import client from 'prom-client';
import { getAllRooms } from './sfu/roomManager';

// Create a Registry
export const register = new client.Registry();

// Add default metrics (e.g. process CPU, memory)
client.collectDefaultMetrics({ register });

export const clientPingHistogram = new client.Histogram({
  name: 'webrtc_client_ping_ms',
  help: 'Client WebSocket ping round trip time in ms',
  buckets: [10, 50, 100, 200, 500, 1000],
});

export const webrtcJitterHistogram = new client.Histogram({
  name: 'webrtc_jitter_ms',
  help: 'WebRTC jitter in ms',
  labelNames: ['kind'], // audio or video
  buckets: [5, 10, 20, 50, 100, 200],
});

export const webrtcRttHistogram = new client.Histogram({
  name: 'webrtc_rtt_ms',
  help: 'WebRTC Round Trip Time in ms',
  labelNames: ['kind'],
  buckets: [10, 50, 100, 200, 500, 1000],
});

export const webrtcPacketsLostTotal = new client.Counter({
  name: 'webrtc_packets_lost_total',
  help: 'Total WebRTC packets lost',
  labelNames: ['kind', 'direction'], // direction: rx or tx
});

export const webrtcBytesTotal = new client.Counter({
  name: 'webrtc_bytes_total',
  help: 'Total WebRTC bytes sent/received (used to calculate bitrate)',
  labelNames: ['kind', 'direction'], // direction: rx or tx
});

register.registerMetric(clientPingHistogram);
register.registerMetric(webrtcJitterHistogram);
register.registerMetric(webrtcRttHistogram);
register.registerMetric(webrtcPacketsLostTotal);
register.registerMetric(webrtcBytesTotal);

const lastStats = new Map<string, { packetsLost: number; bytesReceived: number; bytesSent: number }>();

export function startMetricsPolling() {
  setInterval(async () => {
    const rooms = getAllRooms();
    const activeIds = new Set<string>();

    for (const room of rooms) {
      for (const peer of room.peers.values()) {
        // Poll Producers (inbound-rtp) - Data received by server
        for (const producer of peer.producers.values()) {
          activeIds.add(producer.id);
          try {
            const stats = await producer.getStats();
            stats.forEach((stat: any) => {
              if (stat.type === 'inbound-rtp') {
                if (stat.jitter !== undefined) {
                  webrtcJitterHistogram.labels(producer.kind).observe(stat.jitter);
                }
                const last = lastStats.get(producer.id) || { packetsLost: 0, bytesReceived: 0, bytesSent: 0 };
                
                if (stat.packetsLost !== undefined && stat.packetsLost >= last.packetsLost) {
                  const deltaPackets = stat.packetsLost - last.packetsLost;
                  webrtcPacketsLostTotal.labels(producer.kind, 'rx').inc(deltaPackets);
                  last.packetsLost = stat.packetsLost;
                }
                
                if (stat.bytesReceived !== undefined && stat.bytesReceived >= last.bytesReceived) {
                  const deltaBytes = stat.bytesReceived - last.bytesReceived;
                  webrtcBytesTotal.labels(producer.kind, 'rx').inc(deltaBytes);
                  last.bytesReceived = stat.bytesReceived;
                }
                lastStats.set(producer.id, last);
              }
            });
          } catch (err) {}
        }
        
        // Poll Consumers (outbound-rtp and remote-inbound-rtp) - Data sent by server
        for (const consumer of peer.consumers.values()) {
          activeIds.add(consumer.id);
          try {
            const stats = await consumer.getStats();
            stats.forEach((stat: any) => {
              if (stat.type === 'remote-inbound-rtp' && stat.roundTripTime !== undefined) {
                 webrtcRttHistogram.labels(consumer.kind).observe(stat.roundTripTime * 1000); // RTT is in seconds, convert to ms
              }
              if (stat.type === 'outbound-rtp') {
                const last = lastStats.get(consumer.id) || { packetsLost: 0, bytesReceived: 0, bytesSent: 0 };
                if (stat.bytesSent !== undefined && stat.bytesSent >= last.bytesSent) {
                  const deltaBytes = stat.bytesSent - last.bytesSent;
                  webrtcBytesTotal.labels(consumer.kind, 'tx').inc(deltaBytes);
                  last.bytesSent = stat.bytesSent;
                }
                lastStats.set(consumer.id, last);
              }
            });
          } catch (err) {}
        }
      }
    }

    // Cleanup old stats
    for (const id of lastStats.keys()) {
      if (!activeIds.has(id)) {
        lastStats.delete(id);
      }
    }
  }, 10000);
}

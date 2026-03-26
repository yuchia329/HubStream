# Facetime Server (Mediasoup)

The backend is a high-performance **Node.js** signaling and media server utilizing the **Mediasoup** C++ engine.

## Architecture

This server acts as a **Selective Forwarding Unit (SFU)**. Instead of every participant sending their video directly to every other participant (which consumes $O(N^2)$ bandwidth), each participant sends their stream to this server exactly once. The server then efficiently routes ("forwards") that stream to all connected consumers securely.

## System Dependencies

Because Mediasoup compiles native C++ WebRTC binaries bindings during installation, the host system or Docker container must be equipped with:
- `build-essential` (gcc/g++)
- `python3`

## Configuration & Ports

The server primarily relies on a single open UDP port range and a WebSocket connection for signaling.

- **TCP Port 4000**: Used for both HTTP API health checks and WebSocket Upgrade connections (Signaling).
- **UDP Ports 40000-49999**: The ephemeral ICE candidate port range used by Mediasoup to transport raw RTP media packets.

### Environment Variables

The server requires specific configurations based on where it is deployed:

- `PORT` (Default `4000`): The signaling port.
- `MEDIASOUP_LISTEN_IP` (Default `0.0.0.0`): The local interface the server binds to.
- `MEDIASOUP_ANNOUNCED_IP` (Default `127.0.0.1`): **Critical parameter.** This must be set to the *publicly accessible IP address* of the server (e.g. the EC2 Elastic IP) so that WebRTC STUN/ICE traversal knows where to route packets over the public internet.

## Local Development

```bash
# Install dependencies (will compile native Mediasoup C++ extensions)
npm install

# Start the SFU backend
npm run dev
```

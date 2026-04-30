'use client';

import { useEffect, useRef } from 'react';

interface VideoTileProps {
  stream: MediaStream | null;
  displayName: string;
  isMuted?: boolean;
  isCamOff?: boolean;
  isLocal?: boolean;
  isSpeaking?: boolean;
  isPinned?: boolean;
  latency?: number;
  onPin?: () => void;
  onUnpin?: () => void;
}

export default function VideoTile({
  stream,
  displayName,
  isMuted = false,
  isCamOff = false,
  isLocal = false,
  isSpeaking = false,
  isPinned = false,
  latency,
  onPin,
  onUnpin,
}: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;

    // Initial assignment
    if (video.srcObject !== stream) {
      video.srcObject = stream;
    }

    // Force re-assignment when tracks dynamically arrive (e.g. video consumed after audio)
    const handleTrackEvent = () => {
      video.srcObject = null;
      video.srcObject = stream;
    };

    stream.addEventListener('addtrack', handleTrackEvent);
    stream.addEventListener('removetrack', handleTrackEvent);

    return () => {
      stream.removeEventListener('addtrack', handleTrackEvent);
      stream.removeEventListener('removetrack', handleTrackEvent);
    };
  }, [stream]);

  return (
    <div className={`video-tile ${isCamOff ? 'cam-off' : ''} ${isSpeaking ? 'is-speaking' : ''}`}>
      {/* Video element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal || isMuted}
        className="video-element"
        style={{
          transform: isLocal ? 'scaleX(-1)' : 'none',
          opacity: isCamOff ? 0 : 1,
          visibility: isCamOff ? 'hidden' : 'visible',
          transition: 'opacity 0.2s ease-in-out'
        }}
      />

      {/* Pin Controls (Visible on hover via CSS) */}
      {(onPin || onUnpin) && (
        <div className="tile-pin-controls">
          {isPinned ? (
            <button className="btn-pin btn-unpin" onClick={onUnpin} title="Unpin from center">
              Unpin
            </button>
          ) : (
            <button className="btn-pin" onClick={onPin} title="Pin to center">
              Pin
            </button>
          )}
        </div>
      )}

      {/* Cam-off avatar */}
      {isCamOff && (
        <div className="avatar-placeholder">
          <span className="avatar-letter">
            {displayName.charAt(0).toUpperCase()}
          </span>
        </div>
      )}

      {/* Name badge */}
      <div className="tile-footer">
        <span className="participant-name">{displayName}</span>
        {!isLocal && isMuted && (
          <span className="mute-badge" title="Muted" style={{ fontSize: '14px' }}>
            🔇
          </span>
        )}
        {/* Ping badge — aligned with name in footer */}
        {latency !== undefined && latency >= 0 && (
          <span
            style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: 600,
              color: latency < 100 ? '#4ade80' : latency < 200 ? '#facc15' : '#f87171',
            }}
          >
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor' }} />
            {latency}ms
          </span>
        )}
      </div>

      {/* Local badge */}
      {isLocal && <span className="local-badge">YOU</span>}


    </div>
  );
}

interface Props {
  success: boolean;
}

export function StealOverlay({ success }: Props) {
  return (
    <div className="strike-overlay">
      <div
        className="strike-overlay__flash"
        style={{ background: success ? 'rgba(255, 200, 0, 0.3)' : 'rgba(239, 68, 68, 0.3)' }}
      />
      <div
        className="strike-overlay__x"
        style={{
          color: success ? '#fbbf24' : '#ef4444',
          fontSize: 'clamp(3rem, 8vw, 8rem)',
          textShadow: success
            ? '0 0 40px rgba(251, 191, 36, 0.5)'
            : '0 0 40px rgba(239, 68, 68, 0.5)',
        }}
      >
        {success ? 'ПЕРЕХВАТ!' : 'НЕ УДАЛОСЬ!'}
      </div>
    </div>
  );
}

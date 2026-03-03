export function StealOverlay() {
  return (
    <div className="strike-overlay">
      <div className="strike-overlay__flash" style={{ background: 'rgba(255, 200, 0, 0.3)' }} />
      <div
        className="strike-overlay__x"
        style={{
          color: '#fbbf24',
          fontSize: 'clamp(3rem, 8vw, 8rem)',
          textShadow: '0 0 40px rgba(251, 191, 36, 0.5)',
        }}
      >
        ПЕРЕХВАТ!
      </div>
    </div>
  );
}

import React from "react";

interface HeaderProps {
  isConnected: boolean;
  error?: string | null;
}

export const Header: React.FC<HeaderProps> = ({ isConnected, error }) => {
  return (
    <>
      <header className="header">
        <div className="header-content">
          <h1 className="app-title">Commit-Q</h1>
          <div className="connection-status">
            <span
              className={`status-indicator ${
                isConnected ? "connected" : "disconnected"
              }`}
            >
              {isConnected ? "🟢" : "🔴"}
            </span>
            <span className="status-text">
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>
        {error && (
          <div className="error-message fade-in">
            <span className="error-icon">⚠️</span>
            <span className="error-text">{error}</span>
          </div>
        )}
      </header>

      <style jsx>{`
        .header {
          background: linear-gradient(
            135deg,
            var(--color-primary) 0%,
            var(--color-primary-dark) 100%
          );
          color: var(--color-text-light);
          padding: 24px 0;
          margin-bottom: 32px;
          border-radius: 0 0 16px 16px;
          box-shadow: 0 4px 16px rgba(65, 108, 109, 0.2);
          position: relative;
          overflow: hidden;
        }

        .header::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            45deg,
            transparent 30%,
            rgba(255, 255, 255, 0.05) 50%,
            transparent 70%
          );
          pointer-events: none;
        }

        .header-content {
          max-width: 800px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          z-index: 1;
        }

        .app-title {
          margin: 0;
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--color-text-light);
          font-family: var(--font-secondary);
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          letter-spacing: -0.5px;
        }

        .connection-status {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.1);
          padding: 8px 16px;
          border-radius: 20px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .status-indicator {
          font-size: 12px;
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
        }

        .status-text {
          font-weight: 600;
          font-size: 14px;
          color: var(--color-text-light);
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        .error-message {
          max-width: 800px;
          margin: 16px auto 0;
          padding: 0 20px;
          position: relative;
          z-index: 1;
        }

        .error-message > div {
          background: rgba(255, 255, 255, 0.95);
          color: var(--color-error);
          padding: 12px 16px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid rgba(139, 90, 90, 0.2);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
        }

        .error-icon {
          font-size: 16px;
          flex-shrink: 0;
        }

        .error-text {
          font-weight: 500;
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .header {
            padding: 20px 0;
            margin-bottom: 24px;
          }

          .header-content {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }

          .app-title {
            font-size: 2rem;
          }

          .connection-status {
            padding: 6px 12px;
          }

          .status-text {
            font-size: 13px;
          }
        }

        @media (max-width: 480px) {
          .header {
            padding: 16px 0;
            margin-bottom: 20px;
            border-radius: 0 0 12px 12px;
          }

          .header-content {
            padding: 0 16px;
          }

          .app-title {
            font-size: 1.75rem;
          }

          .error-message {
            padding: 0 16px;
          }
        }
      `}</style>
    </>
  );
};

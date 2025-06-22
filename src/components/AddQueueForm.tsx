import React, { useState } from "react";

interface AddQueueFormProps {
  onAddToQueue: (name: string, isFastTrack?: boolean) => void;
}

export const AddQueueForm: React.FC<AddQueueFormProps> = ({ onAddToQueue }) => {
  const [newQueueName, setNewQueueName] = useState("");

  const handleSubmit = (e: React.FormEvent, isFastTrack: boolean = false) => {
    e.preventDefault();
    if (newQueueName.trim()) {
      onAddToQueue(newQueueName.trim(), isFastTrack);
      setNewQueueName("");
    }
  };

  return (
    <>
      <div className="add-queue-section">
        <h2 className="section-title">Add to Queue</h2>

        <form onSubmit={handleSubmit} className="add-queue-form">
          <div className="input-group">
            <input
              type="text"
              value={newQueueName}
              onChange={(e) => setNewQueueName(e.target.value)}
              placeholder="Enter your name or identifier..."
              className="queue-input"
              maxLength={50}
              autoComplete="off"
            />
            <div className="button-group">
              <button
                type="submit"
                disabled={!newQueueName.trim()}
                className="btn-primary add-button"
              >
                <span className="button-icon">➕</span>
                Add to Queue
              </button>
              <button
                type="button"
                disabled={!newQueueName.trim()}
                className="btn-error fast-track-button"
                onClick={(e) => handleSubmit(e, true)}
              >
                <span className="button-icon">⚡</span>
                <span className="button-text">Fast Track</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      <style jsx>{`
        .add-queue-section {
          background: linear-gradient(
            135deg,
            var(--color-bg-primary) 0%,
            var(--color-accent-light) 100%
          );
          padding: 28px;
          border-radius: 16px;
          border: 2px solid var(--color-border);
          box-shadow: 0 6px 20px rgba(65, 108, 109, 0.08);
          margin-bottom: 32px;
          position: relative;
          overflow: hidden;
        }

        .add-queue-section::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            45deg,
            transparent 30%,
            rgba(65, 108, 109, 0.02) 50%,
            transparent 70%
          );
          pointer-events: none;
        }

        .section-title {
          margin: 0 0 24px 0;
          color: var(--color-primary);
          font-size: 1.5rem;
          font-weight: 700;
          font-family: var(--font-secondary);
          position: relative;
          z-index: 1;
        }

        .add-queue-form {
          margin-bottom: 24px;
          position: relative;
          z-index: 1;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: stretch;
        }

        .queue-input {
          flex: 1;
          font-size: 16px;
          padding: 14px 16px;
          border: 2px solid var(--color-border);
          border-radius: 12px;
          background: var(--color-bg-primary);
          color: var(--color-text-primary);
          transition: all 0.3s ease;
          font-family: var(--font-primary);
          box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .queue-input:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow:
            0 0 0 3px rgba(65, 108, 109, 0.1),
            inset 0 1px 3px rgba(0, 0, 0, 0.05);
          transform: translateY(-1px);
        }

        .queue-input::placeholder {
          color: var(--color-text-secondary);
          opacity: 0.7;
        }

        .button-group {
          display: flex;
          gap: 12px;
        }

        .add-button,
        .fast-track-button {
          padding: 14px 24px;
          font-size: 16px;
          font-weight: 600;
          border-radius: 12px;
          white-space: nowrap;
          min-width: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          flex: 1;
        }

        .fast-track-button {
          background-color: var(--color-error);
          border: 2px solid #b02a37;
          position: relative;
          overflow: hidden;
        }

        .fast-track-button::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.1),
            rgba(255, 255, 255, 0.3),
            rgba(255, 255, 255, 0.1)
          );
          transition: all 0.6s;
          z-index: 1;
        }

        .fast-track-button:hover:not(:disabled) {
          background-color: var(--color-error-dark, #c82333);
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(220, 53, 69, 0.3);
        }

        .fast-track-button:hover:not(:disabled)::before {
          left: 100%;
        }

        .button-icon {
          font-size: 16px;
        }

        .button-text {
          position: relative;
          z-index: 2;
        }

        .fast-track-button .button-icon {
          animation: shake 1s infinite;
          display: inline-block;
        }

        @keyframes shake {
          0% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(15deg);
          }
          75% {
            transform: rotate(-15deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }

        @media (max-width: 768px) {
          .add-queue-section {
            padding: 20px;
            margin-bottom: 24px;
          }

          .input-group {
            flex-direction: column;
            gap: 16px;
          }

          .button-group {
            flex-direction: column;
            gap: 12px;
          }

          .add-button,
          .fast-track-button {
            width: 100%;
            padding: 16px 24px;
          }
        }

        @media (max-width: 480px) {
          .add-queue-section {
            padding: 16px;
            border-radius: 12px;
          }

          .section-title {
            font-size: 1.25rem;
            margin-bottom: 20px;
          }

          .queue-input {
            padding: 12px 14px;
            font-size: 15px;
          }

          .add-button {
            padding: 12px 20px;
            font-size: 14px;
          }

          .preset-buttons {
            width: 100%;
          }

          .preset-button {
            flex: 1;
            min-width: 0;
            text-align: center;
          }
        }
      `}</style>
    </>
  );
};

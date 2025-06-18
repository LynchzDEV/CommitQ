import React, { useState } from "react";

interface AddQueueFormProps {
  onAddToQueue: (name: string) => void;
}

export const AddQueueForm: React.FC<AddQueueFormProps> = ({ onAddToQueue }) => {
  const [newQueueName, setNewQueueName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newQueueName.trim()) {
      onAddToQueue(newQueueName.trim());
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
            <button
              type="submit"
              disabled={!newQueueName.trim()}
              className="btn-primary add-button"
            >
              <span className="button-icon">➕</span>
              Add to Queue
            </button>
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

        .add-button {
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
        }

        .button-icon {
          font-size: 14px;
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

          .add-button {
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

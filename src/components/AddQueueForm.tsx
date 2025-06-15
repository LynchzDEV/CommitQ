import React, { useState } from 'react';

interface AddQueueFormProps {
  onAddToQueue: (name: string) => void;
  timerDuration: number;
  onTimerDurationChange: (duration: number) => void;
}

export const AddQueueForm: React.FC<AddQueueFormProps> = ({
  onAddToQueue,
  timerDuration,
  onTimerDurationChange,
}) => {
  const [newQueueName, setNewQueueName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newQueueName.trim()) {
      onAddToQueue(newQueueName.trim());
      setNewQueueName('');
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

        <div className="timer-settings">
          <div className="timer-setting-group">
            <label htmlFor="timer-duration" className="timer-label">
              Timer Duration
            </label>
            <div className="timer-input-group">
              <input
                id="timer-duration"
                type="number"
                min="5"
                max="300"
                value={timerDuration}
                onChange={(e) => onTimerDurationChange(Number(e.target.value))}
                className="timer-input"
              />
              <span className="timer-unit">seconds</span>
            </div>
          </div>
          <div className="timer-presets">
            <span className="presets-label">Quick set:</span>
            <div className="preset-buttons">
              {[30, 60, 120, 300].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onTimerDurationChange(preset)}
                  className={`preset-button ${timerDuration === preset ? 'active' : ''}`}
                >
                  {preset < 60 ? `${preset}s` : `${preset / 60}m`}
                </button>
              ))}
            </div>
          </div>
        </div>
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
          content: '';
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
          box-shadow: 0 0 0 3px rgba(65, 108, 109, 0.1),
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

        .timer-settings {
          background: rgba(255, 255, 255, 0.6);
          padding: 20px;
          border-radius: 12px;
          border: 1px solid var(--color-border-light);
          backdrop-filter: blur(10px);
          position: relative;
          z-index: 1;
        }

        .timer-setting-group {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
        }

        .timer-label {
          font-weight: 600;
          color: var(--color-text-primary);
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          min-width: 120px;
        }

        .timer-input-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .timer-input {
          width: 80px;
          padding: 8px 12px;
          border: 2px solid var(--color-border);
          border-radius: 8px;
          text-align: center;
          font-weight: 600;
          background: var(--color-bg-primary);
          color: var(--color-text-primary);
          transition: all 0.2s ease;
        }

        .timer-input:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 2px rgba(65, 108, 109, 0.1);
        }

        .timer-unit {
          font-size: 14px;
          color: var(--color-text-secondary);
          font-weight: 500;
        }

        .timer-presets {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .presets-label {
          font-size: 14px;
          color: var(--color-text-secondary);
          font-weight: 500;
          min-width: 80px;
        }

        .preset-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .preset-button {
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 600;
          border: 1px solid var(--color-border);
          border-radius: 6px;
          background: var(--color-bg-primary);
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .preset-button:hover {
          background: var(--color-accent);
          border-color: var(--color-secondary);
          color: var(--color-text-primary);
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(154, 181, 181, 0.2);
        }

        .preset-button.active {
          background: var(--color-primary);
          border-color: var(--color-primary);
          color: var(--color-text-light);
          box-shadow: 0 2px 8px rgba(65, 108, 109, 0.3);
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

          .timer-setting-group {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
            margin-bottom: 20px;
          }

          .timer-label {
            min-width: auto;
          }

          .timer-presets {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .presets-label {
            min-width: auto;
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

          .timer-settings {
            padding: 16px;
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

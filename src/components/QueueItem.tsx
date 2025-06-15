import React from 'react';
import { QueueItem as QueueItemType } from '@/types/queue';

interface QueueItemProps {
  item: QueueItemType;
  index: number;
  isFirst: boolean;
  isCurrentlyServing: boolean;
  timerInfo?: {
    remaining: number;
    total: number;
  };
  onStartTimer: (item: QueueItemType) => void;
  onStopTimer: (id: string) => void;
  onRemove: (id: string) => void;
}

export const QueueItem: React.FC<QueueItemProps> = ({
  item,
  index,
  isFirst,
  isCurrentlyServing,
  timerInfo,
  onStartTimer,
  onStopTimer,
  onRemove,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (remaining: number, total: number) => {
    return ((total - remaining) / total) * 100;
  };

  return (
    <div
      className={`queue-item fade-in ${isFirst ? 'first-item' : ''} ${
        isCurrentlyServing ? 'currently-serving' : ''
      }`}
    >
      <div className="queue-item-content">
        <div className="queue-item-info">
          <div className="queue-position">#{index + 1}</div>
          <div className="queue-name">{item.name}</div>
          <div className="queue-time">
            Added: {new Date(item.addedAt).toLocaleTimeString()}
          </div>
        </div>

        {timerInfo && (
          <div className="timer-display">
            <div className="timer-info">
              <span className="timer-text">
                ⏱️ {formatTime(timerInfo.remaining)}
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${getProgressPercentage(
                    timerInfo.remaining,
                    timerInfo.total
                  )}%`,
                }}
              />
            </div>
          </div>
        )}

        <div className="queue-actions">
          {isFirst && !timerInfo && (
            <button
              onClick={() => onStartTimer(item)}
              className="btn-success timer-button"
            >
              Start Timer
            </button>
          )}

          {timerInfo && (
            <button
              onClick={() => onStopTimer(item.id)}
              className="btn-warning timer-button"
            >
              Stop Timer
            </button>
          )}

          <button
            onClick={() => onRemove(item.id)}
            className="btn-error remove-button"
          >
            Remove
          </button>
        </div>
      </div>

      <style jsx>{`
        .queue-item {
          background: var(--color-bg-primary);
          border: 2px solid var(--color-border);
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
          margin-bottom: 12px;
        }

        .queue-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(65, 108, 109, 0.1);
        }

        .queue-item.first-item {
          border-color: var(--color-primary);
          box-shadow: 0 4px 12px rgba(65, 108, 109, 0.15);
        }

        .queue-item.first-item:hover {
          box-shadow: 0 8px 24px rgba(65, 108, 109, 0.25);
        }

        .queue-item.currently-serving {
          border-color: var(--color-secondary);
          background: linear-gradient(
            90deg,
            var(--color-accent-light) 0%,
            var(--color-bg-primary) 100%
          );
        }

        .queue-item-content {
          padding: 20px;
        }

        .queue-item-info {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
        }

        .queue-position {
          background: var(--color-primary);
          color: var(--color-text-light);
          padding: 8px 12px;
          border-radius: 20px;
          font-weight: bold;
          min-width: 40px;
          text-align: center;
          font-size: 14px;
          box-shadow: 0 2px 8px rgba(65, 108, 109, 0.3);
        }

        .queue-item.currently-serving .queue-position {
          background: var(--color-secondary);
          box-shadow: 0 2px 8px rgba(154, 181, 181, 0.3);
        }

        .queue-name {
          font-size: 18px;
          font-weight: 600;
          flex: 1;
          color: var(--color-text-primary);
          font-family: var(--font-secondary);
        }

        .queue-time {
          color: var(--color-text-secondary);
          font-size: 14px;
          font-weight: 400;
        }

        .timer-display {
          margin-bottom: 16px;
          padding: 16px;
          background: var(--color-accent-light);
          border-radius: 12px;
          border: 1px solid var(--color-border-light);
          box-shadow: inset 0 1px 3px rgba(65, 108, 109, 0.1);
        }

        .timer-info {
          display: flex;
          justify-content: center;
          margin-bottom: 12px;
        }

        .timer-text {
          font-size: 20px;
          font-weight: bold;
          color: var(--color-primary);
          font-family: var(--font-secondary);
        }

        .progress-bar {
          width: 100%;
          height: 10px;
          background: var(--color-border);
          border-radius: 5px;
          overflow: hidden;
          box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(
            90deg,
            var(--color-success),
            var(--color-secondary)
          );
          transition: width 1s linear;
          border-radius: 5px;
          box-shadow: 0 1px 3px rgba(74, 124, 89, 0.3);
        }

        .queue-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          flex-wrap: wrap;
        }

        .timer-button,
        .remove-button {
          padding: 10px 18px;
          font-size: 14px;
          font-weight: 600;
          border-radius: 8px;
          transition: all 0.2s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        @media (max-width: 768px) {
          .queue-item-info {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .queue-position {
            align-self: flex-start;
          }

          .queue-actions {
            justify-content: flex-start;
            gap: 8px;
          }

          .timer-button,
          .remove-button {
            padding: 8px 14px;
            font-size: 12px;
          }

          .timer-text {
            font-size: 18px;
          }

          .queue-name {
            font-size: 16px;
          }
        }

        @media (max-width: 480px) {
          .queue-item-content {
            padding: 16px;
          }

          .timer-display {
            padding: 12px;
          }

          .queue-actions {
            flex-direction: column;
          }

          .timer-button,
          .remove-button {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

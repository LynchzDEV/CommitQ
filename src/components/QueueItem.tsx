import React from "react";
import { QueueItem as QueueItemType } from "@/types/queue";

interface QueueItemProps {
  item: QueueItemType;
  index: number;
  isFirst: boolean;
  onRemove: (id: string) => void;
}

export const QueueItem: React.FC<QueueItemProps> = ({
  item,
  index,
  isFirst,
  onRemove,
}) => {
  return (
    <div
      className={`queue-item fade-in ${isFirst ? "first-item" : ""} ${item.fastTrack ? "fast-track" : ""}`}
    >
      <div className="queue-item-content">
        <div className="queue-item-info">
          <div className="queue-position">#{index + 1}</div>
          <div className="queue-name">
            {item.name}
            {item.fastTrack && (
              <span className="fast-track-badge">FAST TRACK</span>
            )}
          </div>
          <div className="queue-time">
            Added: {new Date(item.addedAt).toLocaleTimeString()}
          </div>
        </div>

        <div className="queue-actions">
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

        .queue-item.fast-track {
          border-color: #dc3545;
          background: linear-gradient(
            90deg,
            rgba(220, 53, 69, 0.2) 0%,
            rgba(220, 53, 69, 0.1) 100%
          );
          border-left: 6px solid #dc3545;
          box-shadow: 0 4px 12px rgba(220, 53, 69, 0.2);
        }

        .queue-item.fast-track:hover {
          box-shadow: 0 8px 24px rgba(220, 53, 69, 0.25);
          transform: translateY(-3px);
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

        .queue-item.fast-track .queue-position {
          background: #dc3545;
          color: white;
          box-shadow: 0 2px 8px rgba(220, 53, 69, 0.4);
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
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }

        .fast-track-badge {
          background-color: #dc3545;
          color: white;
          font-size: 11px;
          font-weight: 800;
          padding: 4px 8px;
          border-radius: 6px;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          box-shadow: 0 2px 6px rgba(220, 53, 69, 0.4);
          animation: pulse 2s infinite;
          border: 1px solid #b02a37;
        }

        @keyframes pulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
          100% {
            opacity: 1;
          }
        }

        .queue-time {
          color: var(--color-text-secondary);
          font-size: 14px;
          font-weight: 400;
        }

        .queue-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          flex-wrap: wrap;
        }

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

          .remove-button {
            padding: 8px 14px;
            font-size: 12px;
          }

          .queue-name {
            font-size: 16px;
          }
        }

        @media (max-width: 480px) {
          .queue-item-content {
            padding: 16px;
          }

          .queue-actions {
            flex-direction: column;
          }

          .remove-button {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

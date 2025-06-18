import { useState } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Header } from "@/components/Header";
import { AddQueueForm } from "@/components/AddQueueForm";
import { QueueItem } from "@/components/QueueItem";

export default function Home() {
  const { queueState, isConnected, error, addToQueue, removeFromQueue } =
    useSocket();

  return (
    <div className="app-container">
      <Header isConnected={isConnected} error={error} />

      <div className="main-content">
        <AddQueueForm onAddToQueue={addToQueue} />

        <div className="queue-section">
          <div className="queue-header">
            <h2 className="queue-title">
              Current Queue
              <span className="queue-count">({queueState.items.length})</span>
            </h2>
            {queueState.items.length > 0 && (
              <div className="queue-stats">
                <span className="stat">Next: #{1}</span>
                {queueState.items.length > 1 && (
                  <span className="stat">
                    Waiting: {queueState.items.length - 1}
                  </span>
                )}
              </div>
            )}
          </div>

          {queueState.items.length === 0 ? (
            <div className="empty-queue fade-in">
              <div className="empty-icon">📋</div>
              <h3 className="empty-title">Queue is empty</h3>
              <p className="empty-description">
                Add your name above to join the queue
              </p>
            </div>
          ) : (
            <div className="queue-list">
              {queueState.items.map((item, index) => {
                const isFirst = index === 0;

                return (
                  <QueueItem
                    key={item.id}
                    item={item}
                    index={index}
                    isFirst={isFirst}
                    onRemove={removeFromQueue}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .app-container {
          min-height: 100vh;
          background: linear-gradient(
            135deg,
            var(--color-bg-secondary) 0%,
            var(--color-accent-light) 100%
          );
        }

        .main-content {
          max-width: 900px;
          margin: 0 auto;
          padding: 0 20px 40px;
        }

        .queue-section {
          margin-bottom: 32px;
        }

        .queue-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding: 20px 0;
          border-bottom: 2px solid var(--color-border);
        }

        .queue-title {
          margin: 0;
          color: var(--color-primary);
          font-size: 1.75rem;
          font-weight: 700;
          font-family: var(--font-secondary);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .queue-count {
          background: var(--color-secondary);
          color: var(--color-text-light);
          padding: 4px 12px;
          border-radius: 16px;
          font-size: 0.9rem;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(154, 181, 181, 0.3);
        }

        .queue-stats {
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .stat {
          background: var(--color-accent);
          color: var(--color-text-primary);
          padding: 6px 12px;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 600;
          border: 1px solid var(--color-border);
        }

        .empty-queue {
          text-align: center;
          padding: 60px 40px;
          background: linear-gradient(
            135deg,
            var(--color-bg-primary) 0%,
            var(--color-accent-light) 100%
          );
          border-radius: 16px;
          border: 2px dashed var(--color-border);
          box-shadow: 0 4px 16px rgba(65, 108, 109, 0.05);
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 16px;
          opacity: 0.6;
        }

        .empty-title {
          margin: 0 0 8px 0;
          color: var(--color-text-primary);
          font-size: 1.5rem;
          font-weight: 600;
          font-family: var(--font-secondary);
        }

        .empty-description {
          margin: 0;
          color: var(--color-text-secondary);
          font-size: 1rem;
          max-width: 300px;
          margin: 0 auto;
        }

        .queue-list {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        @media (max-width: 768px) {
          .main-content {
            padding: 0 16px 32px;
          }

          .queue-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
            padding: 16px 0;
          }

          .queue-stats {
            align-self: stretch;
            justify-content: space-between;
          }

          .queue-title {
            font-size: 1.5rem;
          }

          .empty-queue {
            padding: 40px 20px;
          }

          .empty-icon {
            font-size: 2.5rem;
          }

          .empty-title {
            font-size: 1.25rem;
          }
        }

        @media (max-width: 480px) {
          .main-content {
            padding: 0 12px 24px;
          }

          .queue-header {
            padding: 12px 0;
          }

          .queue-title {
            font-size: 1.25rem;
          }

          .queue-count {
            font-size: 0.8rem;
            padding: 3px 8px;
          }

          .empty-queue {
            padding: 32px 16px;
          }
        }
      `}</style>
    </div>
  );
}

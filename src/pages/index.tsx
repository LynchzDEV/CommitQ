import { useState, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { QueueItem as QueueItemType } from "@/types/queue";
import { Header } from "@/components/Header";
import { AddQueueForm } from "@/components/AddQueueForm";
import { QueueItem } from "@/components/QueueItem";

export default function Home() {
  const {
    queueState,
    isConnected,
    error,
    addToQueue,
    removeFromQueue,
    startTimer,
    stopTimer,
  } = useSocket();

  const [timerDuration, setTimerDuration] = useState(30); // seconds
  const [timers, setTimers] = useState<
    Map<string, { remaining: number; total: number }>
  >(new Map());

  // Handle timer countdown for UI
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) => {
        const newTimers = new Map(prev);
        let hasChanges = false;

        queueState.items.forEach((item) => {
          if (item.timerStarted && item.timerDuration) {
            const elapsed = Date.now() - new Date(item.timerStarted).getTime();
            const remaining = Math.max(0, item.timerDuration - elapsed);

            if (remaining > 0) {
              newTimers.set(item.id, {
                remaining: Math.ceil(remaining / 1000),
                total: Math.ceil(item.timerDuration / 1000),
              });
              hasChanges = true;
            } else {
              newTimers.delete(item.id);
              hasChanges = true;
            }
          }
        });

        return hasChanges ? newTimers : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [queueState.items]);

  const handleStartTimer = (item: QueueItemType) => {
    const durationMs = timerDuration * 1000;
    startTimer(item.id, durationMs);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="app-container">
      <Header isConnected={isConnected} error={error} />

      <div className="main-content">
        <AddQueueForm
          onAddToQueue={addToQueue}
          timerDuration={timerDuration}
          onTimerDurationChange={setTimerDuration}
        />

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
                const timerInfo = timers.get(item.id);
                const isFirst = index === 0;
                const isCurrentlyServing =
                  queueState.currentlyServing?.id === item.id;

                return (
                  <QueueItem
                    key={item.id}
                    item={item}
                    index={index}
                    isFirst={isFirst}
                    isCurrentlyServing={isCurrentlyServing}
                    timerInfo={timerInfo}
                    onStartTimer={handleStartTimer}
                    onStopTimer={stopTimer}
                    onRemove={removeFromQueue}
                  />
                );
              })}
            </div>
          )}
        </div>

        {queueState.currentlyServing && (
          <div className="currently-serving fade-in">
            <div className="serving-header">
              <h3 className="serving-title">
                <span className="serving-icon">🎯</span>
                Currently Serving
              </h3>
            </div>
            <div className="serving-content">
              <div className="serving-item">
                <div className="serving-info">
                  <span className="serving-name">
                    {queueState.currentlyServing.name}
                  </span>
                  <span className="serving-time">
                    Started:{" "}
                    {new Date(
                      queueState.currentlyServing.addedAt,
                    ).toLocaleTimeString()}
                  </span>
                </div>
                {timers.get(queueState.currentlyServing.id) && (
                  <div className="serving-timer">
                    <span className="timer-icon">⏱️</span>
                    <span className="timer-time">
                      {formatTime(
                        timers.get(queueState.currentlyServing.id)!.remaining,
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
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

        .currently-serving {
          background: linear-gradient(
            135deg,
            var(--color-accent-light) 0%,
            var(--color-bg-primary) 100%
          );
          border: 2px solid var(--color-secondary);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 6px 20px rgba(154, 181, 181, 0.15);
        }

        .serving-header {
          background: var(--color-secondary);
          padding: 16px 24px;
        }

        .serving-title {
          margin: 0;
          color: var(--color-text-light);
          font-size: 1.25rem;
          font-weight: 700;
          font-family: var(--font-secondary);
          display: flex;
          align-items: center;
          gap: 8px;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        .serving-icon {
          font-size: 1.1rem;
        }

        .serving-content {
          padding: 24px;
        }

        .serving-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }

        .serving-info {
          flex: 1;
        }

        .serving-name {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-text-primary);
          font-family: var(--font-secondary);
          margin-bottom: 4px;
        }

        .serving-time {
          display: block;
          font-size: 0.9rem;
          color: var(--color-text-secondary);
          font-weight: 500;
        }

        .serving-timer {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--color-bg-primary);
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid var(--color-border);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .timer-icon {
          font-size: 1.2rem;
        }

        .timer-time {
          font-size: 1.25rem;
          font-weight: bold;
          color: var(--color-primary);
          font-family: var(--font-secondary);
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

          .serving-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .serving-timer {
            align-self: stretch;
            justify-content: center;
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

          .serving-header {
            padding: 12px 16px;
          }

          .serving-title {
            font-size: 1.1rem;
          }

          .serving-content {
            padding: 16px;
          }

          .serving-name {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
}

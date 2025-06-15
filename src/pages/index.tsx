import { useState, useEffect } from "react";
import { useSSE } from "@/hooks/useSSE";
import { QueueItem } from "@/types/queue";

export default function Home() {
  const {
    queueState,
    isConnected,
    error,
    addToQueue,
    removeFromQueue,
    startTimer,
    stopTimer,
  } = useSSE();

  const [newQueueName, setNewQueueName] = useState("");
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

  const handleAddQueue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newQueueName.trim()) {
      try {
        await addToQueue(newQueueName.trim());
        setNewQueueName("");
      } catch (error) {
        console.error("Failed to add to queue:", error);
      }
    }
  };

  const handleStartTimer = async (item: QueueItem) => {
    const durationMs = timerDuration * 1000;
    try {
      await startTimer(item.id, durationMs);
    } catch (error) {
      console.error("Failed to start timer:", error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getProgressPercentage = (remaining: number, total: number) => {
    return ((total - remaining) / total) * 100;
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Real-time Queue Manager</h1>
        <div className="connection-status">
          <span
            className={`status-indicator ${isConnected ? "connected" : "disconnected"}`}
          >
            {isConnected ? "🟢" : "🔴"}
          </span>
          {isConnected ? "Connected" : "Disconnected"}
        </div>
      </header>

      {error && <div className="error-message">⚠️ {error}</div>}

      <div className="main-content">
        <div className="add-queue-section">
          <form onSubmit={handleAddQueue} className="add-queue-form">
            <input
              type="text"
              value={newQueueName}
              onChange={(e) => setNewQueueName(e.target.value)}
              placeholder="Enter queue name..."
              className="queue-input"
              maxLength={50}
            />
            <button
              type="submit"
              disabled={!newQueueName.trim()}
              className="add-button"
            >
              Add to Queue
            </button>
          </form>

          <div className="timer-settings">
            <label htmlFor="timer-duration">Timer Duration (seconds):</label>
            <input
              id="timer-duration"
              type="number"
              min="5"
              max="300"
              value={timerDuration}
              onChange={(e) => setTimerDuration(Number(e.target.value))}
              className="timer-input"
            />
          </div>
        </div>

        <div className="queue-section">
          <h2>Current Queue ({queueState.items.length})</h2>

          {queueState.items.length === 0 ? (
            <div className="empty-queue">
              <p>No items in queue</p>
            </div>
          ) : (
            <div className="queue-list">
              {queueState.items.map((item, index) => {
                const timerInfo = timers.get(item.id);
                const isFirst = index === 0;
                const isCurrentlyServing =
                  queueState.currentlyServing?.id === item.id;

                return (
                  <div
                    key={item.id}
                    className={`queue-item ${isFirst ? "first-item" : ""} ${isCurrentlyServing ? "currently-serving" : ""}`}
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
                                width: `${getProgressPercentage(timerInfo.remaining, timerInfo.total)}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="queue-actions">
                        {isFirst && !timerInfo && (
                          <button
                            onClick={() => handleStartTimer(item)}
                            className="timer-button start-timer"
                          >
                            Start Timer
                          </button>
                        )}

                        {timerInfo && (
                          <button
                            onClick={async () => {
                              try {
                                await stopTimer(item.id);
                              } catch (error) {
                                console.error("Failed to stop timer:", error);
                              }
                            }}
                            className="timer-button stop-timer"
                          >
                            Stop Timer
                          </button>
                        )}

                        <button
                          onClick={async () => {
                            try {
                              await removeFromQueue(item.id);
                            } catch (error) {
                              console.error(
                                "Failed to remove from queue:",
                                error,
                              );
                            }
                          }}
                          className="remove-button"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {queueState.currentlyServing && (
          <div className="currently-serving">
            <h3>Currently Serving</h3>
            <div className="serving-item">
              <span className="serving-name">
                {queueState.currentlyServing.name}
              </span>
              {timers.get(queueState.currentlyServing.id) && (
                <span className="serving-timer">
                  ⏱️{" "}
                  {formatTime(
                    timers.get(queueState.currentlyServing.id)!.remaining,
                  )}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family:
            -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e0e0e0;
        }

        .header h1 {
          margin: 0;
          color: #333;
        }

        .connection-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
        }

        .status-indicator {
          font-size: 12px;
        }

        .error-message {
          background: #ffebee;
          color: #c62828;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
          border: 1px solid #ffcdd2;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .error-close {
          background: none;
          border: none;
          color: #c62828;
          font-size: 20px;
          cursor: pointer;
          padding: 0;
          margin-left: 12px;
        }

        .main-content {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .add-queue-section {
          background: #f8f9fa;
          padding: 24px;
          border-radius: 12px;
          border: 1px solid #e0e0e0;
        }

        .add-queue-form {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
        }

        .queue-input {
          flex: 1;
          padding: 12px;
          border: 2px solid #ddd;
          border-radius: 8px;
          font-size: 16px;
        }

        .queue-input:focus {
          outline: none;
          border-color: #4caf50;
        }

        .add-button {
          padding: 12px 24px;
          background: #4caf50;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
          font-weight: 500;
        }

        .add-button:hover:not(:disabled) {
          background: #45a049;
        }

        .add-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .timer-settings {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .timer-settings label {
          font-weight: 500;
        }

        .timer-input {
          padding: 8px;
          border: 2px solid #ddd;
          border-radius: 6px;
          width: 80px;
        }

        .queue-section h2 {
          margin-bottom: 20px;
          color: #333;
        }

        .empty-queue {
          text-align: center;
          padding: 40px;
          color: #666;
          background: #f5f5f5;
          border-radius: 8px;
        }

        .queue-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .queue-item {
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.2s ease;
        }

        .queue-item.first-item {
          border-color: #2196f3;
          box-shadow: 0 4px 12px rgba(33, 150, 243, 0.15);
        }

        .queue-item.currently-serving {
          border-color: #ff9800;
          background: linear-gradient(90deg, #fff3e0 0%, #ffffff 100%);
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
          background: #2196f3;
          color: white;
          padding: 8px 12px;
          border-radius: 20px;
          font-weight: bold;
          min-width: 40px;
          text-align: center;
        }

        .queue-item.currently-serving .queue-position {
          background: #ff9800;
        }

        .queue-name {
          font-size: 18px;
          font-weight: 500;
          flex: 1;
        }

        .queue-time {
          color: #666;
          font-size: 14px;
        }

        .timer-display {
          margin-bottom: 16px;
          padding: 12px;
          background: #f0f8ff;
          border-radius: 8px;
          border: 1px solid #e3f2fd;
        }

        .timer-info {
          display: flex;
          justify-content: center;
          margin-bottom: 8px;
        }

        .timer-text {
          font-size: 18px;
          font-weight: bold;
          color: #1976d2;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: #e0e0e0;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #4caf50, #8bc34a);
          transition: width 1s linear;
        }

        .queue-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .timer-button {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          font-weight: 500;
        }

        .start-timer {
          background: #4caf50;
          color: white;
        }

        .start-timer:hover {
          background: #45a049;
        }

        .stop-timer {
          background: #ff9800;
          color: white;
        }

        .stop-timer:hover {
          background: #f57c00;
        }

        .remove-button {
          padding: 8px 16px;
          background: #f44336;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          font-weight: 500;
        }

        .remove-button:hover {
          background: #d32f2f;
        }

        .currently-serving {
          background: #fff3e0;
          padding: 20px;
          border-radius: 12px;
          border: 2px solid #ff9800;
        }

        .currently-serving h3 {
          margin: 0 0 12px 0;
          color: #ef6c00;
        }

        .serving-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .serving-name {
          font-size: 18px;
          font-weight: 500;
        }

        .serving-timer {
          font-size: 16px;
          font-weight: bold;
          color: #ef6c00;
        }

        @media (max-width: 600px) {
          .container {
            padding: 12px;
          }

          .header {
            flex-direction: column;
            gap: 12px;
            text-align: center;
          }

          .add-queue-form {
            flex-direction: column;
          }

          .queue-item-info {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .queue-actions {
            justify-content: flex-start;
          }

          .serving-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
}

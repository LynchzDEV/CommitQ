import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useActionItems } from "@/hooks/useActionItems";
import { Header } from "@/components/Header";
import { AddActionItemForm } from "@/components/AddActionItemForm";
import { ActionItemComponent } from "@/components/ActionItemComponent";
import { getCurrentTeam, subscribeToTeamChanges, type Team } from "@/components/TeamSelector";

export default function ActionItems() {
  const [currentTeam, setCurrentTeam] = useState<Team>("bma-training");
  const {
    actionItemsState,
    completedItems,
    pendingItems,
    isConnected,
    error,
    addActionItem,
    completeActionItem,
    uncompleteActionItem,
    removeActionItem,
  } = useActionItems();

  // Track current team
  useEffect(() => {
    setCurrentTeam(getCurrentTeam());
    const unsubscribe = subscribeToTeamChanges(setCurrentTeam);
    return unsubscribe;
  }, []);

  // Team display names
  const getTeamDisplayName = (team: Team) => {
    switch (team) {
      case "bma-training": return "BMA Training";
      case "caffeine": return "Caffeine";
      case "tmlt": return "TMLT";
      default: return "BMA Training";
    }
  };

  return (
    <>
      <Head>
        <title>Action Items & Tasks - {getTeamDisplayName(currentTeam)} | CommitQ</title>
        <meta 
          name="description" 
          content={`Manage ${getTeamDisplayName(currentTeam)} action items and tasks with real-time collaboration. Track ${pendingItems.length} pending and ${completedItems.length} completed tasks efficiently.`} 
        />
        <meta 
          name="keywords" 
          content={`${currentTeam} action items, task management, ${getTeamDisplayName(currentTeam)} tasks, team productivity, task tracking, action item list`} 
        />
        <meta property="og:title" content={`${getTeamDisplayName(currentTeam)} Action Items & Task Management | CommitQ`} />
        <meta 
          property="og:description" 
          content={`Efficiently manage ${getTeamDisplayName(currentTeam)} action items and tasks. ${pendingItems.length} pending tasks, ${completedItems.length} completed with real-time updates.`} 
        />
        <meta property="og:url" content="https://commitq.app/action-items" />
        <meta property="og:type" content="website" />
        <meta name="twitter:title" content={`${getTeamDisplayName(currentTeam)} Action Items | CommitQ`} />
        <meta 
          name="twitter:description" 
          content={`Task management for ${getTeamDisplayName(currentTeam)}. ${pendingItems.length} pending, ${completedItems.length} completed tasks.`} 
        />
        <link rel="canonical" href="https://commitq.app/action-items" />
      </Head>
      
      <div className="app-container">
        <Header isConnected={isConnected} error={error} />

      <div className="main-content">
        <AddActionItemForm onAddActionItem={addActionItem} />

        {/* Pending Items Section */}
        <div className="action-items-section">
          <div className="section-header">
            <h2 className="section-title">
              {getTeamDisplayName(currentTeam)} Pending Tasks
              <span className="item-count">({pendingItems.length})</span>
            </h2>
            {pendingItems.length > 0 && (
              <div className="section-stats">
                <span className="stat">
                  {pendingItems.length} task{pendingItems.length !== 1 ? 's' : ''} remaining
                </span>
              </div>
            )}
          </div>

          {pendingItems.length === 0 ? (
            <div className="empty-section fade-in">
              <div className="empty-icon">
                {currentTeam === "bma-training" ? "🎓" : currentTeam === "caffeine" ? "☕" : "🚀"}
              </div>
              <h3 className="empty-title">No pending tasks for {getTeamDisplayName(currentTeam)}</h3>
              <p className="empty-description">
                Great job! All {getTeamDisplayName(currentTeam)} tasks are completed. Add a new task above to get started.
              </p>
            </div>
          ) : (
            <div className="action-items-list">
              {pendingItems.map((item) => (
                <ActionItemComponent
                  key={item.id}
                  item={item}
                  onComplete={completeActionItem}
                  onUncomplete={uncompleteActionItem}
                  onRemove={removeActionItem}
                />
              ))}
            </div>
          )}
        </div>

        {/* Completed Items Section */}
        {completedItems.length > 0 && (
          <div className="action-items-section">
            <div className="section-header">
              <h2 className="section-title">
                {getTeamDisplayName(currentTeam)} Completed Tasks
                <span className="item-count completed">({completedItems.length})</span>
              </h2>
              <div className="section-stats">
                <span className="stat">
                  {completedItems.length} task{completedItems.length !== 1 ? 's' : ''} completed
                </span>
              </div>
            </div>

            <div className="action-items-list">
              {completedItems.map((item) => (
                <ActionItemComponent
                  key={item.id}
                  item={item}
                  onComplete={completeActionItem}
                  onUncomplete={uncompleteActionItem}
                  onRemove={removeActionItem}
                />
              ))}
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

        .action-items-section {
          margin-bottom: 40px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding: 20px 0;
          border-bottom: 2px solid var(--color-border);
        }

        .section-title {
          margin: 0;
          color: var(--color-primary);
          font-size: 1.75rem;
          font-weight: 700;
          font-family: var(--font-secondary);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .item-count {
          background: var(--color-secondary);
          color: var(--color-text-light);
          padding: 4px 12px;
          border-radius: 16px;
          font-size: 0.9rem;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(154, 181, 181, 0.3);
        }

        .item-count.completed {
          background: var(--color-success);
        }

        .section-stats {
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

        .empty-section {
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
          max-width: 400px;
          margin: 0 auto;
          line-height: 1.5;
        }

        .action-items-list {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        /* Progress indicator */
        .progress-indicator {
          background: var(--color-bg-primary);
          border: 2px solid var(--color-border);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
          box-shadow: 0 4px 16px rgba(65, 108, 109, 0.05);
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: var(--color-accent-light);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(
            90deg,
            var(--color-success) 0%,
            var(--color-primary) 100%
          );
          transition: width 0.3s ease;
        }

        .progress-text {
          font-size: 14px;
          color: var(--color-text-secondary);
          text-align: center;
        }

        @media (max-width: 768px) {
          .main-content {
            padding: 0 16px 32px;
          }

          .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
            padding: 16px 0;
          }

          .section-stats {
            align-self: stretch;
            justify-content: space-between;
          }

          .section-title {
            font-size: 1.5rem;
          }

          .empty-section {
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

          .section-header {
            padding: 12px 0;
          }

          .section-title {
            font-size: 1.25rem;
          }

          .item-count {
            font-size: 0.8rem;
            padding: 3px 8px;
          }

          .empty-section {
            padding: 32px 16px;
          }

          .action-items-section {
            margin-bottom: 32px;
          }
        }
      `}</style>
      </div>
    </>
  );
}

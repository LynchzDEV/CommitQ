// src/components/AddActionItemForm.tsx
import React, { useState } from "react";

interface AddActionItemFormProps {
  onAddActionItem: (title: string, description?: string) => void;
}

export const AddActionItemForm: React.FC<AddActionItemFormProps> = ({
  onAddActionItem,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAddActionItem(title.trim(), description.trim() || undefined);
      setTitle("");
      setDescription("");
    }
  };

  return (
    <>
      <div className="add-action-section">
        <h2 className="section-title">Add Action Item</h2>

        <form onSubmit={handleSubmit} className="add-action-form">
          <div className="input-group">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="action-input title-input"
              maxLength={100}
              autoComplete="off"
              required
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add description (optional)..."
              className="action-input description-input"
              maxLength={300}
              rows={3}
            />

            <button
              type="submit"
              disabled={!title.trim()}
              className="btn-primary add-button"
            >
              <span className="button-icon">📋</span>
              Add Action Item
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .add-action-section {
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

        .add-action-section::before {
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

        .add-action-form {
          position: relative;
          z-index: 1;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .action-input {
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

        .title-input {
          font-weight: 600;
        }

        .description-input {
          resize: vertical;
          min-height: 80px;
          font-size: 14px;
        }

        .action-input:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow:
            0 0 0 3px rgba(65, 108, 109, 0.1),
            inset 0 1px 3px rgba(0, 0, 0, 0.05);
          transform: translateY(-1px);
        }

        .action-input::placeholder {
          color: var(--color-text-secondary);
          opacity: 0.7;
        }

        .add-button {
          padding: 14px 24px;
          font-size: 16px;
          font-weight: 600;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          align-self: flex-start;
          min-width: 180px;
        }

        .button-icon {
          font-size: 16px;
        }

        @media (max-width: 768px) {
          .add-action-section {
            padding: 20px;
            margin-bottom: 24px;
          }

          .add-button {
            width: 100%;
            padding: 16px 24px;
          }
        }

        @media (max-width: 480px) {
          .add-action-section {
            padding: 16px;
            border-radius: 12px;
          }

          .section-title {
            font-size: 1.25rem;
            margin-bottom: 20px;
          }

          .action-input {
            padding: 12px 14px;
            font-size: 15px;
          }

          .add-button {
            padding: 12px 20px;
            font-size: 14px;
          }
        }
      `}</style>
    </>
  );
};

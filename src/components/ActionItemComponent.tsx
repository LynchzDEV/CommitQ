import React, { useState, useRef } from "react";
import { ActionItem } from "@/types/actionItems";

interface ActionItemProps {
  item: ActionItem;
  onComplete: (id: string, image?: string, imageName?: string) => void;
  onUncomplete: (id: string) => void;
  onRemove: (id: string) => void;
}

export const ActionItemComponent: React.FC<ActionItemProps> = ({
  item,
  onComplete,
  onUncomplete,
  onRemove,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File): Promise<string | null> => {
    const maxSize = 3 * 1024 * 1024; // 3MB in bytes

    if (file.size > maxSize) {
      alert("Image size must be less than 3MB");
      return null;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return null;
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  };

  const handleMarkComplete = async () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const base64Image = await handleFileUpload(file);
      if (base64Image) {
        onComplete(item.id, base64Image, file.name);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error uploading image. Please try again.");
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleQuickComplete = () => {
    onComplete(item.id);
  };

  return (
    <div className={`action-item fade-in ${item.completed ? "completed" : ""}`}>
      <div className="action-item-content">
        <div className="action-item-main">
          <div className="checkbox-container">
            <button
              className={`checkbox ${item.completed ? "checked" : ""}`}
              onClick={
                item.completed
                  ? () => onUncomplete(item.id)
                  : handleQuickComplete
              }
              disabled={isUploading}
            >
              {item.completed && <span className="checkmark">✓</span>}
            </button>
          </div>

          <div className="action-item-info">
            <h3 className="action-title">{item.title}</h3>
            {item.description && (
              <p className="action-description">{item.description}</p>
            )}
            <div className="action-meta">
              <span className="created-time">
                Created: {new Date(item.createdAt).toLocaleString()}
              </span>
              {item.completed && item.completedAt && (
                <span className="completed-time">
                  Completed: {new Date(item.completedAt).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Completion Image */}
        {item.completed && item.completionImage && (
          <div className="completion-image-container">
            <img
              src={item.completionImage}
              alt="Completion proof"
              className="completion-image"
              onClick={() => setShowImagePreview(true)}
            />
            <span className="image-filename">{item.completionImageName}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="action-buttons">
          {!item.completed && (
            <>
              <button
                onClick={handleMarkComplete}
                disabled={isUploading}
                className="btn-success complete-with-image-button"
              >
                <span className="button-icon">📷</span>
                {isUploading ? "Uploading..." : "Complete with Image"}
              </button>
              <button
                onClick={handleQuickComplete}
                disabled={isUploading}
                className="btn-secondary quick-complete-button"
              >
                <span className="button-icon">✓</span>
                Quick Complete
              </button>
            </>
          )}

          <button
            onClick={() => onRemove(item.id)}
            className="btn-error remove-button"
          >
            <span className="button-icon">🗑️</span>
            Remove
          </button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {/* Image Preview Modal */}
      {showImagePreview && item.completionImage && (
        <div className="image-modal" onClick={() => setShowImagePreview(false)}>
          <div
            className="image-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={item.completionImage} alt="Completion proof" />
            <button
              className="close-modal"
              onClick={() => setShowImagePreview(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .action-item {
          background: var(--color-bg-primary);
          border: 2px solid var(--color-border);
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
          margin-bottom: 16px;
        }

        .action-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(65, 108, 109, 0.1);
        }

        .action-item.completed {
          background: linear-gradient(
            135deg,
            rgba(74, 124, 89, 0.1) 0%,
            rgba(74, 124, 89, 0.05) 100%
          );
          border-color: var(--color-success);
        }

        .action-item-content {
          padding: 20px;
        }

        .action-item-main {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
        }

        .checkbox-container {
          flex-shrink: 0;
        }

        .checkbox {
          width: 24px;
          height: 24px;
          border: 2px solid var(--color-border);
          border-radius: 6px;
          background: var(--color-bg-primary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          padding: 0;
        }

        .checkbox:hover {
          border-color: var(--color-primary);
          transform: scale(1.1);
        }

        .checkbox.checked {
          background: var(--color-success);
          border-color: var(--color-success);
        }

        .checkmark {
          color: white;
          font-size: 14px;
          font-weight: bold;
        }

        .action-item-info {
          flex: 1;
        }

        .action-title {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--color-text-primary);
          font-family: var(--font-secondary);
        }

        .action-item.completed .action-title {
          text-decoration: line-through;
          opacity: 0.7;
        }

        .action-description {
          margin: 0 0 12px 0;
          color: var(--color-text-secondary);
          font-size: 14px;
          line-height: 1.5;
        }

        .action-meta {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 12px;
          color: var(--color-text-secondary);
        }

        .completion-image-container {
          margin: 16px 0;
          text-align: center;
        }

        .completion-image {
          max-width: 200px;
          max-height: 150px;
          border-radius: 8px;
          cursor: pointer;
          border: 2px solid var(--color-border);
          transition: transform 0.2s ease;
        }

        .completion-image:hover {
          transform: scale(1.05);
        }

        .image-filename {
          display: block;
          font-size: 12px;
          color: var(--color-text-secondary);
          margin-top: 4px;
        }

        .action-buttons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .complete-with-image-button,
        .quick-complete-button,
        .remove-button {
          padding: 10px 16px;
          font-size: 14px;
          font-weight: 600;
          border-radius: 8px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .button-icon {
          font-size: 14px;
        }

        /* Image Modal */
        .image-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          cursor: pointer;
        }

        .image-modal-content {
          position: relative;
          max-width: 90vw;
          max-height: 90vh;
          cursor: default;
        }

        .image-modal-content img {
          max-width: 100%;
          max-height: 100%;
          border-radius: 8px;
        }

        .close-modal {
          position: absolute;
          top: -10px;
          right: -10px;
          background: white;
          border: none;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          cursor: pointer;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        @media (max-width: 768px) {
          .action-item-main {
            flex-direction: column;
            gap: 12px;
          }

          .action-buttons {
            flex-direction: column;
          }

          .complete-with-image-button,
          .quick-complete-button,
          .remove-button {
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .action-item-content {
            padding: 16px;
          }

          .action-title {
            font-size: 16px;
          }

          .completion-image {
            max-width: 150px;
            max-height: 100px;
          }
        }
      `}</style>
    </div>
  );
};

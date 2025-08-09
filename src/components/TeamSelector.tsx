import React, { useState, useEffect, useCallback } from "react";

export interface TeamSelectorProps {
  onTeamChange?: (team: string) => void;
  className?: string;
}

export type Team = "bma-training" | "caffeine" | "tmlt";

export const TeamSelector: React.FC<TeamSelectorProps> = ({
  onTeamChange,
  className = "",
}) => {
  const [selectedTeam, setSelectedTeam] = useState<Team>("bma-training");
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const teams: { value: Team; label: string; emoji: string }[] = [
    { value: "bma-training", label: "BMA Training", emoji: "🎓" },
    { value: "caffeine", label: "Caffeine", emoji: "☕" },
    { value: "tmlt", label: "TMLT", emoji: "🚀" },
  ];

  // Load team from localStorage on component mount
  useEffect(() => {
    const savedTeam = localStorage.getItem("commitq-selected-team") as Team;
    if (savedTeam && teams.some(team => team.value === savedTeam)) {
      setSelectedTeam(savedTeam);
    }
  }, []);

  // Calculate dropdown position
  const calculateDropdownPosition = useCallback(() => {
    if (!buttonRef.current) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const scrollTop = window.scrollY;
    const scrollLeft = window.scrollX;
    
    setDropdownPosition({
      top: rect.bottom + scrollTop + 4,
      left: rect.left + scrollLeft,
      width: rect.width
    });
  }, []);

  // Handle scroll and resize events for dynamic positioning
  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = () => {
      calculateDropdownPosition();
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    document.addEventListener("mousedown", handleClickOutside, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, calculateDropdownPosition]);

  // Save to localStorage and emit event when team changes
  const handleTeamChange = (team: Team, event?: React.MouseEvent) => {
    // Prevent event bubbling to avoid interference
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    setSelectedTeam(team);
    setIsOpen(false);
    
    // Save to localStorage
    localStorage.setItem("commitq-selected-team", team);
    
    // Emit custom event for other components to listen to
    const teamChangeEvent = new CustomEvent("teamchange", {
      detail: { team }
    });
    window.dispatchEvent(teamChangeEvent);
    
    // Call optional callback
    onTeamChange?.(team);
  };

  const toggleDropdown = () => {
    if (!isOpen) {
      calculateDropdownPosition();
    }
    setIsOpen(!isOpen);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape' && isOpen) {
      setIsOpen(false);
      buttonRef.current?.focus();
    }
  };

  const selectedTeamData = teams.find(team => team.value === selectedTeam)!;

  return (
    <>
      <div className={`team-selector ${className}`}>
        <div className="team-selector-label">Team:</div>
        <div className={`team-dropdown ${isOpen ? "open" : ""}`}>
          <button
            ref={buttonRef}
            className="team-button"
            onClick={toggleDropdown}
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            role="combobox"
          >
            <span className="team-emoji">{selectedTeamData.emoji}</span>
            <span className="team-name">{selectedTeamData.label}</span>
            <span className={`dropdown-arrow ${isOpen ? "open" : ""}`}>▼</span>
          </button>
        </div>
      </div>
      
      {/* Backdrop and dropdown as siblings to control z-index properly */}
      {isOpen && (
        <>
          <div 
            className="dropdown-backdrop"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsOpen(false);
            }}
          />
          <div 
            ref={dropdownRef}
            className="team-options" 
            role="listbox"
            onKeyDown={handleKeyDown}
            onMouseDown={(e) => {
              // Prevent dropdown from disappearing when clicking options
              e.preventDefault();
            }}
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`
            }}
          >
            {teams.map((team) => (
              <button
                key={team.value}
                className={`team-option ${
                  selectedTeam === team.value ? "selected" : ""
                }`}
                onClick={(e) => handleTeamChange(team.value, e)}
                role="option"
                aria-selected={selectedTeam === team.value}
              >
                <span className="team-emoji">{team.emoji}</span>
                <span className="team-name">{team.label}</span>
                {selectedTeam === team.value && (
                  <span className="checkmark">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}

      <style jsx>{`
        .dropdown-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 9998;
          background: transparent;
          cursor: default;
        }

        .team-selector {
          display: flex;
          align-items: center;
          gap: 8px;
          position: relative;
          z-index: 1000;
        }

        .team-selector-label {
          font-weight: 600;
          font-size: 14px;
          color: var(--color-text-light);
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          flex-shrink: 0;
        }

        .team-dropdown {
          position: relative;
          min-width: 140px;
        }

        .team-dropdown.open {
          z-index: 9999;
        }

        .team-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          color: var(--color-text-light);
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          backdrop-filter: blur(10px);
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          width: 100%;
          text-align: left;
        }

        .team-button:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }

        .team-button:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
        }

        .team-emoji {
          font-size: 16px;
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
        }

        .team-name {
          flex: 1;
          white-space: nowrap;
        }

        .dropdown-arrow {
          font-size: 10px;
          transition: transform 0.2s ease;
          opacity: 0.8;
        }

        .dropdown-arrow.open {
          transform: rotate(180deg);
        }

        .team-options {
          position: fixed;
          background: var(--color-bg-primary);
          border: 2px solid var(--color-border);
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(65, 108, 109, 0.15);
          z-index: 10000;
          overflow: hidden;
          backdrop-filter: blur(10px);
          animation: dropdownFade 0.2s ease-out;
          min-width: 140px;
          max-height: 200px;
          overflow-y: auto;
          pointer-events: auto;
        }

        .team-option {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: transparent;
          border: none;
          color: var(--color-text-primary);
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.15s ease;
          width: 100%;
          text-align: left;
          position: relative;
          z-index: 10001;
          pointer-events: auto;
        }

        .team-option:hover {
          background: var(--color-accent-light);
        }

        .team-option.selected {
          background: var(--color-primary);
          color: var(--color-text-light);
        }

        .team-option.selected:hover {
          background: var(--color-primary-dark);
        }

        .team-option .team-emoji {
          filter: none;
        }

        .team-option .team-name {
          flex: 1;
        }

        .checkmark {
          font-weight: bold;
          color: var(--color-text-light);
        }

        @keyframes dropdownFade {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .team-selector {
            gap: 6px;
          }

          .team-selector-label {
            font-size: 13px;
          }

          .team-dropdown {
            min-width: 120px;
          }

          .team-button {
            padding: 6px 10px;
            font-size: 13px;
          }

          .team-option {
            padding: 10px 12px;
            font-size: 13px;
          }
        }

        @media (max-width: 480px) {
          .team-selector-label {
            display: none;
          }

          .team-dropdown {
            min-width: 100px;
          }

          .team-button {
            padding: 6px 8px;
            font-size: 12px;
          }

          .team-emoji {
            font-size: 14px;
          }

          .team-option {
            padding: 8px 10px;
            font-size: 12px;
          }
        }
      `}</style>
    </>
  );
};

// Export utility functions for other components to use
export const getCurrentTeam = (): Team => {
  if (typeof window === "undefined") return "bma-training";
  const savedTeam = localStorage.getItem("commitq-selected-team") as Team;
  return savedTeam && ["bma-training", "caffeine", "tmlt"].includes(savedTeam) 
    ? savedTeam 
    : "bma-training";
};

export const subscribeToTeamChanges = (callback: (team: Team) => void) => {
  const handleTeamChange = (event: CustomEvent<{ team: Team }>) => {
    callback(event.detail.team);
  };

  window.addEventListener("teamchange", handleTeamChange as EventListener);
  
  // Return unsubscribe function
  return () => {
    window.removeEventListener("teamchange", handleTeamChange as EventListener);
  };
};
import React, { useEffect, useState } from "react";
import { Team, getCurrentTeam, subscribeToTeamChanges } from "./TeamSelector";

/**
 * Example component demonstrating how to listen to team changes
 * This component can be used as a reference for implementing team-aware functionality
 */
export const TeamListener: React.FC = () => {
  const [currentTeam, setCurrentTeam] = useState<Team>("bma-training");

  useEffect(() => {
    // Set initial team
    setCurrentTeam(getCurrentTeam());

    // Subscribe to team changes
    const unsubscribe = subscribeToTeamChanges((team) => {
      setCurrentTeam(team);
      console.log("Team changed to:", team);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  return (
    <div>
      <p>Current selected team: <strong>{currentTeam}</strong></p>
    </div>
  );
};
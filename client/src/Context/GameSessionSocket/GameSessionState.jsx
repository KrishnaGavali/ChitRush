import React, { createContext, useContext, useState } from "react";

const GameSessionStateContext = createContext(null);

// userId : {
//   id: string,
//   name: string,
//   toPlay: boolean,
//   isPlayer: boolean,
//   isReady: boolean,
//   chits: [],
//   isWinner: boolean,
//   index: number,
// }

export const GameSessionStateProvider = ({ children }) => {
  const gameSessionData = {
    roomCode: null,
    gamePhase: "wait", // wait, play, end
    noOfPlayers: -1,
    users: {},
  };

  const [gameSessionState, setGameSessionState] = useState(gameSessionData);

  return (
    <GameSessionStateContext.Provider
      value={{ gameSessionState, setGameSessionState }}
    >
      {children}
    </GameSessionStateContext.Provider>
  );
};

export const useGameSessionState = () => {
  const context = useContext(GameSessionStateContext);
  if (!context) {
    throw new Error(
      "useGameSessionState must be used within a GameSessionStateProvider"
    );
  }
  return context;
};

export default GameSessionStateProvider;

import React from "react";
import { useSocket } from "../../Context/SocketContext/SocketContext";
import { useGameSessionState } from "../../Context/GameSessionSocket/GameSessionState";

const PlayingInfo = () => {
  const storedUser = JSON.parse(localStorage.getItem("ChitRush_user"));
  const userId = storedUser?.id;
  const { socket } = useSocket();
  const { gameSessionState } = useGameSessionState();

  const isUserTurn = gameSessionState?.users?.[userId]?.toPlay;

  return (
    <div className="w-fit m-auto flex flex-col items-center justify-center gap-3 p-4 bg-orange-500 text-white rounded-xl shadow-lg font-extrabold text-lg">
      <p>{`UserName: ${storedUser?.name || "Unknown"}`}</p>

      {isUserTurn ? (
        <div className="bg-green-600 text-white px-4 py-2 rounded-full shadow-md">
          🎯 Your Turn!
        </div>
      ) : (
        <div className="bg-red-600 text-white px-4 py-2 rounded-full shadow-md">
          ⏳ Wait For Your Turn
        </div>
      )}
    </div>
  );
};

export default PlayingInfo;

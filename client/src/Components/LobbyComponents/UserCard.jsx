import React, { useEffect } from "react";
import { useGameSessionState } from "../../Context/GameSessionSocket/GameSessionState";
import { useSocket } from "../../Context/SocketContext/SocketContext";

const UserCard = ({ name, isPlayer, isTurn, isReady, gamePhase, userId }) => {
  const [isPlayerReady, setIsPlayerReady] = React.useState(isReady);
  const { socket } = useSocket();
  const { gameSessionState, setGameSessionState } = useGameSessionState();

  useEffect(() => {
    setIsPlayerReady(isReady);
  }, [isReady]);

  // Handle sending updates to server
  const handleReadyToggle = () => {
    if (!socket || !gameSessionState?.roomCode) return;

    const newReadyState = !isPlayerReady;
    setIsPlayerReady(newReadyState);

    socket.emit("update-user-ready", {
      roomCode: gameSessionState.roomCode,
      userId: userId,
      isReady: newReadyState,
    });
  };

  // Sync with props - but avoid unnecessary socket emissions
  useEffect(() => {
    if (isReady !== isPlayerReady) {
      setIsPlayerReady(isReady);
    }
  }, [isReady]);

  const getInitial = (name) => name?.charAt(0).toUpperCase() || "?";

  return (
    <div
      className={`bg-white w-32 h-56 rounded-lg shadow-md border transition-all duration-300
                ${isTurn ? "border-orange-500 border-2" : "border-gray-200"}
                hover:shadow-lg hover:scale-105 flex flex-col items-center py-4 px-2`}
    >
      <div
        className={`flex items-center justify-center w-16 h-16 text-white text-xl font-bold rounded-full mb-3
                    ${isTurn ? "bg-orange-500" : "bg-orange-300"}`}
      >
        {getInitial(name)}
      </div>

      <h4 className="font-semibold text-gray-800 text-center">
        {name || ""}
        {isPlayer && (
          <span className="text-orange-500 text-xs ml-1">(you)</span>
        )}
      </h4>

      {isPlayerReady && !isTurn && (
        <div className="mt-2 bg-green-100 px-2 py-1 rounded-full text-xs text-green-600">
          Ready
        </div>
      )}
      {!isPlayerReady && (
        <div className="mt-2 bg-red-100 px-2 py-1 rounded-full text-xs text-red-600">
          Not Ready
        </div>
      )}

      {gamePhase === "wait" && !isTurn && isPlayer && (
        <div className="mt-2 ">
          <button
            className={`text-white text-xs font-semibold py-1 px-3 rounded-full ${
              !isPlayerReady
                ? "bg-green-500 hover:bg-green-600"
                : "bg-red-500 hover:bg-red-600"
            } hover:cursor-pointer`}
            onClick={handleReadyToggle}
          >
            {isPlayerReady ? "Set Not Ready" : "Set Ready"}
          </button>
        </div>
      )}

      {isTurn && isReady && (
        <div className="mt-2 bg-orange-100 px-2 py-1 rounded-full text-xs text-orange-600">
          Current Turn
        </div>
      )}
    </div>
  );
};

export default UserCard;

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
      className={`bg-white w-[90px] sm:w-[110px] md:w-32 h-[170px] sm:h-[180px] md:h-56 rounded-lg shadow-md border transition-all duration-300
                ${isTurn ? "border-orange-500 border-2" : "border-gray-200"}
                hover:shadow-lg hover:scale-105 flex flex-col items-center py-3 sm:py-4 px-1 sm:px-2`}
    >
      <div
        className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-white text-base sm:text-lg md:text-xl font-bold rounded-full mb-2 sm:mb-3
                    ${isTurn ? "bg-orange-500" : "bg-orange-300"}`}
      >
        {getInitial(name)}
      </div>

      <h4 className="font-semibold text-gray-800 text-center text-sm sm:text-base truncate w-full px-1">
        {name || ""}
        <br />
        {isPlayer && (
          <span className="text-orange-500 text-xs block sm:inline">(you)</span>
        )}
      </h4>

      {isPlayerReady && !isTurn && (
        <div className="mt-1 sm:mt-2 bg-green-100 px-2 py-1 rounded-full text-[10px] sm:text-xs text-green-600">
          Ready
        </div>
      )}
      {!isPlayerReady && (
        <div className="mt-1 sm:mt-2 bg-red-100 px-2 py-1 rounded-full text-[10px] sm:text-xs text-red-600">
          Not Ready
        </div>
      )}

      {gamePhase === "wait" && !isTurn && isPlayer && (
        <div className="mt-auto mb-1 sm:mb-2">
          <button
            className={`text-white text-[10px] sm:text-xs font-semibold py-1 px-2 sm:px-3 rounded-full ${
              !isPlayerReady
                ? "bg-green-500 hover:bg-green-600 active:bg-green-700"
                : "bg-red-500 hover:bg-red-600 active:bg-red-700"
            } hover:cursor-pointer touch-manipulation`}
            onClick={handleReadyToggle}
          >
            {isPlayerReady ? "Not Ready" : "Ready"}
          </button>
        </div>
      )}

      {isTurn && isReady && (
        <div className="mt-1 sm:mt-2 bg-orange-100 px-2 py-1 rounded-full text-[10px] sm:text-xs text-orange-600">
          Current Turn
        </div>
      )}
    </div>
  );
};

export default UserCard;

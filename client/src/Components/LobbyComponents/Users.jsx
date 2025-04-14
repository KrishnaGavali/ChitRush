import React, { useEffect } from "react";
import UserCard from "./UserCard";
import { useGameSessionState } from "../../Context/GameSessionSocket/GameSessionState";
import { motion, AnimatePresence } from "framer-motion"; // Fixed import
import { useSocket } from "../../Context/SocketContext/SocketContext";

const Users = () => {
  const { gameSessionState, setGameSessionState } = useGameSessionState();
  const users = Object.values(gameSessionState.users || {});

  const [roomCodeCopied, setRoomCodeCopied] = React.useState(false);
  const { socket } = useSocket();

  const copyRoomCode = () => {
    navigator.clipboard.writeText(gameSessionState.roomCode);
    setRoomCodeCopied(true);
    setTimeout(() => {
      setRoomCodeCopied(false);
    }, 2000);
  };

  useEffect(() => {
    if (!socket) return;

    const handleUserReadyUpdate = (data) => {
      console.log("Update user ready", { data });
      setGameSessionState((prevState) => {
        if (!prevState.users || !prevState.users[data.userId]) return prevState;
        return {
          ...prevState,
          users: {
            ...prevState.users,
            [data.userId]: {
              ...prevState.users[data.userId],
              isReady: data.isReady,
            },
          },
        };
      });
    };

    socket.on("user-ready-updated", handleUserReadyUpdate);

    // Cleanup event listener when component unmounts
    return () => {
      socket.off("user-ready-updated", handleUserReadyUpdate);
    };
  }, [socket, setGameSessionState]);

  return (
    <div className="flex justify-center items-center min-h-screen p-2 sm:p-4">
      <div className="w-full max-w-4xl mx-auto text-center bg-white/90 rounded-lg shadow-lg p-3 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-orange-600 text-center">
          ChitRush
        </h1>
        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-6 text-orange-500 bangers-regular">
          Players in Room: {users.length}
        </h2>

        {/* Responsive grid layout */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4">
          {users.map((user) => (
            <UserCard
              key={user.id}
              name={user.name}
              isPlayer={user.isPlayer ? user.isPlayer : false}
              isTurn={user.toPlay}
              isReady={user.isReady}
              gamePhase={gameSessionState.gamePhase}
              userId={user.id}
            />
          ))}
        </div>

        {users.length === 0 && (
          <div className="text-gray-500 py-4 sm:py-8 text-sm sm:text-base">
            No players have joined yet. Share your room code with friends!
          </div>
        )}

        <div className="mt-4 sm:mt-8 text-center">
          <AnimatePresence mode="wait">
            {users.length === 8 ? (
              <motion.p
                key="full-room"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-red-500 font-bold bangers-regular text-lg sm:text-xl"
              >
                Room is full! Please create a new room.
              </motion.p>
            ) : (
              <motion.p
                key="waiting-room"
                className="text-gray-500 font-bold bangers-regular text-lg sm:text-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Waiting for players to join... 4-8 players needed to start!
              </motion.p>
            )}
          </AnimatePresence>

          <div className="flex flex-col sm:flex-row items-center justify-center mt-2 gap-2 sm:gap-4">
            <p className="text-orange-500 font-bold bangers-regular text-lg sm:text-xl">
              Room Code: {gameSessionState.roomCode}
            </p>
            <button
              onClick={copyRoomCode}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-orange-500 text-white text-sm rounded-lg shadow hover:bg-orange-600 active:bg-orange-700 transition-colors"
              aria-label="Copy room code"
            >
              {roomCodeCopied ? "Copied!" : "Copy Code"}
            </button>
          </div>

          <p className="mt-3 sm:mt-4 text-gray-700 text-sm sm:text-base">
            Game will start when all players are ready!
          </p>
          <p className="mt-2 sm:mt-3 text-white text-sm sm:text-base font-semibold bg-red-500 w-fit rounded-lg p-2 mx-auto">
            Don't hit "Ready" if all players haven't joined, or the game will
            start automatically!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Users;

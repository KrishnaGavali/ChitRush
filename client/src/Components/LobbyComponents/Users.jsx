import React, { useEffect } from "react";
import UserCard from "./UserCard";
import { useGameSessionState } from "../../Context/GameSessionSocket/GameSessionState";
import { motion } from "motion/react";
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
      "Update user ready", { data };
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
  }, [gameSessionState.users]);

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <div className="w-full max-w-4xl mx-auto text-center bg-white/90 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-orange-500 bangers-regular">
          Players in Room: {users.length}
        </h2>

        {/* Vertical card grid layout */}
        <div className="flex items-center justify-center flex-wrap gap-4">
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
          <div className="text-gray-500 py-8">
            No players have joined yet. Share your room code with friends!
          </div>
        )}

        <div className="mt-8 text-center">
          {users.length === 8 ? (
            <p className="text-red-500 font-bold bangers-regular text-xl">
              Room is full! Please create a new room.
            </p>
          ) : (
            <motion.p
              className="text-gray-500 font-bold bangers-regular text-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Waiting for players to join...
            </motion.p>
          )}
          <p className="mt-2 text-orange-500 font-bold bangers-regular text-xl">
            Room Code: {gameSessionState.roomCode}
          </p>
          <button
            onClick={copyRoomCode}
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg shadow hover:bg-orange-600"
          >
            {roomCodeCopied ? "Copied!" : "Copy Room Code"}
          </button>
          <p className="mt-4 text-gray-700">
            Game will start when all players are ready!{" "}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Users;

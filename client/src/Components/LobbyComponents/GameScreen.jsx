import React, { useState } from "react";
import { useParams } from "react-router";
import { useEffect } from "react";
import Card from "../GameComponents/Card";
import Users from "../LobbyComponents/Users";
import { useSocket } from "../../Context/SocketContext/SocketContext";
import { useGameSessionState } from "../../Context/GameSessionSocket/GameSessionState";
import { AnimatePresence } from "motion/react";
import { motion } from "motion/react";

const GameScreen = () => {
  const { id } = useParams();
  const dropBoxRef = React.useRef(null);
  const [showCard, setShowCard] = React.useState(false);
  const { socket } = useSocket();
  const { gameSessionState, setGameSessionState } = useGameSessionState();
  const [chitsData, setChitsData] = useState(["✅", "😅", "🔥", "😅"]);
  const storedUser = JSON.parse(localStorage.getItem("ChitRush_user"));
  const userId = storedUser.id;

  useEffect(() => {
    setChitsData(gameSessionState.users[userId].chits);
  }, [gameSessionState.users]);

  useEffect(() => {
    if (!socket) return;

    socket.on("card-passed", (data) => {
      console.log("card-passed : ", data);

      const { userId, emoji } = data;
      setGameSessionState((prevState) => {
        const updatedUsers = { ...prevState.users };
        updatedUsers[data.nextUserId].chits.push(emoji);
        return {
          ...prevState,
          users: updatedUsers,
        };
      });
    });

    return () => {
      socket.off("card-passed");
    };
  }, [socket]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCard(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <div className=" flex flex-col itmes-center justify-center h-screen w-screen p-3 md:justify-start ">
        <div
          className="drop-zone flex items-center justify-center bg-gray-200 rounded-lg shadow-md w-16 h-1/4 absolute -left-4 top-1/2 transform -translate-y-1/2 border-4 border-dashed border-gray-400"
          ref={dropBoxRef}
        >
          <p className="text-center text-gray-600"></p>
        </div>
        <div className="gameNavbar">
          <div className="flex items-center justify-between text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-orange-500">
              ChitRush
            </h1>
            <p className="text-lg md:text-xl text-white bg-orange-500 p-2 rounded-lg shadow-md">
              Room Code: <span className="font-semibold text-white">{id}</span>
            </p>
          </div>
        </div>
        <div className="w-full h-screen flex justify-center items-center">
          <div className="grid grid-cols-2 gap-4">
            <AnimatePresence mode="wait">
              {chitsData.map((card, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    key={index}
                    showCard={showCard}
                    emoji={card}
                    dropBoxRef={dropBoxRef}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
};

export default GameScreen;

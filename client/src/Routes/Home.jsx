import React, { useState } from "react";
import "../App.css";
import CreateRoomScreen from "../Components/HomeComponents/CreateRoomScreen";
import JoinRoomScreen from "../Components/HomeComponents/JoinRoomScreen";
import { Users, LogIn } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

const Home = () => {
  const [show, setShow] = useState("create-room");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-screen min-w-screen w-full px-2 sm:px-6 lg:px-8 quicksand-bold"
      style={{
        background: "linear-gradient(325deg, #ff8800 0%, #ffffff 100%)",
      }}
    >
      <div className="w-full max-w-xs sm:max-w-md md:max-w-lg bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-orange-600 text-center">
          ChitRush
        </h1>
        <p className="text-sm sm:text-base text-gray-700 text-center mt-1 sm:mt-2 quicksand-regular">
          The Ultimate Online Chit Game
        </p>
        <div className="sm:p-3 mt-2" id="quick-info-rules-div">
          <p className="text-xs text-gray-600 quicksand-regular">
            <span
              style={{
                color: "var(--color-orange-500)",
                fontWeight: "900",
              }}
            >
              Rules:
            </span>{" "}
            Each player gets 4 random cards. Pass unwanted cards on your turn.
            Collect 4 cards of the same emoji😀 to win.
          </p>
        </div>
        <div className="flex justify-center items-center mt-3 sm:mt-4 border-b border-gray-300">
          <p
            className={`cursor-pointer w-1/2 text-center py-1 sm:py-2 text-sm sm:text-base md:text-lg ${
              show === "create-room"
                ? "border-b-2 border-amber-600 text-amber-600 font-semibold"
                : "text-gray-600 "
            }`}
            onClick={() => setShow("create-room")}
          >
            <Users className="inline mr-1 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" />
            Create Room
          </p>
          <p
            className={`cursor-pointer w-1/2 text-center py-1 sm:py-2 text-sm sm:text-base md:text-lg ${
              show === "join-room"
                ? "border-b-2 border-amber-600 text-amber-600 font-semibold"
                : "text-gray-600 "
            }`}
            onClick={() => setShow("join-room")}
          >
            <LogIn className="inline mr-1 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" />
            Join Room
          </p>
        </div>
        <div className="mt-4 sm:mt-6">
          <AnimatePresence mode="wait">
            {show === "create-room" && (
              <CreateRoomScreen handleShow={setShow} />
            )}
            {show === "join-room" && <JoinRoomScreen handleShow={setShow} />}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default Home;

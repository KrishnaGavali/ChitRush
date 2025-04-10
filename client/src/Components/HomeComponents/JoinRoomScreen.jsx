import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useNavigate } from "react-router";
import { useSocket } from "../../Context/SocketContext/SocketContext";

const JoinRoomScreen = () => {
  const nameRef = useRef(null);
  const roomCodeRef = useRef(null);
  const navigate = useNavigate();
  const { socket } = useSocket();

  const [showAlertMsg, setShowAlertMsg] = useState(null);

  useEffect(() => {
    if (showAlertMsg) {
      const timer = setTimeout(() => setShowAlertMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [showAlertMsg]);

  const genearteUserId = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 10; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return result;
  };

  const handleJoinRoom = () => {
    // check for name and room code empty
    if (!nameRef.current.value) {
      setShowAlertMsg("Please enter your name");
      return;
    }
    if (!roomCodeRef.current.value) {
      setShowAlertMsg("Please enter a room code");
      return;
    }

    socket.emit(
      "check-room-exits", // socket to check if room exists
      {
        roomCode: roomCodeRef.current.value,
      },
      (response) => {
        if (response.roomExits) {
          if (response.roomFull) {
            setShowAlertMsg("Room is full"); // show alert message if room is full
            return;
          }

          // if room exists
          localStorage.setItem(
            // set user data in local storage
            "ChitRush_user",
            JSON.stringify({
              name: nameRef.current.value,
              id: genearteUserId(),
              action: "join",
            })
          );
          navigate(`/room/${roomCodeRef.current.value}`); // navigate to room page
        } else {
          setShowAlertMsg("Room does not exist"); // show alert message if room does not exist
        }
      }
    );

    // navigate(`/room/${roomCodeRef.current.value}`);
  };

  return (
    <motion.div
      className="quicksand-bold"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      exit={{ opacity: 0 }}
    >
      <div className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Your Name
          </label>
          <input
            ref={nameRef}
            type="text"
            id="name"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Enter your name"
            style={{
              color: "var(--color-orange-500)",
            }}
          />
        </div>

        <div>
          <label
            htmlFor="room-code"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Room Code
          </label>
          <input
            ref={roomCodeRef}
            type="text"
            id="room-code"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Enter room code"
            style={{
              color: "var(--color-orange-500)",
            }}
          />
        </div>
        <motion.button
          type="button"
          className="w-full py-2 px-4 bg-orange-500  text-white font-medium rounded-md  mt-2"
          whileTap={{ scale: 0.95, opacity: 0.8 }}
          transition={{ duration: 0.1 }}
          onClick={handleJoinRoom}
        >
          Join Room
        </motion.button>
        <div className="text-center text-gray-500 text-sm" id="quick-info">
          Got a room code from a friend? Enter it above to join their game!
        </div>
      </div>
      <AnimatePresence mode="wait">
        {showAlertMsg && (
          <motion.div
            className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg z-50 animate-fade-in-out"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            {showAlertMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default JoinRoomScreen;

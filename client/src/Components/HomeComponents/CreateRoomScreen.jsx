import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence } from "motion/react"; // Corrected import
import { useNavigate } from "react-router"; // Fixed router import
import { useSocket } from "../../Context/SocketContext/SocketContext";
import "../../App.css";
import { motion } from "motion/react";

const CreateRoomScreen = () => {
  const [showAlertMsg, setShowAlertMsg] = useState(null);
  const navigate = useNavigate();
  const nameRef = useRef(null);
  const { socket } = useSocket();

  useEffect(() => {
    if (showAlertMsg) {
      const timer = setTimeout(() => setShowAlertMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [showAlertMsg]);

  const generateRoomCode = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 4; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return result;
  };

  const generateUserId = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 10; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return result;
  };

  const handleCreateRoom = () => {
    // Safe check for nameRef and its value
    if (!nameRef?.current?.value) {
      setShowAlertMsg("Please enter your name");
      return;
    }

    const roomCode = generateRoomCode();

    socket.emit(
      "check-room-exits",
      {
        roomCode: roomCode,
      },
      (response) => {
        if (response.roomExits) {
          setShowAlertMsg("Room already exists");
          return;
        } else {
          localStorage.setItem(
            "ChitRush_user",
            JSON.stringify({
              name: nameRef.current.value,
              id: generateUserId(),
              action: "create",
            })
          );

          // Navigate after successful handling
          navigate(`/room/${roomCode}`);
        }
      }
    );
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
            className="block text-sm font-medium text-gray-700 mb-1 bangers-regular"
          >
            Your Name
          </label>
          <input
            type="text"
            id="name"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 "
            required
            ref={nameRef}
            placeholder="Enter your name"
            style={{
              color: "var(--color-orange-500)",
            }}
          />
        </div>
        <motion.button
          type="button"
          className="w-full py-2 px-4 bg-orange-500 text-white font-medium rounded-md mt-2 bangers-regular"
          whileTap={{ scale: 0.95, opacity: 0.8 }}
          transition={{ duration: 0.1 }}
          onClick={handleCreateRoom}
        >
          Create Room
        </motion.button>
        <div className="text-center text-gray-500 text-sm">
          Create a room and share the code with friends to play together!
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

export default CreateRoomScreen;

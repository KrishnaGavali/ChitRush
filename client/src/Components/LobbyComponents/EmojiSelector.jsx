import React, { useState } from "react";
import propTypes from "prop-types";
import GraphemeSplitter from "grapheme-splitter";
import { AnimatePresence, motion } from "motion/react";
import "../../App.css";
import { useSocket } from "../../Context/SocketContext/SocketContext";
import { useParams } from "react-router";

const splitter = new GraphemeSplitter();

const EmojiSelector = ({ showEmojiSelector }) => {
  const [emoji, setEmoji] = useState("");
  const [alert, setAlert] = useState({ show: false, message: "", status: "" });
  const { id } = useParams();

  const { socket } = useSocket();

  const handleSubmit = () => {
    if (emoji.trim()) {
      setAlert({
        show: true,
        message: `Setting emoji... : ${emoji}`,
        status: "wait",
      });

      socket.emit("set-emoji", { emoji: emoji, roomCode: id }, (response) => {
        if (response.status === "success") {
          setAlert({
            show: true,
            message: "Emoji set successfully!",
            status: "success",
          });

          // Show alert then hide with animation, then close selector
          setTimeout(() => {
            setAlert({ show: false, message: "" });

            // Wait for exit animation to finish
            setTimeout(() => {
              showEmojiSelector(false);
            }, 300); // Match this to motion exit duration
          }, 2000);
        } else {
          setAlert({
            show: true,
            message: response.message,
            status: "error",
          });

          // Auto-hide alert
          setTimeout(() => {
            setAlert({ show: false, message: "" });
          }, 2000);
        }
      });
    } else {
      setAlert({
        show: true,
        message: "Please enter an emoji!",
        status: "error",
      });

      setTimeout(() => {
        setAlert({ show: false, message: "" });
      }, 2000);
    }
  };

  if (!showEmojiSelector) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30"
    >
      <motion.div
        className="bg-white rounded-lg shadow-lg p-6 sm:p-8 w-[90%] max-w-md quicksand-bold"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence>
          {alert.show && (
            <motion.div
              key="alert"
              className="fixed top-4 right-4 text-white px-4 py-2 rounded-md shadow-lg z-50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              style={{
                backgroundColor:
                  alert.status === "success"
                    ? "var(--color-green-500)"
                    : alert.status === "wait"
                    ? "var(--color-orange-500)"
                    : "var(--color-red-500)",
              }}
            >
              {alert.message}
            </motion.div>
          )}
        </AnimatePresence>

        <h2 className="text-center text-2xl font-extrabold text-orange-600 mb-5 bangers-regular">
          Select Emoji
        </h2>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="emoji-input"
              className="block text-sm font-medium text-gray-700 mb-1 bangers-regular"
            >
              Your Emoji
            </label>
            <input
              id="emoji-input"
              type="text"
              value={emoji}
              onChange={(e) => {
                const graphemes = splitter.splitGraphemes(e.target.value);
                setEmoji(graphemes[0] || "");
              }}
              placeholder="Type your emoji..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-3xl text-center"
              style={{
                color: "var(--color-orange-500)",
              }}
            />
          </div>

          <motion.button
            onClick={handleSubmit}
            className="w-full py-2 px-4 bg-orange-500 text-white font-medium rounded-md mt-2 bangers-regular"
            whileTap={{ scale: 0.95, opacity: 0.8 }}
            transition={{ duration: 0.1 }}
          >
            Submit
          </motion.button>

          <div className="text-center text-gray-500 text-sm">
            Choose an emoji that represents your game piece!
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

EmojiSelector.propTypes = {
  showEmojiSelector: propTypes.func.isRequired,
};

export default EmojiSelector;

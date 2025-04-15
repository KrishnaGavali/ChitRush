import React, { useRef, useState } from "react";
import Flippy, { FrontSide, BackSide } from "react-flippy";
import { motion } from "motion/react";
import { useSocket } from "../../Context/SocketContext/SocketContext";
import { useGameSessionState } from "../../Context/GameSessionSocket/GameSessionState";

const Card = ({ emoji, showCard, dropBoxRef }) => {
  const cardRef = useRef(null);
  const [isInDropbox, setIsInDropbox] = useState(false);
  const [showAlert, setShowAlert] = useState(false); // State for alert visibility
  const { socket } = useSocket();
  const { gameSessionState, setGameSessionState } = useGameSessionState();
  const storedUser = JSON.parse(localStorage.getItem("ChitRush_user"));

  const cardStyles = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "10px",
    backgroundColor: "white",
    overflow: "hidden",
  };

  const handleDrag = (event, info) => {
    const dropboxRect = dropBoxRef.current.getBoundingClientRect();
    const isInDropbox =
      info.point.x > dropboxRect.left &&
      info.point.x < dropboxRect.right &&
      info.point.y > dropboxRect.top &&
      info.point.y < dropboxRect.bottom;

    setIsInDropbox(isInDropbox);
  };

  const handleDragEnd = (event, info) => {
    if (isInDropbox) {
      if (!socket) return;

      const storedUser = JSON.parse(localStorage.getItem("ChitRush_user"));
      const userId = storedUser.id;

      if (gameSessionState.users[userId].toPlay === false) {
        setShowAlert(true); // Show alert
        setTimeout(() => setShowAlert(false), 2000); // Hide alert after 2 seconds
        setIsInDropbox(false); // Reset drop state
        return;
      }

      socket.emit("card-passed", {
        roomCode: gameSessionState.roomCode,
        userId: userId,
        userIndex: gameSessionState.users[userId].index,
        emoji: emoji,
      });

      const chitsArray = gameSessionState.users[userId].chits;

      const updatedChitsArray = [...chitsArray];
      const indexToRemove = updatedChitsArray.indexOf(emoji);
      if (indexToRemove !== -1) {
        updatedChitsArray.splice(indexToRemove, 1);
      }

      setGameSessionState((prevState) => ({
        ...prevState,
        users: {
          ...prevState.users,
          [userId]: {
            ...prevState.users[userId],
            chits: updatedChitsArray,
            toPlay: false,
          },
        },
      }));

      setIsInDropbox(false);
    }
  };

  return (
    <>
      {showAlert && (
        <div
          style={{
            position: "absolute",
            bottom: "10px",
            left: "10px",
            backgroundColor: "red",
            color: "white",
            padding: "10px",
            borderRadius: "10px",
            fontWeight: "bolder",
            zIndex: 1000,
          }}
        >
          Not your turn!
        </div>
      )}
      <motion.div
        ref={cardRef}
        drag
        dragSnapToOrigin
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{ cursor: "grab" }}
        whileTap={{ cursor: "grabbing" }}
        animate={{ scale: isInDropbox ? 0.75 : 1 }}
      >
        <Flippy
          isFlipped={showCard}
          flipDirection="vertical"
          flipOnHover={false}
          flipOnClick={false}
          style={{ width: "100px", height: "150px" }}
          onClick={() => {}}
          onMouseEnter={() => {}}
          onMouseLeave={() => {}}
        >
          <FrontSide
            style={{ ...cardStyles, fontSize: "24px", color: "white" }}
          >
            {/* Optional front content */}
          </FrontSide>
          <BackSide style={{ ...cardStyles, fontSize: "50px", color: "black" }}>
            {emoji}
          </BackSide>
        </Flippy>
      </motion.div>
    </>
  );
};

export default Card;

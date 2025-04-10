import React, { useEffect, useState } from "react";
import "../App.css";
import { useSocket } from "../Context/SocketContext/SocketContext";
import { useParams } from "react-router"; // Fix import
import { useGameSessionState } from "../Context/GameSessionSocket/GameSessionState";
import EmojiSelector from "../Components/LobbyComponents/EmojiSelector";
import Users from "../Components/LobbyComponents/Users";

const Lobby = () => {
  const { socket } = useSocket();
  const { id } = useParams();
  const [showGameScreen, setShowGameScreen] = useState(false);
  const [emojiSelected, setEmojiSelected] = useState(null);
  const { gameSessionState, setGameSessionState } = useGameSessionState();
  const [showEmojiSelector, setShowEmojiSelector] = useState(true);

  const ShowEmojiSelector = (value) => {
    setShowEmojiSelector(value);
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("ChitRush_user"));

    if (!socket) return;

    // Setup socket event listeners first
    socket.on("user-joined", (data) => {
      // Update gameSessionState to include the new user
      setGameSessionState((prevState) => {
        const updatedUsers = { ...prevState.users };
        updatedUsers[data.id] = {
          id: data.id,
          name: data.name,
          toPlay: false,
          isReady: false,
          chits: [],
          isWinner: false,
          index: data.index,
        };

        return {
          ...prevState,
          noOfPlayers: prevState.noOfPlayers + 1,
          users: updatedUsers,
        };
      });
    });

    // Then emit room join events
    if (storedUser.action === "create") {
      socket.emit(
        "create-room",
        {
          roomCode: id,
          id: storedUser.id,
          name: storedUser.name,
        },
        (response) => {
          if (response.success) {
            setGameSessionState((prevState) => ({
              ...prevState,
              roomCode: id,
              gamePhase: "wait",
              noOfPlayers: 1,
              users: {
                [storedUser.id]: {
                  id: storedUser.id,
                  name: storedUser.name,
                  toPlay: false,
                  isPlayer: true,
                  isReady: false,
                  chits: [],
                  isWinner: false,
                  index: 1,
                },
              },
            }));
          }
        }
      );
    } else if (storedUser.action === "join") {
      socket.emit(
        "join-room",
        {
          roomCode: id,
          id: storedUser.id,
          name: storedUser.name,
        },
        (response) => {
          if (response.success) {
            response.usersAlreadyExitsObj[storedUser.id] = {
              id: storedUser.id,
              name: storedUser.name,
              isPlayer: true,
              isReady: false,
              chits: [],
              isWinner: false,
              toPlay: false,
              index: response.noOfPlayers,
            };

            setGameSessionState((prevState) => ({
              ...prevState,
              roomCode: id,
              gamePhase: "wait",
              noOfPlayers: response.noOfPlayers,
              users: response.usersAlreadyExitsObj,
            }));
          }
        }
      );
    }

    // Cleanup function
    return () => {
      socket.off("user-joined");
      socket.off("create-room");
      socket.off("join-room");
    };
  }, [socket, id]); // Depend on socket and id

  useEffect(() => {
    console.log("Game Session State : ", gameSessionState);
  }, [gameSessionState]);

  return (
    <div
      className="min-h-screen min-w-screen quicksand-regular"
      style={{
        background: "linear-gradient(325deg, #ff8800 0%, #ffffff 100%)",
      }}
    >
      {showEmojiSelector && socket?.connected && (
        <div className="min-h-screen w-full inset-0 fixed z-50 bg-black/30">
          <EmojiSelector showEmojiSelector={ShowEmojiSelector} />
        </div>
      )}

      {socket?.connected && gameSessionState.gamePhase === "wait" && <Users />}
    </div>
  );
};

export default Lobby;

import React from "react";
import { useNavigate } from "react-router";
import { useWindowSize } from "react-use";
import Confetti from "react-confetti";

const WinnerScreen = ({ WinnerData }) => {
  const navigate = useNavigate();
  const { width, height } = useWindowSize();

  return (
    <>
      <Confetti width={width} height={height} />
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-400 to-orange-500 p-6 text-white font-bold">
        <div className="bg-white text-orange-600 p-8 rounded-2xl shadow-2xl text-center max-w-md w-full">
          <h1 className="text-4xl font-extrabold mb-4">
            🎉 We Have a Winner! 🎉
          </h1>
          <p className="text-2xl mb-2">
            👑 <span className="text-3xl">{WinnerData?.name}</span>
          </p>
          <p className="text-xl mb-4">with chits:</p>
          <div className="text-4xl flex justify-center gap-3 mb-6">
            {WinnerData?.chits?.map((emoji, index) => (
              <span key={index}>{emoji}</span>
            ))}
          </div>

          <button
            onClick={() => navigate("/")}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full text-lg transition-all duration-300 ease-in-out"
          >
            🔁 Back to Home
          </button>

          <p className="text-sm text-gray-700 mt-4">
            🔄 Refresh & create a new room to play again!
          </p>
        </div>
      </div>
    </>
  );
};

export default WinnerScreen;

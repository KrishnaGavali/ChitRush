import { createBrowserRouter, RouterProvider } from "react-router";

import React from "react";
import ReactDOM from "react-dom/client";
import Home from "./Routes/Home";
import Lobby from "./Routes/Lobby";
import { SocketProvider } from "./Context/SocketContext/SocketContext";
import { UsersProvider } from "./Context/UsersContext/UsersContext";
import { GameSessionStateProvider } from "./Context/GameSessionSocket/GameSessionState.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/room/:id",
    element: <Lobby />,
  },
]);

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
  <GameSessionStateProvider>
    <UsersProvider>
      <SocketProvider>
        <RouterProvider router={router} />
      </SocketProvider>
    </UsersProvider>
  </GameSessionStateProvider>
);

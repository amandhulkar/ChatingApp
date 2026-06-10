import React from "react";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import MainLayout from "./layouts/MainLayout";
import Chat from "./pages/Chat";
import Group from "./pages/Group";
import Profile from "./pages/Profile";

const router = createBrowserRouter([
  {
    path: "/",
    element: <SignUp />,
  },

  {
    path: "/signup",
    element: <SignUp />,
  },

  {
    path: "/login",
    element: <Login />,
  },

  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "chat",
        element: (
          <div className="flex items-center justify-center h-screen text-gray-600 font-semibold">
            Select user to start chat
             {/* or create group to start group chat */}
          </div>
          
        ),
      },
   
      // {
      //   path: "chat/:userId",
      //   element: <Chat />,
      // },
      // {
      //   path: "group/:groupId",
      //   element: <Group />,
      // },
    ],
  },
   {
        path: "chat/:userId",
        element: <Chat />,
      },
      {
        path: "group/:groupId",
        element: <Group />,
      },
  {
    path: "/profile",
    element: <Profile />,
  },
  {
    path: "*",

    element: (
      <div className="h-screen flex flex-col justify-center items-center bg-black text-white">
        <h1 className="text-8xl font-bold text-red-500">404</h1>

        <p className="text-2xl mt-4">Page Not Found</p>

        <p className="text-gray-400 mt-2">
          Oops! The page you are looking for does not exist.
        </p>
      </div>
    ),
  },
]);

const App = () => {
  return (
    <>
      <Toaster />
      <RouterProvider router={router} />
    </>
  );
};

export default App;

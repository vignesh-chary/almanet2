import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useQuery } from "@tanstack/react-query";
import {axiosInstance} from "../lib/axios";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  // Fetch authenticated user
  const { data: user, isSuccess } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/auth/me");
      return data;
    },
  });

  useEffect(() => {
    if (!isSuccess || !user?._id) return; // Ensure user data is available

    const newSocket = io(import.meta.env.VITE_API_URL, {
      query: { userId: user._id },
    });

    setSocket(newSocket);

    newSocket.on("getOnlineUsers", (users) => {
      setOnlineUsers(users);
    });

    return () => newSocket.disconnect();
  }, [isSuccess, user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext); // Removed error-throwing logic
};

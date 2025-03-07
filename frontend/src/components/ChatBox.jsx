import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSocket } from "../context/SocketContext";
import { axiosInstance } from "../lib/axios";
import { FiSend, FiMinimize2, FiMaximize2 } from "react-icons/fi";
import { IoClose, IoChatbubbleEllipsesOutline } from "react-icons/io5";

const ChatBox = () => {
  const { socket } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [activeChats, setActiveChats] = useState([]); // Stores all active chat sessions
  const [messageInputs, setMessageInputs] = useState({}); // Store message input for each chat
  const [users, setUsers] = useState([]);
  const [messagesMap, setMessagesMap] = useState({}); // Store messages by userId

  // Fetch authenticated user
  const { data: authUser } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/auth/me");
      return data;
    },
  });

  useEffect(() => {
    if (!authUser) return;
    socket?.emit("join", authUser._id);
    axiosInstance.get("/messages/users").then(({ data }) => setUsers(data));
    
    socket?.on("newMessage", (newMsg) => {
      setMessagesMap(prev => ({
        ...prev,
        [newMsg.senderId]: [...(prev[newMsg.senderId] || []), newMsg]
      }));
      
      // Add chat to active chats if not already active
      if (!activeChats.includes(newMsg.senderId)) {
        setActiveChats(prev => [...prev, newMsg.senderId]);
      }
    });
    
    return () => {
      socket?.off("newMessage");
    };
  }, [socket, authUser, activeChats]);

  const startChat = async (userId) => {
    // Check if chat already exists in active chats
    if (!activeChats.includes(userId)) {
      setActiveChats(prev => [...prev, userId]);
    }
    
    // Fetch messages if we don't have them already
    if (!messagesMap[userId]) {
      const { data } = await axiosInstance.get(`/messages/${userId}`);
      setMessagesMap(prev => ({
        ...prev,
        [userId]: data
      }));
    }
  };

  const closeChat = (userId) => {
    setActiveChats(prev => prev.filter(id => id !== userId));
  };

  const sendMessage = async (userId) => {
    const message = messageInputs[userId];
    if (!message?.trim()) return;
    
    const { data } = await axiosInstance.post(`/messages/send/${userId}`, { text: message });
    socket?.emit("sendMessage", { receiverId: userId, message: data });
    
    // Update messages
    setMessagesMap(prev => ({
      ...prev,
      [userId]: [...(prev[userId] || []), data]
    }));
    
    // Clear input
    setMessageInputs(prev => ({
      ...prev,
      [userId]: ""
    }));
  };

  const updateMessageInput = (userId, text) => {
    setMessageInputs(prev => ({
      ...prev,
      [userId]: text
    }));
  };

  const getUser = (userId) => {
    return users.find(u => u._id === userId) || { name: "User", avatar: "/default-avatar.png" };
  };

  if (!authUser) return null;

  return (
    <div className="fixed bottom-0 right-4 flex items-end space-x-2">
      {/* Individual Chat Windows */}
      {activeChats.map((userId, index) => (
        <div 
          key={userId}
          className="w-72 bg-white shadow-xl border rounded-t-lg flex flex-col mb-0"
          style={{ maxHeight: "450px" }}
        >
          {/* Chat Header */}
          <div className="bg-blue-600 text-white p-2 flex justify-between items-center rounded-t-lg">
            <span className="font-semibold truncate">{getUser(userId).name}</span>
            <div className="flex">
              <button className="p-1 hover:bg-blue-700 rounded">
                <FiMinimize2 size={16} />
              </button>
              <button 
                className="p-1 hover:bg-blue-700 rounded ml-1"
                onClick={() => closeChat(userId)}
              >
                <IoClose size={16} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-2 overflow-y-auto bg-gray-50" style={{ height: "300px" }}>
            {messagesMap[userId]?.map((msg, i) => (
              <div key={i} className={`flex ${msg.senderId === userId ? "justify-start" : "justify-end"}`}>
                <div
                  className={`p-2 rounded-lg my-1 max-w-[80%] ${
                    msg.senderId === userId ? "bg-gray-300" : "bg-blue-500 text-white"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input Field */}
          <div className="p-2 border-t flex items-center bg-white">
            <input
              type="text"
              className="flex-1 p-2 border rounded-lg focus:outline-none text-sm"
              value={messageInputs[userId] || ""}
              onChange={(e) => updateMessageInput(userId, e.target.value)}
              placeholder="Type a message..."
              onKeyPress={(e) => e.key === 'Enter' && sendMessage(userId)}
            />
            <button
              onClick={() => sendMessage(userId)}
              className="bg-blue-600 text-white p-2 ml-1 rounded-lg hover:bg-blue-700"
            >
              <FiSend size={16} />
            </button>
          </div>
        </div>
      ))}

      {/* Main Message Container */}
      <div className="w-72 bg-white shadow-xl border rounded-t-lg flex flex-col mb-0">
        {/* Header */}
        <div
          className="bg-blue-600 text-white p-3 flex justify-between items-center cursor-pointer rounded-t-lg"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="font-semibold">Messaging</span>
          {isOpen ? <IoClose size={20} /> : <IoChatbubbleEllipsesOutline size={20} />}
        </div>

        {/* User List */}
        {isOpen && (
          <div className="h-96 overflow-y-auto p-2">
            <h3 className="text-lg font-semibold mb-2">Chats</h3>
            {users.map((user) => (
              <div
                key={user._id}
                className="p-2 flex items-center gap-3 cursor-pointer hover:bg-gray-200 rounded-lg"
                onClick={() => startChat(user._id)}
              >
                <img 
                  src={user.avatar || "/default-avatar.png"} 
                  alt={user.name} 
                  className="w-10 h-10 rounded-full border"
                />
                <div className="flex-1">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-gray-500 truncate">
                    {messagesMap[user._id]?.length > 0 
                      ? messagesMap[user._id][messagesMap[user._id].length - 1].text
                      : "Start a new conversation"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBox;
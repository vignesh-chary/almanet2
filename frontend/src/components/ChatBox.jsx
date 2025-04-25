import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSocket } from "../context/SocketContext";
import { axiosInstance } from "../lib/axios";
import { FiSend, FiMinimize2, FiMaximize2 } from "react-icons/fi";
import { IoClose, IoChatbubbleEllipsesOutline } from "react-icons/io5";

const ChatBox = ({ initialUserId, initialUserName, initialUserAvatar, onClose }) => {
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
      setMessagesMap(prev => {
        const updatedMessages = {
          ...prev,
          [newMsg.senderId]: [...(prev[newMsg.senderId] || []), newMsg]
        };
        // Auto-scroll to latest message
        setTimeout(() => {
          const chatContainer = document.querySelector(`[data-chat-id="${newMsg.senderId}"]`);
          if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
          }
        }, 100);
        return updatedMessages;
      });

      // Add chat to active chats if not already active
      if (!activeChats.includes(newMsg.senderId)) {
        setActiveChats(prev => [...prev, newMsg.senderId]);
      }
    });

    return () => {
      socket?.off("newMessage");
    };
  }, [socket, authUser, activeChats]);

  // Initialize chat with initialUserId if provided
  useEffect(() => {
    if (initialUserId && !activeChats.includes(initialUserId)) {
      // Add initial user to users list if not already present
      if (!users.find(user => user._id === initialUserId)) {
        setUsers(prev => [...prev, {
          _id: initialUserId,
          name: initialUserName,
          avatar: initialUserAvatar
        }]);
      }
      startChat(initialUserId);
      setIsOpen(true);
    }
  }, [initialUserId, initialUserName, initialUserAvatar]);

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
    if (userId === initialUserId && onClose) {
      onClose();
    }
  };

  const sendMessage = async (userId) => {
    const message = messageInputs[userId];
    if (!message?.trim()) return;

    const { data } = await axiosInstance.post(`/messages/send/${userId}`, { text: message });
    socket?.emit("sendMessage", { receiverId: userId, message: data });

    // Update messages and auto-scroll
    setMessagesMap(prev => {
      const updatedMessages = {
        ...prev,
        [userId]: [...(prev[userId] || []), data]
      };
      // Auto-scroll to latest message
      setTimeout(() => {
        const chatContainer = document.querySelector(`[data-chat-id="${userId}"]`);
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      }, 100);
      return updatedMessages;
    });

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
    <div className="fixed bottom-0 right-4 flex items-end space-x-3 z-50">
      {/* Individual Chat Windows */}
      {activeChats.map((userId, index) => (
        <div
          key={userId}
          className="w-[420px] bg-white dark:bg-card-dark shadow-card border-0 rounded-t-2xl flex flex-col mb-0 transition-all duration-200 ease-in-out hover:shadow-lg"
          style={{ height: "500px" }}
        >
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-primary to-primary/90 text-white p-4 flex justify-between items-center rounded-t-2xl backdrop-blur-lg bg-opacity-90">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <img
                  src={getUser(userId).avatar || "/default-avatar.png"}
                  alt={getUser(userId).name}
                  className="w-8 h-8 rounded-full border-2 border-white/80"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-white"></div>
              </div>
              <span className="font-semibold truncate">{getUser(userId).name}</span>
            </div>
            <div className="flex space-x-1">
              <button className="p-1.5 hover:bg-white/20 rounded-full transition-colors duration-200 active:scale-95">
                <FiMinimize2 size={16} />
              </button>
              <button
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors duration-200 active:scale-95"
                onClick={() => closeChat(userId)}
              >
                <IoClose size={16} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div
            data-chat-id={userId}
            className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-secondary/50 to-white dark:from-background-dark dark:to-card-dark space-y-3 custom-scrollbar"
            style={{ height: "440px" }}
          >
            {messagesMap[userId]?.map((msg, i) => (
              <div key={i} className={`flex ${msg.senderId === userId ? "justify-start" : "justify-end"} animate-fade-in`}>
                <div
                  className={`p-3.5 rounded-2xl my-1 max-w-[85%] shadow-soft hover:shadow-card transition-all duration-300 ${msg.senderId === userId
                    ? "bg-white dark:bg-card-dark border border-muted/20 text-dark dark:text-text-dark hover:border-muted/30"
                    : "bg-gradient-to-r from-primary to-primary/90 text-white hover:from-primary/90 hover:to-primary"
                    }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input Field */}
          <div className="p-4 border-t border-muted/10 dark:border-border-dark flex items-center bg-white dark:bg-card-dark rounded-b-2xl shadow-inner">
            <input
              type="text"
              className="flex-1 px-5 py-3 bg-secondary/30 dark:bg-background-dark border border-muted/20 dark:border-border-dark rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm transition-all duration-200 hover:bg-secondary/50 dark:hover:bg-card-dark placeholder-dark/40 dark:placeholder-text-dark-muted dark:text-text-dark"
              value={messageInputs[userId] || ""}
              onChange={(e) => updateMessageInput(userId, e.target.value)}
              placeholder="Type a message..."
              onKeyPress={(e) => e.key === 'Enter' && sendMessage(userId)}
            />
            <button
              onClick={() => sendMessage(userId)}
              className="bg-primary text-white p-3 ml-3 rounded-full hover:bg-primary/90 transition-all duration-200 flex items-center justify-center hover:shadow-lg active:scale-95"
            >
              <FiSend size={18} />
            </button>
          </div>
        </div>
      ))}

      {/* Main Message Container - Only show if no initialUserId */}
      {!initialUserId && (
        <div className="w-[320px] bg-white dark:bg-card-dark shadow-card border-0 rounded-t-2xl flex flex-col mb-0 transition-all duration-300 ease-in-out hover:shadow-lg">
          {/* Header */}
          <div
            className="bg-gradient-to-r from-primary to-primary/90 text-white p-4 flex justify-between items-center cursor-pointer rounded-t-2xl backdrop-blur-lg bg-opacity-90 hover:from-primary/90 hover:to-primary"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="flex items-center space-x-2">
              <IoChatbubbleEllipsesOutline size={24} className="text-white/90" />
              <span className="font-semibold text-lg">Messaging</span>
            </div>
            <div className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors duration-200">
              {isOpen ? <IoClose size={22} /> : <FiMaximize2 size={18} />}
            </div>
          </div>

          {/* User List */}
          {isOpen && (
            <div
              className="overflow-y-auto p-4 custom-scrollbar"
              style={{ height: "440px" }}
            >
              <h3 className="text-lg font-semibold mb-4 px-2 text-gray-800 dark:text-text-dark">Recent Chats</h3>
              {users.map((user) => (
                <div
                  key={user._id}
                  className="p-3.5 flex items-center gap-4 cursor-pointer hover:bg-blue-50/50 dark:hover:bg-background-dark rounded-xl transition-all duration-200 group mb-2"
                  onClick={() => startChat(user._id)}
                >
                  <div className="relative">
                    <img
                      src={user.avatar || "/default-avatar.png"}
                      alt={user.name}
                      className="w-12 h-12 rounded-full border-2 border-gray-100 group-hover:border-blue-200 transition-colors duration-200"
                    />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-md"></div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-text-dark">{user.name}</div>
                    <div className="text-sm text-gray-500 dark:text-text-dark-muted truncate">
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
      )}
    </div>
  );
};

export default ChatBox;
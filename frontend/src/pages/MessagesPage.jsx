import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSocket } from "../context/SocketContext";
import { axiosInstance } from "../lib/axios";
import { FiSend, FiSearch } from "react-icons/fi";
import Sidebar from "../components/Sidebar";
import React from "react";

const MessagesPage = () => {
  const { socket } = useSocket();
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch authenticated user
  const { data: authUser } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/auth/me");
      return data;
    },
  });

  // Fetch messages for all users to sort by recent activity
  const { data: allMessages } = useQuery({
    queryKey: ["allMessages"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/messages/all");
      return data;
    },
  });

  useEffect(() => {
    if (!authUser) return;
    socket?.emit("join", authUser._id);
    axiosInstance.get("/messages/users").then(({ data }) => setUsers(data));

    socket?.on("newMessage", (newMsg) => {
      if (selectedUser && (newMsg.senderId === selectedUser._id || newMsg.receiverId === selectedUser._id)) {
        setMessages(prev => [...prev, newMsg]);
        // Auto-scroll to latest message
        setTimeout(() => {
          const chatContainer = document.querySelector(".messages-container");
          if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
          }
        }, 100);
      }
    });

    return () => {
      socket?.off("newMessage");
    };
  }, [socket, authUser, selectedUser]);

  // Sort users by their most recent message
  const sortedUsers = React.useMemo(() => {
    if (!users || !allMessages) return users;
    
    return [...users].sort((a, b) => {
      const aLastMessage = allMessages.find(msg => 
        msg.senderId === a._id || msg.receiverId === a._id
      );
      const bLastMessage = allMessages.find(msg => 
        msg.senderId === b._id || msg.receiverId === b._id
      );

      if (!aLastMessage && !bLastMessage) return 0;
      if (!aLastMessage) return 1;
      if (!bLastMessage) return -1;

      return new Date(bLastMessage.createdAt) - new Date(aLastMessage.createdAt);
    });
  }, [users, allMessages]);

  // Filter sorted users based on search query
  const filteredUsers = React.useMemo(() => {
    return sortedUsers.filter(user =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sortedUsers, searchQuery]);

  const selectUser = async (user) => {
    setSelectedUser(user);
    const { data } = await axiosInstance.get(`/messages/${user._id}`);
    setMessages(data);
    setTimeout(() => {
      const chatContainer = document.querySelector(".messages-container");
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 100);
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedUser) return;

    const { data } = await axiosInstance.post(`/messages/send/${selectedUser._id}`, { text: messageInput });
    socket?.emit("sendMessage", { receiverId: selectedUser._id, message: data });

    setMessages(prev => [...prev, data]);
    setMessageInput("");

    setTimeout(() => {
      const chatContainer = document.querySelector(".messages-container");
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 100);
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-background dark:bg-background-dark group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col w-80">
            <Sidebar user={authUser} />
          </div>
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="flex min-w-72 flex-col gap-3">
                <p className="text-text dark:text-text-dark text-4xl font-black leading-tight tracking-[-0.033em]">Messages</p>
                <p className="text-text-muted dark:text-text-dark-muted text-base font-normal leading-normal">Connect with your network.</p>
              </div>
            </div>
            <div className="bg-card dark:bg-card-dark rounded-lg shadow h-[calc(100vh-2rem)] flex overflow-hidden">
              {/* Users Sidebar */}
              <div className="w-1/3 border-r border-border dark:border-border-dark bg-secondary dark:bg-secondary-dark">
                <div className="p-4 border-b border-border dark:border-border-dark">
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted dark:text-text-dark-muted" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      className="w-full pl-10 pr-4 py-2 border border-border dark:border-border-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark/20 bg-background dark:bg-background-dark text-text dark:text-text-dark"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="overflow-y-auto h-[calc(100vh-10rem)]">
                  {filteredUsers.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => selectUser(user)}
                      className={`p-4 flex items-center space-x-3 cursor-pointer hover:bg-background dark:hover:bg-background-dark transition-colors ${
                        selectedUser?._id === user._id ? 'bg-background dark:bg-background-dark' : ''
                      }`}
                    >
                      <div className="relative">
                        <img
                          src={user.profilePicture || "/avatar.png"}
                          alt={user.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-accent dark:bg-accent-dark rounded-full border-2 border-secondary dark:border-secondary-dark"></div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-text dark:text-text-dark">{user.name}</h3>
                        <p className="text-sm text-text-muted dark:text-text-dark-muted truncate">
                          {allMessages?.find(msg => 
                            (msg.senderId === user._id || msg.receiverId === user._id)
                          )?.text || user.headline || 'LinkedIn Member'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 flex flex-col">
                {selectedUser ? (
                  <>
                    <div className="p-4 border-b border-border dark:border-border-dark bg-card dark:bg-card-dark">
                      <div className="flex items-center space-x-3">
                        <img
                          src={selectedUser.profilePicture || "/avatar.png"}
                          alt={selectedUser.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="font-semibold text-text dark:text-text-dark">{selectedUser.name}</h3>
                          <p className="text-sm text-text-muted dark:text-text-dark-muted">{selectedUser.headline || 'LinkedIn Member'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 messages-container bg-background dark:bg-background-dark">
                      {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.senderId === selectedUser._id ? "justify-start" : "justify-end"} mb-4`}>
                          <div
                            className={`p-3 rounded-lg max-w-[70%] ${msg.senderId === selectedUser._id
                              ? "bg-secondary dark:bg-secondary-dark text-text dark:text-text-dark"
                              : "bg-primary dark:bg-primary-dark text-white"
                              }`}
                          >
                            {msg.text}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 border-t border-border dark:border-border-dark bg-card dark:bg-card-dark">
                      <div className="flex space-x-3">
                        <input
                          type="text"
                          className="flex-1 px-4 py-2 border border-border dark:border-border-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark/20 bg-background dark:bg-background-dark text-text dark:text-text-dark"
                          placeholder="Type a message..."
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        />
                        <button
                          onClick={sendMessage}
                          className="px-4 py-2 bg-primary dark:bg-primary-dark text-white rounded-lg hover:bg-primary/90 dark:hover:bg-primary-dark/90 transition-colors"
                        >
                          <FiSend size={20} />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center bg-background dark:bg-background-dark">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-secondary dark:bg-secondary-dark rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiSend size={24} className="text-text-muted dark:text-text-dark-muted" />
                      </div>
                      <h3 className="text-xl font-semibold text-text dark:text-text-dark mb-2">Your Messages</h3>
                      <p className="text-text-muted dark:text-text-dark-muted">Select a user to start messaging</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
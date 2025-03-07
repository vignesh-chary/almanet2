import { useState, useEffect } from "react";
import axios from "axios";

const ChatWindow = ({ chat, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/chats/${chat._id}/messages`);
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [chat]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await axios.post("http://localhost:5000/api/messages/send", {
        chatId: chat._id,
        sender: "USER_ID_HERE", // Replace with actual logged-in user ID
        text: newMessage,
      });

      setMessages([...messages, response.data]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="fixed bottom-4 right-20 w-80 bg-white shadow-lg rounded-lg">
      <div className="p-4 border-b flex justify-between">
        <h2 className="text-lg font-semibold">{chat.participants[1].name}</h2>
        <button onClick={onClose}>✖</button>
      </div>

      <div className="p-4 max-h-60 overflow-y-auto">
        {messages.map((msg) => (
          <div key={msg._id} className="p-2 bg-gray-200 rounded my-1">
            {msg.text}
          </div>
        ))}
      </div>

      <div className="p-4 border-t flex">
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 p-2 border rounded"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button className="bg-blue-500 text-white px-4 ml-2 rounded" onClick={sendMessage}>
          ➤
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;

import { useState, useEffect, useRef } from 'react';
import { useChatStore } from '../../context/chatStore.ts';
import { useAuthStore } from '../../context/authStore.ts';
import './ChatWindow.css';

export const ChatWindow = () => {
  const { selectedConversation, messages, sendMessage } = useChatStore();
  const { user } = useAuthStore();
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation) return;

    await sendMessage(selectedConversation.id, messageText);
    setMessageText('');
  };

  if (!selectedConversation) {
    return (
      <div className="chat-window-empty">
        <p>Select a conversation to start chatting</p>
      </div>
    );
  }

  const getConversationName = () => {
    if (selectedConversation.name) return selectedConversation.name;
    
    const otherParticipant = selectedConversation.participants.find(
      (p) => p.userId !== user?.id
    );
    return otherParticipant?.user.fullName || 'Unknown';
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h3>{getConversationName()}</h3>
        <span className="participants-count">
          {selectedConversation.participants.length} participants
        </span>
      </div>

      <div className="messages-container">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${
              message.senderId === user?.id ? 'sent' : 'received'
            }`}
          >
            <div className="message-sender">{message.sender.fullName}</div>
            <div className="message-body">{message.body}</div>
            <div className="message-time">
              {new Date(message.createdAt).toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="message-input-container" onSubmit={handleSend}>
        <input
          type="text"
          placeholder="Type a message..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

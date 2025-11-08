import { useEffect } from 'react';
import { useAuthStore } from '../context/authStore.ts';
import { useChatStore } from '../context/chatStore.ts';
import { socketService } from '../services/socket.ts';
import { ConversationList } from '../components/layout/ConversationList.tsx';
import { ChatWindow } from '../components/layout/ChatWindow.tsx';
import { NewChatModal } from '../components/layout/NewChatModal.tsx';
import './ChatPage.css';

export const ChatPage = () => {
  const { user, logout } = useAuthStore();
  const { loadConversations, addMessage } = useChatStore();

  useEffect(() => {
    loadConversations();

    // Listen for new messages
    socketService.onNewMessage((message) => {
      console.log('New message received:', message);
      addMessage(message);
    });

    return () => {
      socketService.offNewMessage();
    };
  }, [loadConversations, addMessage]);

  return (
    <div className="chat-page">
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <h3>Chats</h3>
          <div className="user-info">
            <span>{user?.fullName}</span>
            <button onClick={logout} className="logout-btn">Logout</button>
          </div>
        </div>
        <ConversationList />
        <NewChatModal />
      </div>
      
      <div className="chat-main">
        <ChatWindow />
      </div>
    </div>
  );
};

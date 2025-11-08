import { useChatStore } from '../../context/chatStore.ts';
import { useAuthStore } from '../../context/authStore.ts';
import './ConversationList.css';

export const ConversationList = () => {
  const { conversations, selectedConversation, selectConversation } = useChatStore();
  const { user } = useAuthStore();

  const getConversationName = (conversation: any) => {
    if (conversation.name) return conversation.name;
    
    // For 1-1 chats, show the other user's name
    const otherParticipant = conversation.participants.find(
      (p: any) => p.userId !== user?.id
    );
    return otherParticipant?.user.fullName || 'Unknown';
  };

  const getLastMessage = (conversation: any) => {
    if (conversation.messages && conversation.messages.length > 0) {
      return conversation.messages[0].body;
    }
    return 'No messages yet';
  };

  return (
    <div className="conversation-list">
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          className={`conversation-item ${
            selectedConversation?.id === conversation.id ? 'active' : ''
          }`}
          onClick={() => selectConversation(conversation.id)}
        >
          <div className="conversation-avatar">
            {getConversationName(conversation)[0].toUpperCase()}
          </div>
          <div className="conversation-info">
            <div className="conversation-name">
              {getConversationName(conversation)}
            </div>
            <div className="conversation-last-message">
              {getLastMessage(conversation)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

import { useState } from 'react';
import { useChatStore } from '../../context/chatStore.ts';
import './NewChatModal.css';

export const NewChatModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [groupName, setGroupName] = useState('');
  
  const { searchUsers, createConversation } = useChatStore();

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 0) {
      const results = await searchUsers(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const toggleUserSelection = (user: any) => {
    if (selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleCreate = async () => {
    if (selectedUsers.length === 0) return;

    const userIds = selectedUsers.map(u => parseInt(u.id));
    const name = selectedUsers.length > 1 ? groupName : undefined;

    await createConversation(userIds, name);
    
    // Reset and close
    setIsOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedUsers([]);
    setGroupName('');
  };

  return (
    <>
      <button className="new-chat-btn" onClick={() => setIsOpen(true)}>
        + New Chat
      </button>

      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>New Conversation</h3>
            
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />

            <div className="search-results">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className={`user-item ${
                    selectedUsers.find(u => u.id === user.id) ? 'selected' : ''
                  }`}
                  onClick={() => toggleUserSelection(user)}
                >
                  <span>{user.fullName}</span>
                  <span className="username">@{user.username}</span>
                </div>
              ))}
            </div>

            {selectedUsers.length > 1 && (
              <input
                type="text"
                placeholder="Group name (optional)"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            )}

            <div className="selected-users">
              {selectedUsers.map(user => (
                <span key={user.id} className="selected-user-tag">
                  {user.fullName}
                </span>
              ))}
            </div>

            <div className="modal-actions">
              <button onClick={() => setIsOpen(false)}>Cancel</button>
              <button
                onClick={handleCreate}
                disabled={selectedUsers.length === 0}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

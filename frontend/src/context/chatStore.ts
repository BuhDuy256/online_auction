import { create } from 'zustand';
import axiosClient from '../api/axiosClient.ts';
import type { Conversation, Message } from '../types/index.ts';

interface ChatState {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  messages: Message[];
  loadConversations: () => Promise<void>;
  selectConversation: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, body: string) => Promise<void>;
  createConversation: (userIds: number[], name?: string) => Promise<void>;
  addMessage: (message: Message) => void;
  searchUsers: (query: string) => Promise<any[]>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  selectedConversation: null,
  messages: [],

  loadConversations: async () => {
    try {
      const response = await axiosClient.get('/conversations');
      set({ conversations: response.data });
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  },

  selectConversation: async (conversationId: string) => {
    try {
      const conversation = get().conversations.find(c => c.id === conversationId);
      set({ selectedConversation: conversation || null });

      // Load messages
      const response = await axiosClient.get(
        `/conversations/${conversationId}/messages`
      );
      set({ messages: response.data });
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  },

  sendMessage: async (conversationId: string, body: string) => {
    try {
      await axiosClient.post(`/conversations/${conversationId}/messages`, {
        body,
      });
      // Message will be added via Socket.io listener
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  },

  createConversation: async (userIds: number[], name?: string) => {
    try {
      const response = await axiosClient.post('/conversations', {
        userIds,
        name,
      });
      
      await get().loadConversations();
      set({ selectedConversation: response.data });
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  },

  addMessage: (message: Message) => {
    const { selectedConversation, messages } = get();
    
    // Add message to current conversation if it matches
    if (selectedConversation?.id === message.conversationId) {
      set({ messages: [...messages, message] });
    }

    // Update last message in conversations list
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === message.conversationId
          ? { ...conv, messages: [message] }
          : conv
      ),
    }));
  },

  searchUsers: async (query: string) => {
    try {
      const response = await axiosClient.get(`/users/search?q=${query}`);
      return response.data;
    } catch (error) {
      console.error('Failed to search users:', error);
      return [];
    }
  },
}));

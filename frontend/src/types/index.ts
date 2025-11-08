export interface User {
  id: string;
  username: string;
  fullName: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
  sender: User;
}

export interface Participant {
  userId: string;
  conversationId: string;
  joinedAt: string;
  user: User;
}

export interface Conversation {
  id: string;
  name: string | null;
  isGroup: boolean;
  creatorId: string;
  createdAt: string;
  participants: Participant[];
  messages: Message[];
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
}

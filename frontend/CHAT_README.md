# Real-time Chat Application

This is a full-stack real-time chat application built with React (frontend) and Node.js/Express with Socket.io (backend).

## Features

- ✅ User Authentication (Signup/Login)
- ✅ Real-time messaging with Socket.io
- ✅ One-on-one conversations
- ✅ Group chat support
- ✅ User search functionality
- ✅ Message history
- ✅ Responsive UI
- ✅ TypeScript support

## Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── axiosClient.ts          # Axios configuration with auth interceptor
│   ├── components/
│   │   └── layout/
│   │       ├── ConversationList.tsx # List of conversations
│   │       ├── ChatWindow.tsx       # Main chat interface
│   │       └── NewChatModal.tsx     # Create new conversation
│   ├── context/
│   │   ├── authStore.ts            # Authentication state management
│   │   └── chatStore.ts            # Chat state management
│   ├── pages/
│   │   ├── LoginPage.tsx           # Login/Signup page
│   │   └── ChatPage.tsx            # Main chat page
│   ├── services/
│   │   └── socket.ts               # Socket.io client service
│   ├── types/
│   │   └── index.ts                # TypeScript type definitions
│   └── App.tsx                     # Main app component with routing
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database (configured in backend)
- Backend server running on `http://localhost:3000`

### Installation

1. Install dependencies:

   ```bash
   cd frontend
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

## Usage

### 1. Sign Up / Login

- On first visit, you'll see the login page
- Click "Sign Up" to create a new account with username, password, and full name
- After signup, login with your credentials

### 2. Create a Conversation

- Click the "+ New Chat" button at the bottom of the sidebar
- Search for users by typing their username or full name
- Select one or more users
- For group chats (2+ users), optionally provide a group name
- Click "Create" to start the conversation

### 3. Send Messages

- Click on a conversation from the list
- Type your message in the input field at the bottom
- Press "Send" or hit Enter to send the message
- Messages appear in real-time for all participants

### 4. Real-time Updates

- New messages appear instantly without refreshing
- All participants in a conversation see messages in real-time
- Socket.io connection is established automatically upon login

## State Management

The application uses **Zustand** for state management:

- **authStore**: Manages user authentication state and tokens
- **chatStore**: Manages conversations, messages, and chat operations

## API Integration

The frontend communicates with the backend through:

- **REST API**: For CRUD operations (axios)

  - `POST /auth/login` - User login
  - `POST /auth/signup` - User registration
  - `GET /conversations` - Get user's conversations
  - `POST /conversations` - Create new conversation
  - `GET /conversations/:id/messages` - Get messages
  - `POST /conversations/:id/messages` - Send message
  - `GET /users/search?q=query` - Search users

- **WebSocket**: For real-time messaging (Socket.io)
  - Event: `newMessage` - Receives new messages in real-time

## Technologies Used

### Frontend

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Socket.io Client** - Real-time WebSocket communication
- **Axios** - HTTP client
- **Zustand** - State management

### Backend

- **Express.js** - Web framework
- **Socket.io** - Real-time communication
- **Prisma** - ORM for PostgreSQL
- **JWT** - Authentication tokens

## Authentication Flow

1. User logs in with credentials
2. Backend returns JWT access token
3. Token is stored in localStorage
4. Token is automatically added to all API requests via axios interceptor
5. Socket.io connection is established with token for authentication
6. User joins all relevant conversation rooms automatically

## Socket.io Connection

The Socket.io client:

- Connects automatically after successful login
- Sends JWT token for authentication
- Joins conversation rooms based on user's conversations
- Listens for `newMessage` events
- Updates UI in real-time when messages arrive
- Disconnects on logout

## Development Notes

### TypeScript Configuration

The project uses strict TypeScript with:

- `verbatimModuleSyntax: true` - Requires explicit `.ts`/`.tsx` extensions
- `allowImportingTsExtensions: true` - Allows importing with extensions
- Type-only imports for type definitions

### Error Handling

- API errors are caught and displayed to users
- Socket connection errors are logged to console
- Failed message sends show error in console

### Performance Considerations

- Messages are paginated (50 per page by default)
- Socket.io uses rooms for efficient message broadcasting
- Conversation list shows only the last message preview
- Images and avatars use initials for lightweight UI

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

## Troubleshooting

### Cannot connect to backend

- Ensure backend server is running on `http://localhost:3000`
- Check CORS settings in backend
- Verify Socket.io CORS configuration allows `http://localhost:5173`

### Messages not appearing in real-time

- Check browser console for Socket.io connection errors
- Verify JWT token is valid
- Ensure backend is emitting `newMessage` events correctly

### TypeScript errors

- Run `npm run build` to see all type errors
- Ensure all imports include `.ts` or `.tsx` extensions
- Use type-only imports for type definitions

## Future Enhancements

- [ ] Message read receipts
- [ ] Typing indicators
- [ ] File/image sharing
- [ ] Message reactions
- [ ] Online/offline status
- [ ] Push notifications
- [ ] Message search
- [ ] User profiles with avatars
- [ ] Message editing/deletion
- [ ] Voice/video calls

## License

MIT

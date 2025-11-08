import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './context/authStore.ts';
import { LoginPage } from './pages/LoginPage.tsx';
import { ChatPage } from './pages/ChatPage.tsx';
import './App.css';

function App() {
  const { accessToken } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={!accessToken ? <LoginPage /> : <Navigate to="/chat" />}
        />
        <Route
          path="/chat"
          element={accessToken ? <ChatPage /> : <Navigate to="/login" />}
        />
        <Route path="/" element={<Navigate to="/chat" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

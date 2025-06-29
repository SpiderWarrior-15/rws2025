import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { AIBuddy } from './components/AIBuddy';
import { NoticeBoard } from './components/NoticeBoard';
import { Home } from './pages/Home';
import { WarriorsPicks } from './pages/WarriorsPicks';
import { Puzzles } from './pages/Puzzles';
import { Events } from './pages/Events';
import { Contact } from './pages/Contact';
import { Chat } from './pages/Chat';
import { Admin } from './pages/Admin';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import { Profile } from './pages/Profile';
import { initializeNotices } from './utils/noticeManager';

// Initialize notices on app start
initializeNotices();

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
          <Navigation />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/warriors-picks" element={<WarriorsPicks />} />
              <Route path="/puzzles" element={<Puzzles />} />
              <Route path="/events" element={<Events />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/chat" element={<Chat />} />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requireAdmin>
                    <Admin />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          <Footer />
          <AIBuddy />
          <NoticeBoard />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
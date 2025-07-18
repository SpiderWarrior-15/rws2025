import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { RealtimeProvider } from './contexts/RealtimeContext';
import { AuthProvider } from './components/AuthProvider';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { News } from './pages/News';
import { Announcements } from './pages/Announcements';
import { WarriorsPicks } from './pages/WarriorsPicks';
import { Tools } from './pages/Tools';
import { Puzzles } from './pages/Puzzles';
import { Events } from './pages/Events';
import { Contact } from './pages/Contact';
import { Chat } from './pages/Chat';
import { Forms } from './pages/Forms';
import { Admin } from './pages/Admin';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import { Profile } from './pages/Profile';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { License } from './pages/License';

function AppContent() {
  const { showIntro, markIntroAsSeen, hideIntro } = useAIBuddy();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <Navigation />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/news" element={<News />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/warriors-picks" element={<WarriorsPicks />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/puzzles" element={<Puzzles />} />
          <Route path="/events" element={<Events />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/forms" element={<Forms />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/license" element={<License />} />
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
      </motion.main>
      <Footer />
      
      {/* AI Buddy Components */}
      <AIBuddy />
      {showIntro && (
        <AIBuddyIntro
          onClose={hideIntro}
          onStartChat={markIntroAsSeen}
        />
      )}
      
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(0, 0, 0, 0.8)',
            color: '#fff',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <RealtimeProvider>
        <AuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
      </RealtimeProvider>
    </ThemeProvider>
  );
}

export default App;
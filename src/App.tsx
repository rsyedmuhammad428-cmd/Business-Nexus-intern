import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MeetingsProvider } from './context/MeetingsContext';
import { DocumentsProvider } from './context/DocumentsContext';
import { PaymentsProvider } from './context/PaymentsContext';

// Layouts
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Dashboard Pages
import { EntrepreneurDashboard } from './pages/dashboard/EntrepreneurDashboard';
import { InvestorDashboard } from './pages/dashboard/InvestorDashboard';

// Profile Pages
import { EntrepreneurProfile } from './pages/profile/EntrepreneurProfile';
import { InvestorProfile } from './pages/profile/InvestorProfile';

// Feature Pages
import { InvestorsPage } from './pages/investors/InvestorsPage';
import { EntrepreneursPage } from './pages/entrepreneurs/EntrepreneursPage';
import { MessagesPage } from './pages/messages/MessagesPage';
import { NotificationsPage } from './pages/notifications/NotificationsPage';
import { DocumentsPage } from './pages/documents/DocumentsPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { HelpPage } from './pages/help/HelpPage';
import { DealsPage } from './pages/deals/DealsPage';
import { MeetingsPage } from './pages/meetings/MeetingsPage';
import { VideoCallPage } from './pages/meetings/VideoCallPage';

// Chat Pages
import { ChatPage } from './pages/chat/ChatPage';

// Payment Pages
import { PaymentsPage } from './pages/payments/PaymentsPage';

// Wrapper component to access currentUser from AuthContext
function AppRoutes() {
  const { user } = useAuth();

  return (
    <MeetingsProvider currentUser={user}>
      <DocumentsProvider>
        <PaymentsProvider>
            <Router>
              <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
              <Routes>
                {/* Authentication Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                {/* Dashboard Routes */}
                <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                  <Route path="entrepreneur" element={<ProtectedRoute requiredRole="entrepreneur"><EntrepreneurDashboard /></ProtectedRoute>} />
                  <Route path="investor" element={<ProtectedRoute requiredRole="investor"><InvestorDashboard /></ProtectedRoute>} />
                </Route>
                
                {/* Profile Routes */}
                <Route path="/profile" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                  <Route path="entrepreneur/:id" element={<EntrepreneurProfile />} />
                  <Route path="investor/:id" element={<InvestorProfile />} />
                </Route>
                
                {/* Feature Routes */}
                <Route path="/investors" element={<ProtectedRoute requiredRole="entrepreneur"><DashboardLayout /></ProtectedRoute>}>
                  <Route index element={<InvestorsPage />} />
                </Route>
                
                <Route path="/entrepreneurs" element={<ProtectedRoute requiredRole="investor"><DashboardLayout /></ProtectedRoute>}>
                  <Route index element={<EntrepreneursPage />} />
                </Route>
                
                <Route path="/messages" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                  <Route index element={<MessagesPage />} />
                </Route>
                
                <Route path="/notifications" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                  <Route index element={<NotificationsPage />} />
                </Route>
                
                <Route path="/documents" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                  <Route index element={<DocumentsPage />} />
                </Route>
                
                <Route path="/settings" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                  <Route index element={<SettingsPage />} />
                </Route>
                
                <Route path="/help" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                  <Route index element={<HelpPage />} />
                </Route>
                
                <Route path="/deals" element={<ProtectedRoute requiredRole="investor"><DashboardLayout /></ProtectedRoute>}>
                  <Route index element={<DealsPage />} />
                </Route>

                <Route path="/meetings" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                  <Route index element={<MeetingsPage />} />
                </Route>
                
                <Route path="/payments" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                  <Route index element={<PaymentsPage />} />
                </Route>
                
                <Route path="/video-call" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                  <Route path=":meetingId" element={<VideoCallPage />} />
                </Route>

                {/* Chat Routes */}
                <Route path="/chat" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                  <Route index element={<ChatPage />} />
                  <Route path=":userId" element={<ChatPage />} />
                </Route>
                
                {/* Redirect root to login */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                
                {/* Catch all other routes and redirect to login */}
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </Router>
        </PaymentsProvider>
      </DocumentsProvider>
    </MeetingsProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
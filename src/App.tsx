import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import CreateOrderPage from './pages/CreateOrderPage';
import { Toaster } from 'react-hot-toast';
import OrderDetailPage from './pages/OrderDetailPage';
import WalletPage from './pages/WalletPage';
import ProfilePage from './pages/ProfilePage';
import HallOfFamePage from './pages/HallOfFamePage';
import MitraRegistrationPage from './pages/MitraRegistrationPage';
import MitraDashboardPage from './pages/MitraDashboardPage';
import RequestSpecialistPage from './pages/RequestSpecialistPage';


function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/hall-of-fame" element={<HallOfFamePage />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/create-order" element={<ProtectedRoute><CreateOrderPage /></ProtectedRoute>} />

          {/* Unified Order Detail Route */}
          <Route path="/order/:type/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />

          <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* Mitra Routes */}
          <Route path="/mitra-registration" element={<ProtectedRoute><MitraRegistrationPage /></ProtectedRoute>} />
          <Route path="/mitra-dashboard" element={<ProtectedRoute><MitraDashboardPage /></ProtectedRoute>} />
          <Route path="/request-specialist" element={<ProtectedRoute><RequestSpecialistPage /></ProtectedRoute>} />
        </Route>
      </Routes>
    </>
  );
}

export default App;

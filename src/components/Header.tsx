import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

export default function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Assuming user roles are stored in app_metadata
  const roles = user?.app_metadata?.roles || [];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid #ccc' }}>
      <Link to="/"><h1>JastipDigital</h1></Link>
      <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {user ? (
          <>
            {/* Role-based links */}
            {roles.includes('driver') && <Link to="/dashboard">Driver Dashboard</Link>}
            {roles.includes('mitra') && <Link to="/mitra-dashboard">Mitra Dashboard</Link>}
            {!roles.includes('driver') && !roles.includes('mitra') && (
              <>
                <Link to="/dashboard">My Orders</Link>
                <Link to="/request-specialist">Request Specialist</Link>
              </>
            )}

            <Link to="/profile">Profile</Link>
            <Link to="/hall-of-fame">Hall of Fame</Link>
            <Link to="/mitra-registration">Become a Mitra</Link>


            <span>{user.email}</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Sign Up</Link>
          </>
        )}
      </nav>
    </header>
  );
}

import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div>
      <h2>Welcome to JastipDigital</h2>
      <p>Your one-stop solution for all your jastip needs.</p>
      <Link to="/dashboard">Go to Dashboard</Link>
    </div>
  );
}

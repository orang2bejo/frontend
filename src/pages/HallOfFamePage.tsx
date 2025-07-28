import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { HallOfFameData, LeaderboardEntry, HallOfFameWinner } from '../types/app.types';

export default function HallOfFamePage() {
  const [data, setData] = useState<HallOfFameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHallOfFameData = async () => {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('get_hall_of_fame_data');

      if (error) {
        setError('Failed to fetch Hall of Fame data.');
        console.error(error);
      } else {
        setData(data);
      }
      setLoading(false);
    };

    fetchHallOfFameData();
  }, []);

  if (loading) return <p>Loading Hall of Fame...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!data) return <p>No data available.</p>;

  return (
    <div>
      <h2>Hall of Fame</h2>

      <section>
        <h3>Current Prize Pool</h3>
        <p style={{ fontSize: '2em', fontWeight: 'bold' }}>
          ${data.current_prize_pool.toFixed(2)}
        </p>
      </section>

      <section>
        <h3>Driver Leaderboard</h3>
        <ol>
          {data.leaderboard.map((driver: LeaderboardEntry, index: number) => (
            <li key={driver.driver_id}>
              {driver.driver_name} - {driver.score} points
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h3>Recent Winners</h3>
        <ul>
          {data.recent_winners.map((winner: HallOfFameWinner) => (
            <li key={winner.id}>
              <strong>{winner.driver_name}</strong> won the "{winner.award_name}" award on {new Date(winner.achieved_at).toLocaleDateString()}.
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Community Milestone</h3>
        <p>
          We have {data.milestone_progress.current_drivers} drivers!
          Next milestone at {data.milestone_progress.next_milestone} drivers.
        </p>
        <p>Reward: {data.milestone_progress.milestone_reward}</p>
      </section>
    </div>
  );
}

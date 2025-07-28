import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { DriverWallet, WithdrawalRequest } from '../types/app.types';

export default function WalletPage() {
  const [wallet, setWallet] = useState<DriverWallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState('');

  const fetchWalletDetails = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke('get_my_wallet_details');

    if (error) {
      setError('Failed to fetch wallet details.');
      console.error(error);
    } else {
      setWallet(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWalletDetails();
  }, []);

  const handleWithdrawalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const withdrawalAmount = Number(amount);
    if (withdrawalAmount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }
    if (wallet && withdrawalAmount > wallet.available_balance) {
      alert('Withdrawal amount cannot exceed available balance.');
      return;
    }

    const { error } = await supabase.functions.invoke('request_withdrawal', {
      body: { amount: withdrawalAmount },
    });

    if (error) {
      alert('Failed to request withdrawal: ' + error.message);
    } else {
      alert('Withdrawal request submitted successfully.');
      setAmount('');
      fetchWalletDetails(); // Refresh wallet details
    }
  };

  if (loading) return <p>Loading wallet...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!wallet) return <p>Could not load wallet information.</p>;

  return (
    <div>
      <h2>My Wallet</h2>
      <p><strong>Available Balance:</strong> ${wallet.available_balance.toFixed(2)}</p>
      <p><strong>Commission Debt:</strong> ${wallet.commission_debt.toFixed(2)}</p>

      <hr />

      <h3>Request Withdrawal</h3>
      <form onSubmit={handleWithdrawalRequest}>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount to withdraw"
          required
        />
        <button type="submit">Request</button>
      </form>

      <hr />

      <h3>Withdrawal History</h3>
      {wallet.withdrawal_history && wallet.withdrawal_history.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {wallet.withdrawal_history.map((req: WithdrawalRequest) => (
              <tr key={req.id}>
                <td>{new Date(req.requested_at).toLocaleDateString()}</td>
                <td>${req.amount.toFixed(2)}</td>
                <td>{req.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No withdrawal history.</p>
      )}
    </div>
  );
}

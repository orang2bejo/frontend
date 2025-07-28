import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Order } from '../types/app.types';

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc('get_my_orders');

      if (error) {
        setError(error.message);
      } else {
        setOrders(data);
      }

      setLoading(false);
    };

    fetchOrders();
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      <Link to="/create-order">Create New Order</Link>
      {loading && <p>Memuat...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && (
        <>
          {orders.length === 0 ? (
            <p>Anda belum memiliki pesanan</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID Pesanan</th>
                  <th>Deskripsi</th>
                  <th>Budget</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.item_description}</td>
                    <td>{order.max_budget}</td>
                    <td>{order.status}</td>
                    <td>
                      <Link to={`/order/${order.id}`}>View Details</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { SpecialistOrder } from '../types/app.types';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function MitraDashboardPage() {
  const [availableOrders, setAvailableOrders] = useState<SpecialistOrder[]>([]);
  const [myActiveOrders, setMyActiveOrders] = useState<SpecialistOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch available orders
      const { data: availableData, error: availableError } = await supabase.functions.invoke('get_available_specialist_orders');
      if (availableError) throw availableError;
      setAvailableOrders(availableData);

      // Fetch user's active orders (assuming an RPC for this)
      const { data: myOrdersData, error: myOrdersError } = await supabase.rpc('get_my_active_specialist_orders');
      if (myOrdersError) throw myOrdersError;
      setMyActiveOrders(myOrdersData);

    } catch (error: any) {
      toast.error(`Failed to fetch data: ${error.message}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div>
      <h2>Mitra Dashboard</h2>

      <section>
        <h3>Available Jobs</h3>
        {availableOrders.length > 0 ? (
          <ul>
            {availableOrders.map(order => (
              <li key={order.id}>
                <strong>{order.service_type}</strong> - {order.problem_description}
                {/* Link to a detail page where they can submit a quote */}
                <Link to={`/order/specialist/${order.id}`}>View and Quote</Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>No available jobs matching your profile.</p>
        )}
      </section>

      <hr />

      <section>
        <h3>My Active Jobs</h3>
        {myActiveOrders.length > 0 ? (
          <ul>
            {myActiveOrders.map(order => (
              <li key={order.id}>
                <strong>{order.service_type}</strong> - Status: {order.status}
                <Link to={`/order/specialist/${order.id}`}>View Details</Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>You have no active jobs.</p>
        )}
      </section>
    </div>
  );
}

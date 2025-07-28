import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Order, SpecialistOrder, Quote } from '../types/app.types';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

// This component will now handle both regular Orders and SpecialistOrders
export default function OrderDetailPage() {
  const { type, id } = useParams<{ type: string, id: string }>(); // type is 'jastip' or 'specialist'
  const navigate = useNavigate();
  const { user } = useAuth();

  const [order, setOrder] = useState<Order | SpecialistOrder | null>(null);
  const [loading, setLoading] = useState(true);

  // Unified fetch function
  const fetchDetails = async () => {
    if (!id || !type) return;
    setLoading(true);

    const tableName = type === 'jastip' ? 'orders' : 'specialist_orders';
    const toastId = toast.loading('Fetching order details...');

    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*, quotes(*)') // Fetch quotes if it's a specialist order
        .eq('id', id)
        .single();

      if (error) throw error;

      setOrder(data as Order | SpecialistOrder);
      toast.success('Details loaded', { id: toastId });
    } catch (err: any) {
      toast.error(`Failed to fetch details: ${err.message}`, { id: toastId });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id, type]);

  // Actions specific to Specialist Orders
  const handleAcceptQuote = async (quoteId: string) => {
    const promise = supabase.functions.invoke('accept_specialist_quote', { body: { quote_id: quoteId } });
    toast.promise(promise, {
      loading: 'Accepting quote...',
      success: 'Quote accepted! The Mitra has been notified.',
      error: 'Failed to accept quote.',
    });
    await promise;
    fetchDetails();
  };

  const handleCompleteSpecialistOrder = async () => {
    const promise = supabase.functions.invoke('complete_specialist_order', { body: { order_id: id } });
    toast.promise(promise, {
      loading: 'Completing order...',
      success: 'Order marked as complete!',
      error: 'Failed to complete order.',
    });
    await promise;
    fetchDetails();
  };

  const handleMitraReviewSubmit = async (e: React.FormEvent, rating: number, comment: string) => {
    e.preventDefault();
    const promise = supabase.functions.invoke('submit_mitra_review', { body: { order_id: id, rating, comment } });
    toast.promise(promise, {
      loading: 'Submitting review...',
      success: 'Thank you for your feedback!',
      error: 'Failed to submit review.',
    });
    await promise;
    fetchDetails();
  };


  if (loading) return <p>Loading...</p>;
  if (!order) return <p>Order not found.</p>;

  const isSpecialistOrder = 'service_type' in order;
  const currentUserIsCustomer = user?.id === order.customer_id;
  const currentUserIsMitra = !currentUserIsCustomer; // Simplified logic

  return (
    <div>
      <h2>Order Details: {order.id}</h2>
      <p><strong>Status:</strong> {order.status}</p>

      {isSpecialistOrder ? (
        <>
          <p><strong>Service:</strong> {(order as SpecialistOrder).service_type}</p>
          <p><strong>Problem:</strong> {(order as SpecialistOrder).problem_description}</p>
        </>
      ) : (
        <>
          <p><strong>Item:</strong> {(order as Order).item_description}</p>
          <p><strong>Budget:</strong> {(order as Order).max_budget}</p>
        </>
      )}

      <hr />

      {/* Specialist Order specific UI */}
      {isSpecialistOrder && (
        <>
          {/* Customer view: See quotes */}
          {currentUserIsCustomer && order.status === 'quoted' && (
            <section>
              <h3>Quotes Received</h3>
              {(order as SpecialistOrder).quotes.map((q: Quote) => (
                <div key={q.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
                  <p><strong>From:</strong> {q.mitra_name}</p>
                  <p><strong>Price:</strong> ${q.quoted_price}</p>
                  <p><strong>Time:</strong> {q.estimated_duration}</p>
                  <p><em>{q.notes}</em></p>
                  <button onClick={() => handleAcceptQuote(q.id)}>Accept This Quote</button>
                </div>
              ))}
            </section>
          )}

          {/* Mitra view: Complete order button */}
          {currentUserIsMitra && order.status === 'accepted' && (
            <button onClick={handleCompleteSpecialistOrder}>Mark as Complete</button>
          )}

          {/* Customer view: Review form */}
          {currentUserIsCustomer && order.status === 'completed' && (
            <p>Review form here...</p> /* Placeholder for brevity */
          )}
        </>
      )}

      {/* Jastip Order specific UI would go here, similar to the original file */}

    </div>
  );
}

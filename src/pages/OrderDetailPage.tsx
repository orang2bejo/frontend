import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Order } from '../types/app.types';
import { useAuth } from '../contexts/AuthContext';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for forms
  const [counterOffer, setCounterOffer] = useState('');
  const [negotiationNotes, setNegotiationNotes] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const fetchOrderDetails = async () => {
    if (!id) return;
    setLoading(true);
    // Assuming there's an RPC function to get a single order's details
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      setError('Failed to fetch order details.');
      console.error(error);
    } else {
      setOrder(data as Order);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const handleNegotiationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    const { error } = await supabase.functions.invoke('submit_customer_negotiation', {
      body: {
        order_id: id,
        counter_offer: Number(counterOffer),
        notes: negotiationNotes,
      },
    });

    if (error) {
      alert('Failed to submit offer: ' + error.message);
    } else {
      alert('Negotiation submitted!');
      fetchOrderDetails(); // Refresh data
    }
  };

  const handleCancelOrder = async () => {
    if (!id || !cancellationReason) {
        alert('Please provide a reason for cancellation.');
        return;
    }

    const { error } = await supabase.functions.invoke('cancel_order', {
      body: {
        order_id: id,
        cancelled_by: 'customer', // Assuming customer cancels
        reason: cancellationReason,
      },
    });

    if (error) {
      alert('Failed to cancel order: ' + error.message);
    } else {
      alert('Order cancelled.');
      navigate('/dashboard');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    const { error } = await supabase.functions.invoke('submit_review', {
      body: {
        order_id: id,
        rating: reviewRating,
        comment: reviewComment,
      },
    });

    if (error) {
      alert('Failed to submit review: ' + error.message);
    } else {
      alert('Thank you for your review!');
      fetchOrderDetails(); // Refresh to update review status
    }
  };


  if (loading) return <p>Loading order details...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!order) return <p>Order not found.</p>;

  const canCancel = !['completed', 'cancelled', 'shipped'].includes(order.status);

  return (
    <div>
      <h2>Order Details: {order.id}</h2>
      <p><strong>Status:</strong> {order.status}</p>
      <p><strong>Item:</strong> {order.item_description}</p>
      <p><strong>Max Budget:</strong> {order.max_budget}</p>
      <p><strong>Delivery Address:</strong> {order.delivery_address}</p>
      <hr />

      {/* Conditional Forms */}

      {order.status === 'price_confirmation' && (
        <form onSubmit={handleNegotiationSubmit}>
          <h3>Negotiate Price</h3>
          <p>The proposed final price is {order.final_price}. You can accept or make a counter-offer.</p>
          <input
            type="number"
            value={counterOffer}
            onChange={(e) => setCounterOffer(e.target.value)}
            placeholder="Your counter offer"
            required
          />
          <textarea
            value={negotiationNotes}
            onChange={(e) => setNegotiationNotes(e.target.value)}
            placeholder="Notes (optional)"
          ></textarea>
          <button type="submit">Submit Counter-Offer</button>
        </form>
      )}

      {canCancel && (
        <div>
          <h3>Cancel Order</h3>
          <input
            type="text"
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            placeholder="Reason for cancellation"
            required
          />
          <button onClick={handleCancelOrder} style={{backgroundColor: 'red'}}>Cancel Order</button>
        </div>
      )}

      {order.status === 'completed' && !order.review_submitted && (
        <form onSubmit={handleReviewSubmit}>
            <h3>Leave a Review</h3>
            <label>Rating (1-5)</label>
            <input
                type="number"
                min="1"
                max="5"
                value={reviewRating}
                onChange={(e) => setReviewRating(Number(e.target.value))}
                required
            />
            <label>Comment</label>
            <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="How was your experience?"
                required
            ></textarea>
            <button type="submit">Submit Review</button>
        </form>
      )}
    </div>
  );
}

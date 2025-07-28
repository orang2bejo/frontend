import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

export default function CreateOrderPage() {
  const [itemDescription, setItemDescription] = useState('');
  const [storeLocation, setStoreLocation] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const orderData = {
      item_description: itemDescription,
      store_location: storeLocation,
      delivery_address: deliveryAddress,
      max_budget: Number(maxBudget),
      customer_phone: customerPhone,
      customer_notes: customerNotes,
    };

    const promise = supabase.functions.invoke('create-order', { body: orderData });

    toast.promise(promise, {
      loading: 'Creating your order...',
      success: () => {
        navigate('/dashboard');
        return 'Order created successfully!';
      },
      error: (err) => {
        console.error('Create order error:', err);
        return `Error: ${err.message}`;
      },
    });

    try {
        await promise;
    } catch (e) {
        // Errors are handled by the toast
    } finally {
        setLoading(false);
    }
  };

  return (
    <div>
      <h2>Create New Jastip Order</h2>
      <form onSubmit={handleCreateOrder}>
        {/* Using a more streamlined input approach for brevity */}
        <input value={itemDescription} onChange={e => setItemDescription(e.target.value)} placeholder="Item Description" required />
        <input value={storeLocation} onChange={e => setStoreLocation(e.target.value)} placeholder="Store Location (optional)" />
        <input value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} placeholder="Delivery Address" required />
        <input type="number" value={maxBudget} onChange={e => setMaxBudget(e.target.value)} placeholder="Max Budget" required />
        <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="Your Phone Number" required />
        <textarea value={customerNotes} onChange={e => setCustomerNotes(e.target.value)} placeholder="Notes for the driver (optional)" />

        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Create Order'}
        </button>
      </form>
    </div>
  );
}

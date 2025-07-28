import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function CreateOrderPage() {
  const [itemDescription, setItemDescription] = useState('');
  const [storeLocation, setStoreLocation] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCreateOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.functions.invoke('create-order', {
      body: {
        item_description: itemDescription,
        store_location: storeLocation,
        delivery_address: deliveryAddress,
        max_budget: Number(maxBudget),
        customer_phone: customerPhone,
        customer_notes: customerNotes,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      alert('Order created successfully!');
      navigate('/dashboard');
    }

    setLoading(false);
  };

  return (
    <div>
      <h2>Create New Order</h2>
      <form onSubmit={handleCreateOrder}>
        <div>
          <label htmlFor="item_description">Item Description</label>
          <input
            id="item_description"
            type="text"
            value={itemDescription}
            onChange={(e) => setItemDescription(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="store_location">Store Location</label>
          <input
            id="store_location"
            type="text"
            value={storeLocation}
            onChange={(e) => setStoreLocation(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="delivery_address">Delivery Address</label>
          <input
            id="delivery_address"
            type="text"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="max_budget">Max Budget</label>
          <input
            id="max_budget"
            type="number"
            value={maxBudget}
            onChange={(e) => setMaxBudget(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="customer_phone">Phone Number</label>
          <input
            id="customer_phone"
            type="text"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="customer_notes">Notes</label>
          <textarea
            id="customer_notes"
            value={customerNotes}
            onChange={(e) => setCustomerNotes(e.target.value)}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Creating order...' : 'Create Order'}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
}

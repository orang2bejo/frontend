import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function RequestSpecialistPage() {
  const [serviceType, setServiceType] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [urgencyLevel, setUrgencyLevel] = useState('normal');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const promise = supabase.functions.invoke('create_specialist_order', {
      body: {
        service_type: serviceType,
        problem_description: problemDescription,
        // In a real app, get user's current location
        customer_location: { lat: -6.200000, lon: 106.816666 },
        urgency_level: urgencyLevel,
      },
    });

    toast.promise(promise, {
      loading: 'Submitting your request...',
      success: (data: any) => {
        // Assuming the response includes the new order's ID
        navigate(`/order/specialist/${data.id}`);
        return 'Request submitted successfully!';
      },
      error: (err) => {
        console.error(err);
        return `Submission failed: ${err.message}`;
      },
    });

    setLoading(false);
  };

  return (
    <div>
      <h2>Request a Specialist Service</h2>
      <form onSubmit={handleSubmit}>
        <input value={serviceType} onChange={(e) => setServiceType(e.target.value)} placeholder="Type of Service (e.g., AC Repair)" required />
        <textarea value={problemDescription} onChange={(e) => setProblemDescription(e.target.value)} placeholder="Describe your problem in detail" required />
        <select value={urgencyLevel} onChange={(e) => setUrgencyLevel(e.target.value)}>
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Find a Specialist'}
        </button>
      </form>
    </div>
  );
}

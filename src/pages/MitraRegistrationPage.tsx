import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface Specialization {
  id: string;
  name: string;
}

export default function MitraRegistrationPage() {
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [serviceRadius, setServiceRadius] = useState(10);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [selectedSpecs, setSelectedSpecs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch specializations from the backend
    const fetchSpecializations = async () => {
      const { data, error } = await supabase.from('specializations').select('id, name');
      if (error) {
        toast.error('Could not fetch specializations list.');
        console.error(error);
      } else {
        setSpecializations(data);
      }
    };
    fetchSpecializations();
  }, []);

  const handleSpecChange = (specId: string) => {
    const newSelection = new Set(selectedSpecs);
    if (newSelection.has(specId)) {
      newSelection.delete(specId);
    } else {
      newSelection.add(specId);
    }
    setSelectedSpecs(newSelection);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const promise = supabase.functions.invoke('create_mitra_profile', {
      body: {
        full_name: fullName,
        business_name: businessName,
        phone_number: phoneNumber,
        // In a real app, you'd get location data, e.g., from a map API
        base_location: { lat: -6.200000, lon: 106.816666 },
        service_radius: serviceRadius,
        specialization_ids: Array.from(selectedSpecs),
      },
    });

    toast.promise(promise, {
      loading: 'Registering as Mitra...',
      success: () => {
        navigate('/mitra-dashboard'); // Redirect on success
        return 'Registration successful!';
      },
      error: (err) => {
        console.error(err);
        return `Registration failed: ${err.message}`;
      },
    });

    setLoading(false);
  };

  return (
    <div>
      <h2>Become a Specialist Mitra</h2>
      <form onSubmit={handleSubmit}>
        {/* Input fields for profile data */}
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" required />
        <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Business Name (optional)" />
        <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="Phone Number" required />
        <input type="number" value={serviceRadius} onChange={(e) => setServiceRadius(Number(e.target.value))} placeholder="Service Radius (km)" required />

        <h3>Select Your Specializations</h3>
        <div>
          {specializations.map(spec => (
            <div key={spec.id}>
              <input
                type="checkbox"
                id={spec.id}
                checked={selectedSpecs.has(spec.id)}
                onChange={() => handleSpecChange(spec.id)}
              />
              <label htmlFor={spec.id}>{spec.name}</label>
            </div>
          ))}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Register'}
        </button>
      </form>
    </div>
  );
}

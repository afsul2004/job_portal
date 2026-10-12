import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/client';
import { User, Mail, Phone, Lock, BookOpen, MapPin, Award, CheckCircle2, ArrowRight } from 'lucide-react';

export const Register = () => {
  const navigate = useNavigate();
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    qualification: 'B.Tech / B.E',
    stream_specialization: '',
    academic_percentage: '',
    passing_year: new Date().getFullYear(),
    preferred_city_id: '',
    dob: '',
    gender: 'MALE',
    skills: '',
    address: ''
  });

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await api.get('/cities');
        setCities(res.data);
        if (res.data.length > 0) {
          setFormData((prev) => ({ ...prev, preferred_city_id: res.data[0].id }));
        }
      } catch (err) {
        // fallback default cities
        setCities([
          { id: 1, city_name: 'Chennai', state: 'Tamil Nadu' },
          { id: 2, city_name: 'Bangalore', state: 'Karnataka' },
          { id: 3, city_name: 'Hyderabad', state: 'Telangana' }
        ]);
        setFormData((prev) => ({ ...prev, preferred_city_id: 1 }));
      }
    };
    fetchCities();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        full_name: formData.full_name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
        qualification: formData.qualification,
        stream_specialization: formData.stream_specialization ? formData.stream_specialization.trim() : null,
        academic_percentage: parseFloat(formData.academic_percentage),
        passing_year: parseInt(formData.passing_year),
        preferred_city_id: formData.preferred_city_id ? parseInt(formData.preferred_city_id) : null,
        dob: formData.dob && formData.dob.trim() ? formData.dob.trim() : null,
        gender: formData.gender,
        skills: formData.skills ? formData.skills.trim() : null,
        address: formData.address ? formData.address.trim() : null
      };

      const res = await api.post('/auth/register', payload);
      setSuccessMsg(res.data.message || 'Registration submitted! Your profile is pending administrator approval.');
    } catch (err) {
      const detail = err.response?.data?.detail;
      let errorText = 'Registration failed. Please verify your information.';
      if (typeof detail === 'string') {
        errorText = detail;
      } else if (Array.isArray(detail)) {
        errorText = detail.map((d) => d.msg || JSON.stringify(d)).join(', ');
      }
      setError(errorText);
    } finally {
      setLoading(false);
    }
  };

  if (successMsg) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '24px' }}>
        <div style={{ maxWidth: '520px', width: '100%', background: 'white', borderRadius: '20px', padding: '40px', textAlign: 'center', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <CheckCircle2 size={36} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>Registration Submitted!</h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '24px' }}>
            {successMsg}
          </p>
          <div style={{ background: '#eff6ff', borderRadius: '12px', padding: '16px', marginBottom: '28px', textAlign: 'left', fontSize: '0.85rem', color: '#1e40af' }}>
            <strong>Next Step:</strong> The Administrator will review your educational qualification and allocate an exam centre. You can log in once approved.
          </div>
          <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '40px 20px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: '800px', width: '100%', background: 'white', borderRadius: '20px', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        
        <div style={{ background: 'linear-gradient(135deg, #1e40af, #2563eb)', padding: '32px 40px', color: 'white' }}>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 700 }}>Job Applicant Registration</h2>
          <p style={{ color: '#bfdbfe', fontSize: '0.9rem', marginTop: '6px' }}>
            Enter your personal background, educational qualifications, aggregate percentage, and preferred exam location.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '40px' }}>
          {error && (
            <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '12px', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '24px' }}>
              {error}
            </div>
          )}

          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} color="#2563eb" /> Personal Details
          </h4>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input type="text" name="full_name" required className="form-control" placeholder="e.g. Rahul Sharma" value={formData.full_name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input type="email" name="email" required className="form-control" placeholder="rahul@example.com" value={formData.email} onChange={handleChange} />
            </div>
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input type="tel" name="phone" required className="form-control" placeholder="+91 9876543210" value={formData.phone} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input type="password" name="password" required minLength={6} className="form-control" placeholder="At least 6 chars" value={formData.password} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select name="gender" className="form-control" value={formData.gender} onChange={handleChange}>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '24px 0' }} />

          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={18} color="#2563eb" /> Educational Background & Preferences
          </h4>
          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">Highest Qualification *</label>
              <select name="qualification" className="form-control" value={formData.qualification} onChange={handleChange}>
                <option value="B.Tech / B.E">B.Tech / B.E</option>
                <option value="B.Sc / BCA">B.Sc / BCA</option>
                <option value="M.Tech / MCA">M.Tech / MCA</option>
                <option value="B.Com">B.Com</option>
                <option value="Diploma">Diploma</option>
                <option value="Higher Secondary (12th)">Higher Secondary (12th)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Specialization / Stream</label>
              <input type="text" name="stream_specialization" className="form-control" placeholder="e.g. Computer Science" value={formData.stream_specialization} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Academic Aggregate % *</label>
              <input type="number" step="0.01" min="0" max="100" name="academic_percentage" required className="form-control" placeholder="e.g. 78.50" value={formData.academic_percentage} onChange={handleChange} />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Year of Passing *</label>
              <input type="number" name="passing_year" required className="form-control" value={formData.passing_year} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Preferred Exam City *</label>
              <select name="preferred_city_id" className="form-control" value={formData.preferred_city_id} onChange={handleChange}>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>{c.city_name} ({c.state})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Technical Skills (Comma separated)</label>
            <input type="text" name="skills" className="form-control" placeholder="e.g. Python, SQL, React, Typing, MS Excel" value={formData.skills} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Communication Address</label>
            <textarea name="address" rows={2} className="form-control" placeholder="Permanent or residential address" value={formData.address} onChange={handleChange}></textarea>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '14px', marginTop: '12px', fontSize: '1rem' }}>
            {loading ? 'Submitting Registration...' : 'Complete One-Time Registration'}
          </button>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.875rem', color: '#64748b' }}>
            Already registered? <Link to="/login" style={{ color: '#2563eb', fontWeight: 600 }}>Sign In</Link>
          </p>
        </form>

      </div>
    </div>
  );
};

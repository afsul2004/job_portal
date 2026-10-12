import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, ArrowRight, ShieldCheck, CheckCircle } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else if (user.role === 'HR') {
        navigate('/hr');
      } else {
        navigate('/candidate');
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid email or password. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillQuickCredentials = (demoEmail, demoPw) => {
    setEmail(demoEmail);
    setPassword(demoPw);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9', padding: '24px' }}>
      <div style={{ maxWidth: '960px', width: '100%', background: 'white', borderRadius: '24px', boxShadow: 'var(--shadow-xl)', overflow: 'hidden', display: 'grid', gridTemplateColumns: '1.1fr 1fr' }}>
        
        {/* Left Side: Brand & Overview */}
        <div style={{ background: 'linear-gradient(145deg, #1e3a8a, #1d4ed8)', padding: '48px 40px', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
              <div style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 800 }}>
                JP
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Job Portal & Exam System</span>
            </div>

            <h2 style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.25, marginBottom: '16px' }}>
              Modern Recruitment Powered by Online Assessment
            </h2>
            <p style={{ color: '#bfdbfe', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '28px' }}>
              Streamlined evaluation pipeline featuring automated MCQ examinations, configurable eligibility criteria, and end-to-end recruitment management.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CheckCircle size={20} color="#60a5fa" />
                <span style={{ fontSize: '0.9rem', color: '#e0f2fe' }}>Server-timed online testing with auto-grading</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CheckCircle size={20} color="#60a5fa" />
                <span style={{ fontSize: '0.9rem', color: '#e0f2fe' }}>Rule engine for Programmer & Data Entry roles</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CheckCircle size={20} color="#60a5fa" />
                <span style={{ fontSize: '0.9rem', color: '#e0f2fe' }}>Role-based dashboards for Admin, HR & Candidates</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '40px', background: 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#93c5fd', fontWeight: 700 }}>Quick Login Presets:</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
              <button onClick={() => fillQuickCredentials('admin@jobportal.com', 'Admin@123')} style={{ background: '#2563eb', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>Admin</button>
              <button onClick={() => fillQuickCredentials('hr@jobportal.com', 'Hr@123')} style={{ background: '#0284c7', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>HR Officer</button>
              <button onClick={() => fillQuickCredentials('rahul@example.com', 'Candidate@123')} style={{ background: '#059669', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>Candidate (Rahul)</button>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div style={{ padding: '48px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ marginBottom: '28px' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>Sign In to Account</h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '4px' }}>Enter your email and password to access your portal</p>
          </div>

          {error && (
            <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '12px', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '20px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="form-control"
                  style={{ paddingLeft: '38px' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="form-control"
                  style={{ paddingLeft: '38px' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', marginTop: '8px' }}
            >
              {loading ? 'Authenticating...' : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: '28px', textAlign: 'center', fontSize: '0.875rem', color: '#64748b' }}>
            Don't have an applicant account?{' '}
            <Link to="/register" style={{ color: '#2563eb', fontWeight: 600 }}>
              Register Here
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { CandidateSidebar } from './CandidateSidebar';
import { TopBar } from '../../components/TopBar';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { 
  User, Mail, Phone, BookOpen, MapPin, Upload, FileCheck, 
  CheckCircle, Building, Award, Calendar 
} from 'lucide-react';

export const CandidateProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/candidates/profile');
      setProfile(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('Only PDF files are accepted for resumes.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      setUploadMsg('');
      const res = await api.post('/candidates/upload-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadMsg('Resume uploaded successfully!');
      fetchProfile();
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <CandidateSidebar />
      <div className="main-content">
        <TopBar title="My Candidate Profile & Resume" />

        <div className="page-wrapper">
          {/* Status Header */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px 32px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700 }}>
                {profile?.full_name ? profile.full_name[0] : 'C'}
              </div>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>{profile?.full_name}</h2>
                <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '0.875rem', color: '#64748b' }}>
                  <span>{profile?.email}</span>
                  <span>•</span>
                  <span>{profile?.phone}</span>
                </div>
              </div>
            </div>

            <div>
              <span className={`badge ${
                profile?.status === 'APPROVED' ? 'badge-success' :
                profile?.status === 'PENDING' ? 'badge-warning' : 'badge-danger'
              }`} style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
                Account Status: {profile?.status}
              </span>
            </div>
          </div>

          <div className="grid-2">
            {/* Academic Information */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '28px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <BookOpen size={20} color="#2563eb" /> Academic Background
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Highest Qualification</div>
                  <div style={{ fontWeight: 600, fontSize: '1rem', color: '#0f172a' }}>
                    {profile?.qualification} ({profile?.stream_specialization || 'General'})
                  </div>
                </div>

                <div className="grid-2">
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Academic Aggregate</div>
                    <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#2563eb' }}>
                      {profile?.academic_percentage}%
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Year of Passing</div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0f172a' }}>
                      {profile?.passing_year}
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Technical Skills</div>
                  <div style={{ fontSize: '0.9rem', color: '#334155', marginTop: '4px' }}>
                    {profile?.skills || 'Not specified'}
                  </div>
                </div>
              </div>
            </div>

            {/* Examination Centre & Location Allocation */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '28px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MapPin size={20} color="#059669" /> Examination City & Centre Allocation
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Candidate Preferred City</div>
                  <div style={{ fontWeight: 600, fontSize: '1rem', color: '#0f172a' }}>
                    {profile?.preferred_city || 'Assigned automatically'}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803d', fontWeight: 700, fontSize: '0.9rem' }}>
                    <Building size={18} /> Allocated Examination Centre
                  </div>
                  <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '6px' }}>
                    {profile?.allocated_centre || 'Anna University Digital Testing Assessment Centre (CHN-001)'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                    Seat confirmed. Please carry official government ID on physical verification dates if requested.
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Residential Address</div>
                  <div style={{ fontSize: '0.875rem', color: '#475569', marginTop: '4px' }}>
                    {profile?.address || 'On file'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Resume Upload Box */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '28px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', marginTop: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Upload size={20} color="#2563eb" /> Curriculum Vitae (PDF Resume)
            </h3>

            {uploadMsg && (
              <div style={{ background: '#dcfce7', color: '#15803d', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', fontWeight: 600 }}>
                {uploadMsg}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <p style={{ fontSize: '0.9rem', color: '#475569' }}>
                  Upload your latest resume in PDF format. HR recruitment officers review your uploaded document alongside your test marks.
                </p>
                {profile?.resume_path && (
                  <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', fontSize: '0.85rem', fontWeight: 600 }}>
                    <FileCheck size={16} /> Current Resume on file: <a href={`http://localhost:8000${profile.resume_path}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline', color: '#2563eb' }}>View PDF Document</a>
                  </div>
                )}
              </div>

              <div>
                <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
                  <Upload size={16} /> {uploading ? 'Uploading...' : 'Choose & Upload PDF'}
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

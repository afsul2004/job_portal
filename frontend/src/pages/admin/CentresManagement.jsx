import React, { useState, useEffect } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { TopBar } from '../../components/TopBar';
import api from '../../api/client';
import { MapPin, Building, Plus, X } from 'lucide-react';

export const CentresManagement = () => {
  const [cities, setCities] = useState([]);
  const [centres, setCentres] = useState([]);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showCentreModal, setShowCentreModal] = useState(false);

  const [cityForm, setCityForm] = useState({ city_name: '', state: '' });
  const [centreForm, setCentreForm] = useState({
    city_id: '',
    centre_name: '',
    centre_code: '',
    address: '',
    total_capacity: 100
  });

  const fetchData = async () => {
    try {
      const [resCities, resCentres] = await Promise.all([
        api.get('/admin/cities'),
        api.get('/admin/centres')
      ]);
      setCities(resCities.data);
      setCentres(resCentres.data);
      if (resCities.data.length > 0) {
        setCentreForm((prev) => ({ ...prev, city_id: resCities.data[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddCity = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/cities', cityForm);
      setShowCityModal(false);
      setCityForm({ city_name: '', state: '' });
      fetchData();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleAddCentre = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/centres', {
        ...centreForm,
        city_id: parseInt(centreForm.city_id),
        total_capacity: parseInt(centreForm.total_capacity)
      });
      setShowCentreModal(false);
      setCentreForm({ city_id: cities[0]?.id || '', centre_name: '', centre_code: '', address: '', total_capacity: 100 });
      fetchData();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <div className="main-content">
        <TopBar title="Exam Cities & Assessment Centres" />

        <div className="page-wrapper">
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginBottom: '24px' }}>
            <button onClick={() => setShowCityModal(true)} className="btn btn-outline">
              <Plus size={16} /> Add Examination City
            </button>
            <button onClick={() => setShowCentreModal(true)} className="btn btn-primary">
              <Plus size={16} /> Add Testing Centre
            </button>
          </div>

          {/* Assessment Centres Table */}
          <div className="table-container" style={{ marginBottom: '32px' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Allocated Testing Centres</h3>
            </div>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Centre Code & Name</th>
                  <th>City & State</th>
                  <th>Full Address</th>
                  <th>Capacity</th>
                  <th>Allocated Seats</th>
                  <th>Available Seats</th>
                </tr>
              </thead>
              <tbody>
                {centres.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{c.centre_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600 }}>{c.centre_code}</div>
                    </td>
                    <td>{c.city_name}</td>
                    <td style={{ fontSize: '0.85rem', color: '#475569' }}>{c.address}</td>
                    <td><strong>{c.total_capacity}</strong> seats</td>
                    <td>
                      <span className="badge badge-primary">{c.allocated_seats} filled</span>
                    </td>
                    <td>
                      <span className="badge badge-success">{c.available_seats} remaining</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cities Card Grid */}
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>Registered Exam Cities</h3>
          <div className="grid-4">
            {cities.map((city) => {
              const centreCount = centres.filter((c) => c.city_id === city.id).length;
              return (
                <div key={city.id} style={{ background: 'white', padding: '18px 20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <MapPin size={20} color="#2563eb" />
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{city.city_name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{city.state}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: '12px', fontSize: '0.775rem', color: '#16a34a', fontWeight: 600 }}>
                    {centreCount} Centre(s) active
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add City Modal */}
          {showCityModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Add Exam City</h3>
                  <button onClick={() => setShowCityModal(false)}><X size={20} /></button>
                </div>
                <form onSubmit={handleAddCity}>
                  <div className="form-group">
                    <label className="form-label">City Name *</label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      placeholder="e.g. Pune"
                      value={cityForm.city_name}
                      onChange={(e) => setCityForm({ ...cityForm, city_name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State *</label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      placeholder="e.g. Maharashtra"
                      value={cityForm.state}
                      onChange={(e) => setCityForm({ ...cityForm, state: e.target.value })}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                    <button type="button" onClick={() => setShowCityModal(false)} className="btn btn-secondary">Cancel</button>
                    <button type="submit" className="btn btn-primary">Save City</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Add Centre Modal */}
          {showCentreModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Add Examination Centre</h3>
                  <button onClick={() => setShowCentreModal(false)}><X size={20} /></button>
                </div>
                <form onSubmit={handleAddCentre}>
                  <div className="form-group">
                    <label className="form-label">Select City *</label>
                    <select
                      className="form-control"
                      value={centreForm.city_id}
                      onChange={(e) => setCentreForm({ ...centreForm, city_id: e.target.value })}
                    >
                      {cities.map((ct) => (
                        <option key={ct.id} value={ct.id}>{ct.city_name} ({ct.state})</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Centre Name *</label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        placeholder="e.g. Tech Assessment Hub"
                        value={centreForm.centre_name}
                        onChange={(e) => setCentreForm({ ...centreForm, centre_name: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Centre Code *</label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        placeholder="e.g. PUN-001"
                        value={centreForm.centre_code}
                        onChange={(e) => setCentreForm({ ...centreForm, centre_code: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Address *</label>
                    <textarea
                      required
                      rows={2}
                      className="form-control"
                      placeholder="Full street address and pincode"
                      value={centreForm.address}
                      onChange={(e) => setCentreForm({ ...centreForm, address: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Total Seat Capacity *</label>
                    <input
                      type="number"
                      required
                      className="form-control"
                      value={centreForm.total_capacity}
                      onChange={(e) => setCentreForm({ ...centreForm, total_capacity: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                    <button type="button" onClick={() => setShowCentreModal(false)} className="btn btn-secondary">Cancel</button>
                    <button type="submit" className="btn btn-primary">Save Centre</button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

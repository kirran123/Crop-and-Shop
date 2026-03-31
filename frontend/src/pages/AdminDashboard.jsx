import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Activity, Settings, LogOut, BarChart3, Database, CheckSquare, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ farmers: 0, customers: 0, marketValue: 0, history: [] });
  const [activeTab, setActiveTab] = useState('overview');
  const [usersList, setUsersList] = useState([]);
  const [approvalsList, setApprovalsList] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/admin/users?_t=${Date.now()}`);
      if(res.ok) setUsersList(await res.json());
    } catch(e) {}
  };

  const fetchApprovals = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/admin/approvals?_t=${Date.now()}`);
      if(res.ok) setApprovalsList(await res.json());
    } catch(e) {}
  };

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'approvals') fetchApprovals();
  }, [activeTab]);

  const handleDeleteUser = async (userId) => {
    if(!window.confirm("Are you sure you want to permanently delete this user?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/admin/users/${userId}`, { method: 'DELETE' });
      if(res.ok) setUsersList(prev => prev.filter(u => u.id !== userId));
    } catch(e) {}
  };

  const handleApprove = async (id) => {
    if(!window.confirm("Approve this >500kg transaction?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/admin/approvals/${id}/approve`, { method: 'POST' });
      if(res.ok) setApprovalsList(prev => prev.filter(a => a.id !== id));
      else alert("Error approving transaction.");
    } catch(e) {}
  };

  const handleReject = async (id) => {
    if(!window.confirm("Reject and delete this transaction?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/admin/approvals/${id}/reject`, { method: 'POST' });
      if(res.ok) setApprovalsList(prev => prev.filter(a => a.id !== id));
    } catch(e) {}
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/admin/stats?_t=${Date.now()}`);
        if(res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (e) {}
    };
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="layout-grid">
      {/* Mobile Header */}
      <div className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Shield color="var(--warning-accent)" size={24} />
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Admin Console</h2>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem' }}>
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      <div className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>

      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
          <Shield color="var(--warning-accent)" size={32} />
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Admin Console</h2>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }} style={{ padding: '0.75rem 1rem', background: activeTab === 'overview' ? 'rgba(255,255,255,0.1)' : 'transparent', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 500, opacity: activeTab === 'overview' ? 1 : 0.7 }}>
            <Activity size={20} /> Platform Overview
          </div>
          <div onClick={() => { setActiveTab('users'); setIsSidebarOpen(false); }} style={{ padding: '0.75rem 1rem', background: activeTab === 'users' ? 'rgba(255,255,255,0.1)' : 'transparent', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 500, opacity: activeTab === 'users' ? 1 : 0.7 }}>
            <Users size={20} /> Manage Users
          </div>
          <div onClick={() => { setActiveTab('logs'); setIsSidebarOpen(false); }} style={{ padding: '0.75rem 1rem', background: activeTab === 'logs' ? 'rgba(255,255,255,0.1)' : 'transparent', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 500, opacity: activeTab === 'logs' ? 1 : 0.7 }}>
            <Database size={20} /> Admin Logs
          </div>
          <div onClick={() => { setActiveTab('approvals'); setIsSidebarOpen(false); }} style={{ padding: '0.75rem 1rem', background: activeTab === 'approvals' ? 'rgba(255,255,255,0.1)' : 'transparent', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 500, opacity: activeTab === 'approvals' ? 1 : 0.7 }}>
            <CheckSquare size={20} /> Pending Approvals
          </div>
        </nav>
        
        <div style={{ marginTop: 'auto' }}>
           <button onClick={() => { localStorage.removeItem('userName'); localStorage.removeItem('lastActiveTime'); navigate('/login'); }} style={{ color: 'var(--danger-accent)', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', padding: '0.75rem', width: '100%' }}>
             <LogOut size={20} /> Sign Out
           </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="main-content" style={{ overflowY: 'auto' }}>
        <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>
              {activeTab === 'overview' && 'Platform Analytics'}
              {activeTab === 'users' && 'Manage Users'}
              {activeTab === 'logs' && 'Admin Activity Logs'}
              {activeTab === 'approvals' && 'Pending Transactions (>500kg)'}
            </h1>
            <p style={{ color: 'var(--color-text-muted)' }}>
              {activeTab === 'overview' && 'Monitor users, market activity, and system health.'}
              {activeTab === 'users' && 'View, manage, and explicitly remove verified platform accounts.'}
              {activeTab === 'logs' && 'Global feed of every single action taken on the database.'}
              {activeTab === 'approvals' && 'Review and manually authorize massive listings and checkouts.'}
            </p>
          </div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(16, 185, 129, 0.15))', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-xl)', display: 'flex', gap: '0.75rem', alignItems: 'center', backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-accent)', boxShadow: '0 0 10px var(--primary-accent)' }} />
            <span style={{ fontWeight: 600, letterSpacing: '0.5px', fontSize: '0.95rem' }}>Welcome, Admin</span>
          </motion.div>
        </header>

        {activeTab === 'overview' && (
          <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }} >
            
            <div className="dashboard-grid">
              <div className="glass-panel" style={{ borderLeft: '4px solid var(--primary-accent)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Total Farmers</h3>
                  <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '1rem' }}><Users size={24} color="var(--primary-accent)" /></div>
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.farmers.toLocaleString()}</div>
                <div style={{ color: 'var(--primary-accent)', fontSize: '0.875rem', marginTop: '0.75rem', fontWeight: 500 }}>Verified farm accounts</div>
              </div>

              <div className="glass-panel" style={{ borderLeft: '4px solid var(--secondary-accent)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Active Customers</h3>
                  <div style={{ padding: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '1rem' }}><Users size={24} color="var(--secondary-accent)" /></div>
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.customers.toLocaleString()}</div>
                <div style={{ color: 'var(--secondary-accent)', fontSize: '0.875rem', marginTop: '0.75rem', fontWeight: 500 }}>Active shoppers</div>
              </div>

              <div className="glass-panel" style={{ borderLeft: '4px solid var(--warning-accent)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Market Volume</h3>
                  <div style={{ padding: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '1rem' }}><BarChart3 size={24} color="var(--warning-accent)" /></div>
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>₹{stats.marketValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                <div style={{ color: 'var(--warning-accent)', fontSize: '0.875rem', marginTop: '0.75rem', fontWeight: 500 }}>Global Marketplace Cap</div>
              </div>
            </div>

            <div style={{ marginTop: '2.5rem' }}>
              <h2 style={{ marginBottom: '1.25rem' }}>Recent Admin Events</h2>
              <div className="glass-panel" style={{ padding: '0', overflowX: 'auto', width: '100%' }}>
                <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', background: 'rgba(0,0,0,0.02)' }}>
                      <th style={{ padding: '1rem 1.5rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Timestamp</th>
                      <th style={{ padding: '1rem 1.5rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Event Type</th>
                      <th style={{ padding: '1rem 1.5rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Status</th>
                      <th style={{ padding: '1rem 1.5rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.history.length === 0 ? (
                      <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No live activity detected in the database.</td></tr>
                    ) : stats.history.slice(0, 5).map(log => (
                      <tr key={log.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                        <td style={{ padding: '1rem 1.5rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{log.time}</td>
                        <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>{log.type}</td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <span className={log.status === 'Success' ? 'status-good' : 'status-warning'}>{log.status}</span>
                        </td>
                        <td style={{ padding: '1rem 1.5rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{log.detail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel" style={{ padding: '0', overflowX: 'auto', width: '100%' }}>
            <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', background: 'rgba(0,0,0,0.02)' }}>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Name</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Role</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Email Address</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Status</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersList.length === 0 ? (
                   <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading Users...</td></tr>
                ) : usersList.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>{u.name}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ padding: '0.2rem 0.6rem', display: 'inline-block', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 'bold', background: u.role === 'farmer' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)', color: u.role === 'farmer' ? 'var(--primary-accent)' : 'var(--secondary-accent)', textTransform: 'capitalize' }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--color-text-muted)' }}>{u.email}</td>
                    <td style={{ padding: '1rem 1.5rem' }}><span className="status-good">{u.status || 'Active'}</span></td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <button onClick={() => handleDeleteUser(u.id)} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600 }}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

        {activeTab === 'logs' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel" style={{ padding: '0', overflowX: 'auto', width: '100%' }}>
            <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', background: 'rgba(0,0,0,0.02)' }}>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Timestamp</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Event Type</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Status</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Comprehensive Details</th>
                </tr>
              </thead>
              <tbody>
                {stats.history.length === 0 ? (
                  <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No live activity detected in the database.</td></tr>
                ) : stats.history.map(log => (
                  <tr key={log.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{log.time}</td>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>{log.type}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span className={log.status === 'Success' ? 'status-good' : 'status-warning'}>{log.status}</span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{log.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

        {activeTab === 'approvals' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel" style={{ padding: '0', overflowX: 'auto', width: '100%' }}>
            <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', background: 'rgba(0,0,0,0.02)' }}>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Type</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>User details</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Crop Payload</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Timestamp</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {approvalsList.length === 0 ? (
                  <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No pending approvals.</td></tr>
                ) : approvalsList.map(a => {
                  const p = a.payload;
                  const isSell = a.type === 'sell';
                  const cropName = isSell ? p.crop_name : (p.item ? p.item.crop_name : "Unknown");
                  const kg = isSell ? p.quantity_kg : (p.item ? p.item.cartQuantity : 0);
                  const actName = isSell ? `Farmer: ${p.farmer_name}` : `Buyer: ${p.customer_name}`;
                  
                  return (
                    <tr key={a.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                      <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: isSell ? 'var(--primary-accent)' : 'var(--secondary-accent)' }}>
                        {a.type.toUpperCase()}
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>{actName}</td>
                      <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>{cropName} <span style={{ color: 'var(--warning-accent)' }}>({kg} kg)</span></td>
                      <td style={{ padding: '1rem 1.5rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{new Date(a.timestamp).toLocaleString()}</td>
                      <td style={{ padding: '1rem 1.5rem', display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleApprove(a.id)} className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: 'var(--primary-accent)' }}>Approve</button>
                        <button onClick={() => handleReject(a.id)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600 }}>Reject</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </motion.div>
        )}


      </main>
    </div>
  );
};

export default AdminDashboard;

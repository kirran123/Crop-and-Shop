import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, ShoppingCart, Shield, AlertCircle } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('farmer');
  const [isLogin, setIsLogin] = useState(true);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setError('');
    
    if (newRole === 'admin') {
      setIsLogin(true); // Admins cannot sign up
    } 
    
    // Clear credentials on role switch
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (role === 'admin') {
      if (email === 'kirranvijay' && password === 'kirran14') {
        localStorage.setItem('userName', 'Admin');
        localStorage.setItem('lastActiveTime', Date.now().toString());
        navigate('/admin');
      } else {
        setError("Invalid admin credentials.");
      }
      return;
    }

    if (!isLogin) {
      if (!name.trim()) {
        setError("Full name is required to register.");
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ role, name, email, password }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
           // Show success message
           alert("Account created successfully! Please log in.");
           
           // Switch to login screen and clear fields
           setIsLogin(true);
           setName('');
           setPassword('');
        } else {
           setError(data.detail || "An error occurred during sign up.");
        }
      } catch (err) {
        setError("Failed to connect to backend server. Make sure it is running.");
      }
      return;
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role, email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('userName', data.name || email.split('@')[0]);
        localStorage.setItem('lastActiveTime', Date.now().toString());
        if (role === 'farmer') navigate('/farmer');
        if (role === 'customer') navigate('/customer');
      } else {
        setError(data.detail || "Invalid login credentials.");
      }
    } catch (err) {
      setError("Failed to connect to backend server. Make sure it is running.");
    }
  };

  return (
    <div className="login-container" style={{ minHeight: '100vh', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--bg-dark-secondary) 0%, var(--bg-dark) 100%)' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="glass-panel" 
        style={{ width: '100%', maxWidth: '480px', padding: 'clamp(1.5rem, 5vw, 3rem)', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--primary-accent)' }}
        >
          <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%' }}>
            <Sprout size={48} strokeWidth={1.5} />
          </div>
        </motion.div>
        
        <h2 style={{ marginBottom: '0.5rem', color: 'white', fontSize: '1.75rem' }}>Crop and Shop</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2.5rem' }}>Modern Farming & Direct Commerce</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Role Selector */}
          <div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginBottom: '0.5rem' }}>
              <button 
                type="button"
                onClick={() => handleRoleChange('farmer')}
                style={{ padding: '0.75rem 0', borderRadius: 'var(--radius-md)', background: role === 'farmer' ? 'var(--primary-accent)' : 'rgba(255,255,255,0.05)', color: role === 'farmer' ? 'white' : 'var(--color-text-muted)', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.3s ease', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <Sprout size={16} /> Farmer
              </button>
              <button 
                type="button"
                onClick={() => handleRoleChange('customer')}
                style={{ padding: '0.75rem 0', borderRadius: 'var(--radius-md)', background: role === 'customer' ? 'var(--secondary-accent)' : 'rgba(255,255,255,0.05)', color: role === 'customer' ? 'white' : 'var(--color-text-muted)', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.3s ease', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <ShoppingCart size={16} /> Buyer
              </button>
              <button 
                type="button"
                onClick={() => handleRoleChange('admin')}
                style={{ padding: '0.75rem 0', borderRadius: 'var(--radius-md)', background: role === 'admin' ? '#475569' : 'rgba(255,255,255,0.05)', color: role === 'admin' ? 'white' : 'var(--color-text-muted)', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.3s ease', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <Shield size={16} /> Admin
              </button>
            </div>
          </div>
          
          {/* Error Message Display */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-md)', color: '#fca5a5', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                  <AlertCircle size={16} /> {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form Fields */}
          <AnimatePresence mode="popLayout">
            {!isLogin && (
              <motion.div 
                initial={{ opacity: 0, scaleY: 0 }} 
                animate={{ opacity: 1, scaleY: 1 }} 
                exit={{ opacity: 0, scaleY: 0 }}
                style={{ transformOrigin: 'top position: relative' }}
              >
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  required={!isLogin} 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', outline: 'none', color: 'white', transition: 'border-color 0.3s' }} 
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{position: 'relative'}}>
            <input 
              type="text" 
              placeholder={role === 'admin' ? "Admin ID" : "Email Address"} 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', outline: 'none', color: 'white', transition: 'border-color 0.3s' }} 
            />
          </div>
          
          <div style={{position: 'relative'}}>
            <input 
              type="password" 
              placeholder="Password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', outline: 'none', color: 'white', transition: 'border-color 0.3s' }} 
            />
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit" 
            className="btn-primary" 
            style={{ marginTop: '0.5rem', width: '100%', fontSize: '1rem', padding: '1rem', background: role === 'farmer' ? 'var(--primary-accent)' : role === 'customer' ? 'var(--secondary-accent)' : '#475569' }}
          >
            {isLogin ? "Access Dashboard" : "Create Account"}
          </motion.button>

        </form>

        {/* Toggle Login / Signup */}
        {role !== 'admin' && (
          <div style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span 
              onClick={() => { setIsLogin(!isLogin); setError(''); }} 
              style={{ color: 'white', cursor: 'pointer', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: '4px' }}
            >
              {isLogin ? "Sign Up" : "Log In"}
            </span>
          </div>
        )}

      </motion.div>
    </div>
  );
};

export default Login;

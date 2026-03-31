import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Search, Filter, LogOut, Store, Tag, CloudLightning, Trash2, CreditCard, Plus, Minus, Check, ClipboardList, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CustomerMarketplace = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [marketListings, setMarketListings] = useState([]);
  const [customerName, setCustomerName] = useState('Customer');
  const [activeTab, setActiveTab] = useState('shop');
  const [cartItems, setCartItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [filterOption, setFilterOption] = useState('newest');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setCustomerName(storedName.charAt(0).toUpperCase() + storedName.slice(1));
    }
  }, []);

  useEffect(() => {
    const fetchMarket = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/market/list?_t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          setMarketListings(data);
        }
        
        const appRes = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/admin/approvals?_t=${Date.now()}`);
        if(appRes.ok) {
          const apps = await appRes.json();
          const storedName = localStorage.getItem('userName');
          const nameToMatch = storedName ? storedName.charAt(0).toUpperCase() + storedName.slice(1) : 'Customer';
          setPendingApprovals(apps.filter(x => x.type === 'buy' && (x.payload.customer_name === nameToMatch || x.payload.customer_name === customerName)));
        }
      } catch (e) { }
    }
    fetchMarket();
    const interval = setInterval(fetchMarket, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleQuantityChange = (productId, val, max) => {
    let num = parseInt(val);
    if (isNaN(num)) num = '';
    else if (num > max) num = max;
    else if (num < 1) num = 1;
    setQuantities(prev => ({ ...prev, [productId]: num }));
  };

  const increment = (productId, max) => {
    const q = quantities[productId] !== undefined ? quantities[productId] : max;
    if (q < max) setQuantities(prev => ({ ...prev, [productId]: q + 1 }));
  };

  const decrement = (productId, max) => {
    const q = quantities[productId] !== undefined ? quantities[productId] : max;
    if (q > 1) setQuantities(prev => ({ ...prev, [productId]: q - 1 }));
  };

  const addToCart = (product) => {
    const q = quantities[product.id] !== undefined ? quantities[product.id] : product.quantity_kg;
    if (q === '' || q < 1) return;
    setCartItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, cartQuantity: q } : i);
      }
      return [...prev, { ...product, cartQuantity: q }];
    });
  };

  const removeFromCart = (index) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleCheckout = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/market/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cartItems, customer_name: customerName }),
      });
      if (res.ok) {
        const data = await res.json();
        alert(data.message || "Checkout successful! The farmer's stock has been updated globally.");
        setCartItems([]);
        setActiveTab('shop');
        // trigger an immediate fetch so UI updates without waiting 15s
        const fetchRes = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/market/list?_t=${Date.now()}`);
        if (fetchRes.ok) {
          const data = await fetchRes.json();
          setMarketListings(data);
        }
      } else {
        alert("An error occurred during checkout. Please try again.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const renderCart = () => {
    const total = cartItems.reduce((acc, item) => acc + ((parseFloat(item.price_per_qtl) / item.quantity_kg) * item.cartQuantity), 0);
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {cartItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
            <ShoppingCart size={64} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <h2>Your cart is empty</h2>
            <p>Go back to the shop to find fresh produce!</p>
            <button className="btn-primary" onClick={() => setActiveTab('shop')} style={{ marginTop: '1.5rem', padding: '0.75rem 2rem' }}>Browse Shop</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 2fr) minmax(280px, 1fr)', gap: '2rem' }}>
            <div>
              {cartItems.map((item, index) => (
                <div key={index} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '1.5rem' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>{item.crop_name}</h3>
                    <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Qty: {item.cartQuantity} Kg • Sell by {item.farmer_name}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary-accent)' }}>₹{((item.price_per_qtl / item.quantity_kg) * item.cartQuantity).toFixed(2)}</div>
                    <button onClick={() => removeFromCart(index)} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', padding: '0.75rem', borderRadius: '50%', cursor: 'pointer' }}>
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="glass-panel" style={{ height: 'fit-content' }}>
              <h3 style={{ margin: '0 0 1.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>Order Summary</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--color-text-muted)' }}>
                <span>Subtotal ({cartItems.length} items)</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', color: 'var(--color-text-muted)' }}>
                <span>Platform Fee</span>
                <span>Free</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
                <span>Total Amount</span>
                <span style={{ color: 'var(--secondary-accent)' }}>₹{total.toFixed(2)}</span>
              </div>
              <button className="btn-primary" style={{ width: '100%', padding: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }} onClick={handleCheckout}>
                <CreditCard size={20} /> Checkout Securely
              </button>
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  const renderShop = () => (
    <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
      {marketListings.length === 0 ? (
        <div style={{ color: 'var(--color-text-muted)', gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
          <CloudLightning size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
          <h2>No Live Sales Found</h2>
          <p>Waiting for farmers to post to the Global Decentralized Network...</p>
        </div>
      ) : marketListings
            .filter(p => p.crop_name.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => {
              if (filterOption === 'price-asc') return parseFloat(a.price_per_qtl) - parseFloat(b.price_per_qtl);
              if (filterOption === 'price-desc') return parseFloat(b.price_per_qtl) - parseFloat(a.price_per_qtl);
              return 0; // Default is newest (as returned by Firebase via get_market_listings which already reverses timestamp)
            })
            .map(product => {
        const q = quantities[product.id] !== undefined ? quantities[product.id] : product.quantity_kg;
        const inCart = cartItems.find(i => i.id === product.id);

        return (
          <motion.div key={product.id} variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} className="glass-panel" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0, color: 'white' }}>{product.crop_name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', color: 'var(--primary-accent)', fontWeight: 600, fontSize: '1.2rem' }}>
                  ₹{product.price_per_qtl} <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 400, marginLeft: '0.2rem' }}>/Qtl</span>
                </div>
              </div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Store size={14} color="var(--primary-accent)" /> <span style={{ color: 'white' }}>{product.farmer_name}</span> (📍 {product.location})
              </p>
              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column' }}>
                  <span>Stock: <strong style={{ color: 'white' }}>{product.quantity_kg} Kg</strong></span>
                  <span>{product.timestamp ? new Date(product.timestamp).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Live'}</span>
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-md)', padding: '0.25rem' }}>
                  <button onClick={() => decrement(product.id, product.quantity_kg)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.25rem' }}>
                    <Minus size={14} />
                  </button>
                  <input
                    type="number"
                    value={q}
                    onChange={(e) => handleQuantityChange(product.id, e.target.value, product.quantity_kg)}
                    style={{ width: '40px', textAlign: 'center', background: 'transparent', border: 'none', color: 'white', outline: 'none', fontSize: '0.9rem', MozAppearance: 'textfield' }}
                  />
                  <button onClick={() => increment(product.id, product.quantity_kg)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.25rem' }}>
                    <Plus size={14} />
                  </button>
                  <button onClick={() => addToCart(product)} style={{ marginLeft: '0.25rem', background: inCart && inCart.cartQuantity === q ? 'var(--primary-accent)' : 'rgba(16,185,129,0.2)', color: inCart && inCart.cartQuantity === q ? 'white' : 'var(--primary-accent)', border: 'none', borderRadius: 'var(--radius-sm)', padding: '0.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}>
                    <Check size={16} />
                  </button>
                </div>

              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );

  const renderPendingApprovals = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
        <ClipboardList color="var(--warning-accent)" /> Pending Order Approvals
      </h2>
      
      {pendingApprovals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
          <Tag size={48} style={{ margin: '0 auto 1.5rem auto', opacity: 0.5, display: 'block' }} />
          <h2>No pending orders</h2>
          <p>Any large-scale purchases (&gt;500kg) will appear here while awaiting admin review.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {pendingApprovals.map(app => (
            <div key={app.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid var(--warning-accent)' }}>
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: 'white' }}>{app.payload.item?.crop_name}</h3>
                <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
                  Qty: <strong style={{ color: 'var(--warning-accent)' }}>{app.payload.item?.cartQuantity} Kg</strong> • Target Farmer: {app.payload.item?.farmer_name}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: 'var(--warning-accent)', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.25rem', display: 'inline-block', padding: '0.2rem 0.6rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '1rem' }}>
                  Awaiting Verification
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginTop: '0.5rem' }}>
                  ₹{((app.payload.item?.price_per_qtl / app.payload.item?.quantity_kg) * app.payload.item?.cartQuantity).toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="layout-grid">
      {/* Mobile Header */}
      <div className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Store color="var(--secondary-accent)" size={24} />
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Market Hub</h2>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem' }}>
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      <div className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>

      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
          <Store color="var(--secondary-accent)" size={32} />
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Market Hub</h2>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div onClick={() => { setActiveTab('shop'); setIsSidebarOpen(false); }} style={{ padding: '0.75rem 1rem', background: activeTab === 'shop' ? 'rgba(255,255,255,0.1)' : 'transparent', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 500, opacity: activeTab === 'shop' ? 1 : 0.7 }}>
            <Search size={20} /> Browse Crops
          </div>
          <div onClick={() => { setActiveTab('cart'); setIsSidebarOpen(false); }} style={{ padding: '0.75rem 1rem', background: activeTab === 'cart' ? 'rgba(255,255,255,0.1)' : 'transparent', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 500, opacity: activeTab === 'cart' ? 1 : 0.7 }}>
            <ShoppingCart size={20} /> My Cart {cartItems.length > 0 && <span style={{ marginLeft: 'auto', background: 'var(--secondary-accent)', borderRadius: '1rem', padding: '0.1rem 0.5rem', fontSize: '0.75rem' }}>{cartItems.length}</span>}
          </div>
          <div onClick={() => { setActiveTab('pending'); setIsSidebarOpen(false); }} style={{ padding: '0.75rem 1rem', background: activeTab === 'pending' ? 'rgba(255,255,255,0.1)' : 'transparent', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 500, opacity: activeTab === 'pending' ? 1 : 0.7 }}>
            <ClipboardList size={20} /> Pending Orders {pendingApprovals.length > 0 && <span style={{ marginLeft: 'auto', background: 'var(--warning-accent)', borderRadius: '1rem', padding: '0.1rem 0.5rem', fontSize: '0.75rem', color: 'black' }}>{pendingApprovals.length}</span>}
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
            <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Welcome, {customerName}!</h1>
            <p style={{ color: 'var(--color-text-muted)' }}>Buy fresh produce directly from local farmers.</p>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={18} color="var(--color-text-muted)" style={{ position: 'absolute', left: '1rem' }} />
              <input
                type="text"
                placeholder="Search crops..."
                style={{ padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(0,0,0,0.1)', outline: 'none', width: '100%', maxWidth: '300px' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowFilterMenu(!showFilterMenu)} 
                className="btn-secondary" 
                style={{ borderRadius: 'var(--radius-xl)', padding: '0.75rem', background: showFilterMenu ? 'rgba(255,255,255,0.2)' : '' }}
              >
                <Filter size={20} />
              </button>
              
              <AnimatePresence>
                {showFilterMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, scale: 0.95 }} 
                    style={{ position: 'absolute', right: 0, top: '100%', marginTop: '0.5rem', background: 'var(--bg-dark-secondary)', padding: '0.5rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', zIndex: 50, width: '200px', border: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <div onClick={() => { setFilterOption('newest'); setShowFilterMenu(false); }} style={{ padding: '0.75rem 1rem', cursor: 'pointer', borderRadius: 'var(--radius-md)', background: filterOption === 'newest' ? 'rgba(255,255,255,0.05)' : 'transparent', color: filterOption === 'newest' ? 'var(--primary-accent)' : 'white', fontSize: '0.9rem', transition: 'all 0.2s' }}>Newest Listings</div>
                    <div onClick={() => { setFilterOption('price-asc'); setShowFilterMenu(false); }} style={{ padding: '0.75rem 1rem', cursor: 'pointer', borderRadius: 'var(--radius-md)', background: filterOption === 'price-asc' ? 'rgba(255,255,255,0.05)' : 'transparent', color: filterOption === 'price-asc' ? 'var(--primary-accent)' : 'white', fontSize: '0.9rem', transition: 'all 0.2s' }}>Price: Low to High</div>
                    <div onClick={() => { setFilterOption('price-desc'); setShowFilterMenu(false); }} style={{ padding: '0.75rem 1rem', cursor: 'pointer', borderRadius: 'var(--radius-md)', background: filterOption === 'price-desc' ? 'rgba(255,255,255,0.05)' : 'transparent', color: filterOption === 'price-desc' ? 'var(--primary-accent)' : 'white', fontSize: '0.9rem', transition: 'all 0.2s' }}>Price: High to Low</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'shop' && <motion.div key="shop" exit={{ opacity: 0, scale: 0.98 }}>{renderShop()}</motion.div>}
          {activeTab === 'cart' && <motion.div key="cart" exit={{ opacity: 0, scale: 0.98 }}>{renderCart()}</motion.div>}
          {activeTab === 'pending' && <motion.div key="pending" exit={{ opacity: 0, scale: 0.98 }}>{renderPendingApprovals()}</motion.div>}
        </AnimatePresence>

      </main>
    </div>
  );
};

export default CustomerMarketplace;

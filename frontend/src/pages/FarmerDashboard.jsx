import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sprout, Droplets, Thermometer, CloudRain, Wallet, Calculator, LogOut,
  MessageSquare, Calendar as CalendarIcon, ArrowUpRight, ArrowDownRight,
  Sun, TrendingUp, Wind, IndianRupee, LineChart, BookOpen, Store,
  CheckCircle, Users, Wheat, Leaf, Activity, Menu, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CROP_DB = {
  paddy: {
    id: "paddy", name: "Paddy (Rice)", season: "Monsoon", tempRange: "25 - 35",
    sowingMonths: [5, 6, 7], harvestMonths: [9, 10, 11],
    npk: { N: 120, P: 60, K: 40 }, waterLevel: "High. 2-5cm standing water.", moistureRange: [75, 100],
    stages: ["Nursery Seedling", "Transplanting", "Tillering", "Flowering", "Harvesting"],
    durationDays: 120, msp: 2320, market: 2450, icon: <CloudRain size={32} color="var(--primary-accent)" />,
    steps: [
      { title: 'Land Preparation', desc: 'Puddle the field repeatedly to form a mud slurry. This ensures a constant standing water environment is maintained, which softens the soil and suppresses nascent weed growth before transplanting.' },
      { title: 'Nursery Management', desc: 'Sow pre-germinated seeds uniformly in properly leveled nursery beds. Maintain a shallow water level to keep the roots hydrated and apply required basal fertilizers.' },
      { title: 'Transplanting', desc: 'Carefully transplant 20-25 day old seedlings, keeping 2-3 seedlings per hill at a shallow depth of 2-3 cm for optimal root establishment and tillering.' }
    ]
  },
  wheat: {
    id: "wheat", name: "Wheat", season: "Winter", tempRange: "10 - 20",
    sowingMonths: [9, 10, 11], harvestMonths: [2, 3, 4],
    npk: { N: 120, P: 60, K: 30 }, waterLevel: "Moderate.", moistureRange: [40, 60],
    stages: ["Sowing", "Crown Root", "Tillering", "Heading", "Ripening"],
    durationDays: 140, msp: 2275, market: 2500, icon: <Wheat size={32} color="var(--warning-accent)" />,
    steps: [
      { title: 'Field Preparation', desc: 'Plough deeply using a tractor-drawn disc harrow to break hardpans and achieve a fine tilth. Ensure proper leveling for uniform irrigation.' },
      { title: 'Seed Sowing', desc: 'Treat seeds with fungicide and sow at a depth of 3-5 cm using seed drills to maintain straight alignment and correct spacing.' },
      { title: 'Irrigation & Weeding', desc: 'Provide crucial irrigation at Crown Root Initiation (CRI) and Booting stages. Apply broad-spectrum herbicides 30-35 days post sowing.' }
    ]
  },
  sugarcane: {
    id: "sugarcane", name: "Sugarcane", season: "Year-Round", tempRange: "20 - 32",
    sowingMonths: [1, 2, 9, 10], harvestMonths: [0, 1, 11],
    npk: { N: 250, P: 100, K: 100 }, waterLevel: "Very High.", moistureRange: [65, 85],
    stages: ["Germination", "Tillering", "Maturation", "Ripening"],
    durationDays: 360, msp: 3150, market: 3400, icon: <Leaf size={32} color="var(--secondary-accent)" />,
    steps: [
      { title: 'Trench Preparation', desc: 'Deep plough the soil up to 25-30 cm to allow for deep root penetration, establishing ridges and furrows.' },
      { title: 'Setts Planting', desc: 'Select 3-budded, healthy disease-free setts. Plant them end to end in deep furrows and treat with fungicide to prevent sett rot.' },
      { title: 'Earthing Up', desc: 'Perform partial earthing at 45 days and full manual earthing at 120 days to prevent lodging during heavy winds and rains.' }
    ]
  },
  cotton: {
    id: "cotton", name: "Cotton", season: "Monsoon", tempRange: "21 - 30",
    sowingMonths: [4, 5, 6], harvestMonths: [9, 10, 11],
    npk: { N: 100, P: 50, K: 50 }, waterLevel: "Moderate.", moistureRange: [40, 55],
    stages: ["Germination", "Squaring", "Flowering", "Boll Opening"],
    durationDays: 160, msp: 6620, market: 6900, icon: <Sun size={32} color="var(--warning-accent)" />,
    steps: [
      { title: 'Deep Ploughing', desc: 'Plough 20-25cm deep during summer to expose overwintering pests to sunlight and disrupt their life cycles.' },
      { title: 'Dibbling', desc: 'Sow high-quality Bt cotton seeds at a 90x90 cm spacing to provide ample room for lateral branching and canopy growth.' },
      { title: 'Topping', desc: 'Remove the apical buds manually around 80 days post-sowing to arrest vertical height and encourage fruit-bearing lateral branches.' }
    ]
  },
  groundnut: {
    id: "groundnut", name: "Groundnut", season: "Monsoon", tempRange: "25 - 30",
    sowingMonths: [5, 6], harvestMonths: [8, 9, 10],
    npk: { N: 25, P: 50, K: 75 }, waterLevel: "Moderate.", moistureRange: [35, 55],
    stages: ["Seedling", "Vegetative", "Flowering", "Harvest"],
    durationDays: 110, msp: 6377, market: 6600, icon: <Sprout size={32} color="var(--primary-accent)" />,
    steps: [
      { title: 'Soil Loosening', desc: 'Prepare well-drained, friable sandy loam soil to ensure the pegs can easily penetrate the ground.' },
      { title: 'Seed Treatment', desc: 'Treat kernels with Trichoderma viride to prevent systemic soil-borne diseases before sowing.' },
      { title: 'Gypsum Application', desc: 'Apply 250 kg/ha of gypsum at the peak flowering stage to supply calcium, which is critical for robust pod formation.' }
    ]
  },
  maize: {
    id: "maize", name: "Maize", season: "Monsoon", tempRange: "21 - 27",
    sowingMonths: [5, 6], harvestMonths: [8, 9],
    npk: { N: 150, P: 60, K: 60 }, waterLevel: "High.", moistureRange: [50, 70],
    stages: ["Emergence", "Knee-High", "Tasseling", "Dough Stage"],
    durationDays: 100, msp: 2090, market: 2300, icon: <CloudRain size={32} color="var(--secondary-accent)" />,
    steps: [
      { title: 'Ridge Planting', desc: 'Plant the seeds on ridges rather than flat ground, as maize roots are highly sensitive to water-logging.' },
      { title: 'Top Dressing', desc: 'Apply urea top dressing in split doses specifically at the knee-high and tasseling stages for maximum nitrogen uptake.' },
      { title: 'Weed Control', desc: 'Maintain a critically weed-free environment for the first 45 days using pre-emergence herbicides and manual hoeing.' }
    ]
  },
  mustard: {
    id: "mustard", name: "Mustard", season: "Winter", tempRange: "10 - 25",
    sowingMonths: [9, 10], harvestMonths: [1, 2, 3],
    npk: { N: 80, P: 40, K: 40 }, waterLevel: "Low.", moistureRange: [30, 45],
    stages: ["Vegetative", "Flowering", "Pod Formation", "Maturation"],
    durationDays: 130, msp: 5650, market: 6100, icon: <Sun size={32} color="var(--warning-accent)" />,
    steps: [
      { title: 'Fine Tilth', desc: 'Prepare a very fine, granular seedbed, as mustard seeds are tiny and require excellent soil-to-seed contact for germination.' },
      { title: 'Thinning', desc: 'Thin the plant population manually 15-20 days after sowing to maintain an optimum intra-row spacing of 10-15 cm.' },
      { title: 'Pest Surveillance', desc: 'Watch explicitly for Mustard Aphids, especially during cloudy days, and spray appropriate systemic insecticides if the economic threshold is crossed.' }
    ]
  },
  tomato: {
    id: "tomato", name: "Tomato", season: "Year-Round", tempRange: "21 - 27",
    sowingMonths: [5, 6, 9, 10], harvestMonths: [8, 9, 0, 1],
    npk: { N: 100, P: 80, K: 80 }, waterLevel: "Moderate.", moistureRange: [50, 70],
    stages: ["Seedling", "Vegetative", "Flowering", "Fruiting", "Ripening"],
    durationDays: 120, msp: 1500, market: 2000, icon: <Sun size={32} color="#ef4444" />,
    steps: [
      { title: 'Nursery Raising', desc: 'Sow seeds in raised beds or pro-trays under shade netting to protect from heavy rain and direct sunlight.' },
      { title: 'Transplanting & Staking', desc: 'Transplant 25-30 day old seedlings at a spacing of 60x45 cm. Provide vertical support with bamboo stakes to prevent fruit rot.' },
      { title: 'Nutrient & Pest Management', desc: 'Apply calcium nitrate to prevent blossom end rot, and use sticky traps or neem oil to control whitefly infestations.' }
    ]
  },
  potato: {
    id: "potato", name: "Potato", season: "Winter", tempRange: "15 - 20",
    sowingMonths: [9, 10], harvestMonths: [1, 2],
    npk: { N: 120, P: 80, K: 100 }, waterLevel: "Moderate.", moistureRange: [60, 80],
    stages: ["Sprouting", "Vegetative", "Tuber Initiation", "Tuber Bulking", "Maturation"],
    durationDays: 110, msp: 1200, market: 1800, icon: <Sprout size={32} color="var(--warning-accent)" />,
    steps: [
      { title: 'Seed Tuber Preparation', desc: 'Select certified, disease-free seed tubers weighting 30-40g each. Pre-sprout them in diffuse light for 10-15 days prior to planting.' },
      { title: 'Ridge Planting', desc: 'Plant the tubers 5-7 cm deep on well-prepared ridges spaced 60 cm apart. This provides loose soil for unhindered tuber expansion.' },
      { title: 'Earthing Up', desc: 'Perform earthing up 25-30 days after planting to completely cover the developing stolons and prevent the tubers from turning green due to sun exposure.' }
    ]
  },
  mango: {
    id: "mango", name: "Mango", season: "Perennial", tempRange: "24 - 30",
    sowingMonths: [6, 7], harvestMonths: [3, 4, 5],
    npk: { N: 150, P: 80, K: 150 }, waterLevel: "Low to Moderate.", moistureRange: [40, 60],
    stages: ["Leaves Flush", "Flowering", "Fruit Set", "Fruit Growth", "Harvest"],
    durationDays: 360, msp: 4000, market: 6000, icon: <Sun size={32} color="#f59e0b" />,
    steps: [
      { title: 'Pit Digging & Planting', desc: 'Dig 1x1x1m pits during summer to expose them to the sun. Fill with topsoil, FYM, and superphosphate before planting grafted saplings during the monsoon.' },
      { title: 'Formative Pruning', desc: 'Train the young trees by removing the central shoot at a height of 1m to encourage lateral branching and develop a strong, low-spreading scaffold.' },
      { title: 'Water Management', desc: 'Withhold irrigation during the pre-flowering phase to induce stress and promote profuse flowering. Resume watering immediately after fruit set.' }
    ]
  },
  banana: {
    id: "banana", name: "Banana", season: "Perennial", tempRange: "25 - 30",
    sowingMonths: [5, 6, 7], harvestMonths: [4, 5, 8, 9],
    npk: { N: 200, P: 50, K: 250 }, waterLevel: "High.", moistureRange: [70, 90],
    stages: ["Planting", "Vegetative", "Shooting", "Bunch Development", "Harvest"],
    durationDays: 330, msp: 1500, market: 2500, icon: <Leaf size={32} color="#10b981" />,
    steps: [
      { title: 'Sucker Treatment', desc: 'Select disease-free sword suckers or tissue-cultured plants. Pare the roots and dip the corms in a fungicidal slurry before planting.' },
      { title: 'High-Density Planting', desc: 'Plant the suckers in broad pits with heavy basal manure. Bananas are gross feeders, requiring continuous, heavy top-dressing of nitrogen and potassium.' },
      { title: 'Desuckering & Propping', desc: 'Regularly remove lateral daughter suckers to direct energy to the main fruiting stem. Prop the plants with bamboo poles to prevent them from toppling over.' }
    ]
  }
};

const AI_TIPS_DB = [
  { irg: "Wait until tomorrow evening to turn on the water pumps. This prevents root rot.", cult: "The optimal temperature allows rapid vegetative growth. Weed your fields today.", mkt: "Mandi prices are expected to rise for Kharif crops this weekend. Hold your stock." },
  { irg: "Surface moisture is dropping rapidly today. Initiate light drip irrigation for 2 hours.", cult: "Check the underside of lower leaves for Aphids. It's the right weather for pest breeding.", mkt: "Supply is high in local markets today. Focus on local bulk buyers rather than wholesale." },
  { irg: "Soil pH is slightly acidic today. Avoid heavy watering to prevent further leaching of nutrients.", cult: "Good day to apply Nitrogen top-dressing as soil conditions are prime for absorption.", mkt: "Compare your listing with recent Community Board posts. Price accordingly to stay competitive." },
  { irg: "No irrigation needed. The ambient humidity is keeping the topsoil hydrated.", cult: "Strong winds expected later. Ensure tall crops like Maize/Sugarcane have adequate base support.", mkt: "Winter crop futures are looking strong. Secure your seed supply for the next cycle now." }
];

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ai_tips');
  const [farmerName, setFarmerName] = useState('Farmer');

  const [envData, setEnvData] = useState({ temp: 33.5, humidity: 70.0, rainfall: 6.5, windspeed: 14, sunlight: 38.0, ph: 6.8 });
  const [liveCultivationSensors, setLiveCultivationSensors] = useState({ moisture: 0.0, npk: { N: 0, P: 0, K: 0 } });

  const [selectedCropId, setSelectedCropId] = useState(null);
  const [activeFarmCrop, setActiveFarmCrop] = useState(null);
  const [marketListings, setMarketListings] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [plannerSelectedCropId, setPlannerSelectedCropId] = useState("paddy");

  const [ping, setPing] = useState(false);
  const [aiTipIndex, setAiTipIndex] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setFarmerName(storedName.charAt(0).toUpperCase() + storedName.slice(1));
    }

    const fetchEnvData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/sensors/dashboard?cacheBust=${Date.now()}`);
        if (response.ok) {
          const data = await response.json();
          setEnvData({
            temp: data.temperature !== undefined ? data.temperature : 33.5,
            humidity: data.humidity !== undefined ? data.humidity : 70.0,
            rainfall: data.rainfall !== undefined && data.rainfall !== null ? data.rainfall : Math.round((data.humidity || 70) / 15 * 10) / 10,
            windspeed: data.windspeed !== undefined && data.windspeed !== null ? data.windspeed : 14.5,
            sunlight: data.sunlight !== undefined && data.sunlight !== null ? data.sunlight : 38.5,
            ph: data.soil_ph !== undefined ? data.soil_ph : 6.8
          });
        }
      } catch (err) { }
    };
    fetchEnvData();

    // Autonomously update daily environmental metrics once every 24 hours
    const envInterval = setInterval(fetchEnvData, 86400000);
    return () => clearInterval(envInterval);
  }, []);

  // AI Daily Tips Auto-Rotation (Every 1 Minute)
  useEffect(() => {
    const aiInterval = setInterval(() => {
      setAiTipIndex((prev) => (prev + 1) % AI_TIPS_DB.length);
    }, 60000); // 1 minute
    return () => clearInterval(aiInterval);
  }, []);

  // 1-Hour Cultivation Sensor Polling Rule
  useEffect(() => {
    let interval;
    if (activeTab === 'cultivation' && selectedCropId) {
      const fetchLiveSensors = async () => {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/sensors/cultivation?_t=${Date.now()}`);
          if (response.ok) {
            const data = await response.json();
            setLiveCultivationSensors({
              moisture: data.soil_moisture || 0.0,
              npk: data.npk || { N: 0, P: 0, K: 0 }
            });
            setPing(p => !p);
          }
        } catch (err) { }
      };

      fetchLiveSensors();
      interval = setInterval(fetchLiveSensors, 3600000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [activeTab, selectedCropId]);

  const fetchMarketDB = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/market/list?_t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setMarketListings(data);
      }
      const appRes = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/admin/approvals?_t=${Date.now()}`);
      if (appRes.ok) {
        const apps = await appRes.json();
        const storedName = localStorage.getItem('userName');
        const nameToMatch = storedName ? storedName.charAt(0).toUpperCase() + storedName.slice(1) : 'Farmer';
        setPendingApprovals(apps.filter(x => x.type === 'sell' && (x.payload.farmer_name === nameToMatch || x.payload.farmer_name === farmerName)));
      }
    } catch (e) { console.error("Could not fetch market", e); }
  };

  useEffect(() => {
    if (activeTab === 'market') {
      fetchMarketDB();
      const mt = setInterval(fetchMarketDB, 15000);
      return () => clearInterval(mt);
    }
  }, [activeTab]);

  const handleStartCultivation = (cropId) => {
    setActiveFarmCrop(CROP_DB[cropId]);
    setActiveTab('forecast');
  };

  const handleMarketSubmission = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      farmer_name: formData.get('farmer_name'),
      location: formData.get('location'),
      crop_name: formData.get('crop_name'),
      quantity_kg: parseFloat(formData.get('quantity_kg')),
      price_per_qtl: parseFloat(formData.get('price_per_qtl'))
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/market/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        alert(data.message || "Listing successfully published to the verified Global Market Network.");
        e.target.reset();
        fetchMarketDB();
      } else {
        alert("Server failed to push your listing.");
      }
    } catch (err) {
      alert(`Failed to connect to the Market Network. Ensure your backend is running! Details: ${err.message}`);
    }
  };

  // -------------------------------------------------------------------------------- //
  //  0. AI FIELD ASSISTANT (Auto Rotates Every 1 Minute)
  // -------------------------------------------------------------------------------- //
  const renderAiAssistant = () => {
    const tip = AI_TIPS_DB[aiTipIndex];
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <MessageSquare color="var(--primary-accent)" /> Active AI Farming Intelligence
          </h2>
          <span style={{ fontSize: '0.8rem', background: 'rgba(139,92,246,0.2)', padding: '0.2rem 0.5rem', borderRadius: '1rem', color: '#8B5CF6' }}>
            Auto-Updates Every Minute 🔃
          </span>
        </div>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
          Dynamically generated operational intelligence. Derived from ambient temperature: {envData.temp}°C and soil pH: {envData.ph}.
        </p>

        <AnimatePresence mode="wait">
          <motion.div
            key={aiTipIndex}
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.5 }}
            style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr)', gap: '1.5rem' }}
          >
            <div className="glass-panel" style={{ borderLeft: '4px solid var(--primary-accent)', background: 'var(--bg-secondary)', padding: '2rem' }}>
              <h3 style={{ marginBottom: '1rem', color: 'white' }}>💧 Irrigation Strategy</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', lineHeight: '1.6' }}>{tip.irg}</p>
            </div>

            <div className="glass-panel" style={{ borderLeft: '4px solid var(--warning-accent)', background: 'var(--bg-secondary)', padding: '2rem' }}>
              <h3 style={{ marginBottom: '1rem', color: 'white' }}>🌱 Cultivation Advice</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', lineHeight: '1.6' }}>{tip.cult}</p>
            </div>

            <div className="glass-panel" style={{ borderLeft: '4px solid #8B5CF6', background: 'var(--bg-secondary)', padding: '2rem' }}>
              <h3 style={{ marginBottom: '1rem', color: 'white' }}>💰 Market Analytics</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', lineHeight: '1.6' }}>{tip.mkt}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    );
  };

  // -------------------------------------------------------------------------------- //
  //  1. ENVIRONMENT WEATHER TELEMETRY OVERVIEW
  // -------------------------------------------------------------------------------- //
  const renderOverview = () => (
    <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}>
      <h2 style={{ marginBottom: '1.5rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <CloudRain color="var(--primary-accent)" /> Global Field Telemetry & Weather Logs
      </h2>
      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} className="glass-panel" style={{ borderLeft: '4px solid var(--primary-accent)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Rainfall</h3>
            <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '1rem' }}><CloudRain size={24} color="var(--primary-accent)" /></div>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{envData.rainfall} mm</div>
          <div style={{ color: 'var(--primary-accent)', fontSize: '0.875rem', marginTop: '0.75rem', fontWeight: 500 }}>Daily Aggregate Tracker</div>
        </motion.div>

        <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} className="glass-panel" style={{ borderLeft: '4px solid #8B5CF6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Windspeed</h3>
            <div style={{ padding: '0.75rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '1rem' }}><Wind size={24} color="#8B5CF6" /></div>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{envData.windspeed} km/h</div>
          <div style={{ color: '#8B5CF6', fontSize: '0.875rem', marginTop: '1.25rem', fontWeight: 500 }}>Daily Maximum Gusts</div>
        </motion.div>

        <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} className="glass-panel" style={{ borderLeft: '4px solid var(--warning-accent)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Sunlight Hours</h3>
            <div style={{ padding: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '1rem' }}><Sun size={24} color="var(--warning-accent)" /></div>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{envData.sunlight}°C</div>
          <div style={{ color: 'var(--warning-accent)', fontSize: '0.875rem', marginTop: '0.75rem', fontWeight: 500 }}>Daily Heat Insolation</div>
        </motion.div>

        <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} className="glass-panel" style={{ borderLeft: '4px solid var(--secondary-accent)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Soil pH Data</h3>
            <div style={{ padding: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '1rem' }}><Sprout size={24} color="var(--secondary-accent)" /></div>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{envData.ph}</div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.75rem' }}>Average Field Health</div>
        </motion.div>
      </div>

      <div style={{ marginTop: '2.5rem', display: 'flex', gap: '2rem' }}>
        <div className="glass-panel" style={{ flex: 1, borderLeft: '4px solid #ef4444' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--color-text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Thermometer size={20} color="#ef4444" /> Avg Temp</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{envData.temp}°C</div>
        </div>
        <div className="glass-panel" style={{ flex: 1, borderLeft: '4px solid #3b82f6' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--color-text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CloudRain size={20} color="#3b82f6" /> Avg Humidity</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{envData.humidity}%</div>
        </div>
      </div>
    </motion.div>
  );

  // -------------------------------------------------------------------------------- //
  //  2. SOWING PLANNER
  // -------------------------------------------------------------------------------- //
  const renderCropPlanner = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const targetCrop = CROP_DB[plannerSelectedCropId];

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
          <h2 style={{ color: 'white' }}>12-Month Sowing Lifecycle Matrix</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Analyze Any Crop:</span>
            <select
              className="glass-panel"
              style={{ padding: '0.5rem 1rem', background: 'var(--bg-primary)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', outline: 'none', cursor: 'pointer' }}
              value={plannerSelectedCropId}
              onChange={(e) => setPlannerSelectedCropId(e.target.value)}
            >
              {Object.values(CROP_DB).map(crop => <option key={crop.id} value={crop.id}>{crop.name}</option>)}
            </select>
          </div>
        </div>

        <div className="glass-panel" style={{ background: 'var(--bg-secondary)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
            {months.map((month, i) => {
              const isSowing = targetCrop.sowingMonths.includes(i);
              const isHarvest = targetCrop.harvestMonths.includes(i);
              let bgColor = 'var(--bg-primary)';
              let borderCol = '1px solid rgba(255,255,255,0.05)';
              let icon = null;

              if (isSowing) { bgColor = 'rgba(16, 185, 129, 0.2)'; borderCol = '1px solid var(--primary-accent)'; icon = <Sprout size={16} color="var(--primary-accent)" />; }
              else if (isHarvest) { bgColor = 'rgba(245, 158, 11, 0.2)'; borderCol = '1px solid var(--warning-accent)'; icon = <CheckCircle size={16} color="var(--warning-accent)" />; }

              return (
                <div key={month} style={{ padding: '1.5rem 0.5rem', borderRadius: '0.5rem', background: bgColor, border: borderCol, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 'bold', color: isSowing || isHarvest ? 'white' : 'var(--color-text-muted)' }}>{month}</span>
                  <div style={{ height: '20px' }}>{icon}</div>
                </div>
              )
            })}
          </div>
        </div>
      </motion.div>
    );
  };

  // -------------------------------------------------------------------------------- //
  //  3. CULTIVATION GUIDE (Rapid 5s Polling enforced)
  // -------------------------------------------------------------------------------- //
  const renderCultivationGuide = () => {
    if (!selectedCropId) {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <h2 style={{ marginBottom: '1.5rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen color="var(--primary-accent)" /> High-Resolution Cultivation Library
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {Object.values(CROP_DB).map(crop => (
              <div key={crop.id} className="glass-panel hover-card" onClick={() => setSelectedCropId(crop.id)}
                style={{ cursor: 'pointer', background: 'var(--bg-secondary)', transition: 'all 0.2s', borderTop: '4px solid var(--primary-accent)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '1rem' }}>{crop.icon}</div>
                  <span style={{ padding: '0.25rem 0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{crop.season}</span>
                </div>
                <h3 style={{ color: 'white', fontSize: '1.4rem', marginBottom: '0.5rem' }}>{crop.name}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                  <span>Optimal Temp Model: {crop.tempRange}°C</span>
                  <span>Tracking Duration: {crop.durationDays} Days</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      );
    }

    const guide = CROP_DB[selectedCropId];
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <button onClick={() => setSelectedCropId(null)} className="btn-secondary">← Back to Encyclopedia</button>
          <button onClick={() => handleStartCultivation(guide.id)} className="btn-primary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Sprout size={18} /> Push Plant to Active Yield Predictor
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ color: 'var(--color-text-muted)' }}>Agronomic Steps: {guide.name}</h3>
            {guide.steps.map((step, index) => (
              <div key={index} className="glass-panel" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', background: 'var(--bg-secondary)' }}>
                <div style={{ background: 'var(--primary-accent)', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', flexShrink: 0 }}>
                  {index + 1}
                </div>
                <div>
                  <h4 style={{ marginBottom: '0.5rem', fontSize: '1.1rem', color: 'white' }}>{step.title}</h4>
                  <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.6' }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ color: 'var(--color-text-muted)' }}>Deep Sensor Hardware Tracking Module</h3>

            {/* 5-SEC LIVE SENSOR BLOCKS */}
            <div className="glass-panel" style={{ background: 'var(--bg-dark)', borderLeft: '4px solid var(--primary-accent)' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', color: 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Droplets color="var(--primary-accent)" /> Real-Time Soil Water Level</div>
                <motion.span animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 5, repeat: Infinity }} style={{ fontSize: '0.7rem', background: 'rgba(16,185,129,0.2)', padding: '0.2rem 0.5rem', borderRadius: '1rem', color: 'white' }}>
                  Live hardware refresh (1H) 🟢
                </motion.span>
              </h4>
              <motion.div key={ping ? "p1" : "p2"} initial={{ scale: 1.05 }} animate={{ scale: 1 }} transition={{ duration: 0.2 }} style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>
                {liveCultivationSensors.moisture}%
              </motion.div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem' }}>
                <strong>Field Directive:</strong> Limit bounds require Min {guide.moistureRange[0]}% to Max {guide.moistureRange[1]}%.
              </p>
            </div>

            <div className="glass-panel" style={{ background: 'var(--bg-dark)', borderLeft: '4px solid #8B5CF6' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', color: 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Sprout color="#8B5CF6" /> Live Chemical Substrate (NPK) Levels</div>
                <motion.span animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 5, repeat: Infinity, delay: 0.5 }} style={{ fontSize: '0.7rem', background: 'rgba(139,92,246,0.2)', padding: '0.2rem 0.5rem', borderRadius: '1rem', color: 'white' }}>
                  Live hardware refresh (1H) 🟢
                </motion.span>
              </h4>

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <motion.div key={ping ? "n1" : "n2"} initial={{ scale: 1.1 }} animate={{ scale: 1 }} style={{ flex: 1, textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ color: '#ef4444', fontSize: '1.8rem', fontWeight: 'bold' }}>{liveCultivationSensors.npk.N}</div>
                  <div style={{ fontSize: '0.8rem', color: 'white' }}>Nitrogen Tracker</div>
                </motion.div>
                <motion.div key={ping ? "p_1" : "p_2"} initial={{ scale: 1.1 }} animate={{ scale: 1 }} style={{ flex: 1, textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ color: '#3b82f6', fontSize: '1.8rem', fontWeight: 'bold' }}>{liveCultivationSensors.npk.P}</div>
                  <div style={{ fontSize: '0.8rem', color: 'white' }}>Phosphorus Tracker</div>
                </motion.div>
                <motion.div key={ping ? "k1" : "k2"} initial={{ scale: 1.1 }} animate={{ scale: 1 }} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ color: '#eab308', fontSize: '1.8rem', fontWeight: 'bold' }}>{liveCultivationSensors.npk.K}</div>
                  <div style={{ fontSize: '0.8rem', color: 'white' }}>Potash Tracker</div>
                </motion.div>
              </div>

              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem' }}>
                <strong>Required Application Schedule:</strong> You need to maintain N:{guide.npk.N} P:{guide.npk.P} K:{guide.npk.K} limits.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // -------------------------------------------------------------------------------- //
  //  4. GROWTH TRAJECTORY (Daily Target Tracker added)
  // -------------------------------------------------------------------------------- //
  const renderForecast = () => {
    if (!activeFarmCrop) {
      return (
        <div style={{ height: '50vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'var(--color-text-muted)' }}>
          <Activity size={64} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <h2>Waiting for Plant System Initialization...</h2>
          <p>Please launch the Growth model from inside the Cultivation Guide.</p>
        </div>
      );
    }

    const currentTemp = parseFloat(envData.temp);
    const stages = activeFarmCrop.stages;
    const daysPerStage = Math.floor(activeFarmCrop.durationDays / stages.length);
    const today = new Date();

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div className="glass-panel" style={{ background: 'var(--bg-secondary)', padding: '2rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'white' }}>
            <TrendingUp color="var(--primary-accent)" /> 30-Day Predictive Interpolation: {activeFarmCrop.name}
          </h3>

          <div style={{ display: 'flex', overflowX: 'auto', paddingBottom: '1rem', gap: '1rem', scrollbarWidth: 'thin' }}>
            {Array.from({ length: 30 }).map((_, i) => {
              const stepDate = new Date(today);
              stepDate.setDate(today.getDate() + i);

              const dayTemp = (currentTemp + Math.sin(i / 3) * 5).toFixed(1);
              const stageTarget = Math.min(Math.floor((i * 4) / daysPerStage), stages.length - 1);

              const baseMinW = activeFarmCrop.moistureRange[0];
              const baseMaxW = activeFarmCrop.moistureRange[1];
              const dMinW = (baseMinW + Math.sin(i)).toFixed(0);
              const dMaxW = (baseMaxW + Math.cos(i)).toFixed(0);

              return (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                  style={{ minWidth: '260px', padding: '1.5rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', color: 'white' }}>
                    <span style={{ fontWeight: 'bold' }}>Day {i + 1}</span>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{stepDate.toLocaleDateString()}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-text-muted)' }}><Thermometer size={14} /> Simulation Temp:</span>
                      <span>{dayTemp}°C</span>
                    </div>

                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.5rem', borderRadius: '0.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#3b82f6', fontSize: '0.8rem', marginBottom: '0.25rem' }}><Droplets size={12} /> Daily Water Limit Simulation</div>
                      <div style={{ fontSize: '0.85rem' }}><strong>Minimum:</strong> {dMinW}% &mdash; <strong>Maximum:</strong> {dMaxW}%</div>
                    </div>

                    <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '0.5rem', borderRadius: '0.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#8B5CF6', fontSize: '0.8rem', marginBottom: '0.25rem' }}><Sprout size={12} /> Daily Fertilizer Target</div>
                      <div style={{ fontSize: '0.85rem' }}>Target Profile: {activeFarmCrop.npk.N}N - {activeFarmCrop.npk.P}P - {activeFarmCrop.npk.K}K</div>
                    </div>
                  </div>

                  <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderLeft: '3px solid var(--primary-accent)', borderRadius: '0.25rem', marginTop: 'auto' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--primary-accent)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.1rem' }}>Growth Phase Designation</div>
                    <div style={{ fontWeight: 'bold', color: 'white', fontSize: '1rem' }}>{stages[stageTarget]}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    );
  };

  const renderMarketHub = () => {
    const product = activeFarmCrop || CROP_DB['paddy'];

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
          <Store color="var(--primary-accent)" /> Global Farmer Market Operations
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 1fr', gap: '2rem' }}>
          <div className="glass-panel" style={{ background: 'var(--bg-secondary)', color: 'white' }}>
            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Push Listing to Cloud Platform</h3>
            <form onSubmit={handleMarketSubmission} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Authenticated User</label>
                  <input type="text" name="farmer_name" defaultValue={farmerName} required readOnly style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'var(--color-text-muted)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Distribution Location</label>
                  <input type="text" name="location" placeholder="" required style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.1)', background: 'var(--bg-primary)', color: 'white' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Active Crop Variant</label>
                  <input type="text" name="crop_name" defaultValue={product.name} required style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.1)', background: 'var(--bg-primary)', color: 'white' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Net Weight (Kg)</label>
                  <input type="number" name="quantity_kg" placeholder="" min="1" required style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.1)', background: 'var(--bg-primary)', color: 'white' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Target Sale Price per Quintal (₹)</label>
                <input type="number" name="price_per_qtl" defaultValue={product.market} required style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.1)', background: 'var(--bg-primary)', color: 'white', fontSize: '1.2rem', fontWeight: 'bold' }} />
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', width: '100%', padding: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
                <CheckCircle size={22} /> Sale
              </button>
            </form>

            {pendingApprovals.length > 0 && (
              <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                <h4 style={{ color: 'var(--warning-accent)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  ⏳ Pending Admin Approvals (&gt;500kg)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {pendingApprovals.map(app => (
                    <div key={app.id} style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'white', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 'bold' }}>{app.payload.crop_name}</span>
                        <span style={{ color: 'var(--warning-accent)' }}>{app.payload.quantity_kg} Kg</span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                        Waiting for Admin verification...
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="glass-panel" style={{ background: 'var(--card-bg)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', color: 'var(--color-text-main)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users color="var(--primary-accent)" /> Global Sell Community Server</div>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {marketListings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>No active sales on the global network yet.</div>
              ) : marketListings.map(listing => (
                <div key={listing.id} className="glass-panel" style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem', borderLeft: '4px solid var(--primary-accent)', borderTop: 'none', borderRight: 'none', borderBottom: 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 'bold', color: 'var(--color-text-main)', fontSize: '1.1rem' }}>{listing.farmer_name}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>
                        {listing.timestamp ? new Date(listing.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : "Just now"}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-main)', background: 'rgba(59, 130, 246, 0.2)', padding: '0.3rem 0.6rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>📍 {listing.location}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                    <span style={{ color: 'white', fontWeight: 500 }}>{listing.crop_name} <span style={{ color: 'var(--primary-accent)', fontSize: '0.9rem' }}>({listing.quantity_kg} Kg)</span></span>
                    <span style={{ fontWeight: 'bold', color: 'var(--warning-accent)', fontSize: '1.2rem' }}>₹{listing.price_per_qtl}/Qtl</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="layout-grid">
      {/* Mobile Header */}
      <div className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Sprout color="var(--primary-accent)" size={24} />
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Farm Hub</h2>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem' }}>
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Sidebar Overlay */}
      <div className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>

      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
          <Sprout color="var(--primary-accent)" size={32} />
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Farm Hub</h2>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div onClick={() => { setActiveTab('ai_tips'); setIsSidebarOpen(false); }} style={{ padding: '0.75rem 1rem', background: activeTab === 'ai_tips' ? 'rgba(255,255,255,0.1)' : 'transparent', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', color: activeTab === 'ai_tips' ? 'white' : 'var(--color-text-muted)' }}>
            <MessageSquare size={20} /> Daily AI Farm Tips
          </div>
          <div onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }} style={{ padding: '0.75rem 1rem', background: activeTab === 'overview' ? 'rgba(255,255,255,0.1)' : 'transparent', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', color: activeTab === 'overview' ? 'white' : 'var(--color-text-muted)' }}>
            <CloudRain size={20} /> Environment Weather
          </div>
          <div onClick={() => { setActiveTab('planner'); setIsSidebarOpen(false); }} style={{ padding: '0.75rem 1rem', background: activeTab === 'planner' ? 'rgba(255,255,255,0.1)' : 'transparent', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', color: activeTab === 'planner' ? 'white' : 'var(--color-text-muted)' }}>
            <CalendarIcon size={20} /> 12M Sowing Matrix
          </div>
          <div onClick={() => { setActiveTab('cultivation'); setIsSidebarOpen(false); }} style={{ padding: '0.75rem 1rem', background: activeTab === 'cultivation' ? 'rgba(255,255,255,0.1)' : 'transparent', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', color: activeTab === 'cultivation' ? 'white' : 'var(--color-text-muted)' }}>
            <BookOpen size={20} /> Cultivation Setup
          </div>
          <div onClick={() => { setActiveTab('forecast'); setIsSidebarOpen(false); }} style={{ padding: '0.75rem 1rem', background: activeTab === 'forecast' ? 'rgba(255,255,255,0.1)' : 'transparent', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', color: activeTab === 'forecast' ? 'white' : 'var(--color-text-muted)' }}>
            <TrendingUp size={20} /> Growth Trajectory
          </div>
          <div onClick={() => { setActiveTab('market'); setIsSidebarOpen(false); }} style={{ padding: '0.75rem 1rem', background: activeTab === 'market' ? 'rgba(255,255,255,0.1)' : 'transparent', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', color: activeTab === 'market' ? 'white' : 'var(--color-text-muted)' }}>
            <Store size={20} /> Market Listings
          </div>
        </nav>
        <div
          onClick={() => { localStorage.removeItem('userName'); localStorage.removeItem('lastActiveTime'); navigate('/login'); }}
          style={{ marginTop: 'auto', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#ef4444', cursor: 'pointer', borderRadius: 'var(--radius-md)', background: 'rgba(239,68,68,0.05)' }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.05)'}
        >
          <LogOut size={20} /> Logout System
        </div>
      </div>

      <main className="main-content" style={{ overflowY: 'auto' }}>
        <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: "easeOut" }} style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <motion.span
                animate={{ rotate: [0, 14, -8, 14, -4, 10, 0, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
                style={{ fontSize: '2.8rem', display: 'inline-block', transformOrigin: '70% 70%' }}
              >
                👋
              </motion.span>
              <h1 style={{
                fontSize: '2.8rem',
                fontWeight: 800,
                margin: 0,
                background: 'linear-gradient(to right, #ffffff, #a78bfa, #10b981)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1.2,
                letterSpacing: '-0.02em'
              }}>
                Welcome back, {farmerName}!
              </h1>
            </div>
            <p style={{ color: '#9ca3af', fontSize: '1.1rem', fontWeight: 500, marginLeft: '3.55rem' }}>
              {activeTab === 'ai_tips' && "Daily plain English agriculture tips autonomously updating every 1 minute."}
              {activeTab === 'overview' && "24-Hour Environmental averages."}
              {activeTab === 'planner' && "Analyze 12-Month Sowing bounds."}
              {activeTab === 'cultivation' && "High-Frequency live NPK sensory tracks."}
              {activeTab === 'forecast' && "Daily maturity models mapping precise Minimum and Maximum limits."}
              {activeTab === 'market' && "Global Unified Real-Time Market Exchange."}
            </p>
          </motion.div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {activeFarmCrop && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'rgba(16, 185, 129, 0.1)', color: 'white', borderRadius: '0.5rem', border: '1px solid var(--primary-accent)' }}>
                <div style={{ width: '8px', height: '8px', background: 'var(--primary-accent)', borderRadius: '50%' }}></div> Cultivating Dataset: {activeFarmCrop.name}
              </div>
            )}
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'ai_tips' && <motion.div key="ai" exit={{ opacity: 0, y: -20 }}>{renderAiAssistant()}</motion.div>}
          {activeTab === 'overview' && <motion.div key="overview" exit={{ opacity: 0, y: -20 }}>{renderOverview()}</motion.div>}
          {activeTab === 'planner' && <motion.div key="planner" exit={{ opacity: 0, y: -20 }}>{renderCropPlanner()}</motion.div>}
          {activeTab === 'cultivation' && <motion.div key="cultivation" exit={{ opacity: 0, y: -20 }}>{renderCultivationGuide()}</motion.div>}
          {activeTab === 'forecast' && <motion.div key="forecast" exit={{ opacity: 0, y: -20 }}>{renderForecast()}</motion.div>}
          {activeTab === 'market' && <motion.div key="market" exit={{ opacity: 0, y: -20 }}>{renderMarketHub()}</motion.div>}
        </AnimatePresence>

      </main>
    </div>
  );
};
export default FarmerDashboard;

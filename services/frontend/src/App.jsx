import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import Navbar  from './components/layout/Navbar.jsx';
import Footer  from './components/layout/Footer.jsx';

import Landing  from './pages/Landing.jsx';
import Home     from './pages/Home.jsx';
import Submit   from './pages/Submit.jsx';
import Pending  from './pages/Pending.jsx';
import Stats    from './pages/Stats.jsx';
import Login    from './pages/Login.jsx';
import Signup   from './pages/Signup.jsx';

function AppRoutes({ user, setUser }) {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/"          element={<Landing />} />
        <Route path="/browse"    element={<Home />} />
        <Route path="/submit"    element={<Submit />} />
        <Route path="/community" element={<Pending />} />
        <Route path="/stats"     element={<Stats />} />
        <Route path="/login"     element={<Login setUser={setUser} />} />
        <Route path="/signup"    element={<Signup />} />
        {/* Legacy redirect support */}
        <Route path="/pending"   element={<Pending />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');
    if (token && email) setUser(email);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    setUser(null);
  };

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar user={user} onLogout={handleLogout} />
        <main style={{ flex: 1 }}>
          <AppRoutes user={user} setUser={setUser} />
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { ColoniesProvider } from './context/ColoniesContext';
import { AuthProvider }    from './context/AuthContext';
import { GameProvider }    from './context/GameContext';
import Navbar  from './components/Navbar';
import Footer  from './components/Footer';

// Public pages
import Home         from './pages/Home';
import About        from './pages/About';
import FAQ          from './pages/FAQ';
import Contact      from './pages/Contact';
import AITools      from './pages/AITools';
import Gallery      from './pages/Gallery';
import Conservation from './pages/Conservation';

// Citizen science pages
import Login       from './pages/Login';
import Profile     from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import Submit      from './pages/Submit';
import Challenge   from './pages/Challenge';
import Admin       from './pages/Admin';

// Map/tool pages
import Analytics      from './pages/Analytics';
import BirdUpload     from './pages/BirdUpload';
import HurricaneTracker from './pages/HurricaneTracker';
import BudgetPlanner  from './pages/BudgetPlanner';
import SpeciesPage    from './pages/SpeciesPage';
import HabitatLoss    from './pages/HabitatLoss';
import Reports        from './pages/Reports';

/** Pages with Navbar + Footer (scrollable) */
function PublicLayout() {
  return (
    <div className="bg-[#020b18] text-white min-h-screen">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
}

/** Full-viewport map pages — Navbar only, no Footer */
function MapLayout() {
  return (
    <div className="bg-[#020b18] text-white">
      <Navbar />
      <Outlet />
    </div>
  );
}

/** Standalone pages — Navbar only, no Footer */
function StandaloneLayout() {
  return (
    <div className="bg-[#020b18] text-white min-h-screen">
      <Navbar />
      <Outlet />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GameProvider>
          <ColoniesProvider>
            <Routes>
              {/* ── Map/tool pages ──────────────────────────────── */}
              <Route element={<MapLayout />}>
                <Route path="/analytics"  element={<Analytics />} />
                <Route path="/upload"     element={<BirdUpload />} />
                <Route path="/hurricane"  element={<HurricaneTracker />} />
                <Route path="/budget"     element={<BudgetPlanner />} />
                <Route path="/species"    element={<SpeciesPage />} />
                <Route path="/habitat"    element={<HabitatLoss />} />
                <Route path="/reports"    element={<Reports />} />
              </Route>

              {/* ── Citizen science pages (no footer) ───────────── */}
              <Route element={<StandaloneLayout />}>
                <Route path="/profile"     element={<Profile />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/submit"      element={<Submit />} />
                <Route path="/challenge"   element={<Challenge />} />
                <Route path="/admin"       element={<Admin />} />
              </Route>

              {/* ── Login page (no navbar needed) ───────────────── */}
              <Route path="/login" element={<Login />} />

              {/* ── Public website pages ────────────────────────── */}
              <Route element={<PublicLayout />}>
                <Route path="/"             element={<Home />} />
                <Route path="/about"        element={<About />} />
                <Route path="/faq"          element={<FAQ />} />
                <Route path="/contact"      element={<Contact />} />
                <Route path="/ai-tools"     element={<AITools />} />
                <Route path="/gallery"      element={<Gallery />} />
                <Route path="/conservation" element={<Conservation />} />
              </Route>
            </Routes>
          </ColoniesProvider>
        </GameProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { ColoniesProvider } from './context/ColoniesContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Public pages (with Footer)
import Home         from './pages/Home';
import About        from './pages/About';
import FAQ          from './pages/FAQ';
import Contact      from './pages/Contact';
import AITools      from './pages/AITools';
import Gallery      from './pages/Gallery';
import Conservation from './pages/Conservation';

// Map/tool pages (no Footer — full-screen map layout)
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

export default function App() {
  return (
    <BrowserRouter>
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

          {/* ── Public website pages ────────────────────────── */}
          <Route element={<PublicLayout />}>
            <Route path="/"            element={<Home />} />
            <Route path="/about"       element={<About />} />
            <Route path="/faq"         element={<FAQ />} />
            <Route path="/contact"     element={<Contact />} />
            <Route path="/ai-tools"    element={<AITools />} />
            <Route path="/gallery"     element={<Gallery />} />
            <Route path="/conservation" element={<Conservation />} />
          </Route>
        </Routes>
      </ColoniesProvider>
    </BrowserRouter>
  );
}

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin, Camera, CheckCircle2,
  AlertCircle, ArrowRight, Zap, Lock, ImagePlus, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabaseClient';
import { XP, BADGES } from '../context/GameContext';

const SPECIES_OPTIONS = [
  'Brown Pelican', 'Roseate Spoonbill', 'Great Blue Heron', 'Great Egret',
  'Snowy Egret', 'Tricolored Heron', 'Little Blue Heron', 'White Ibis',
  'Glossy Ibis', 'Roseate Tern', 'Royal Tern', 'Sandwich Tern',
  'Forster\'s Tern', 'Caspian Tern', 'Least Tern', 'Laughing Gull',
  'Ring-billed Gull', 'Herring Gull', 'Double-crested Cormorant',
  'Neotropic Cormorant', 'Wood Stork', 'Anhinga', 'Black Skimmer',
  'American Avocet', 'Willet', 'Other / Unknown',
];

const BEHAVIOR_OPTIONS = [
  'Nesting', 'Feeding', 'Roosting', 'Flying overhead',
  'Courtship display', 'Territorial behavior', 'Juvenile observed', 'Injured bird',
];

const COLONY_OPTIONS = [
  'Breton Island', 'North Breton Island', 'Raccoon Island', 'Queen Bess Island',
  'Cat Island', 'Whiskey Island', 'East Timbalier Island', 'West Timbalier Island',
  'Shell Island', 'Grand Terre Island', 'Bay Champagne', 'Marsh Island',
  'Open coast / Not near colony',
];

function ProgressStep({ num, label, active, done }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
        done  ? 'bg-emerald-500 border-emerald-500 text-white' :
        active ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' :
                 'border-white/15 text-slate-600 bg-transparent'
      }`}>
        {done ? '✓' : num}
      </div>
      <span className={`text-xs font-medium hidden sm:block ${active ? 'text-white' : done ? 'text-emerald-400' : 'text-slate-600'}`}>
        {label}
      </span>
    </div>
  );
}

export default function Submit() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep]           = useState(1);
  const [species, setSpecies]     = useState('');
  const [count, setCount]         = useState('');
  const [colony, setColony]       = useState('');
  const [lat, setLat]             = useState('');
  const [lng, setLng]             = useState('');
  const [behavior, setBehavior]   = useState('');
  const [notes, setNotes]         = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [done, setDone]               = useState(false);
  const [xpEarned, setXpEarned]       = useState(0);
  const [newBadges, setNewBadges]     = useState([]);
  const [photoFile, setPhotoFile]     = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }
  function removePhoto() {
    setPhotoFile(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
  }

  function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        setLat(pos.coords.latitude.toFixed(5));
        setLng(pos.coords.longitude.toFixed(5));
      });
    }
  }

  async function handleSubmit() {
    if (!user) { navigate('/login'); return; }
    setError('');
    setLoading(true);

    try {
      // Upload photo if attached
      let photoUrl = null;
      if (photoFile) {
        const ext  = photoFile.name.split('.').pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from('observation-photos')
          .upload(path, photoFile, { contentType: photoFile.type });
        if (uploadErr) {
          // Surface the error so user knows photo didn't save
          throw new Error(`Photo upload failed: ${uploadErr.message}. Make sure the "observation-photos" storage bucket exists in Supabase and is set to public.`);
        }
        const { data: { publicUrl } } = supabase.storage
          .from('observation-photos')
          .getPublicUrl(path);
        photoUrl = publicUrl;
      }

      const { error: insertErr } = await supabase.from('observations').insert({
        user_id:     user.id,
        colony_name: colony,
        lat:         lat ? parseFloat(lat) : null,
        lng:         lng ? parseFloat(lng) : null,
        species,
        count:       parseInt(count) || 1,
        behavior,
        notes,
        photo_url:   photoUrl,
        verified:    false,
      });
      if (insertErr) throw insertErr;

      // XP is awarded only when admin verifies — just track pending amount to display
      const pendingXP = photoUrl ? XP.SIGHTING_VERIFIED : XP.SIGHTING;
      setXpEarned(pendingXP);
      setDone(true);
    } catch (err) {
      setError(err.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  /* ── Success screen ───────────────────────────────────────── */
  if (done) {
    return (
      <div className="min-h-screen bg-[#020b18] flex items-center justify-center px-4">
        <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-emerald-500/8 blur-[100px] pointer-events-none" />
        <div className="relative max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6 text-4xl">
            🦅
          </div>
          <h2 className="text-3xl font-black text-white mb-2">Sighting Submitted!</h2>
          <p className="text-slate-400 text-sm mb-6">Your observation is pending admin verification.</p>

          {/* Pending XP */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-lg mb-3">
            <Zap className="w-5 h-5" />
            +{xpEarned} XP pending
          </div>
          <p className="text-slate-600 text-xs mb-6">XP will be awarded once an admin verifies your sighting.</p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => { setDone(false); setStep(1); setSpecies(''); setCount(''); setColony(''); setNotes(''); setBehavior(''); removePhoto(); }}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold transition-all"
            >
              <Camera className="w-4 h-4" /> Log Another
            </button>
            <Link
              to="/profile"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold transition-all"
            >
              View Profile <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Auth gate ───────────────────────────────────────────── */
  if (!user) {
    return (
      <div className="min-h-screen bg-[#020b18] flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
            <Lock className="w-7 h-7 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Sign in to contribute</h2>
          <p className="text-slate-400 text-sm mb-6">Create an account to log sightings, earn XP and badges.</p>
          <Link to="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold transition-all">
            Sign In / Join <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  /* ── Main form ───────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#020b18] pt-24 pb-20 px-4">
      <div className="fixed top-1/4 right-1/3 w-[400px] h-[400px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4">
            <Camera className="w-3.5 h-3.5" /> +{XP.SIGHTING} XP per observation
          </div>
          <h1 className="text-3xl font-black text-white">Log a Sighting</h1>
          <p className="text-slate-400 text-sm mt-2">Your data helps protect Louisiana's coastal birds.</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8">
          <ProgressStep num={1} label="Species"  active={step===1} done={step>1} />
          <div className="flex-1 max-w-[40px] h-px bg-white/10" />
          <ProgressStep num={2} label="Location" active={step===2} done={step>2} />
          <div className="flex-1 max-w-[40px] h-px bg-white/10" />
          <ProgressStep num={3} label="Details"  active={step===3} done={step>3} />
        </div>

        {/* Card */}
        <div className="bg-white/3 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-xl">

          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-5">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Step 1: Species */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-white font-bold text-lg mb-1">What did you see?</h2>
                <p className="text-slate-500 text-sm">Select the species you observed.</p>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1.5 font-medium">Species *</label>
                <select
                  value={species}
                  onChange={e => setSpecies(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500/50 transition-all text-sm appearance-none"
                >
                  <option value="" className="bg-[#0a1628]">Choose a species…</option>
                  {SPECIES_OPTIONS.map(s => (
                    <option key={s} value={s} className="bg-[#0a1628]">{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1.5 font-medium">Approximate count *</label>
                <input
                  type="number"
                  value={count}
                  onChange={e => setCount(e.target.value)}
                  placeholder="e.g. 12"
                  min="1"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                />
              </div>

              <button
                onClick={() => { if (species && count) setStep(2); }}
                disabled={!species || !count}
                className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Next: Location <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-white font-bold text-lg mb-1">Where did you see them?</h2>
                <p className="text-slate-500 text-sm">Nearest colony or GPS coordinates.</p>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1.5 font-medium">Nearest Colony</label>
                <select
                  value={colony}
                  onChange={e => setColony(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500/50 transition-all text-sm appearance-none"
                >
                  <option value="" className="bg-[#0a1628]">Select nearest colony…</option>
                  {COLONY_OPTIONS.map(c => (
                    <option key={c} value={c} className="bg-[#0a1628]">{c}</option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/8" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-[#0a1628] text-slate-600 text-xs">OR use GPS</span>
                </div>
              </div>

              <button
                type="button"
                onClick={getLocation}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 hover:border-emerald-500/30 text-slate-300 hover:text-white transition-all text-sm font-medium"
              >
                <MapPin className="w-4 h-4 text-emerald-400" />
                {lat ? `📍 ${lat}, ${lng}` : 'Use My Current Location'}
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white transition-all font-semibold text-sm"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold transition-all flex items-center justify-center gap-2 text-sm"
                >
                  Next: Details <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Details + submit */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-white font-bold text-lg mb-1">Any additional details?</h2>
                <p className="text-slate-500 text-sm">Behavior and notes help experts verify your sighting.</p>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1.5 font-medium">Behavior observed</label>
                <div className="grid grid-cols-2 gap-2">
                  {BEHAVIOR_OPTIONS.map(b => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBehavior(behavior === b ? '' : b)}
                      className={`py-2 px-3 rounded-xl text-xs font-medium text-left transition-all border ${
                        behavior === b
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                          : 'bg-white/3 border-white/8 text-slate-400 hover:bg-white/6 hover:text-white'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo upload */}
              <div>
                <label className="block text-sm text-slate-400 mb-1.5 font-medium">
                  Photo <span className="text-emerald-400 font-semibold">+{XP.SIGHTING_VERIFIED} XP</span>
                  <span className="text-slate-600 font-normal ml-1">(vs +{XP.SIGHTING} without)</span>
                </label>
                {photoPreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-emerald-500/30">
                    <img src={photoPreview} alt="preview" className="w-full h-36 object-cover" />
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-emerald-500/80 text-white text-[10px] font-bold">
                      +{XP.SIGHTING_VERIFIED} XP
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="photo-upload"
                    className="flex flex-col items-center justify-center gap-2 w-full h-24 rounded-xl border-2 border-dashed border-white/10 hover:border-emerald-500/40 bg-white/2 hover:bg-white/4 cursor-pointer transition-all"
                  >
                    <ImagePlus className="w-5 h-5 text-slate-500" />
                    <span className="text-slate-500 text-xs">Attach a photo for bonus XP</span>
                    <input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                  </label>
                )}
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1.5 font-medium">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Any unusual behavior, habitat notes, or other observations…"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all text-sm resize-none"
                />
              </div>

              {/* Summary */}
              <div className="p-4 rounded-2xl bg-white/3 border border-white/8 space-y-2">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Summary</p>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Species</span>
                  <span className="text-white font-medium">{species}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Count</span>
                  <span className="text-white font-medium">{count} bird{count !== '1' ? 's' : ''}</span>
                </div>
                {colony && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Colony</span>
                    <span className="text-white font-medium">{colony}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">XP reward</span>
                  <span className="text-emerald-400 font-bold">
                    +{photoFile ? XP.SIGHTING_VERIFIED : XP.SIGHTING} XP
                    {photoFile && <span className="text-emerald-600 font-normal ml-1 text-xs">(photo bonus!)</span>}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white transition-all font-semibold text-sm"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold transition-all disabled:opacity-60 flex items-center justify-center gap-2 text-sm shadow-lg shadow-emerald-500/25"
                >
                  {loading
                    ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    : <><CheckCircle2 className="w-4 h-4" /> Submit Sighting</>
                  }
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="mt-5 p-4 rounded-2xl bg-white/2 border border-white/6">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Tips for accurate sightings</p>
          <ul className="space-y-1 text-slate-600 text-xs">
            <li>• Use binoculars and note distinctive field marks</li>
            <li>• Count birds in groups of 10 for large flocks</li>
            <li>• Note time of day and weather conditions in notes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { MapPin, UploadCloud } from 'lucide-react';
import { uploadPhoto, createObservation } from '../utils/citizenStorage';

export default function CitizenUpload() {
  const [files, setFiles] = useState([]);
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [datetime, setDatetime] = useState(new Date().toISOString().slice(0,16));
  const [species, setSpecies] = useState('');
  const [count, setCount] = useState(1);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const pickFiles = (e) => {
    setFiles(Array.from(e.target.files || []));
  }

  const useGeolocation = () => {
    if (!navigator.geolocation) {
      setMessage('Geolocation not supported');
      return;
    }
    navigator.geolocation.getCurrentPosition((pos) => {
      setLat(pos.coords.latitude.toFixed(6));
      setLng(pos.coords.longitude.toFixed(6));
    }, (err) => {
      setMessage('Location access denied');
    });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('saving');
    setMessage('Uploading photos...');
    try {
      const uploaded = [];
      for (const f of files) {
        const res = await uploadPhoto(f);
        uploaded.push(res);
      }
      setMessage('Saving observation...');
      const record = {
        photos: uploaded.map(u => u.publicURL || u.path),
        lat: parseFloat(lat) || null,
        lng: parseFloat(lng) || null,
        datetime: datetime ? new Date(datetime).toISOString() : new Date().toISOString(),
        species_guess: species || null,
        count: parseInt(count) || 0,
        status: 'pending'
      };
      const created = await createObservation(record);
      setStatus('done');
      setMessage('Observation saved locally to Supabase. ID: ' + created.id);
      // reset
      setFiles([]);
      setSpecies('');
      setCount(1);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setMessage(err.message || 'Failed to save observation');
    }
  }

  return (
    <div className="p-3">
      <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-400"/> Citizen Scientist Upload</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-xs text-gray-300">Photos</label>
          <div className="mt-1">
            <input type="file" multiple accept="image/*" onChange={pickFiles} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-300">Latitude</label>
            <input value={lat} onChange={e => setLat(e.target.value)} className="w-full mt-1 p-2 bg-gray-900 rounded" />
          </div>
          <div>
            <label className="text-xs text-gray-300">Longitude</label>
            <input value={lng} onChange={e => setLng(e.target.value)} className="w-full mt-1 p-2 bg-gray-900 rounded" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={useGeolocation} className="glass-button px-3 py-2">Use current location</button>
          <div className="text-xs text-gray-400">or enter coordinates manually</div>
        </div>
        <div>
          <label className="text-xs text-gray-300">When</label>
          <input type="datetime-local" value={datetime} onChange={e => setDatetime(e.target.value)} className="w-full mt-1 p-2 bg-gray-900 rounded" />
        </div>
        <div>
          <label className="text-xs text-gray-300">Species (guess)</label>
          <input value={species} onChange={e => setSpecies(e.target.value)} className="w-full mt-1 p-2 bg-gray-900 rounded" />
        </div>
        <div>
          <label className="text-xs text-gray-300">Count</label>
          <input type="number" min="0" value={count} onChange={e => setCount(e.target.value)} className="w-full mt-1 p-2 bg-gray-900 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <button type="submit" className="bg-emerald-500 text-black px-4 py-2 rounded font-semibold">Submit</button>
          <div className="text-sm text-gray-400">{status === 'saving' ? 'Saving…' : status === 'done' ? 'Saved' : ''}</div>
        </div>
        {message && <div className="text-xs text-gray-300 pt-1">{message}</div>}
      </form>
    </div>
  );
}

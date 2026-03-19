import { createContext, useContext, useState, useEffect } from 'react';

const ColoniesContext = createContext(null);

export function ColoniesProvider({ children }) {
  const [coloniesData, setColoniesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import('../data/la_colonies_summary.json')
      .then(m => { setColoniesData(m.default); setLoading(false); })
      .catch(() => {
        fetch('/data/la_colonies_summary.json')
          .then(r => r.json())
          .then(d => { setColoniesData(d); setLoading(false); })
          .catch(() => setLoading(false));
      });
  }, []);

  return (
    <ColoniesContext.Provider value={{ coloniesData, loading }}>
      {children}
    </ColoniesContext.Provider>
  );
}

export const useColonies = () => useContext(ColoniesContext);

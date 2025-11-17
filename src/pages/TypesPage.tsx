import React, { useEffect, useState } from "react";
import { listPrefixes } from "../services/gcsService";
import TypeCard from "../components/TypeCard";

const TypesPage: React.FC = () => {
  const [types, setTypes] = useState<string[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    listPrefixes("")
      .then(async (r) => {
        setTypes(r);
        // fetch counts for each type
        const promises = r.map(async (t) => {
          try {
            const items = await listPrefixes(`${t}/`);
            return [t, items.length] as const;
          } catch {
            return [t, 0] as const;
          }
        });
        const results = await Promise.all(promises);
        const map: Record<string, number> = {};
        for (const [t, c] of results) map[t] = c;
        setCounts(map);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2>Types</h2>
      {loading && <div>Loading types…</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}

      <div className="grid">
        {types.map((t) => (
          <TypeCard key={t} name={t} count={counts[t]} />
        ))}
      </div>

      {!loading && types.length === 0 && <div>No types found.</div>}
    </div>
  );
};

export default TypesPage;

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { listPrefixes, listObjects, publicUrlFor, fetchJsonForPrefix } from "../services/gcsService";
import ItemCard from "../components/ItemCard";

const ItemsPage: React.FC = () => {
  const { typeName } = useParams<{ typeName: string }>();
  const [items, setItems] = useState<string[]>([]);
  const [metas, setMetas] = useState<Record<string, any>>({});
  const [thumbs, setThumbs] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!typeName) return;
    const type = decodeURIComponent(typeName);
    setLoading(true);
    listPrefixes(`${type}/`)
      .then(async (r) => {
        setItems(r);
        // for each item, try to find a thumbnail and metadata
        const thumbMap: Record<string, string | null> = {};
        const metaMap: Record<string, any> = {};
        await Promise.all(
          r.map(async (it) => {
            try {
              const objects = await listObjects(`${type}/${it}/`);
              const img = objects.find((o) => /\.(png|jpe?g|webp|gif|svg)$/i.test(o.name));
              // objects from listObjects already include the full path (e.g. "fruits/apple/apple.svg")
              // so pass img.name directly to publicUrlFor to avoid duplicating the path.
              thumbMap[it] = img ? publicUrlFor(img.name) : null;
              const json = await fetchJsonForPrefix(`${type}/${it}/`);
              metaMap[it] = json ?? null;
            } catch (e) {
              thumbMap[it] = null;
              metaMap[it] = null;
            }
          })
        );
        setThumbs(thumbMap);
        setMetas(metaMap);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [typeName]);

  return (
    <div>
      <h2>Items in {typeName}</h2>
      {loading && <div>Loading items…</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}

      <div className="grid">
        {items.map((it) => (
          <ItemCard key={it} typeName={decodeURIComponent(typeName || "")} itemName={it} imageUrl={thumbs[it] ?? null} meta={metas[it]} />
        ))}
      </div>

      {!loading && items.length === 0 && <div>No items found for this type.</div>}
    </div>
  );
};

export default ItemsPage;

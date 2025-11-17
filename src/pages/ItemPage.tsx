import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { listObjects, fetchJsonForPrefix, publicUrlFor } from "../services/gcsService";

const ItemPage: React.FC = () => {
  const { typeName, itemName } = useParams<{ typeName: string; itemName: string }>();
  const [meta, setMeta] = useState<any | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!typeName || !itemName) return;
    const type = decodeURIComponent(typeName);
    const item = decodeURIComponent(itemName);
    const prefix = `${type}/${item}/`;
    setLoading(true);
    Promise.all([listObjects(prefix), fetchJsonForPrefix(prefix)])
      .then(([objects, json]) => {
        setMeta(json ?? null);
  const img = objects.find((o) => /\.(png|jpe?g|webp|gif|svg)$/i.test(o.name));
        if (img) setImageUrl(publicUrlFor(img.name));
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [typeName, itemName]);

  return (
    <div>
      <h2>
        {itemName} in {typeName}
      </h2>
      {loading && <div>Loading item…</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
      {imageUrl && <img src={imageUrl} alt={itemName} style={{ maxWidth: 400 }} />}
      <pre style={{ whiteSpace: "pre-wrap", marginTop: 12 }}>{meta ? JSON.stringify(meta, null, 2) : "No JSON metadata found."}</pre>
    </div>
  );
};

export default ItemPage;

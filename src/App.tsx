import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { TypesPage, ItemsPage, ItemPage } from "./pages";

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
        <header style={{ marginBottom: 16 }}>
          <h1>
            <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>
              Drive Gallery
            </Link>
          </h1>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<TypesPage />} />
            <Route path="/type/:typeName" element={<ItemsPage />} />
            <Route path="/type/:typeName/item/:itemName" element={<ItemPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

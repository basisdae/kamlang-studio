"use client";

import { useState } from "react";

export default function TouchTestPage() {
  const [count, setCount] = useState(0);

  return (
    <main style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1>Touch Test</h1>

      <div
        onClick={() => setCount((v) => v + 1)}
        onTouchStart={() => setCount((v) => v + 1)}
        style={{
          height: 120,
          borderRadius: 24,
          background: "#c46a2d",
          color: "white",
          display: "grid",
          placeItems: "center",
          fontSize: 28,
          fontWeight: 800,
          userSelect: "none",
        }}
      >
        กดฉัน
      </div>

      <h2>Count: {count}</h2>
    </main>
  );
}
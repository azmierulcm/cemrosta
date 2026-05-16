'use client';

import React from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Line,
  Marker
} from 'react-simple-maps';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface Route {
  from: [number, number]; // [lon, lat]
  to: [number, number];
}

export const PublicMissionMap = () => {
  const routes: Route[] = [
    { from: [101.7099, 2.7456], to: [-0.4543, 51.4700] }, // KUL to LHR
    { from: [101.7099, 2.7456], to: [113.2988, 23.3924] }, // KUL to CAN
    { from: [101.7099, 2.7456], to: [140.3929, 35.7720] }, // KUL to NRT
  ];

  const markers = [
    { name: "KUL", coordinates: [101.7099, 2.7456] },
    { name: "LHR", coordinates: [-0.4543, 51.4700] },
    { name: "CAN", coordinates: [113.2988, 23.3924] },
    { name: "NRT", coordinates: [140.3929, 35.7720] },
  ];

  return (
    <div className="w-full h-[500px] bg-surface-2 rounded-[2.5rem] overflow-hidden border border-border relative group shadow-inner">
      <ComposableMap
        projectionConfig={{
          rotate: [-120, 0, 0],
          scale: 140
        }}
        style={{ width: "100%", height: "100%" }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#FFFFFF"
                stroke="#E2E8F0"
                strokeWidth={0.5}
                style={{
                  default: { outline: "none" },
                  hover: { outline: "none", fill: "#F7F9FC" },
                  pressed: { outline: "none" },
                }}
              />
            ))
          }
        </Geographies>
        
        {routes.map((route, i) => (
          <Line
            key={i}
            from={route.from}
            to={route.to}
            stroke="var(--accent)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray="4 4"
            opacity={0.6}
          />
        ))}

        {markers.map(({ name, coordinates }) => (
          <Marker key={name} coordinates={coordinates as [number, number]}>
            <circle r={4} fill="var(--accent)" stroke="#FFF" strokeWidth={2} />
            <text
              textAnchor="middle"
              y={-12}
              style={{ fontFamily: "var(--font-geist-mono)", fontSize: "10px", fontWeight: "900", fill: "var(--text)" }}
            >
              {name}
            </text>
          </Marker>
        ))}
      </ComposableMap>

      <div className="absolute top-8 left-8 bg-white/95 backdrop-blur-md px-6 py-3 rounded-full border border-border shadow-xl z-10">
        <p className="text-[10px] font-black text-text tracking-[0.3em] uppercase font-mono">
          {"// MISSION FLIGHT PATHS"}
        </p>
      </div>
    </div>
  );
};

import React from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function OrderMap({ route, warehouse, customer }) {
  if (!warehouse || !customer) return null;
  const center = [
    (warehouse.lat + customer.lat) / 2,
    (warehouse.lon + customer.lon) / 2
  ];
  const positions = [
    [warehouse.lat, warehouse.lon],
    [customer.lat, customer.lon]
  ];
  return (
    <div className="h-80 w-full rounded overflow-hidden">
      <MapContainer center={center} zoom={12} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[warehouse.lat, warehouse.lon]} />
        <Marker position={[customer.lat, customer.lon]} />
        <Polyline positions={positions} color="blue" />
      </MapContainer>
    </div>
  );
} 
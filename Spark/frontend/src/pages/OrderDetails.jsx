import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../index.css';

export default function OrderDetails() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`http://127.0.0.1:5000/orders/${orderId}`);
        setOrder(res.data.orders[0]);
        if (res.data.orders[0]?.assigned_wh) {
          const routeRes = await axios.post('http://127.0.0.1:5000/route', {
            order_ids: [orderId]
          });
          setRouteInfo(routeRes.data.routes[0]);
        }
      } catch (err) {
        setError('Error fetching order');
      }
      setLoading(false);
    };
    fetchOrder();
  }, [orderId]);

  if (loading) return <div className="page-root">Loading...</div>;
  if (error) return <div className="page-root" style={{ color: '#e53935' }}>{error}</div>;
  if (!order) return <div className="page-root">Order not found.</div>;

  const mapCenter = routeInfo && routeInfo.warehouse_coords
    ? [routeInfo.warehouse_coords.lat, routeInfo.warehouse_coords.lon]
    : [22.9734, 78.6569];

  const warehouseMarker = routeInfo && routeInfo.warehouse_coords ? (
    <Marker position={[routeInfo.warehouse_coords.lat, routeInfo.warehouse_coords.lon]}>
      <Popup>
        <b>Warehouse {routeInfo.assigned_wh}</b><br />
        Lat: {routeInfo.warehouse_coords.lat}<br />
        Lon: {routeInfo.warehouse_coords.lon}
      </Popup>
    </Marker>
  ) : null;

  const customerMarker = order ? (
    <Marker position={[order.lat, order.lon]}>
      <Popup>
        <b>Customer Location</b><br />
        Lat: {order.lat}<br />
        Lon: {order.lon}
      </Popup>
    </Marker>
  ) : null;

  const routeLine = routeInfo && routeInfo.route ? (
    <Polyline positions={routeInfo.route.map(p => [p.lat, p.lon])} color="#22c55e" weight={4} />
  ) : null;

  return (
    <div className="page-root">
      <h2 className="page-title">Order Details</h2>
      <div className="card">
        <div style={{ marginBottom: '18px' }}>
          <div><b>Order ID:</b> <span style={{ fontFamily: 'monospace' }}>{order._id}</span></div>
          <div><b>Items:</b> {order.items.map(i => `${i.item} (${i.qty})`).join(', ')}</div>
          <div><b>Status:</b> {order.status}</div>
          <div><b>Warehouse:</b> {order.assigned_wh || '-'}</div>
          <div><b>ETA:</b> {order.eta || '-'}</div>
          <div><b>Dispatch Time:</b> {order.dispatch_time || '-'}</div>
          <div><b>Location:</b> {order.lat}, {order.lon}</div>
        </div>
        {routeInfo && routeInfo.route && (
          <div className="map-container">
            <MapContainer center={mapCenter} zoom={5} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {warehouseMarker}
              {customerMarker}
              {routeLine}
            </MapContainer>
          </div>
        )}
      </div>
    </div>
  );
} 
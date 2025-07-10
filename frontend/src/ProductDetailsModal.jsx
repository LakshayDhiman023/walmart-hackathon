import React, { useState } from 'react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

const ProductDetailsModal = ({ product, onClose, onOrder }) => {
  if (!product) return null;
  const last10 = [...product.sales_history].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
  const runOut = product.stock_run_out !== undefined ? product.stock_run_out : 'N/A';
  const percent = product.consensus_percent;
  const trend = product.consensus_trend;
  const [placingOrder, setPlacingOrder] = useState(false);

  const handleOrder = async () => {
    setPlacingOrder(true);
    await onOrder(product._id);
    setPlacingOrder(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8 relative animate-fadeIn">
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl" onClick={onClose}>&times;</button>
        <h2 className="text-2xl font-bold mb-2 text-center">{product.product_name}</h2>
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          <div className="flex-1">
            <div className="mb-2 text-gray-700 font-medium">Sales History (all time)</div>
            <div className="w-full h-48 bg-gray-50 rounded">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={product.sales_history} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <XAxis dataKey="date" hide />
                  <YAxis hide />
                  <Tooltip formatter={(v) => [v, 'Units Sold']} labelFormatter={() => ''} />
                  <Line type="monotone" dataKey="units_sold" stroke={trend === 'increasing' ? '#22c55e' : trend === 'decreasing' ? '#ef4444' : '#64748b'} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-2 justify-center">
            <div><span className="font-semibold">Current Stock:</span> {product.current_stock}</div>
            <div><span className="font-semibold">Stock runs out in:</span> {runOut !== 'N/A' && runOut !== 'Unknown' ? `${runOut} days` : runOut}</div>
            <div><span className="font-semibold">Demand %:</span> <span className={percent > 0 ? 'text-green-600' : percent < 0 ? 'text-red-600' : 'text-gray-600'}>{percent > 0 ? '+' : ''}{percent.toFixed(1)}%</span></div>
            <div><span className="font-semibold">Trend:</span> <span className={trend === 'increasing' ? 'text-green-600' : trend === 'decreasing' ? 'text-red-600' : 'text-gray-600'}>{trend.charAt(0).toUpperCase() + trend.slice(1)}</span></div>
            <div><span className="font-semibold">Category:</span> {product.product_category}</div>
            <div><span className="font-semibold">Region:</span> {product.region}</div>
            <button onClick={handleOrder} disabled={placingOrder} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50">
              {placingOrder ? 'Placing Order...' : 'Place Order (+10 Stock)'}
            </button>
          </div>
        </div>
        <div>
          <div className="font-semibold mb-2">Last 10 Orders</div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border rounded">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-2 py-1 text-left">Date</th>
                  <th className="px-2 py-1 text-left">Units Sold</th>
                  <th className="px-2 py-1 text-left">Day</th>
                </tr>
              </thead>
              <tbody>
                {last10.map((order, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="px-2 py-1">{new Date(order.date).toLocaleDateString()}</td>
                    <td className="px-2 py-1">{order.units_sold}</td>
                    <td className="px-2 py-1">{order.day_of_week}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal; 
import React, { useState } from 'react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import './ProductDetailsModal.css';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 transition-opacity duration-300">
      <div className="modal-animate bg-white rounded-3xl shadow-lg w-full max-w-2xl pt-20 pb-12 px-8 relative border border-[#E5E7EB] flex flex-col gap-8 max-h-[90vh] overflow-y-auto">
        <button className="absolute top-6 right-6 text-[#4B5563] hover:text-[#0071CE] text-3xl font-bold transition" onClick={onClose} aria-label="Close">&times;</button>
        <h2 className="text-3xl font-bold mb-6 text-center text-[#0071CE]">{product.product_name}</h2>
        <div className="flex flex-col md:flex-row gap-10 mb-8">
          <div className="flex-1">
            <div className="mb-3 text-[#1F2937] font-semibold text-lg">Sales History (all time)</div>
            <div className="w-full h-56 bg-[#F9FAFB] rounded-xl p-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={product.sales_history} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <XAxis dataKey="date" hide />
                  <YAxis hide />
                  <Tooltip formatter={(v) => [v, 'Units Sold']} labelFormatter={() => ''} contentStyle={{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB' }} />
                  <Line type="monotone" dataKey="units_sold" stroke={trend === 'increasing' ? '#28A745' : trend === 'decreasing' ? '#DC3545' : '#0071CE'} strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-4 justify-center">
            <div className="flex items-center gap-2"><span className="font-semibold text-[#1F2937]">Current Stock:</span> <span className="text-[#1F2937] font-bold">{product.current_stock}</span></div>
            <div className="flex items-center gap-2"><span className="font-semibold text-[#1F2937]">Stock runs out in:</span> <span className="text-[#1F2937] font-bold">{runOut !== 'N/A' && runOut !== 'Unknown' ? `${runOut} days` : runOut}</span></div>
            <div className="flex items-center gap-2"><span className="font-semibold text-[#1F2937]">Demand %:</span> <span className={percent > 0 ? 'text-[#28A745]' : percent < 0 ? 'text-[#DC3545]' : 'text-[#0071CE]'}>{percent > 0 ? '+' : ''}{percent.toFixed(1)}%</span></div>
            <div className="flex items-center gap-2"><span className="font-semibold text-[#1F2937]">Trend:</span> {trend === 'increasing' ? <span className="inline-block bg-[#E6F4EA] text-[#28A745] px-3 py-1 rounded-full font-semibold text-xs border border-[#28A745]/20 ml-1">Increasing</span> : trend === 'decreasing' ? <span className="inline-block bg-[#FDE8E8] text-[#DC3545] px-3 py-1 rounded-full font-semibold text-xs border border-[#DC3545]/20 ml-1">Decreasing</span> : <span className="inline-block bg-[#F0F0F0] text-[#6C757D] px-3 py-1 rounded-full font-semibold text-xs border border-[#E5E7EB] ml-1">Stable</span>}</div>
            <div className="flex items-center gap-2"><span className="font-semibold text-[#1F2937]">Category:</span> <span className="text-[#4B5563]">{product.product_category}</span></div>
            <div className="flex items-center gap-2"><span className="font-semibold text-[#1F2937]">Region:</span> <span className="text-[#4B5563]">{product.region}</span></div>
            <button onClick={handleOrder} disabled={placingOrder} className="mt-4 bg-[#0071CE] text-white px-6 py-2 rounded-xl font-bold text-lg hover:bg-[#FFC220] hover:text-[#1F2937] transition disabled:opacity-50 border border-[#0071CE]/30 shadow-sm">
              {placingOrder ? 'Placing Order...' : 'Place Order (+10 Stock)'}
            </button>
          </div>
        </div>
        <div className="border-t border-[#E5E7EB] pt-6">
          <div className="font-semibold mb-2 text-[#1F2937] text-lg">Last 10 Orders</div>
          <div className="overflow-x-auto max-h-64">
            <table className="min-w-full text-base border rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-[#F9FAFB]">
                  <th className="px-3 py-2 text-left font-semibold text-[#1F2937]">Date</th>
                  <th className="px-3 py-2 text-left font-semibold text-[#1F2937]">Units Sold</th>
                  <th className="px-3 py-2 text-left font-semibold text-[#1F2937]">Day</th>
                </tr>
              </thead>
              <tbody>
                {last10.map((order, idx) => (
                  <tr key={idx} className="border-t border-[#E5E7EB]">
                    <td className="px-3 py-2 text-[#1F2937]">{new Date(order.date).toLocaleDateString()}</td>
                    <td className="px-3 py-2 text-[#1F2937]">{order.units_sold}</td>
                    <td className="px-3 py-2 text-[#1F2937]">{order.day_of_week}</td>
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
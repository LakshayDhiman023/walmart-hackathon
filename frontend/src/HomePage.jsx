import React, { useEffect, useState } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import ProductDetailsModal from './ProductDetailsModal';

function calculateEMA(data, alpha = 0.3) {
  if (!data || data.length === 0) return 0;
  let ema = data[0].units_sold;
  for (let i = 1; i < data.length; i++) {
    ema = alpha * data[i].units_sold + (1 - alpha) * ema;
  }
  return ema;
}

function getDemandTrend(sales_history) {
  if (!sales_history || sales_history.length < 2) return 'Unknown';
  const sorted = [...sales_history].sort((a, b) => new Date(a.date) - new Date(b.date));
  const n = sorted.length;
  const half = Math.floor(n / 2);
  const firstHalf = sorted.slice(0, half);
  const lastHalf = sorted.slice(half);
  const emaFirst = calculateEMA(firstHalf);
  const emaLast = calculateEMA(lastHalf);
  if (emaLast > emaFirst * 1.05) return 'increasing'; // 5% threshold
  if (emaLast < emaFirst * 0.95) return 'decreasing';
  return 'stable';
}

function getStockRunOut(sales_history) {
  // Placeholder: estimate days left as average of last 7 days sales (simulate 100 units left)
  if (!sales_history || sales_history.length === 0) return 'Unknown';
  const n = sales_history.length;
  const last7 = sales_history.slice(-Math.min(7, n));
  const avg = last7.reduce((sum, s) => sum + s.units_sold, 0) / last7.length;
  if (avg === 0) return 'N/A';
  const stockLeft = 100; // Placeholder
  return Math.round(stockLeft / avg);
}

const DemandBadge = ({ trend }) => {
  if (trend === 'increasing') return <span className="inline-block bg-[#E6F4EA] text-[#28A745] px-3 py-1 rounded-full font-semibold text-xs border border-[#28A745]/20">Increasing</span>;
  if (trend === 'decreasing') return <span className="inline-block bg-[#FDE8E8] text-[#DC3545] px-3 py-1 rounded-full font-semibold text-xs border border-[#DC3545]/20">Decreasing</span>;
  return <span className="inline-block bg-[#F0F0F0] text-[#6C757D] px-3 py-1 rounded-full font-semibold text-xs border border-[#E5E7EB]">Stable</span>;
};

const PercentChange = ({ percent, trend }) => {
  const color = trend === 'increasing' ? 'text-[#28A745]' : trend === 'decreasing' ? 'text-[#DC3545]' : 'text-[#0071CE]';
  const sign = percent > 0 ? '+' : '';
  return (
    <div className={`text-base font-bold mt-1 ${color}`}>{sign}{percent.toFixed(1)}%</div>
  );
};

const ProductCard = ({ product }) => {
  const trend = product.consensus_trend;
  const percent = product.consensus_percent;
  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-[#E5E7EB] p-7 flex flex-col items-center group cursor-pointer min-h-[260px] focus-within:ring-2 focus-within:ring-[#0071CE]/30">
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-block w-7 h-7 rounded-full bg-[#0071CE]/10 flex items-center justify-center">
          {/* Icon: box */}
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-[#0071CE]"><rect x="3" y="7" width="18" height="13" rx="2" strokeWidth="2" /><path d="M16 3v4M8 3v4" strokeWidth="2" /></svg>
        </span>
        <div className="text-xl font-bold text-[#1F2937] text-center flex-1">{product.product_name}</div>
      </div>
      <div className="w-full h-20 mb-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={product.sales_history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <Line type="monotone" dataKey="units_sold" stroke={trend === 'increasing' ? '#28A745' : trend === 'decreasing' ? '#DC3545' : '#0071CE'} strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <DemandBadge trend={trend} />
      <PercentChange percent={percent} trend={trend} />
      <div className="text-[#4B5563] text-base mt-1 font-medium">Stock runs out {product.stock_run_out !== 'N/A' && product.stock_run_out !== 'Unknown' ? `in ${product.stock_run_out || 'N/A'} days` : product.stock_run_out}</div>
    </div>
  );
};

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetch('/api/products')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch products');
        return res.json();
      })
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'An error occurred');
        setLoading(false);
      });
  }, []);

  const handleCardClick = (product) => {
    setSelectedProduct(product);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  const handleOrder = async (productId) => {
    await fetch(`/api/products/${productId}/increment-stock`, { method: 'POST' });
    // Refresh product list and modal data
    const res = await fetch('/api/products');
    const data = await res.json();
    setProducts(data);
    const updated = data.find(p => p._id === productId);
    setSelectedProduct(updated);
  };

  if (loading) return <div className="flex justify-center items-center h-screen bg-[#F9FAFB] text-[#1F2937]">Loading...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-[#DC3545] font-semibold bg-[#F9FAFB]">{error}</div>;

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6 text-[#1F2937]">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product, idx) => (
          <div key={product._id || idx} onClick={() => handleCardClick(product)} className="cursor-pointer">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={handleCloseModal}
          onOrder={handleOrder}
        />
      )}
    </div>
  );
};

export default HomePage; 
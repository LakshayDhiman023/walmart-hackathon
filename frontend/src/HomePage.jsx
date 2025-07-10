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
  if (trend === 'increasing') return <span className="bg-green-100 text-green-700 px-3 py-1 rounded font-medium">Demand Increasing</span>;
  if (trend === 'decreasing') return <span className="bg-red-100 text-red-700 px-3 py-1 rounded font-medium">Demand Decreasing</span>;
  return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded font-medium">Stable</span>;
};

const PercentChange = ({ percent, trend }) => {
  const color = trend === 'increasing' ? 'text-green-600' : trend === 'decreasing' ? 'text-red-600' : 'text-gray-600';
  const sign = percent > 0 ? '+' : '';
  return (
    <div className={`text-sm font-semibold mt-1 ${color}`}>{sign}{percent.toFixed(1)}%</div>
  );
};

const ProductCard = ({ product }) => {
  const trend = product.consensus_trend;
  const percent = product.consensus_percent;
  return (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center border">
      <div className="text-lg font-semibold mb-2 text-center">{product.product_name}</div>
      <div className="w-full h-16 mb-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={product.sales_history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <Line type="monotone" dataKey="units_sold" stroke={trend === 'increasing' ? '#22c55e' : trend === 'decreasing' ? '#ef4444' : '#64748b'} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <DemandBadge trend={trend} />
      <PercentChange percent={percent} trend={trend} />
      <div className="text-gray-500 text-sm mt-1">Stock runs out {product.stock_run_out !== 'N/A' && product.stock_run_out !== 'Unknown' ? `in ${product.stock_run_out || 'N/A'} days` : product.stock_run_out}</div>
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

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-600 font-semibold">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
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
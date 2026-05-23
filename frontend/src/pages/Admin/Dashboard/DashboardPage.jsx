import React, { useEffect, useState } from 'react'
import { getAdminMetrics, getTripsOverTime, getVisitsByCategory, getTopAttractions, getExperienceUsage } from '../../../api/admin.api.js';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, ArcElement, Tooltip, Legend);
import { Link } from 'react-router-dom';

const formatNumber = (num) => {
  if (num === undefined || num === null) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
};

const StatCard = ({ title, value, to, icon, trend }) => (
  <Link
    to={to || '#'}
    className={`block bg-white rounded-2xl border border-gray-100 shadow-sm p-6 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${!to ? 'cursor-default' : ''}`}
  >
    <div className="flex items-center justify-between">
      <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</div>
      {icon && <div className="text-2xl text-indigo-400">{icon}</div>}
    </div>
    <div className="mt-3 flex items-baseline justify-between">
      <div className="text-3xl font-bold text-gray-900">{formatNumber(value)}</div>
      {trend && (
        <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
      )}
    </div>
  </Link>
);

const RecentList = ({ title, items, mapFn, icon }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-full">
    <div className="flex items-center gap-2 mb-4">
      <span className="text-xl">{icon || '📋'}</span>
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    </div>
    <ul className="divide-y divide-gray-100">
      {items.length === 0 && <li className="py-3 text-gray-400 text-sm">No items</li>}
      {items.slice(0, 5).map((it, i) => (
        <li key={i} className="py-3 flex justify-between items-center">
          <div className="text-sm text-gray-700 truncate">{mapFn(it)}</div>
          <div className="text-xs text-gray-400 whitespace-nowrap ml-2">
            {new Date(it.created_at).toLocaleDateString()}
          </div>
        </li>
      ))}
    </ul>
  </div>
);

const DashboardPage = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tripsData, setTripsData] = useState(null);
  const [visitsByCategory, setVisitsByCategory] = useState([]);
  const [topAttractions, setTopAttractions] = useState([]);
  const [experienceUsage, setExperienceUsage] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getAdminMetrics();
        setMetrics(res.data.data || res.data);
        const [tres, vbcr, tar, eur] = await Promise.all([
          getTripsOverTime('daily'),
          getVisitsByCategory(),
          getTopAttractions(5),
          getExperienceUsage()
        ]);
        setTripsData(tres.data.data || tres.data);
        setVisitsByCategory(vbcr.data.data || vbcr.data);
        setTopAttractions(tar.data.data || tar.data);
        setExperienceUsage(eur.data.data || eur.data);
      } catch (err) {
        console.error(err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading dashboard...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-md text-center">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Failed to load dashboard</h2>
        <p className="text-gray-600 mb-4">{error?.message || 'Server error'}</p>
        <button onClick={() => window.location.reload()} className="px-5 py-2 bg-indigo-700 text-white rounded-xl hover:bg-indigo-800 transition">
          Retry
        </button>
      </div>
    </div>
  );

  if (!metrics) return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-md p-8 text-center">
        <p className="text-gray-600">No dashboard data available.</p>
      </div>
    </div>
  );

  const chartData = {
    labels: tripsData ? tripsData.map(d => d.period) : [],
    datasets: [
      {
        label: 'Trips',
        data: tripsData ? tripsData.map(d => d.count) : [],
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.05)',
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: '#4f46e5',
        pointBorderColor: '#fff',
        pointHoverRadius: 5,
        tension: 0.3,
        fill: true,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { boxWidth: 12, font: { size: 12 } } },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      y: { beginAtZero: true, grid: { color: '#e5e7eb' }, title: { display: true, text: 'Number of Trips' } },
      x: { grid: { display: false }, ticks: { maxRotation: 45, minRotation: 30 } }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="px-4 md:px-8 lg:px-10 py-8 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back, Admin — here's what's happening.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/admin/attractions/create" className="px-5 py-2.5 bg-indigo-700 text-white rounded-xl shadow-sm hover:bg-indigo-800 transition flex items-center gap-2">
              <span>+</span> Add Attraction
            </Link>
          </div>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Attractions" value={metrics.total_attractions} to="/admin/attractions" icon="🏛️" />
          <StatCard title="Total Experiences" value={metrics.total_experiences} to="/admin/attractions" icon="🎢" />
          <StatCard title="Categories" value={metrics.total_categories} to="/admin/categories" icon="📁" />
          <StatCard title="Total Trips" value={metrics.total_trips} icon="✈️" />
        </div>

        {/* Row: Chart + Top Attractions (System Health removed) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <span>📈</span> Trips Over Time
                </h3>
                <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">Daily</div>
              </div>
              <div className="h-80 w-full">
                {tripsData && tripsData.length > 0 ? (
                  <Line data={chartData} options={chartOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">No trip data available</div>
                )}
              </div>
            </div>
          </div>

          <div>
            {/* Top Attractions only */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🏆</span>
                <h3 className="text-lg font-semibold text-gray-800">Top Attractions</h3>
              </div>
              {topAttractions.length === 0 ? (
                <p className="text-gray-400 text-sm">No data</p>
              ) : (
                <ul className="space-y-3">
                  {topAttractions.map((item, idx) => (
                    <li key={idx} className="flex justify-between items-center border-b border-gray-100 pb-2 last:border-0">
                      <span className="text-sm font-medium text-gray-700 truncate">{item.name || item.attraction_name}</span>
                      <span className="text-sm text-indigo-600 font-semibold">{item.visits || item.count} visits</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Second Row: Experience Usage + Latest Attractions + Latest Experiences */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">⭐</span>
              <h3 className="text-lg font-semibold text-gray-800">Top Experiences Used</h3>
            </div>
            {experienceUsage.length === 0 ? (
              <p className="text-gray-400 text-sm">No data</p>
            ) : (
              <ul className="space-y-3">
                {experienceUsage.slice(0, 5).map((exp, idx) => (
                  <li key={idx} className="flex justify-between items-center border-b border-gray-100 pb-2 last:border-0">
                    <span className="text-sm text-gray-700 truncate">{exp.type || exp.name}s</span>
                    <span className="text-sm text-indigo-600 font-semibold">{exp.usage_count || exp.count} uses</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <RecentList 
            title="Latest Attractions" 
            items={metrics.recent_attractions || []} 
            mapFn={a => `${a.name} — ${a.category || 'Uncategorized'}`}
            icon="🏛️"
          />
          <RecentList 
            title="Latest Experiences" 
            items={metrics.recent_experiences || []} 
            mapFn={e => `${e.type} — ${e.attraction || '-'}`}
            icon="🎢"
          />
        </div>

        {/* Quick Actions (full width, since Background Jobs removed) */}
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">⚡</span>
              <h3 className="text-lg font-semibold text-gray-800">Quick Actions</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/admin/attractions/create" className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-medium hover:bg-indigo-100 transition">+ Add Attraction</Link>
              <Link to="/admin/categories/create" className="px-4 py-2 bg-gray-50 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-100 transition">+ Add Category</Link>
              <Link to="/admin/attractions" className="px-4 py-2 bg-gray-50 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-100 transition">Manage Experiences</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
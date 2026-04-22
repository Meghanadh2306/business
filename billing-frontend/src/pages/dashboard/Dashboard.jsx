import { useState, useEffect } from "react";
import API from "../../services/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalBills: 0,
    totalCustomers: 0
  });

  // Mocking simple stats for now - can fetch from real API later
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [billsRes, customersRes] = await Promise.all([
          API.get("/bills").catch(() => ({ data: [] })),
          API.get("/customers").catch(() => ({ data: [] }))
        ]);
        
        const bills = billsRes.data || [];
        const totalSales = bills.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        
        setStats({
          totalSales,
          totalBills: bills.length,
          totalCustomers: customersRes.data?.length || 0
        });
      } catch (err) {
        console.error("Failed to load stats", err);
      }
    };
    fetchStats();
  }, []);

  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Dairy Sales (₹)',
        data: [1200, 1900, 1500, 2200, 1800, 2800, 3100],
        borderColor: '#0284c7',
        backgroundColor: 'rgba(2, 132, 199, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: false },
    },
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Omkar Sai Dairy Dashboard</h2>
        <button className="btn-primary" onClick={() => window.location.href='/create'}>+ New Bill</button>
      </div>

      <div className="dashboard-grid mb-4">
        <Card title="Total Revenue" value={`₹${stats.totalSales.toLocaleString()}`} subtitle="Overall earnings" icon="💰" color="#10B981" />
        <Card title="Invoices Generated" value={stats.totalBills} subtitle="Total bills created" icon="🧾" color="#4F46E5" />
        <Card title="Active Customers" value={stats.totalCustomers} subtitle="Registered clients" icon="👥" color="#F59E0B" />
      </div>

      <div className="dashboard-grid mt-4">
        <div className="card glass" style={{ gridColumn: 'span 2' }}>
          <h3 className="mb-4">Revenue Trend</h3>
          <div style={{ height: '300px' }}>
            <Line options={chartOptions} data={lineChartData} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value, subtitle, icon, color }) {
  return (
    <div className="card glass flex items-center" style={{ gap: '20px', borderLeft: `4px solid ${color}` }}>
      <div style={{ fontSize: '40px' }}>{icon}</div>
      <div>
        <p className="text-muted" style={{ fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>{title}</p>
        <h2 style={{ fontSize: '28px', color: '#0F172A', marginBottom: '2px' }}>{value}</h2>
        <span style={{ fontSize: '12px', color: '#64748B' }}>{subtitle}</span>
      </div>
    </div>
  );
}
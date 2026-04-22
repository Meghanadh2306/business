import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalSales: 0,
    todaySales: 0,
    totalBills: 0,
    totalCustomers: 0,
    todayBills: 0,
    topCustomer: "—",
    topProduct: "—",
    recentBills: [],
  });

  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [billsRes, customersRes] = await Promise.all([
          API.get("/bills").catch(() => ({ data: [] })),
          API.get("/customers").catch(() => ({ data: [] }))
        ]);

        const bills = billsRes.data || [];
        const customers = customersRes.data || [];

        const now = new Date();
        const today = now.toDateString();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        let totalSales = 0;
        let todaySales = 0;
        let todayBills = 0;

        const monthly = Array(12).fill(0);
        const customerMap = {};
        const productMap = {};

        bills.forEach(b => {
          const amount = b.totalAmount || 0;
          const date = new Date(b.createdAt);

          // ✅ THIS MONTH
          if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
            totalSales += amount;
          }

          // ✅ TODAY
          if (date.toDateString() === today) {
            todaySales += amount;
            todayBills++;
          }

          // 📊 monthly trend
          monthly[date.getMonth()] += amount;

          // 👤 customer
          const name = b.customerName || "Unknown";
          customerMap[name] = (customerMap[name] || 0) + amount;

          // 📦 product
          b.items?.forEach(item => {
            productMap[item.name] = (productMap[item.name] || 0) + item.qty;
          });
        });

        // 🔥 fallback if no data
        if (monthly.every(v => v === 0)) {
          monthly[currentMonth] = totalSales;
        }

        const topCustomer = Object.entries(customerMap).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
        const topProduct = Object.entries(productMap).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

        setChartData(monthly);

        setStats({
          totalSales,
          todaySales,
          totalBills: bills.length,
          totalCustomers: customers.length,
          todayBills,
          topCustomer,
          topProduct,
          recentBills: bills.slice(-5).reverse()
        });

      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const chartConfig = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: "Revenue",
        data: chartData,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.15)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `₹ ${ctx.raw}`
        }
      }
    },
    scales: {
      y: {
        ticks: {
          callback: (val) => `₹${val}`
        }
      }
    }
  };

  return (
    <div>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl md:text-2xl font-bold">Dashboard</h2>
        <button className="btn-primary" onClick={() => navigate("/create")}>
          + New Bill
        </button>
      </div>

      {/* KPI */}
      <div className="dashboard-grid">
        <Card title="This Month Revenue" value={`₹${stats.totalSales}`} icon="💰" color="#10B981" />
        <Card title="Today Revenue" value={`₹${stats.todaySales}`} icon="📅" color="#3B82F6" />
        <Card title="Total Bills" value={stats.totalBills} icon="🧾" color="#6366F1" />
        <Card title="Customers" value={stats.totalCustomers} icon="👥" color="#F59E0B" />
      </div>

      {/* CHART */}
      <div className="card glass mt-4">
        <h3>Monthly Revenue</h3>
        <div style={{ height: "250px" }}>
          <Line data={chartConfig} options={chartOptions} />
        </div>
      </div>

      {/* INSIGHTS */}
      <div className="dashboard-grid mt-4">
        <Card title="Top Customer" value={stats.topCustomer} icon="🏆" color="#ec4899" />
        <Card title="Top Product" value={stats.topProduct} icon="📦" color="#14b8a6" />
        <Card title="Today Bills" value={stats.todayBills} icon="📊" color="#f97316" />
      </div>

      {/* RECENT */}
      <div className="card glass mt-4">
        <h3>Recent Bills</h3>
        {stats.recentBills.map((b, i) => (
          <div key={i} style={styles.billRow}>
            <span>{b.customerName}</span>
            <span>₹{b.totalAmount}</span>
          </div>
        ))}
      </div>

    </div>
  );
}

function Card({ title, value, icon, color }) {
  return (
    <div
      className="card glass"
      style={{
        padding: "12px",
        borderLeft: `4px solid ${color}`,
        transition: "0.3s",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.1)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={{ fontSize: "22px" }}>{icon}</div>
      <p style={{ opacity: 0.6, fontSize: "13px" }}>{title}</p>
      <h2 style={{ fontSize: "20px" }}>{value}</h2>
    </div>
  );
}

const styles = {
  billRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid #eee"
  }
};
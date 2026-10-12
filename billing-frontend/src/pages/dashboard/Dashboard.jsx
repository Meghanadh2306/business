import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import { useQuery } from "@tanstack/react-query";
import { formatDate } from "../../utils/dateUtils";
import Pagination from "../../components/ui/Pagination";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Fetch dashboard data with React Query
  const { data: dashboardData, isLoading: loading } = useQuery({
    queryKey: ["dashboard-data"],
    queryFn: async () => {
      const [billsRes, customersRes] = await Promise.all([
        API.get("/bills").catch(() => ({ data: [] })),
        API.get("/customers").catch(() => ({ data: [] }))
      ]);

      const bills = (billsRes.data || []).sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
      const customers = customersRes.data || [];

      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
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
        const bDate = new Date(b.date || b.createdAt);
        const bDateStr = !isNaN(bDate.getTime())
          ? `${bDate.getFullYear()}-${String(bDate.getMonth() + 1).padStart(2, "0")}-${String(bDate.getDate()).padStart(2, "0")}`
          : "";

        // THIS MONTH
        if (bDate.getMonth() === currentMonth && bDate.getFullYear() === currentYear) {
          totalSales += amount;
        }

        // TODAY
        if (bDateStr === todayStr) {
          todaySales += amount;
          todayBills++;
        }

        // monthly trend
        if (!isNaN(bDate.getMonth())) {
          monthly[bDate.getMonth()] += amount;
        }

        // customer
        const name = b.customerId?.name || b.customerName || "Walk-in";
        customerMap[name] = (customerMap[name] || 0) + amount;

        // product
        b.items?.forEach(item => {
          if (item.name) {
            productMap[item.name] = (productMap[item.name] || 0) + (item.quantity || item.qty || 1);
          }
        });
      });

      if (monthly.every(v => v === 0)) {
        monthly[currentMonth] = totalSales;
      }

      const topCustomer = Object.entries(customerMap).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
      const topProduct = Object.entries(productMap).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

      return {
        totalSales,
        todaySales,
        totalBills: bills.length,
        totalCustomers: customers.length,
        todayBills,
        topCustomer,
        topProduct,
        bills,
        chartData: monthly,
      };
    },
  });

  const stats = dashboardData || {
    totalSales: 0,
    todaySales: 0,
    totalBills: 0,
    totalCustomers: 0,
    todayBills: 0,
    topCustomer: "—",
    topProduct: "—",
    bills: [],
    chartData: Array(12).fill(0),
  };

  const chartConfig = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Revenue",
        data: stats.chartData,
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
          label: (ctx) => `₹ ${ctx.raw.toLocaleString()}`
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

  // Pagination for Recent Bills
  const totalBills = stats.bills.length;
  const totalPages = Math.ceil(totalBills / pageSize) || 1;
  const validPage = Math.min(Math.max(currentPage, 1), totalPages);
  const paginatedRecentBills = stats.bills.slice((validPage - 1) * pageSize, validPage * pageSize);

  return (
    <div>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4" style={{ flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Dashboard</h2>
          <p className="text-muted">Real-time overview of your dairy business</p>
        </div>
        <button className="btn-primary" onClick={() => navigate("/create")}>
          + New Bill
        </button>
      </div>

      {/* KPI CARDS */}
      <div className="dashboard-grid">
        <Card title="This Month Revenue" value={`₹${stats.totalSales.toLocaleString()}`} icon="💰" color="#10B981" />
        <Card title="Today's Revenue" value={`₹${stats.todaySales.toLocaleString()}`} icon="📅" color="#3B82F6" />
        <Card title="Total Bills" value={stats.totalBills} icon="🧾" color="#6366F1" />
        <Card title="Registered Customers" value={stats.totalCustomers} icon="👥" color="#F59E0B" />
      </div>

      {/* CHART */}
      <div className="card glass mt-4">
        <h3 style={{ marginBottom: "12px" }}>Monthly Revenue Trend</h3>
        <div style={{ height: "250px" }}>
          <Line data={chartConfig} options={chartOptions} />
        </div>
      </div>

      {/* INSIGHTS */}
      <div className="dashboard-grid mt-4">
        <Card title="Top Customer" value={stats.topCustomer} icon="🏆" color="#ec4899" />
        <Card title="Top Product" value={stats.topProduct} icon="📦" color="#14b8a6" />
        <Card title="Today's Bills" value={stats.todayBills} icon="📊" color="#f97316" />
      </div>

      {/* RECENT BILLS WITH PAGINATION */}
      <div className="card glass mt-4">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
          <h3 style={{ margin: 0 }}>Recent Orders ({totalBills})</h3>
          <button
            onClick={() => navigate("/bills")}
            style={{
              background: "transparent",
              color: "var(--primary)",
              border: "none",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 600
            }}
          >
            View All Invoices →
          </button>
        </div>

        {loading ? (
          <p className="text-muted text-center py-4">Loading dashboard data...</p>
        ) : stats.bills.length === 0 ? (
          <p className="text-muted text-center py-4">No recent bills found.</p>
        ) : (
          <div>
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Invoice No</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th style={{ textAlign: "right" }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRecentBills.map((b) => (
                    <tr
                      key={b._id}
                      onClick={() => b.customerId?._id && navigate(`/customers/${b.customerId._id}`)}
                      style={{ cursor: b.customerId?._id ? "pointer" : "default" }}
                    >
                      <td style={{ fontWeight: 600 }}>{b.invoiceNumber || `#${b._id.slice(-6).toUpperCase()}`}</td>
                      <td>{b.customerId?.name || b.customerName || "Walk-in"}</td>
                      <td>{formatDate(b.date || b.createdAt)}</td>
                      <td>{b.items?.map(i => `${i.name} (x${i.quantity || 1})`).join(", ") || "—"}</td>
                      <td style={{ textAlign: "right", fontWeight: 700, color: "var(--primary)" }}>
                        ₹{(b.totalAmount || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <Pagination
              currentPage={validPage}
              totalPages={totalPages}
              totalItems={totalBills}
              pageSize={pageSize}
              pageSizeOptions={[5, 10, 20]}
              onPageChange={(p) => setCurrentPage(p)}
              onPageSizeChange={(sz) => {
                setPageSize(sz);
                setCurrentPage(1);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function Card({ title, value, icon, color }) {
  return (
    <div
      className="card glass"
      style={{
        padding: "16px",
        borderLeft: `4px solid ${color}`,
        transition: "var(--transition, all 0.3s ease)",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.08)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={{ fontSize: "24px", marginBottom: "4px" }}>{icon}</div>
      <p style={{ opacity: 0.7, fontSize: "13px", fontWeight: 500 }}>{title}</p>
      <h2 style={{ fontSize: "22px", marginTop: "4px" }}>{value}</h2>
    </div>
  );
}
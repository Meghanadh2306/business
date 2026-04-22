import { useEffect, useState } from "react";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function BillsList() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/bills")
      .then(res => {
        // Sort descending by date first
        const sorted = (res.data || []).sort((a, b) => new Date(b.date) - new Date(a.date));
        setBills(sorted);
      })
      .catch(err => console.error("Error fetching bills", err))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        await API.delete(`/bills/${id}`);
        setBills(bills.filter(b => b._id !== id));
        toast.success("Invoice deleted successfully");
      } catch (err) {
        console.error("Error deleting bill:", err);
        toast.error("Failed to delete bill");
      }
    }
  };

  const handlePrint = (bill) => {
    // A simple print representation
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice #${bill._id.slice(-6).toUpperCase()}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h2>Invoice #${bill._id.slice(-6).toUpperCase()}</h2>
          <p><strong>Customer:</strong> ${bill.customerId?.name || 'Walk-in / Unknown'}</p>
          <p><strong>Date:</strong> ${new Date(bill.date).toLocaleDateString()}</p>
          
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${bill.items?.map(item => `
                <tr>
                  <td>${item.name || 'Unknown Item'}</td>
                  <td>${item.quantity}</td>
                  <td>₹${item.price}</td>
                  <td>₹${item.quantity * item.price}</td>
                </tr>
              `).join('') || '<tr><td colspan="4">No items listed.</td></tr>'}
            </tbody>
          </table>
          <h3 style="text-align: right; margin-top: 20px;"><strong>Total Amount:</strong> ₹${bill.totalAmount || 0}</h3>
          
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Filter bills
  const filteredBills = bills.filter(bill => {
    if (!filterMonth && !filterYear) return true;
    const date = new Date(bill.date);
    const m = (date.getMonth() + 1).toString();
    const y = date.getFullYear().toString();

    if (filterMonth && filterMonth !== m) return false;
    if (filterYear && filterYear !== y) return false;
    return true;
  });

  // Group bills by customer object
  const groupedBills = filteredBills.reduce((groups, bill) => {
    const customer = bill.customerId || { _id: 'unknown', name: 'Walk-in / Unknown', phone: '', address: '' };
    if (!groups[customer._id]) {
      groups[customer._id] = {
        customer: customer,
        bills: []
      };
    }
    groups[customer._id].bills.push(bill);
    return groups;
  }, {});

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold">All Invoices by Customer</h2>
          <p className="text-muted">Manage and view bills grouped under each user profile.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
            style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-main)' }}
          >
            <option value="">All Months</option>
            <option value="1">January</option>
            <option value="2">February</option>
            <option value="3">March</option>
            <option value="4">April</option>
            <option value="5">May</option>
            <option value="6">June</option>
            <option value="7">July</option>
            <option value="8">August</option>
            <option value="9">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
          </select>

          <select
            value={filterYear}
            onChange={e => setFilterYear(e.target.value)}
            style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-main)' }}
          >
            <option value="">All Years</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
          </select>

          <button className="btn-primary" onClick={() => window.location.href = '/create'}>+ Create Bill</button>
        </div>
      </div>

      {loading ? (
        <div className="card glass">
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading bills...</div>
        </div>
      ) : Object.keys(groupedBills).length === 0 ? (
        <div className="card glass">
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>🧾</div>
            <p>No bills found. Create your first bill!</p>
          </div>
        </div>
      ) : (
        Object.values(groupedBills).map(({ customer, bills }) => (
          <div 
            key={customer._id} 
            className="card glass mb-4" 
            onClick={() => customer._id !== 'unknown' && navigate(`/customers/${customer._id}`)}
            style={{ cursor: customer._id !== 'unknown' ? 'pointer' : 'default', transition: 'var(--transition)' }}
            onMouseOver={(e) => { if (customer._id !== 'unknown') e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseOut={(e) => { if (customer._id !== 'unknown') e.currentTarget.style.transform = 'none' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '20px' }}>👤</span> {customer.name}
                </h3>
                {customer.phone && <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '4px 0' }}>📞 {customer.phone}</p>}
                {customer.address && <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '4px 0' }}>📍 {customer.address}</p>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="btn-primary" style={{ background: 'var(--bg-color)', color: 'var(--text-main)', border: '1px solid var(--border-color)', padding: '6px 12px', fontSize: '14px' }}>
                  {bills.length} Orders
                </span>
                {customer._id !== 'unknown' && (
                  <span style={{ fontSize: '18px', color: 'var(--primary)' }}>
                    →
                  </span>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

const styles = {
  actionBtn: {
    background: "var(--bg-color)",
    color: "var(--primary)",
    border: "1px solid var(--primary)",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "var(--transition)"
  }
};
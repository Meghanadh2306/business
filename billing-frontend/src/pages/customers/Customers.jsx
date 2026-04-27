import { useEffect, useState } from "react";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const res = await API.get("/customers");
      setCustomers(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addCustomer = async (e) => {
    e.preventDefault();
    if (!name || !phone) return toast.error("Name and phone are required");

    try {
      await API.post("/customers", { name, phone, address });
      toast.success("Customer added successfully");
      setName("");
      setPhone("");
      setAddress("");
      loadCustomers();
    } catch (err) {
      toast.error("Error adding customer");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        await API.delete(`/customers/${id}`);
        setCustomers(customers.filter(c => c._id !== id));
        toast.success("Customer deleted successfully");
      } catch (err) {
        console.error("Error deleting customer", err);
        toast.error("Failed to delete customer");
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 className="text-2xl font-bold">Customers</h2>
          <p className="text-muted">Manage your client directory</p>
        </div>
      </div>

      <div className="dashboard-grid mb-4">
        <div className="card glass" style={{ gridColumn: 'span 1', height: 'fit-content' }}>
          <h3 className="mb-4">Add New Customer</h3>
          <form onSubmit={addCustomer} className="flex" style={{ flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Full Name *</label>
              <input 
                placeholder="John Doe" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                style={{ width: '100%' }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Phone Number *</label>
              <input 
                placeholder="+91 98765 43210" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                style={{ width: '100%' }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Address</label>
              <input 
                placeholder="123 Main St" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                style={{ width: '100%' }}
              />
            </div>
            <button type="submit" className="btn-primary mt-4">Save Customer</button>
          </form>
        </div>

        <div className="card glass" style={{ gridColumn: window.innerWidth > 1024 ? 'span 2' : 'span 1' }}>
          <h3 className="mb-4">Customer List</h3>
          {loading ? (
            <p className="text-muted text-center py-4">Loading...</p>
          ) : customers.length === 0 ? (
             <p className="text-muted text-center py-4">No customers found.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map(c => (
                    <tr key={c._id}>
                      <td style={{ fontWeight: 500 }}>{c.name}</td>
                      <td>{c.phone}</td>
                      <td>{c.address || 'N/A'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => navigate(`/customers/${c._id}`)}
                            style={styles.actionBtn}
                          >
                            View
                          </button>
                          <button 
                            onClick={() => handleDelete(c._id)}
                            style={{...styles.actionBtn, borderColor: '#ef4444', color: '#ef4444'}}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  actionBtn: {
    background: "var(--bg-color)",
    color: "var(--primary)",
    border: "1px solid var(--border-color)",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: 600
  }
};
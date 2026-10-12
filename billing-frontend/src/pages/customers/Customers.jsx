import { useEffect, useState } from "react";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  useEffect(() => {
    let isMounted = true;
    API.get("/customers")
      .then(res => {
        if (isMounted) setCustomers(res.data || []);
      })
      .catch(err => console.error(err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) return toast.error("Name is required");

    try {
      if (editingId) {
        await API.put(`/customers/${editingId}`, { name, phone, address });
        toast.success("Customer updated successfully");
        setEditingId(null);
      } else {
        await API.post("/customers", { name, phone, address });
        toast.success("Customer added successfully");
      }
      setName("");
      setPhone("");
      setAddress("");
      loadCustomers();
    } catch {
      toast.error(editingId ? "Error updating customer" : "Error adding customer");
    }
  };

  const startEdit = (c) => {
    setEditingId(c._id);
    setName(c.name || "");
    setPhone(c.phone || "");
    setAddress(c.address || "");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName("");
    setPhone("");
    setAddress("");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        await API.delete(`/customers/${id}`);
        setCustomers(customers.filter(c => c._id !== id));
        if (editingId === id) cancelEdit();
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>{editingId ? "✏️ Edit Customer" : "Add New Customer"}</h3>
            {editingId && (
              <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600 }}>Editing</span>
            )}
          </div>
          <form onSubmit={handleSubmit} className="flex" style={{ flexDirection: 'column', gap: '16px' }}>
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
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Phone Number</label>
              <input 
                placeholder="+91 98765 43210" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                style={{ width: '100%' }}
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

            {editingId ? (
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Update Customer</button>
                <button 
                  type="button" 
                  onClick={cancelEdit} 
                  style={{
                    padding: '8px 14px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-color)',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button type="submit" className="btn-primary mt-4">Save Customer</button>
            )}
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
                    <tr key={c._id} style={{ backgroundColor: editingId === c._id ? 'rgba(99, 102, 241, 0.08)' : undefined }}>
                      <td style={{ fontWeight: 500 }}>{c.name}</td>
                      <td>{c.phone && c.phone !== 'N/A' ? c.phone : ''}</td>
                      <td>{c.address && c.address !== 'N/A' ? c.address : ''}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => startEdit(c)}
                            style={{ ...styles.actionBtn, borderColor: 'var(--primary)', color: 'var(--primary)' }}
                            title="Edit customer details"
                          >
                            Edit
                          </button>
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
    fontWeight: 600,
    cursor: "pointer"
  }
};
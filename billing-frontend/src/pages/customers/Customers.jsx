import { useState } from "react";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Pagination from "../../components/ui/Pagination";

export default function Customers() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch customers with React Query
  const { data: customers = [], isLoading: loading } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const res = await API.get("/customers");
      return res.data || [];
    },
  });

  // Save / Update mutation
  const saveMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      if (id) {
        return await API.put(`/customers/${id}`, payload);
      }
      return await API.post("/customers", payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success(variables.id ? "Customer updated successfully" : "Customer added successfully");
      setName("");
      setPhone("");
      setAddress("");
      setEditingId(null);
    },
    onError: (err) => {
      console.error(err);
      toast.error(editingId ? "Error updating customer" : "Error adding customer");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await API.delete(`/customers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer deleted successfully");
    },
    onError: (err) => {
      console.error("Error deleting customer", err);
      toast.error("Failed to delete customer");
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) return toast.error("Name is required");
    saveMutation.mutate({
      id: editingId,
      payload: { name, phone, address },
    });
  };

  const startEdit = (c) => {
    setEditingId(c._id);
    setName(c.name || "");
    setPhone(c.phone || "");
    setAddress(c.address || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName("");
    setPhone("");
    setAddress("");
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      deleteMutation.mutate(id);
      if (editingId === id) cancelEdit();
    }
  };

  // Filter and pagination
  const filteredCustomers = customers.filter(c => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const matchName = c.name?.toLowerCase().includes(term);
    const matchPhone = c.phone?.toLowerCase().includes(term);
    const matchAddr = c.address?.toLowerCase().includes(term);
    return matchName || matchPhone || matchAddr;
  });

  const totalItems = filteredCustomers.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const validPage = Math.min(Math.max(currentPage, 1), totalPages);
  const paginatedCustomers = filteredCustomers.slice((validPage - 1) * pageSize, validPage * pageSize);

  return (
    <div>
      <div className="flex justify-between items-center mb-4" style={{ flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 className="text-2xl font-bold">Customers</h2>
          <p className="text-muted">Manage your client directory</p>
        </div>
      </div>

      <div className="dashboard-grid mb-4">
        {/* Customer Form */}
        <div className="card glass" style={{ gridColumn: "span 1", height: "fit-content" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ margin: 0 }}>{editingId ? "✏️ Edit Customer" : "Add New Customer"}</h3>
            {editingId && (
              <span style={{ fontSize: "12px", color: "var(--primary)", fontWeight: 600 }}>Editing</span>
            )}
          </div>
          <form onSubmit={handleSubmit} className="flex" style={{ flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", marginBottom: "4px", fontWeight: 600 }}>Full Name *</label>
              <input 
                placeholder="John Doe" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                style={{ width: "100%" }}
                required
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", marginBottom: "4px", fontWeight: 600 }}>Phone Number</label>
              <input 
                placeholder="+91 98765 43210" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                style={{ width: "100%" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", marginBottom: "4px", fontWeight: 600 }}>Address</label>
              <input 
                placeholder="123 Main St" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                style={{ width: "100%" }}
              />
            </div>

            {editingId ? (
              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "Updating..." : "Update Customer"}
                </button>
                <button 
                  type="button" 
                  onClick={cancelEdit} 
                  style={{
                    padding: "8px 14px",
                    borderRadius: "6px",
                    border: "1px solid var(--border-color)",
                    background: "var(--bg-color)",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    fontWeight: 600
                  }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button type="submit" className="btn-primary mt-4" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Saving..." : "Save Customer"}
              </button>
            )}
          </form>
        </div>

        {/* Customer List Table */}
        <div className="card glass" style={{ gridColumn: window.innerWidth > 1024 ? "span 2" : "span 1" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
            <h3 style={{ margin: 0 }}>Customer List ({totalItems})</h3>
            <input
              type="text"
              placeholder="Search by name, phone, address..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                padding: "7px 12px",
                borderRadius: "6px",
                border: "1px solid var(--border-color)",
                background: "var(--bg-color)",
                color: "var(--text-main)",
                fontSize: "13px",
                minWidth: "220px"
              }}
            />
          </div>

          {loading ? (
            <p className="text-muted text-center py-4">Loading customers with React Query...</p>
          ) : filteredCustomers.length === 0 ? (
            <p className="text-muted text-center py-4">No customers found.</p>
          ) : (
            <div>
              <div style={{ overflowX: "auto" }}>
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
                    {paginatedCustomers.map(c => (
                      <tr key={c._id} style={{ backgroundColor: editingId === c._id ? "rgba(99, 102, 241, 0.08)" : undefined }}>
                        <td style={{ fontWeight: 500 }}>{c.name}</td>
                        <td>{c.phone && c.phone !== "N/A" ? c.phone : ""}</td>
                        <td>{c.address && c.address !== "N/A" ? c.address : ""}</td>
                        <td>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button 
                              onClick={() => startEdit(c)}
                              style={{ ...styles.actionBtn, borderColor: "var(--primary)", color: "var(--primary)" }}
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
                              style={{ ...styles.actionBtn, borderColor: "#ef4444", color: "#ef4444" }}
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

              {/* Pagination */}
              <Pagination
                currentPage={validPage}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={pageSize}
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
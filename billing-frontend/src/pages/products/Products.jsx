import { useState } from "react";
import API from "../../services/api";
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Pagination from "../../components/ui/Pagination";

export default function Products() {
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const queryClient = useQueryClient();

  // Fetch products with React Query
  const { data: products = [], isLoading: loading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await API.get("/products");
      return res.data || [];
    },
  });

  // Save / Update product mutation
  const saveMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      if (id) {
        return await API.put(`/products/${id}`, payload);
      }
      return await API.post("/products", payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(variables.id ? "Product updated successfully" : "Product added successfully");
      setName("");
      setEditingId(null);
    },
    onError: (err) => {
      console.error(err);
      toast.error(editingId ? "Error updating product" : "Error adding product");
    },
  });

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await API.delete(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted successfully");
    },
    onError: (err) => {
      console.error("Error deleting product", err);
      toast.error("Failed to delete product");
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) return toast.error("Product name is required");
    saveMutation.mutate({
      id: editingId,
      payload: { name },
    });
  };

  const startEdit = (p) => {
    setEditingId(p._id);
    setName(p.name || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName("");
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteMutation.mutate(id);
      if (editingId === id) cancelEdit();
    }
  };

  // Filter & Pagination
  const filteredProducts = products.filter(p => {
    if (!searchTerm) return true;
    return p.name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const validPage = Math.min(Math.max(currentPage, 1), totalPages);
  const paginatedProducts = filteredProducts.slice((validPage - 1) * pageSize, validPage * pageSize);

  return (
    <div>
      <div className="flex justify-between items-center mb-4" style={{ flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 className="text-2xl font-bold">Dairy Products & Inventory</h2>
          <p className="text-muted">Manage your milk products and catalog</p>
        </div>
      </div>

      <div className="dashboard-grid mb-4">
        {/* Product Form */}
        <div className="card glass" style={{ gridColumn: "span 1", height: "fit-content" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ margin: 0 }}>{editingId ? "✏️ Edit Product" : "Add New Product"}</h3>
            {editingId && (
              <span style={{ fontSize: "12px", color: "var(--primary)", fontWeight: 600 }}>Editing</span>
            )}
          </div>
          <form onSubmit={handleSubmit} className="flex" style={{ flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", marginBottom: "4px", fontWeight: 600 }}>Product Name *</label>
              <input 
                placeholder="Cow Milk 1L" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                style={{ width: "100%" }}
                required
              />
            </div>

            {editingId ? (
              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "Updating..." : "Update Product"}
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
                {saveMutation.isPending ? "Saving..." : "Save Product"}
              </button>
            )}
          </form>
        </div>

        {/* Product Catalog Table */}
        <div className="card glass" style={{ gridColumn: window.innerWidth > 1024 ? "span 2" : "span 1" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
            <h3 style={{ margin: 0 }}>Product Catalog ({totalItems})</h3>
            <input
              type="text"
              placeholder="Search product..."
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
                minWidth: "200px"
              }}
            />
          </div>

          {loading ? (
            <p className="text-muted text-center py-4">Loading products with React Query...</p>
          ) : filteredProducts.length === 0 ? (
            <p className="text-muted text-center py-4">No products found.</p>
          ) : (
            <div>
              <div style={{ overflowX: "auto" }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Item ID</th>
                      <th>Name</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedProducts.map((p, idx) => {
                      const displayIndex = (validPage - 1) * pageSize + idx + 1;
                      return (
                        <tr key={p._id} style={{ backgroundColor: editingId === p._id ? "rgba(99, 102, 241, 0.08)" : undefined }}>
                          <td style={{ color: "var(--text-muted)" }}>
                            PROD-{p._id ? p._id.slice(-4).toUpperCase() : displayIndex}
                          </td>
                          <td style={{ fontWeight: 600 }}>{p.name}</td>
                          <td>
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button 
                                onClick={() => startEdit(p)}
                                style={{
                                  background: "var(--bg-color)",
                                  color: "var(--primary)",
                                  border: "1px solid var(--primary)",
                                  padding: "6px 12px",
                                  borderRadius: "6px",
                                  fontSize: "12px",
                                  fontWeight: 600,
                                  cursor: "pointer"
                                }}
                                title="Edit product name"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDelete(p._id)}
                                style={{
                                  background: "var(--bg-color)",
                                  color: "#ef4444",
                                  border: "1px solid #ef4444",
                                  padding: "6px 12px",
                                  borderRadius: "6px",
                                  fontSize: "12px",
                                  fontWeight: 600,
                                  cursor: "pointer"
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
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
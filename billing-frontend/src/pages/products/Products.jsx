import { useEffect, useState } from "react";
import API from "../../services/api";
import toast from "react-hot-toast";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const res = await API.get("/products");
      setProducts(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (e) => {
    e.preventDefault();
    if (!name) return toast.error("Product name is required");

    try {
      await API.post("/products", { name });
      toast.success("Product added successfully");
      setName("");
      load();
    } catch (err) {
      toast.error("Error adding product");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await API.delete(`/products/${id}`);
        setProducts(products.filter(p => p._id !== id));
        toast.success("Product deleted successfully");
      } catch (err) {
        console.error("Error deleting product", err);
        toast.error("Failed to delete product");
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold">Dairy Products & Inventory</h2>
          <p className="text-muted">Manage your milk products and daily pricing</p>
        </div>
      </div>

      <div className="dashboard-grid mb-4">
        <div className="card glass" style={{ gridColumn: 'span 1', height: 'fit-content' }}>
          <h3 className="mb-4">Add New Product</h3>
          <form onSubmit={addProduct} className="flex" style={{ flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Product Name *</label>
              <input 
                placeholder="Cow Milk 1L" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                style={{ width: '100%' }}
                required
              />
            </div>
            <button type="submit" className="btn-primary mt-4">Save Product</button>
          </form>
        </div>

        <div className="card glass" style={{ gridColumn: window.innerWidth > 1024 ? 'span 2' : 'span 1' }}>
          <h3 className="mb-4">Product Catalog</h3>
          {loading ? (
            <p className="text-muted text-center py-4">Loading...</p>
          ) : products.length === 0 ? (
             <p className="text-muted text-center py-4">No products found.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Item ID</th>
                    <th>Name</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, idx) => (
                    <tr key={p._id}>
                      <td style={{ color: 'var(--text-muted)' }}>PROD-{p._id ? p._id.slice(-4).toUpperCase() : idx}</td>
                      <td style={{ fontWeight: 600 }}>{p.name}</td>
                      <td>
                        <button 
                          onClick={() => handleDelete(p._id)}
                          style={{
                            background: "var(--bg-color)",
                            color: "#ef4444",
                            border: "1px solid #ef4444",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: 600
                          }}
                        >
                          Delete
                        </button>
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
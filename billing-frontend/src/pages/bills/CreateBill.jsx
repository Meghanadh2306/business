import { useEffect, useState } from "react";
import API from "../../services/api";
import toast from "react-hot-toast";
import html2pdf from "html2pdf.js";
import { useNavigate } from "react-router-dom";

export default function CreateBill() {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([{ productId: "", name: "", quantity: 1, price: 0 }]);
  const [customerId, setCustomerId] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [cRes, pRes] = await Promise.all([
        API.get("/customers").catch(() => ({ data: [] })),
        API.get("/products").catch(() => ({ data: [] }))
      ]);
      setCustomers(cRes.data || []);
      setProducts(pRes.data || []);
    } catch (err) {
      console.error("Failed to load initial data", err);
    }
  };

  const addItem = () => {
    setItems([...items, { productId: "", name: "", quantity: 1, price: 0 }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
    }
  };

  const updateItem = (i, field, value) => {
    const newItems = [...items];
    newItems[i][field] = value;

    if (field === "productId") {
      const product = products.find(p => p._id === value);
      newItems[i].name = product?.name || "";
    }

    setItems(newItems);
  };

  const subtotal = items.reduce((sum, i) => sum + (i.quantity || 0) * (i.price || 0), 0);
  const tax = 0;
  const total = subtotal;

  const submitBill = async () => {
    if (!customerId) return toast.error("Please select a customer");
    const validItems = items.filter(i => i.productId && i.quantity > 0);
    if (validItems.length === 0) return toast.error("Please add at least one valid item");

    setLoading(true);
    try {
      await API.post("/bills", {
        customerId,
        items: validItems,
        subtotal,
        tax,
        discount: 0,
        totalAmount: total
      });
      toast.success("Bill Created Successfully!");
      setTimeout(() => navigate("/bills"), 1000);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create bill");
    }
    setLoading(false);
  };

  const handleDownloadDraft = () => {
    if (!customerId) return toast.error("Please select a customer first");
    const validItems = items.filter(i => i.productId && i.quantity > 0);
    if (validItems.length === 0) return toast.error("Please add at least one valid item");

    const customer = customers.find(c => c._id === customerId);

    const element = document.createElement('div');
    element.innerHTML = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #000; background: #fff; width: 100%; box-sizing: border-box;">
        <style>
          .bill-container {
            width: 100%;
            border: 1px solid #000;
            outline: 2px solid #000;
            outline-offset: -4px;
            padding: 20px 25px;
            box-sizing: border-box;
          }
          .header-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 5px;
          }
          .cash-bill {
            text-decoration: underline;
            font-style: italic;
          }
          .header-center {
            text-align: center;
            margin-bottom: 15px;
          }
          .header-center h1 {
            margin: 0;
            font-size: 32px;
            letter-spacing: 1px;
            font-family: 'Times New Roman', Times, serif;
          }
          .header-center h2 {
            margin: 5px 0 0 0;
            font-size: 26px;
            letter-spacing: 0.5px;
            font-family: 'Times New Roman', Times, serif;
          }
          .header-center p {
            margin: 4px 0;
            font-size: 15px;
          }
          .customer-details {
            margin-bottom: 15px;
            line-height: 1.8;
          }
          .customer-row {
            display: flex;
            align-items: flex-end;
            margin-bottom: 8px;
          }
          .customer-label {
            font-weight: bold;
            margin-right: 8px;
            font-size: 16px;
          }
          .customer-value {
            flex: 1;
            border-bottom: 1px dotted #000;
            font-family: 'Times New Roman', Times, serif;
            font-size: 18px;
            font-style: italic;
            color: #111;
            padding-left: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            border: 2px solid #000;
          }
          th, td {
            border: 1px solid #000;
            padding: 8px;
          }
          th {
            text-align: center;
            font-weight: bold;
            font-size: 15px;
          }
          .col-sno { width: 5%; text-align: center; font-weight: bold; }
          .col-particulars { width: 55%; font-family: 'Times New Roman', Times, serif; font-size: 18px; }
          .col-qty { width: 10%; text-align: center; font-family: 'Times New Roman', Times, serif; font-size: 18px; }
          .col-rate { width: 10%; text-align: center; font-family: 'Times New Roman', Times, serif; font-size: 18px; }
          .col-amount { width: 20%; text-align: right; font-family: 'Times New Roman', Times, serif; font-size: 18px; }
          
          .total-row td {
            font-weight: bold;
            border-top: 2px solid #000;
          }
          .instructions-container {
            border: 2px solid #000;
            border-top: none;
            padding: 10px 20px 20px 20px;
          }
          .instructions-title-wrapper {
            text-align: center;
            margin-bottom: 10px;
          }
          .instructions-title {
            background-color: #000;
            color: #fff;
            padding: 4px 20px;
            border-radius: 20px;
            font-weight: bold;
            display: inline-block;
            font-size: 15px;
          }
          .instructions-list {
            list-style-type: decimal;
            margin: 0;
            padding-left: 20px;
            font-size: 14px;
            line-height: 1.6;
          }
          .signatures {
            display: flex;
            justify-content: space-between;
            margin-top: 40px;
            font-weight: bold;
            font-style: italic;
            font-family: 'Times New Roman', Times, serif;
            font-size: 18px;
          }
        </style>
        
        <div class="bill-container">
          <div class="header-top">
            <span>No. DRAFT</span>
            <span class="cash-bill">Cash Bill</span>
            <span>Date: ${new Date().toLocaleDateString()}</span>
          </div>
          
          <div class="header-center">
            <h1>OMKAR</h1>
            <h2>SAI TIRUMALA DAIRY PARLOR</h2>
            <p>Ramchandra Rao Peta, ELURU -534002</p>
            <p>Cell : 8309471669, 9848377920</p>
          </div>

          <div class="customer-details">
            <div class="customer-row">
              <span class="customer-label">Name.</span>
              <span class="customer-value">${customer?.name || ''}</span>
            </div>
            <div class="customer-row">
              <span class="customer-label">Mobile No.</span>
              <span class="customer-value">${customer?.phone || ''}</span>
            </div>
            <div class="customer-row">
              <span class="customer-label">Address.</span>
              <span class="customer-value">${customer?.address || ''}</span>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th class="col-sno">S.<br>No.</th>
                <th class="col-particulars">Order Particulars</th>
                <th class="col-qty">Qty</th>
                <th class="col-rate">Rate</th>
                <th class="col-amount">Amount<br>Rs.</th>
              </tr>
            </thead>
            <tbody>
              ${validItems.map((item, index) => `
                <tr>
                  <td class="col-sno">${index + 1}</td>
                  <td class="col-particulars">${item.name || ''}</td>
                  <td class="col-qty">${item.quantity || ''}</td>
                  <td class="col-rate">${item.price || ''}</td>
                  <td class="col-amount">${(item.quantity * item.price) || ''}</td>
                </tr>
              `).join('')}
              <tr><td class="col-sno" style="height: 30px;"></td><td class="col-particulars"></td><td class="col-qty"></td><td class="col-rate"></td><td class="col-amount"></td></tr>
              <tr><td class="col-sno" style="height: 30px;"></td><td class="col-particulars"></td><td class="col-qty"></td><td class="col-rate"></td><td class="col-amount"></td></tr>
              
              <tr class="total-row">
                <td colspan="4" style="text-align: center;">TOTAL</td>
                <td class="col-amount">${total}</td>
              </tr>
            </tbody>
          </table>

          <div class="instructions-container">
            <div class="instructions-title-wrapper">
              <span class="instructions-title">Instructions to be Followed</span>
            </div>
            <ol class="instructions-list">
              <li>Paid amount is not refundable</li>
              <li>Advance to be paid for Milk Cans</li>
              <li>Ordered Milk cannot be taken back under any circumtances</li>
            </ol>
            
            <div class="signatures">
              <span>Customer Signature</span>
              <span>Signature</span>
            </div>
          </div>
        </div>
      </div>
    `;

    toast.loading("Generating Draft PDF...", { id: "pdf-toast" });

    html2pdf().from(element).set({
      margin: 0.2,
      filename: `Draft_Invoice.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    }).save().then(() => {
      toast.success("Draft Download Complete!", { id: "pdf-toast" });
    }).catch(err => {
      console.error(err);
      toast.error("Failed to generate PDF", { id: "pdf-toast" });
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold">New Dairy Bill</h2>
          <p className="text-muted">Generate a new invoice for Omkar Sai Tirumula Dairy Parlor.</p>
        </div>
        <button className="btn-primary" onClick={handleDownloadDraft} style={{ background: '#0f172a' }}>📥 Download Draft</button>
      </div>

      {/* Printable Header - Visible mostly in print styles if we add them, but good for UI too */}
      <div className="card mb-4" style={{ textAlign: 'center', background: 'var(--primary)', color: 'white', borderRadius: '12px 12px 0 0' }}>
        <h1 style={{ margin: 0, fontSize: '24px', letterSpacing: '1px', color: 'white' }}>OMKAR SAI TIRUMULA DAIRY PARLOR</h1>
        <p style={{ margin: '4px 0 0 0', opacity: 0.9 }}>Fresh Milk, Curd & Daily Dairy Products</p>
      </div>

      <div className="card glass mb-4">
        <h3 className="mb-4" style={{ fontSize: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>Customer Details</h3>
        <div>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', fontWeight: 500 }}>Select Customer</label>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            style={{ width: '100%', maxWidth: '400px' }}
          >
            <option value="">-- Choose Customer --</option>
            {customers.map(c => (
              <option key={c._id} value={c._id}>{c.name} {c.phone ? `(${c.phone})` : ''}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card glass mb-4">
        <div className="flex justify-between items-center mb-4" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
          <h3 style={{ fontSize: '18px' }}>Products</h3>
          <button className="btn-primary" onClick={addItem} style={{ padding: '6px 12px' }}>+ Add Item</button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th width="150px">Price (₹)</th>
              <th width="120px">Quantity</th>
              <th width="150px">Total (₹)</th>
              <th width="80px">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i}>
                <td>
                  <select
                    value={item.productId}
                    onChange={(e) => updateItem(i, "productId", e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="">-- Select --</option>
                    {products.map(p => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) => updateItem(i, "price", Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(i, "quantity", Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </td>
                <td style={{ fontWeight: 600 }}>
                  ₹{((item.quantity || 0) * (item.price || 0)).toLocaleString()}
                </td>
                <td>
                  <button
                    onClick={() => removeItem(i)}
                    style={{ background: '#FEE2E2', color: '#EF4444', border: 'none', padding: '8px', borderRadius: '6px' }}
                    disabled={items.length === 1}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card glass flex-col-mobile justify-between" style={{ alignItems: 'flex-start' }}>
        <div>
          <p className="text-muted" style={{ fontSize: '14px' }}>Notes</p>
          <textarea
            placeholder="Add any notes here..."
            style={{ width: '300px', height: '80px', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '8px', resize: 'none', fontFamily: 'inherit' }}
          />
        </div>

        <div style={{ width: '300px' }}>
          <div className="flex justify-between mb-2">
            <span className="text-muted">Subtotal:</span>
            <span style={{ fontWeight: 600 }}>₹{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between mt-4 pt-4" style={{ borderTop: '2px dashed var(--border-color)' }}>
            <span style={{ fontSize: '18px', fontWeight: 700 }}>Total Amount:</span>
            <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--primary)' }}>₹{total.toLocaleString()}</span>
          </div>

          <button
            className="btn-primary"
            style={{ width: '100%', marginTop: '20px', padding: '12px', fontSize: '16px' }}
            onClick={submitBill}
            disabled={loading}
          >
            {loading ? "Processing..." : "Generate Invoice"}
          </button>
        </div>
      </div>
    </div>
  );
}
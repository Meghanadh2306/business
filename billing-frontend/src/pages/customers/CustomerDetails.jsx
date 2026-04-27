import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";
import toast from "react-hot-toast";
import html2pdf from "html2pdf.js";
import { useAuth } from "../../context/AuthContext";

export default function CustomerDetails() {
  const { username } = useAuth();
  const isVijaya = username === "vijaya";
  
  const parlorTitle1 = isVijaya ? "VIJAYA" : "OMKAR";
  const parlorTitle2 = isVijaya ? "DAIRY PARLOUR" : "SAI TIRUMALA DAIRY PARLOR";
  const { id } = useParams();
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchDate, setSearchDate] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [billsRes, customerRes] = await Promise.all([
          API.get(`/bills/customer/${id}`).catch(() => ({ data: [] })),
          API.get(`/customers/${id}`).catch(() => ({ data: null }))
        ]);
        setBills(billsRes.data || []);
        // Optional: If you don't have a specific endpoint, you might just show "Customer Info"
        setCustomer(customerRes.data || { name: 'Customer', phone: 'N/A' });
      } catch (err) {
        console.error("Error fetching details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const filteredBills = bills.filter(b => {
    if (!searchDate) return true;
    const bDate = new Date(b.date).toISOString().split('T')[0];
    return bDate === searchDate;
  });

  const total = filteredBills.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  const handleDelete = async (billId) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        await API.delete(`/bills/${billId}`);
        setBills(bills.filter(b => b._id !== billId));
        toast.success("Bill deleted successfully");
      } catch (err) {
        console.error("Error deleting bill:", err);
        toast.error("Failed to delete bill");
      }
    }
  };

  const handleDownload = (bill) => {
    const invoiceNumber = bill.invoiceNumber || ("Invoice #" + bill._id.slice(-6).toUpperCase());
    
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
            <span>No. ${bill.invoiceNumber ? bill.invoiceNumber.replace('INV-', '') : ''}</span>
            <span class="cash-bill">Cash Bill</span>
            <span>Date: ${new Date(bill.date).toLocaleDateString()}</span>
          </div>
          
          <div class="header-center">
            <h1>${parlorTitle1}</h1>
            <h2>${parlorTitle2}</h2>
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
              ${bill.items?.map((item, index) => `
                <tr>
                  <td class="col-sno">${index + 1}</td>
                  <td class="col-particulars">${item.name || ''}</td>
                  <td class="col-qty">${item.quantity || ''}</td>
                  <td class="col-rate">${item.price || ''}</td>
                  <td class="col-amount">${(item.quantity * item.price) || ''}</td>
                </tr>
              `).join('') || ''}
              <tr><td class="col-sno" style="height: 30px;"></td><td class="col-particulars"></td><td class="col-qty"></td><td class="col-rate"></td><td class="col-amount"></td></tr>
              <tr><td class="col-sno" style="height: 30px;"></td><td class="col-particulars"></td><td class="col-qty"></td><td class="col-rate"></td><td class="col-amount"></td></tr>
              
              <tr class="total-row">
                <td colspan="4" style="text-align: center;">TOTAL</td>
                <td class="col-amount">${bill.totalAmount || 0}</td>
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

    toast.loading("Generating PDF...", { id: "pdf-toast" });

    const opt = {
      margin:       0.2,
      filename:     `${invoiceNumber.replace('#', '')}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().from(element).set(opt).save().then(() => {
      toast.success("Download Complete!", { id: "pdf-toast" });
    }).catch(err => {
      console.error(err);
      toast.error("Failed to generate PDF", { id: "pdf-toast" });
    });
  };

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 500 }}
      >
        ← Back to Customers
      </button>

      <div className="flex justify-between items-center mb-4" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 className="text-2xl font-bold">{customer ? customer.name : 'Customer Details'}</h2>
          <p className="text-muted">History and billing records</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>Search by Date:</label>
          <input 
            type="date" 
            value={searchDate} 
            onChange={e => setSearchDate(e.target.value)}
            style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-main)' }}
          />
        </div>
      </div>

      <div className="dashboard-grid mb-4">
        <div className="card glass">
          <p className="text-muted text-sm">Total Lifetime Spend</p>
          <h2 style={{ fontSize: '32px', color: 'var(--secondary)' }}>₹{total.toLocaleString()}</h2>
        </div>
        <div className="card glass">
          <p className="text-muted text-sm">Total Orders</p>
          <h2 style={{ fontSize: '32px', color: 'var(--primary)' }}>{bills.length}</h2>
        </div>
        {customer && (
          <div className="card glass" style={{ gridColumn: 'span 1' }}>
            <p className="text-muted text-sm">Contact Info</p>
            <p className="mt-4" style={{ fontWeight: 600 }}>📞 {customer.phone || 'N/A'}</p>
            {customer.address && <p style={{ fontWeight: 500, color: 'var(--text-muted)', marginTop: '4px' }}>📍 {customer.address}</p>}
          </div>
        )}
      </div>

      <div className="card glass">
        <h3 className="mb-4">Order History</h3>
        {loading ? (
          <p className="text-muted text-center py-4">Loading history...</p>
        ) : bills.length === 0 ? (
          <p className="text-muted text-center py-4">No order history available for this customer.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total Amount</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.map(b => (
                  <tr key={b._id}>
                    <td><span style={{ fontWeight: 600 }}>{b.invoiceNumber || `#${b._id.slice(-6).toUpperCase()}`}</span></td>
                    <td>{new Date(b.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td>{b.items?.map(i => `${i.name} (x${i.quantity})`).join(', ') || 'No items'}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>₹{(b.totalAmount || 0).toLocaleString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          style={{ background: "var(--bg-color)", color: "var(--primary)", border: "1px solid var(--primary)", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }} 
                          onClick={() => handleDownload(b)}>
                          Download
                        </button>
                        <button 
                          style={{ background: "var(--bg-color)", color: "#ef4444", border: "1px solid #ef4444", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }} 
                          onClick={() => handleDelete(b._id)}>
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
  );
}
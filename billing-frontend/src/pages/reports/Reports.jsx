import { useState, useEffect } from "react";
import API from "../../services/api";
import toast from "react-hot-toast";
import html2pdf from "html2pdf.js";
import { useAuth } from "../../context/AuthContext";

export default function Reports() {
  const { username } = useAuth();
  const isVijaya = username === "vijaya";
  
  const parlorTitle1 = isVijaya ? "VIJAYA" : "OMKAR";
  const parlorTitle2 = isVijaya ? "DAIRY PARLOUR" : "SAI TIRUMALA DAIRY PARLOR";
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [customerBills, setCustomerBills] = useState(null);

  useEffect(() => {
    API.get("/customers").then(res => setCustomers(res.data || [])).catch(console.error);
  }, []);

  const fetchReport = async () => {
    if (!month || !year) return toast.error("Please select both month and year");
    if (!customerId) return toast.error("Please select a customer");
    
    setLoading(true);
    try {
      const res = await API.get(`/bills/customer/${customerId}`);
      const allBills = res.data || [];
      const filtered = allBills.filter(b => {
        const d = new Date(b.date);
        return (d.getMonth() + 1).toString() === month && d.getFullYear().toString() === year;
      });
      setCustomerBills(filtered);
      toast.success("Report generated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Error generating report");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!customerBills) return;
    const customer = customers.find(c => c._id === customerId);
    const customerName = customer?.name || 'Unknown Customer';
    const monthName = months.find(m => m.value === month)?.label;
    
    // Map individual bills for the report
    const reportEntries = customerBills.map((b, index) => ({
      sno: index + 1,
      invoiceNumber: b.invoiceNumber || `INV-${b._id.slice(-6).toUpperCase()}`,
      date: new Date(b.date).toLocaleDateString(),
      amount: b.totalAmount || 0
    }));
    const grandTotal = reportEntries.reduce((sum, e) => sum + e.amount, 0);

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
          .col-sno { width: 10%; text-align: center; font-weight: bold; }
          .col-inv { width: 30%; text-align: center; font-family: 'Times New Roman', Times, serif; font-size: 18px; }
          .col-date { width: 30%; text-align: center; font-family: 'Times New Roman', Times, serif; font-size: 18px; }
          .col-amount { width: 30%; text-align: center; font-family: 'Times New Roman', Times, serif; font-size: 18px; }
          
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
            <span>No. REPORT</span>
            <span class="cash-bill">Monthly Statement</span>
            <span>Month: ${monthName} ${year}</span>
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
                <th class="col-inv">Invoice No.</th>
                <th class="col-date">Date</th>
                <th class="col-amount">Amount Rs.</th>
              </tr>
            </thead>
            <tbody>
              ${reportEntries.map(entry => `
                <tr>
                  <td class="col-sno">${entry.sno}</td>
                  <td class="col-inv">${entry.invoiceNumber}</td>
                  <td class="col-date">${entry.date}</td>
                  <td class="col-amount">${entry.amount}</td>
                </tr>
              `).join('')}
              <tr><td class="col-sno" style="height: 30px;"></td><td class="col-inv"></td><td class="col-date"></td><td class="col-amount"></td></tr>
              
              <tr class="total-row">
                <td colspan="3" style="text-align: center;">GRAND TOTAL</td>
                <td class="col-amount">${grandTotal}</td>
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
      margin:       0.5,
      filename:     `Report_${customerName.replace(/ /g, '_')}_${monthName}_${year}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().from(element).set(opt).save().then(() => {
      toast.success("Download Complete!", { id: "pdf-toast" });
    }).catch(err => {
      console.error(err);
      toast.error("Failed to generate PDF", { id: "pdf-toast" });
    });
  };

  const months = [
    { value: "1", label: "January" }, { value: "2", label: "February" },
    { value: "3", label: "March" }, { value: "4", label: "April" },
    { value: "5", label: "May" }, { value: "6", label: "June" },
    { value: "7", label: "July" }, { value: "8", label: "August" },
    { value: "9", label: "September" }, { value: "10", label: "October" },
    { value: "11", label: "November" }, { value: "12", label: "December" }
  ];

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-2xl font-bold">Financial Reports</h2>
        <p className="text-muted">Generate and view your monthly summaries</p>
      </div>

      <div className="card glass mb-4" style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Customer Name</label>
          <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} style={{ width: '200px' }}>
            <option value="">-- Select Customer --</option>
            {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Month</label>
          <select value={month} onChange={(e) => setMonth(e.target.value)} style={{ width: '160px' }}>
            <option value="">-- Select Month --</option>
            {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        
        <div>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Year</label>
          <input 
            type="number" 
            value={year} 
            onChange={(e) => setYear(e.target.value)} 
            style={{ width: '120px' }}
          />
        </div>

        <button className="btn-primary" onClick={fetchReport} disabled={loading} style={{ height: '40px', padding: '0 24px' }}>
          {loading ? 'Crunching numbers...' : 'Generate Report'}
        </button>
      </div>

      {customerBills && (
        <div className="card glass">
          <h3 className="mb-4">
            Bills for {customers.find(c => c._id === customerId)?.name} - {months.find(m => m.value === month)?.label} {year}
          </h3>
          {customerBills.length === 0 ? (
            <p className="text-muted text-center py-4">No bills found for this customer in {months.find(m => m.value === month)?.label} {year}.</p>
          ) : (
            <div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Invoice ID</th>
                      <th>Date</th>
                      <th>Items</th>
                      <th style={{ textAlign: 'right' }}>Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerBills.map(b => (
                      <tr key={b._id}>
                        <td><span style={{ fontWeight: 600 }}>{b.invoiceNumber || `#${b._id.slice(-6).toUpperCase()}`}</span></td>
                        <td>{new Date(b.date).toLocaleDateString()}</td>
                        <td>{b.items?.map(i => `${i.name} (x${i.quantity})`).join(', ') || 'No items'}</td>
                        <td style={{ textAlign: 'right', fontWeight: 500 }}>₹{(b.totalAmount || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: 'var(--bg-color)', borderTop: '2px solid var(--primary)' }}>
                      <td colSpan="3" style={{ textAlign: 'right', fontWeight: 700, fontSize: '16px' }}>Grand Total:</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '18px', color: 'var(--primary)' }}>
                        ₹{customerBills.reduce((sum, b) => sum + (b.totalAmount || 0), 0).toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button className="btn-primary" onClick={handleDownload} style={{ background: '#0f172a' }}>
                  📥 Download Report
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
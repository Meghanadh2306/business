import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";
import toast from "react-hot-toast";
import html2pdf from "html2pdf.js";
import html2canvas from "html2canvas";
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
  const [selectedBillIds, setSelectedBillIds] = useState([]);
  const [sharing, setSharing] = useState(false);
  const isSharingRef = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [billsRes, customerRes] = await Promise.all([
          API.get(`/bills/customer/${id}`).catch(() => ({ data: [] })),
          API.get(`/customers/${id}`).catch(() => ({ data: null }))
        ]);
        setBills(billsRes.data || []);
        setCustomer(customerRes.data || { name: 'Customer', phone: '' });
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

  // Multi-select helpers
  const isAllSelected = filteredBills.length > 0 && selectedBillIds.length === filteredBills.length;
  const isSomeSelected = selectedBillIds.length > 0 && selectedBillIds.length < filteredBills.length;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedBillIds([]);
    } else {
      setSelectedBillIds(filteredBills.map(b => b._id));
    }
  };

  const handleToggleBill = (billId) => {
    setSelectedBillIds(prev =>
      prev.includes(billId) ? prev.filter(id => id !== billId) : [...prev, billId]
    );
  };

  const clearSelection = () => {
    setSelectedBillIds([]);
  };

  const selectedBills = filteredBills.filter(b => selectedBillIds.includes(b._id));
  const selectedTotal = selectedBills.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custAddress, setCustAddress] = useState("");

  const openCustomerEdit = () => {
    setCustName(customer?.name || "");
    setCustPhone(customer?.phone || "");
    setCustAddress(customer?.address || "");
    setIsEditingCustomer(true);
  };

  const handleUpdateCustomer = async (e) => {
    e.preventDefault();
    if (!custName) return toast.error("Customer name is required");

    try {
      const res = await API.put(`/customers/${id}`, {
        name: custName,
        phone: custPhone,
        address: custAddress
      });
      setCustomer(res.data);
      setIsEditingCustomer(false);
      toast.success("Customer details updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update customer");
    }
  };

  const handleDelete = async (billId) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        await API.delete(`/bills/${billId}`);
        setBills(bills.filter(b => b._id !== billId));
        setSelectedBillIds(prev => prev.filter(id => id !== billId));
        toast.success("Bill deleted successfully");
      } catch (err) {
        console.error("Error deleting bill:", err);
        toast.error("Failed to delete bill");
      }
    }
  };

  // Generate Image Blob for a single bill (Individual Cash Bill format)
  const generateSingleBillImageBlob = async (bill) => {
    if (!bill) return null;

    const shareCardHtml = `
      <div id="share-invoice-card" style="box-sizing: border-box; width: 760px; background: #ffffff; font-family: Arial, sans-serif; padding: 25px; color: #000;">
        <style>
          #share-invoice-card * { box-sizing: border-box; }
          #share-invoice-card table { width: 100%; border-collapse: collapse; border: 2px solid #000; margin-bottom: 12px; }
          #share-invoice-card th, #share-invoice-card td { border: 1px solid #000; padding: 7px 8px; font-size: 14px; }
          #share-invoice-card th { text-align: center; font-weight: bold; background-color: #f8f9fa; }
        </style>
        <div style="border: 1px solid #000; outline: 2px solid #000; outline-offset: -4px; padding: 20px 22px;">
          <!-- Top Header -->
          <div style="display: flex; justify-content: space-between; align-items: center; font-weight: bold; font-size: 15px; margin-bottom: 6px;">
            <span>No. ${bill.invoiceNumber ? bill.invoiceNumber.replace('INV-', '') : (bill._id ? bill._id.slice(-6).toUpperCase() : '')}</span>
            <span style="text-decoration: underline; font-style: italic;">Cash Bill</span>
            <span>Date: ${bill.date ? new Date(bill.date).toLocaleDateString() : new Date().toLocaleDateString()}</span>
          </div>
          
          <!-- Parlor Info -->
          <div style="text-align: center; margin-bottom: 14px;">
            <h1 style="margin: 0; font-size: 30px; letter-spacing: 1px; font-family: 'Times New Roman', Times, serif;">${parlorTitle1}</h1>
            <h2 style="margin: 4px 0 0 0; font-size: 24px; font-family: 'Times New Roman', Times, serif;">${parlorTitle2}</h2>
            <p style="margin: 3px 0; font-size: 14px;">Ramchandra Rao Peta, ELURU -534002</p>
            <p style="margin: 3px 0; font-size: 14px;">Cell : 8309471669, 9848377920</p>
          </div>

          <!-- Customer Info -->
          <div style="margin-bottom: 14px; line-height: 1.6; background: #fafafa; border: 1px solid #eee; padding: 8px 12px; border-radius: 4px;">
            <div style="display: flex; align-items: flex-end; margin-bottom: 4px;">
              <span style="font-weight: bold; margin-right: 8px; font-size: 15px; min-width: 85px;">Customer:</span>
              <span style="flex: 1; border-bottom: 1px dotted #666; font-family: 'Times New Roman', Times, serif; font-size: 17px; font-weight: bold; color: #111;">${(customer?.name && customer.name !== 'N/A') ? customer.name : ''}</span>
            </div>
            <div style="display: flex; align-items: flex-end; margin-bottom: 4px;">
              <span style="font-weight: bold; margin-right: 8px; font-size: 15px; min-width: 85px;">Mobile No:</span>
              <span style="flex: 1; border-bottom: 1px dotted #666; font-family: 'Times New Roman', Times, serif; font-size: 16px; color: #111;">${(customer?.phone && customer.phone !== 'N/A') ? customer.phone : ''}</span>
            </div>
            <div style="display: flex; align-items: flex-end;">
              <span style="font-weight: bold; margin-right: 8px; font-size: 15px; min-width: 85px;">Address:</span>
              <span style="flex: 1; border-bottom: 1px dotted #666; font-family: 'Times New Roman', Times, serif; font-size: 15px; color: #333;">${(customer?.address && customer.address !== 'N/A') ? customer.address : ''}</span>
            </div>
          </div>

          <!-- Bill Table -->
          <table>
            <thead>
              <tr>
                <th style="width: 6%;">S.No</th>
                <th style="width: 54%; text-align: left; padding-left: 10px;">Order Particulars</th>
                <th style="width: 10%;">Qty</th>
                <th style="width: 12%;">Rate</th>
                <th style="width: 18%; text-align: right; padding-right: 10px;">Amount Rs.</th>
              </tr>
            </thead>
            <tbody>
              ${bill.items?.map((item, index) => `
                <tr>
                  <td style="text-align: center; font-weight: bold;">${index + 1}</td>
                  <td style="font-family: 'Times New Roman', Times, serif; font-size: 16px; padding-left: 10px;">${item.name || ''}</td>
                  <td style="text-align: center; font-family: 'Times New Roman', Times, serif; font-size: 16px;">${item.quantity || ''}</td>
                  <td style="text-align: center; font-family: 'Times New Roman', Times, serif; font-size: 16px;">${item.price || ''}</td>
                  <td style="text-align: right; font-family: 'Times New Roman', Times, serif; font-size: 16px; padding-right: 10px;">${((item.quantity || 0) * (item.price || 0)) || ''}</td>
                </tr>
              `).join('') || ''}
              <tr><td style="height: 24px;"></td><td></td><td></td><td></td><td></td></tr>
              <tr style="border-top: 2px solid #000; font-weight: bold; background-color: #f9f9f9;">
                <td colspan="4" style="text-align: center; font-size: 16px;">TOTAL</td>
                <td style="text-align: right; font-family: 'Times New Roman', Times, serif; font-size: 18px; padding-right: 10px;">₹${(bill.totalAmount || 0).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <!-- Instructions and Signatures -->
          <div style="border: 2px solid #000; border-top: none; padding: 10px 18px 16px 18px; margin-top: -2px;">
            <div style="text-align: center; margin-bottom: 8px;">
              <span style="background-color: #000; color: #fff; padding: 3px 18px; border-radius: 20px; font-weight: bold; display: inline-block; font-size: 14px;">Instructions to be Followed</span>
            </div>
            <ol style="list-style-type: decimal; margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.5;">
              <li>Paid amount is not refundable</li>
              <li>Advance to be paid for Milk Cans</li>
              <li>Ordered Milk cannot be taken back under any circumstances</li>
            </ol>
            
            <div style="display: flex; justify-content: space-between; margin-top: 32px; font-weight: bold; font-style: italic; font-family: 'Times New Roman', Times, serif; font-size: 17px;">
              <span>Customer Signature</span>
              <span>Authorized Signature</span>
            </div>
          </div>
        </div>
      </div>
    `;

    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'position: fixed; top: -99999px; left: -99999px; width: 800px; background: #ffffff; z-index: -9999; padding: 20px; box-sizing: border-box;';
    wrapper.innerHTML = shareCardHtml;
    document.body.appendChild(wrapper);

    try {
      const cardElement = wrapper.querySelector('#share-invoice-card') || wrapper.firstElementChild;
      const canvas = await html2canvas(cardElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: 760,
        windowWidth: 1200,
      });

      if (document.body.contains(wrapper)) {
        document.body.removeChild(wrapper);
      }

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (!blob) { resolve(null); return; }
          const rawNum = bill.invoiceNumber ? bill.invoiceNumber.replace('INV-', '') : (bill._id ? bill._id.slice(-6).toUpperCase() : 'Bill');
          const filename = `Bill_${rawNum.replace(/[^a-zA-Z0-9_-]/g, '_')}.png`;
          const file = new File([blob], filename, { type: 'image/png' });
          resolve({ blob, file, filename, bill });
        }, 'image/png');
      });
    } catch (err) {
      console.error('html2canvas generation failed', err);
      if (document.body.contains(wrapper)) {
        document.body.removeChild(wrapper);
      }
      return null;
    }
  };

  // Helper to sequentially download multiple generated files
  const downloadGeneratedFiles = async (results) => {
    for (let i = 0; i < results.length; i++) {
      const { blob, filename } = results[i];
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      if (i < results.length - 1) {
        await new Promise(r => setTimeout(r, 250));
      }
    }
    toast.success(results.length === 1 ? "Bill image downloaded!" : `Downloaded all ${results.length} bill images!`);
  };

  // Handle sharing one or multiple bills without mixing them into a single image
  const handleShareBills = async (billsToShare) => {
    if (!billsToShare || billsToShare.length === 0) {
      toast.error("Please select at least one bill to share");
      return;
    }
    if (isSharingRef.current) return;
    isSharingRef.current = true;
    setSharing(true);

    const totalCount = billsToShare.length;
    const toastId = toast.loading(
      totalCount > 1
        ? `Generating bill images (1/${totalCount})...`
        : "Generating bill image..."
    );

    try {
      const generatedResults = [];
      for (let i = 0; i < totalCount; i++) {
        if (totalCount > 1) {
          toast.loading(`Generating bill image (${i + 1}/${totalCount})...`, { id: toastId });
        }
        const itemResult = await generateSingleBillImageBlob(billsToShare[i]);
        if (itemResult) {
          generatedResults.push(itemResult);
        }
      }

      if (generatedResults.length === 0) {
        toast.error("Failed to generate bill images", { id: toastId });
        return;
      }

      toast.dismiss(toastId);

      const files = generatedResults.map(r => r.file);
      const title = totalCount === 1
        ? `Invoice #${billsToShare[0].invoiceNumber || billsToShare[0]._id.slice(-6).toUpperCase()}`
        : `${totalCount} Orders - ${customer?.name || 'Customer'}`;

      // Web Share API (mobile devices, WhatsApp, etc.)
      if (typeof navigator !== 'undefined' && navigator.share) {
        let shared = false;

        // Try sharing all separate image files together
        if (files.length > 0 && typeof navigator.canShare === 'function') {
          try {
            if (navigator.canShare({ files })) {
              await navigator.share({
                files,
                title,
              });
              shared = true;
            }
          } catch (fileErr) {
            if (fileErr.name === 'AbortError') {
              shared = true; // User cancelled share sheet
            } else {
              console.error('Multi-file share failed, attempting fallback:', fileErr);
            }
          }
        }

        // If multi-file share was not supported by browser/platform, but it is single file:
        if (!shared && files.length === 1 && typeof navigator.canShare === 'function') {
          try {
            if (navigator.canShare({ files: [files[0]] })) {
              await navigator.share({
                files: [files[0]],
                title,
              });
              shared = true;
            }
          } catch (singleErr) {
            if (singleErr.name === 'AbortError') {
              shared = true;
            }
          }
        }

        if (!shared) {
          // If native share sheet failed to share files, download each separate image
          await downloadGeneratedFiles(generatedResults);
        }
      } else {
        // Desktop / non-share browser
        if (generatedResults.length === 1) {
          try {
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': generatedResults[0].blob })]);
            toast.success("Bill image copied to clipboard!");
          } catch {
            await downloadGeneratedFiles(generatedResults);
          }
        } else {
          await downloadGeneratedFiles(generatedResults);
        }
      }
    } catch (e) {
      console.error('Share error:', e);
      toast.error('Failed to share bill images', { id: toastId });
    } finally {
      isSharingRef.current = false;
      setSharing(false);
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
      margin: 0.2,
      filename: `${invoiceNumber.replace('#', '')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
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
          <div className="card glass" style={{ gridColumn: 'span 1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p className="text-muted text-sm">Contact Info</p>
                <button
                  onClick={openCustomerEdit}
                  style={{
                    background: "var(--bg-color)",
                    color: "var(--primary)",
                    border: "1px solid var(--primary)",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "11px",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                  title="Edit customer details"
                >
                  ✏️ Edit Customer
                </button>
              </div>
              {customer.phone && customer.phone !== 'N/A' && <p className="mt-3" style={{ fontWeight: 600 }}>📞 {customer.phone}</p>}
              {customer.address && <p style={{ fontWeight: 500, color: 'var(--text-muted)', marginTop: '4px' }}>📍 {customer.address}</p>}
            </div>
          </div>
        )}
      </div>

      {/* Edit Customer Modal */}
      {isEditingCustomer && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="card glass" style={{ width: '100%', maxWidth: '440px', background: 'var(--card-bg, #fff)', padding: '24px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginBottom: '16px' }}>✏️ Edit Customer Details</h3>
            <form onSubmit={handleUpdateCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Customer Name *</label>
                <input
                  value={custName}
                  onChange={e => setCustName(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-main)' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Phone Number</label>
                <input
                  value={custPhone}
                  onChange={e => setCustPhone(e.target.value)}
                  placeholder="e.g. 9848377920"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-main)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Address</label>
                <input
                  value={custAddress}
                  onChange={e => setCustAddress(e.target.value)}
                  placeholder="e.g. Ramchandra Rao Peta, Eluru"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-main)' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Save Changes</button>
                <button
                  type="button"
                  onClick={() => setIsEditingCustomer(false)}
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
            </form>
          </div>
        </div>
      )}

      {/* Multi-Select Floating / Sticky Action Bar */}
      {selectedBillIds.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.12), rgba(16, 185, 129, 0.18))',
          border: '1px solid #25D366',
          borderRadius: '10px',
          padding: '12px 20px',
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-main)' }}>
              ✓ {selectedBillIds.length} {selectedBillIds.length === 1 ? 'bill' : 'bills'} selected
            </span>
            <span style={{
              background: '#25D366',
              color: '#fff',
              padding: '2px 10px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 700
            }}>
              ₹{selectedTotal.toLocaleString()}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={() => handleShareBills(selectedBills)}
              disabled={sharing}
              style={{
                background: '#25D366',
                color: '#fff',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 6px rgba(37, 211, 102, 0.4)'
              }}
            >
              {sharing ? '⏳ Generating Image...' : `📤 Share Selected (${selectedBillIds.length})`}
            </button>
            <button
              onClick={clearSelection}
              style={{
                background: 'transparent',
                color: 'var(--text-muted)',
                border: '1px solid var(--border-color)',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      <div className="card glass">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ margin: 0 }}>Order History</h3>
          {filteredBills.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={handleToggleSelectAll}
                style={{
                  background: isAllSelected ? '#25D366' : 'var(--bg-color)',
                  color: isAllSelected ? '#fff' : 'var(--text-main)',
                  border: isAllSelected ? '1px solid #25D366' : '1px solid var(--border-color)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {isAllSelected ? '✓ Deselect All' : 'Select All Bills'}
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <p className="text-muted text-center py-4">Loading history...</p>
        ) : bills.length === 0 ? (
          <p className="text-muted text-center py-4">No order history available for this customer.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={input => {
                        if (input) input.indeterminate = isSomeSelected;
                      }}
                      onChange={handleToggleSelectAll}
                      style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                      title="Select all bills"
                    />
                  </th>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total Amount</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.map(b => {
                  const isSelected = selectedBillIds.includes(b._id);
                  return (
                    <tr
                      key={b._id}
                      style={{
                        backgroundColor: isSelected ? 'rgba(37, 211, 102, 0.08)' : undefined,
                        transition: 'background-color 0.15s ease'
                      }}
                    >
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleBill(b._id)}
                          style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                          title={`Select bill ${b.invoiceNumber || b._id}`}
                        />
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {b.invoiceNumber || `#${b._id.slice(-6).toUpperCase()}`}
                          {b.generatedBy && (
                            <span style={{
                              fontSize: '10px',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: b.generatedBy === 'vijaya' ? '#e0e7ff' : '#fce7f3',
                              color: b.generatedBy === 'vijaya' ? '#3730a3' : '#9d174d'
                            }}>
                              {b.generatedBy === 'vijaya' ? 'Vijaya' : 'Omkar'}
                            </span>
                          )}
                        </span>
                      </td>
                      <td>{new Date(b.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                      <td>{b.items?.map(i => `${i.name} (x${i.quantity})`).join(', ') || 'No items'}</td>
                      <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>₹{(b.totalAmount || 0).toLocaleString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <button
                            style={{
                              background: '#25D366',
                              color: '#fff',
                              border: 'none',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            disabled={sharing}
                            onClick={() => handleShareBills([b])}
                            title="Share this bill as image"
                          >
                            📤 Share
                          </button>
                          <button
                            style={{
                              background: "var(--bg-color)",
                              color: "var(--primary)",
                              border: "1px solid var(--primary)",
                              padding: "6px 10px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: 600,
                              cursor: "pointer"
                            }}
                            onClick={() => navigate(`/create?edit=${b._id}`, { state: { bill: { ...b, customerId: b.customerId?._id || b.customerId || customer?._id || id } } })}
                            title="Edit this invoice"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            style={{
                              background: "var(--bg-color)",
                              color: "var(--primary)",
                              border: "1px solid var(--primary)",
                              padding: "6px 10px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: 600,
                              cursor: "pointer"
                            }}
                            onClick={() => handleDownload(b)}
                            title="Download PDF"
                          >
                            Download
                          </button>
                          <button
                            style={{
                              background: "var(--bg-color)",
                              color: "#ef4444",
                              border: "1px solid #ef4444",
                              padding: "6px 10px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: 600,
                              cursor: "pointer"
                            }}
                            onClick={() => handleDelete(b._id)}
                            title="Delete Bill"
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
        )}
      </div>
    </div>
  );
}
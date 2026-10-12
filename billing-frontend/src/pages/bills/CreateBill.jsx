import { useEffect, useState, useRef, useMemo } from "react";
import API from "../../services/api";
import toast from "react-hot-toast";
import html2pdf from "html2pdf.js";
import html2canvas from "html2canvas";
import { useNavigate, useSearchParams, useParams, useLocation } from "react-router-dom";
import Select from "react-select";
import { useAuth } from "../../context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { formatDate } from "../../utils/dateUtils";

export default function CreateBill() {
  const { username } = useAuth();
  const isVijaya = username === "vijaya";
  
  const parlorTitle1 = isVijaya ? "VIJAYA" : "OMKAR";
  const parlorTitle2 = isVijaya ? "DAIRY PARLOUR" : "SAI TIRUMALA DAIRY PARLOR";
  
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([{ productId: "", name: "", quantity: "", price: "" }]);
  const [customerId, setCustomerId] = useState("");
  const [billDate, setBillDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [sharingImage, setSharingImage] = useState(false);
  const isSharingRef = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { id: paramBillId } = useParams();
  const editBillId = paramBillId || searchParams.get("edit");
  const [existingBillNumber, setExistingBillNumber] = useState("");
  const [loadingBill, setLoadingBill] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    let isMounted = true;

    const populateBillData = (b, availableProducts = []) => {
      if (!b) return;
      if (b.customerId) {
        setCustomerId(typeof b.customerId === 'object' ? (b.customerId._id || '') : b.customerId);
      }
      if (b.date) {
        setBillDate(new Date(b.date).toISOString().split('T')[0]);
      }
      if (b.invoiceNumber) {
        setExistingBillNumber(b.invoiceNumber);
      }
      if (b.items && b.items.length > 0) {
        setItems(b.items.map(i => {
          const prodId = typeof i.productId === 'object' ? i.productId?._id : (i.productId || "");
          const matched = availableProducts.find(p => p._id === prodId || p.name.toLowerCase() === (i.name || '').toLowerCase());
          return {
            productId: matched ? matched._id : (prodId || ""),
            name: i.name || (matched ? matched.name : ""),
            quantity: i.quantity ?? "",
            price: i.price ?? ""
          };
        }));
      }
    };

    const fetchData = async () => {
      try {
        const [cRes, pRes] = await Promise.all([
          API.get("/customers").catch(() => ({ data: [] })),
          API.get("/products").catch(() => ({ data: [] }))
        ]);
        if (!isMounted) return;
        const fetchedCustomers = cRes.data || [];
        const fetchedProducts = pRes.data || [];
        setCustomers(fetchedCustomers);
        setProducts(fetchedProducts);

        if (editBillId) {
          // If bill was passed via navigation state, load it immediately
          if (location.state?.bill) {
            populateBillData(location.state.bill, fetchedProducts);
          } else {
            setLoadingBill(true);
            try {
              let b = null;
              try {
                const bRes = await API.get(`/bills/${editBillId}`);
                b = bRes.data;
              } catch {
                // Fallback: search in all bills
                const allRes = await API.get('/bills');
                b = (allRes.data || []).find(item => item._id === editBillId);
              }

              if (b && isMounted) {
                populateBillData(b, fetchedProducts);
              } else if (!b && isMounted) {
                toast.error("Invoice details not found");
              }
            } catch (bErr) {
              console.error("Error loading bill details", bErr);
              toast.error("Failed to load invoice details");
            } finally {
              if (isMounted) setLoadingBill(false);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load initial data", err);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [editBillId, location.state]);

  const addItem = () => {
    setItems([...items, { productId: "", name: "", quantity: "", price: "" }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
    }
  };

  const updateItem = (i, field, value) => {
    const newItems = [...items];

    if (field === "productId") {
      // 🚨 check duplicate
      const alreadyExists = newItems.some(
        (item, index) => item.productId === value && index !== i
      );

      if (alreadyExists) {
        const existingIndex = newItems.findIndex(
          (item, index) => item.productId === value && index !== i
        );

        newItems[existingIndex].quantity =
          Math.max(1, Number(newItems[existingIndex].quantity || 0) + 1);

        // 🔥 OPTIONAL: set price if empty
        if (!newItems[existingIndex].price) {
          const product = products.find(p => p._id === value);
          newItems[existingIndex].price = product?.price || "";
        }

        setItems(newItems.filter((_, index) => index !== i));

        toast.success("Quantity updated instead of duplicate");
        return;
      }

      const product = products.find(p => p._id === value);

      newItems[i] = {
        ...newItems[i],
        productId: value,
        name: product?.name || ""
      };
    } else {
      newItems[i][field] = value;
    }

    setItems(newItems);
  };

  const subtotal = items.reduce((sum, i) => sum + (i.quantity || 0) * (i.price || 0), 0);
  const tax = 0;
  const total = subtotal;

  const submitBill = async () => {
    if (!customerId) return toast.error("Please select a customer");
    if (items.some(i => i.quantity === "")) {
      return toast.error("Please enter quantity for all items");
    }
    if (items.some(i => i.price === "")) {
      return toast.error("Please enter price for all items");
    }
    const validItems = items.filter(
      i =>
        i.productId &&
        i.quantity !== "" &&
        i.quantity > 0 &&
        i.price !== "" &&
        i.price > 0
    );
    if (validItems.length === 0) return toast.error("Please add at least one valid item");

    setLoading(true);
    try {
      if (editBillId) {
        try {
          await API.put(`/bills/${editBillId}`, {
            customerId,
            items: validItems,
            subtotal,
            tax,
            discount: 0,
            totalAmount: total,
            date: billDate ? new Date(billDate) : new Date()
          });
          toast.success("Bill Updated Successfully!");
          setTimeout(() => navigate(-1), 800);
        } catch (putErr) {
          if (putErr.response?.status === 404) {
            await API.delete(`/bills/${editBillId}`);
            await API.post("/bills", {
              customerId,
              items: validItems,
              subtotal,
              tax,
              discount: 0,
              totalAmount: total,
              date: billDate ? new Date(billDate) : new Date()
            });
            toast.success("Bill Updated Successfully!");
            setTimeout(() => navigate(-1), 800);
          } else {
            throw putErr;
          }
        }
      } else {
        await API.post("/bills", {
          customerId,
          items: validItems,
          subtotal,
          tax,
          discount: 0,
          totalAmount: total,
          date: billDate ? new Date(billDate) : new Date()
        });
        queryClient.invalidateQueries({ queryKey: ["bills"] });
        queryClient.invalidateQueries({ queryKey: ["customer-bills"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard-data"] });
        toast.success("Bill Created Successfully!");
        setTimeout(() => navigate("/bills"), 1000);
      }
    } catch (err) {
      console.error(err);
      toast.error(editBillId ? "Failed to update bill" : "Failed to create bill");
    }
    setLoading(false);
  };

  const handleDownloadDraft = () => {
    if (!customerId) return toast.error("Please select a customer first");
    const validItems = items.filter(
      i =>
        i.productId &&
        i.quantity !== "" &&
        i.quantity > 0 &&
        i.price !== "" &&
        i.price > 0
    );
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
            <span>Date: ${formatDate(billDate || new Date())}</span>
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

  // Generate invoice image blob for sharing (similar to pocketops)
  const generateInvoiceImageBlob = async () => {
    if (!customerId) return null;
    const validItems = items.filter(
      i => i.productId && i.quantity !== "" && i.quantity > 0 && i.price !== "" && i.price > 0
    );
    if (validItems.length === 0) return null;

    const customer = customers.find(c => c._id === customerId);
    const dateStr = formatDate(billDate || new Date());

    const shareCardHtml = `
      <div id="share-invoice-card" style="box-sizing: border-box; width: 760px; background: #ffffff; font-family: Arial, sans-serif; padding: 30px; color: #000;">
        <style>
          #share-invoice-card * { box-sizing: border-box; }
          #share-invoice-card table { width: 100%; border-collapse: collapse; border: 2px solid #000; }
          #share-invoice-card th, #share-invoice-card td { border: 1px solid #000; padding: 8px; }
          #share-invoice-card th { text-align: center; font-weight: bold; font-size: 15px; }
        </style>
        <div style="border: 1px solid #000; outline: 2px solid #000; outline-offset: -4px; padding: 20px 25px;">
          <div style="display: flex; justify-content: space-between; align-items: center; font-weight: bold; font-size: 16px; margin-bottom: 5px;">
            <span>No. DRAFT</span>
            <span style="text-decoration: underline; font-style: italic;">Cash Bill</span>
            <span>Date: ${dateStr}</span>
          </div>
          <div style="text-align: center; margin-bottom: 15px;">
            <h1 style="margin: 0; font-size: 32px; letter-spacing: 1px; font-family: 'Times New Roman', Times, serif;">${parlorTitle1}</h1>
            <h2 style="margin: 5px 0 0 0; font-size: 26px; font-family: 'Times New Roman', Times, serif;">${parlorTitle2}</h2>
            <p style="margin: 4px 0; font-size: 15px;">Ramchandra Rao Peta, ELURU -534002</p>
            <p style="margin: 4px 0; font-size: 15px;">Cell : 8309471669, 9848377920</p>
          </div>
          <div style="margin-bottom: 15px; line-height: 1.8;">
            <div style="display: flex; align-items: flex-end; margin-bottom: 8px;">
              <span style="font-weight: bold; margin-right: 8px; font-size: 16px;">Name.</span>
              <span style="flex: 1; border-bottom: 1px dotted #000; font-family: 'Times New Roman', Times, serif; font-size: 18px; font-style: italic; color: #111; padding-left: 10px;">${customer?.name || ''}</span>
            </div>
            <div style="display: flex; align-items: flex-end; margin-bottom: 8px;">
              <span style="font-weight: bold; margin-right: 8px; font-size: 16px;">Mobile No.</span>
              <span style="flex: 1; border-bottom: 1px dotted #000; font-family: 'Times New Roman', Times, serif; font-size: 18px; font-style: italic; color: #111; padding-left: 10px;">${customer?.phone || ''}</span>
            </div>
            <div style="display: flex; align-items: flex-end; margin-bottom: 8px;">
              <span style="font-weight: bold; margin-right: 8px; font-size: 16px;">Address.</span>
              <span style="flex: 1; border-bottom: 1px dotted #000; font-family: 'Times New Roman', Times, serif; font-size: 18px; font-style: italic; color: #111; padding-left: 10px;">${customer?.address || ''}</span>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 5%; text-align: center;">S.<br>No.</th>
                <th style="width: 55%;">Order Particulars</th>
                <th style="width: 10%; text-align: center;">Qty</th>
                <th style="width: 10%; text-align: center;">Rate</th>
                <th style="width: 20%; text-align: right;">Amount<br>Rs.</th>
              </tr>
            </thead>
            <tbody>
              ${validItems.map((item, index) => `
                <tr>
                  <td style="text-align: center; font-weight: bold;">${index + 1}</td>
                  <td style="font-family: 'Times New Roman', Times, serif; font-size: 18px;">${item.name || ''}</td>
                  <td style="text-align: center; font-family: 'Times New Roman', Times, serif; font-size: 18px;">${item.quantity || ''}</td>
                  <td style="text-align: center; font-family: 'Times New Roman', Times, serif; font-size: 18px;">${item.price || ''}</td>
                  <td style="text-align: right; font-family: 'Times New Roman', Times, serif; font-size: 18px;">${(item.quantity * item.price) || ''}</td>
                </tr>
              `).join('')}
              <tr><td style="height: 30px;"></td><td></td><td></td><td></td><td></td></tr>
              <tr style="border-top: 2px solid #000;">
                <td colspan="4" style="text-align: center; font-weight: bold;">TOTAL</td>
                <td style="text-align: right; font-weight: bold; font-family: 'Times New Roman', Times, serif; font-size: 18px;">${total}</td>
              </tr>
            </tbody>
          </table>
          <div style="border: 2px solid #000; border-top: none; padding: 10px 20px 20px 20px;">
            <div style="text-align: center; margin-bottom: 10px;">
              <span style="background-color: #000; color: #fff; padding: 4px 20px; border-radius: 20px; font-weight: bold; display: inline-block; font-size: 15px;">Instructions to be Followed</span>
            </div>
            <ol style="list-style-type: decimal; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
              <li>Paid amount is not refundable</li>
              <li>Advance to be paid for Milk Cans</li>
              <li>Ordered Milk cannot be taken back under any circumtances</li>
            </ol>
            <div style="display: flex; justify-content: space-between; margin-top: 40px; font-weight: bold; font-style: italic; font-family: 'Times New Roman', Times, serif; font-size: 18px;">
              <span>Customer Signature</span>
              <span>Signature</span>
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
          const filename = `Draft_Invoice.png`;
          const file = new File([blob], filename, { type: 'image/png' });
          resolve({ blob, file });
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

  // Share invoice as image
  const handleShare = async () => {
    if (!customerId) return toast.error('Please select a customer first');
    const validItems = items.filter(
      i => i.productId && i.quantity !== "" && i.quantity > 0 && i.price !== "" && i.price > 0
    );
    if (validItems.length === 0) return toast.error('Please add at least one valid item');
    if (isSharingRef.current) return;
    isSharingRef.current = true;
    setSharingImage(true);

    try {
      const customer = customers.find(c => c._id === customerId);
      const res = await generateInvoiceImageBlob();
      if (!res) {
        toast.error('Failed to generate invoice image');
        return;
      }

      const { blob, file } = res;
      const msg = `${parlorTitle1} ${parlorTitle2}\n\nDate: ${formatDate(billDate || new Date())}\nCustomer: ${customer?.name || ''}\nTotal: ₹${total.toLocaleString()}`;

      // Try Web Share API (works on mobile)
      if (typeof navigator !== 'undefined' && navigator.share) {
        let shared = false;

        // Try native file sharing first
        if (file && typeof navigator.canShare === 'function') {
          try {
            if (navigator.canShare({ files: [file] })) {
              await navigator.share({
                files: [new File([blob], 'Draft_Invoice.png', { type: 'image/png', lastModified: Date.now() })],
                title: 'Draft Invoice',
              });
              shared = true;
            }
          } catch (fileErr) {
            if (fileErr.name === 'AbortError') {
              shared = true; // User cancelled
            } else {
              console.error('File share failed, falling back:', fileErr);
            }
          }
        }

        // Fallback to text share
        if (!shared) {
          try {
            await navigator.share({ title: 'Draft Invoice', text: msg });
          } catch (textErr) {
            if (textErr.name !== 'AbortError') {
              console.error('Text share failed:', textErr);
            }
          }
        }
      } else {
        // Desktop: copy image to clipboard or download
        if (blob) {
          try {
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            toast.success('Invoice image copied to clipboard!');
          } catch {
            // Fallback: download the image
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Draft_Invoice.png';
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Invoice image downloaded!');
          }
        }
      }
    } catch (e) {
      console.error('Share error:', e);
      toast.error('Failed to share invoice');
    } finally {
      isSharingRef.current = false;
      setSharingImage(false);
    }
  };
  const productOptions = useMemo(() =>
    products.map(p => ({
      value: p._id,
      label: items.some(item => item.productId === p._id)
        ? `${p.name} (Added)`
        : p.name,
      isDisabled: items.some(item => item.productId === p._id)
    })),
    [products, items]);

  return (
    <div>
      {editBillId && (
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 500 }}
        >
          ← Back to Invoice
        </button>
      )}

      <div className="flex justify-between items-center mb-4" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 className="text-2xl font-bold">
            {editBillId ? `Edit Invoice ${existingBillNumber ? `#${existingBillNumber.replace('INV-', '')}` : ''}` : "New Dairy Bill"}
          </h2>
          <p className="text-muted">
            {editBillId ? "Modify items, prices, quantities, customer, or billing date." : `Generate a new invoice for ${parlorTitle1} ${parlorTitle2}.`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={handleShare} disabled={sharingImage} style={{ background: '#25D366', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {sharingImage ? '⏳ Generating...' : '📤 Share'}
          </button>
          <button className="btn-primary" onClick={handleDownloadDraft} style={{ background: 'var(--primary)', color: '#fff' }}>📥 Download Draft</button>
        </div>
      </div>

      {/* Printable Header - Visible mostly in print styles if we add them, but good for UI too */}
      <div className="card mb-4" style={{ textAlign: 'center', background: 'var(--primary)', color: '#fff', borderRadius: '12px 12px 0 0' }}>
        <h1 style={{ margin: 0, fontSize: '24px', letterSpacing: '1px', color: '#fff' }}>{parlorTitle1} {parlorTitle2}</h1>
        <p style={{ margin: '4px 0 0 0', opacity: 0.9 }}>Fresh Milk, Curd & Daily Dairy Products</p>
      </div>

      <div className="card glass mb-4">
        <h3 className="mb-4" style={{ fontSize: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>Customer Details</h3>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px' }}>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', fontWeight: 500 }}>Select Customer</label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              style={{
                width: '100%',
                maxWidth: '400px',
                background: 'var(--bg-card)',
                color: 'var(--text-color)',
                border: '1px solid var(--border-color)',
                padding: '10px',
                borderRadius: '8px'
              }}
            >
              <option value="">-- Choose Customer --</option>
              {customers.map(c => (
                <option key={c._id} value={c._id}>{c.name} {c.phone ? `(${c.phone})` : ''}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: '0 1 220px' }}>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', fontWeight: 500 }}>Bill Date</label>
            <input
              type="date"
              value={billDate}
              onChange={(e) => setBillDate(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-card)',
                color: 'var(--text-color)',
                border: '1px solid var(--border-color)',
                padding: '10px',
                borderRadius: '8px'
              }}
            />
          </div>
        </div>
      </div>

      <div className="card glass mb-4">
        <div className="flex justify-between items-center mb-4" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ fontSize: '18px' }}>Products</h3>
          <button className="btn-primary" onClick={addItem} style={{ padding: '6px 12px' }}>+ Add Item</button>
        </div>

        <div className="desktop-table">
          <div style={{ overflowX: "auto" }}>
            <table className="data-table" style={{ minWidth: "600px" }}>
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
                  <tr key={i} style={{ background: item.productId ? "var(--bg-color)" : "var(--bg-card)" }}>
                    <td>
                      <Select
                        options={productOptions}
                        value={
                          productOptions.find(opt => opt.value === item.productId) ||
                          (item.name ? { value: item.productId || item.name, label: item.name } : null)
                        }
                        onChange={(selected) =>
                          updateItem(i, "productId", selected ? selected.value : "")
                        }
                        placeholder="Search product..."
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        isClearable
                        styles={{
                          menuPortal: base => ({ ...base, zIndex: 9999 }),
                          control: (base) => ({
                            ...base,
                            backgroundColor: "var(--bg-card)",
                            borderColor: "var(--border-color)",
                            color: "var(--text-color)"
                          }),
                          menu: (base) => ({
                            ...base,
                            backgroundColor: "var(--bg-card)",
                            color: "var(--text-color)"
                          }),
                          singleValue: (base) => ({
                            ...base,
                            color: "var(--text-color)"
                          })
                        }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        placeholder="Enter price"
                        value={item.price}
                        required
                        min="0"
                        onChange={(e) =>
                          updateItem(i, "price", e.target.value === "" ? "" : Number(e.target.value))
                        }
                        style={{
                          background: "var(--bg-card)",
                          color: "var(--text-color)",
                          border: "1px solid var(--border-color)",
                          width: "100%"
                        }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        placeholder="Enter qty"
                        value={item.quantity}
                        required
                        min="1"
                        onChange={(e) =>
                          updateItem(
                            i,
                            "quantity",
                            e.target.value === "" ? "" : Number(e.target.value)
                          )
                        }
                        style={{
                          background: "var(--bg-card)",
                          color: "var(--text-color)",
                          border: "1px solid var(--border-color)",
                          width: "100%"
                        }}
                      />
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      ₹{((item.quantity || 0) * (item.price || 0)).toLocaleString()}
                    </td>
                    <td>
                      <button
                        onClick={() => removeItem(i)}
                        style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: 'none', padding: '8px', borderRadius: '6px' }}
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
        </div>
        <div className="mobile-cards">
          {items.map((item, i) => (
            <div key={i} className="mobile-card">
              <Select
                options={productOptions}
                value={
                  productOptions.find(opt => opt.value === item.productId) ||
                  (item.name ? { value: item.productId || item.name, label: item.name } : null)
                }
                onChange={(selected) =>
                  updateItem(i, "productId", selected ? selected.value : "")
                }
                placeholder="Search product..."
                menuPortalTarget={document.body}
                menuPosition="fixed"
                isClearable
                styles={{
                  menuPortal: base => ({ ...base, zIndex: 9999 }),
                  control: (base) => ({
                    ...base,
                    backgroundColor: "var(--bg-card)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-color)"
                  }),
                  menu: (base) => ({
                    ...base,
                    backgroundColor: "var(--bg-card)",
                    color: "var(--text-color)"
                  }),
                  singleValue: (base) => ({
                    ...base,
                    color: "var(--text-color)"
                  })
                }}
              />

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <input
                  type="number"
                  placeholder="Enter price"
                  value={item.price}
                  required
                  min="0"
                  onChange={(e) =>
                    updateItem(i, "price", e.target.value === "" ? "" : Number(e.target.value))
                  }
                />

                <input
                  type="number"
                  placeholder="Enter qty"
                  value={item.quantity}
                  required
                  min="1"
                  onChange={(e) =>
                    updateItem(
                      i,
                      "quantity",
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                />
              </div>

              <p style={{ fontWeight: "bold" }}>
                ₹{((item.quantity || 0) * (item.price || 0)).toLocaleString()}
              </p>

              <button
                onClick={() => removeItem(i)}
                style={{
                  width: "100%",
                  background: "rgba(239, 68, 68, 0.15)",
                  color: "#ef4444",
                  border: "none",
                  padding: "8px",
                  borderRadius: "6px",
                  fontWeight: "bold"
                }}
              >
                🗑 Remove Item
              </button>
            </div>
          ))}
        </div>
      </div>

      <div
        className="card glass"
        style={{ display: "flex", flexWrap: "wrap", gap: "20px", justifyContent: "space-between", alignItems: 'flex-start' }}>

        <div>
          <p className="text-muted" style={{ fontSize: '14px' }}>Notes</p>
          <textarea
            placeholder="Add any notes here..."
            style={{
              width: '100%', maxWidth: '300px', height: '80px', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)',
              color: 'var(--text-color)', marginTop: '8px', resize: 'none', fontFamily: 'inherit'
            }}
          />
        </div>

        <div style={{ width: '100%', maxWidth: '300px' }}>
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
            style={{
              width: '100%',
              marginTop: '20px',
              padding: '12px',
              fontSize: '16px',
              background: editBillId ? '#0284c7' : undefined
            }}
            onClick={submitBill}
            disabled={loading || loadingBill}
          >
            {loading ? "Processing..." : (editBillId ? "Update Invoice" : "Generate Invoice")}
          </button>
        </div>
      </div>
      <style>
        {`
.mobile-cards { display: none; }

@media (max-width: 768px) {
  .desktop-table { display: none; }
  .mobile-cards { display: block; }

  .mobile-card {
    padding: 12px;
    margin-bottom: 10px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    background: var(--bg-card);
    color: var(--text-color);

  }

  .mobile-card input,
  .mobile-card select {
    width: 100%;
    margin-bottom: 8px;
  }

  .mobile-card button {
    width: 100%;
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
    border: none;
    padding: 8px;
    border-radius: 6px;
  }
}
`}
      </style>
    </div>
  );
}
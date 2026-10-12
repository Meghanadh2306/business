import { useState } from "react";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { formatDate } from "../../utils/dateUtils";
import Pagination from "../../components/ui/Pagination";

export default function BillsList() {
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate();

  // Fetch bills using React Query
  const { data: bills = [], isLoading: loading } = useQuery({
    queryKey: ["bills"],
    queryFn: async () => {
      const res = await API.get("/bills");
      return (res.data || []).sort((a, b) => new Date(b.date) - new Date(a.date));
    },
  });

  // Filter bills
  const filteredBills = bills.filter(bill => {
    const customer = bill.customerId || { name: "", phone: "", address: "" };
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = customer.name?.toLowerCase().includes(term);
      const matchPhone = customer.phone?.toLowerCase().includes(term);
      const matchInv = (bill.invoiceNumber || "").toLowerCase().includes(term);
      if (!matchName && !matchPhone && !matchInv) return false;
    }

    if (!filterMonth && !filterYear) return true;
    const date = new Date(bill.date);
    const m = (date.getMonth() + 1).toString();
    const y = date.getFullYear().toString();

    if (filterMonth && filterMonth !== m) return false;
    if (filterYear && filterYear !== y) return false;
    return true;
  });

  // Group bills by customer name/phone to merge branches visually
  const groupedBills = filteredBills.reduce((groups, bill) => {
    const customer = bill.customerId || { _id: "unknown", name: "Walk-in / Unknown", phone: "", address: "" };
    const groupKey = customer.phone ? customer.phone.trim() : customer.name.trim().toLowerCase();
    
    if (!groups[groupKey]) {
      groups[groupKey] = {
        customer: customer,
        bills: []
      };
    }
    groups[groupKey].bills.push(bill);
    return groups;
  }, {});

  const groupList = Object.values(groupedBills);
  const totalItems = groupList.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const validPage = Math.min(Math.max(currentPage, 1), totalPages);

  const paginatedGroups = groupList.slice((validPage - 1) * pageSize, validPage * pageSize);

  const handleFilterChange = (setter, val) => {
    setter(val);
    setCurrentPage(1);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4" style={{ flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 className="text-2xl font-bold">All Invoices by Customer</h2>
          <p className="text-muted">Manage and view bills grouped under each user profile.</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Search customer, phone, invoice..."
            value={searchTerm}
            onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid var(--border-color)",
              background: "var(--bg-color)",
              color: "var(--text-main)",
              minWidth: "220px",
              fontSize: "13px"
            }}
          />

          <select
            value={filterMonth}
            onChange={e => handleFilterChange(setFilterMonth, e.target.value)}
            style={{ padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--bg-color)", color: "var(--text-main)", fontSize: "13px" }}
          >
            <option value="">All Months</option>
            <option value="1">January</option>
            <option value="2">February</option>
            <option value="3">March</option>
            <option value="4">April</option>
            <option value="5">May</option>
            <option value="6">June</option>
            <option value="7">July</option>
            <option value="8">August</option>
            <option value="9">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
          </select>

          <select
            value={filterYear}
            onChange={e => handleFilterChange(setFilterYear, e.target.value)}
            style={{ padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--bg-color)", color: "var(--text-main)", fontSize: "13px" }}
          >
            <option value="">All Years</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
          </select>

          <button className="btn-primary" onClick={() => navigate("/create")}>+ Create Bill</button>
        </div>
      </div>

      {loading ? (
        <div className="card glass">
          <div style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)" }}>Loading bills with React Query...</div>
        </div>
      ) : groupList.length === 0 ? (
        <div className="card glass">
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            <div style={{ fontSize: "48px", marginBottom: "10px" }}>🧾</div>
            <p>No bills found. Create your first bill!</p>
          </div>
        </div>
      ) : (
        <>
          {paginatedGroups.map(({ customer, bills: customerBills }) => (
            <div 
              key={customer._id || customer.phone || customer.name} 
              className="card glass mb-4" 
              onClick={() => customer._id && customer._id !== "unknown" && navigate(`/customers/${customer._id}`)}
              style={{ cursor: customer._id && customer._id !== "unknown" ? "pointer" : "default", transition: "var(--transition)" }}
              onMouseOver={(e) => { if (customer._id && customer._id !== "unknown") e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseOut={(e) => { if (customer._id && customer._id !== "unknown") e.currentTarget.style.transform = "none"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <h3 style={{ fontSize: "18px", display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <span style={{ fontSize: "20px" }}>👤</span> {customer.name}
                  </h3>
                  {customer.phone && customer.phone !== "N/A" && (
                    <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: "2px 0" }}>📞 {customer.phone}</p>
                  )}
                  {customer.address && customer.address !== "N/A" && (
                    <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: "2px 0" }}>📍 {customer.address}</p>
                  )}
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                    Latest Order: {formatDate(customerBills[0]?.date)}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span className="btn-primary" style={{ background: "var(--bg-color)", color: "var(--text-main)", border: "1px solid var(--border-color)", padding: "6px 12px", fontSize: "14px" }}>
                    {customerBills.length} Orders
                  </span>
                  <span style={{ fontWeight: 700, fontSize: "15px", color: "var(--primary)" }}>
                    ₹{customerBills.reduce((s, b) => s + (b.totalAmount || 0), 0).toLocaleString()}
                  </span>
                  {customer._id && customer._id !== "unknown" && (
                    <span style={{ fontSize: "18px", color: "var(--primary)" }}>
                      →
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

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
        </>
      )}
    </div>
  );
}
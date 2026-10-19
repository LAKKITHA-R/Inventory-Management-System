
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import BillInvoice from "./BillInvoice";
import BASE_URL from "./api";
function Billing() {
  const [bills, setBills] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [billItems, setBillItems] = useState({});
  const [expandedBill, setExpandedBill] = useState(null);
  const [printData, setPrintData] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const invoiceRef = useRef(null);

  const role = localStorage.getItem("role");
  const isAdmin =
    role === "ADMIN" || role === "ROLE_ADMIN";

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
  `${BASE_URL}/api/billing`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBills(
        Array.isArray(response.data) ? response.data : []
      );

      setError("");
    } catch (err) {
      setError("Failed to load billing history.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBillItems = async (billId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${BASE_URL}/api/billing`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBillItems((prev) => ({
        ...prev,
        [billId]: Array.isArray(response.data)
          ? response.data
          : [],
      }));

      setError("");
    } catch (err) {
      console.error(
        "Failed to load purchased products:",
        err
      );

      setBillItems((prev) => ({
        ...prev,
        [billId]: [],
      }));

      setError(
        `Could not load products for bill ${billId}.`
      );
    }
  };

  const toggleBillItems = (billId) => {
    if (expandedBill === billId) {
      setExpandedBill(null);
      return;
    }

    setExpandedBill(billId);

    if (
      !Object.prototype.hasOwnProperty.call(
        billItems,
        billId
      )
    ) {
      fetchBillItems(billId);
    }
  };

  // Export bill as PDF
  const exportBill = async (bill) => {
    try {
      let items = billItems[bill.id];

      if (!items) {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          `${BASE_URL}/api/billing`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        items = Array.isArray(response.data)
          ? response.data
          : [];

        setBillItems((prev) => ({
          ...prev,
          [bill.id]: items,
        }));
      }

      setPrintData({ bill, items });

      await new Promise((resolve) =>
        setTimeout(resolve, 200)
      );

      if (!invoiceRef.current) {
        throw new Error("Invoice element not found.");
      }

      const canvas = await html2canvas(
        invoiceRef.current,
        {
          scale: 2,
          backgroundColor: "#ffffff",
        }
      );

      const pdf = new jsPDF("p", "mm", "a4");
      const width = 190;
      const height =
        (canvas.height * width) / canvas.width;

      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        10,
        10,
        width,
        height
      );

      pdf.save(`Bill-${bill.billNumber}.pdf`);
    } catch (err) {
      console.error(err);
      setError("Failed to export bill.");
    } finally {
      setPrintData(null);
    }
  };

  // Search bills
  const filteredBills = bills.filter((bill) => {
    const query = search.toLowerCase().trim();

    return (
      String(bill.billNumber || "")
        .toLowerCase()
        .includes(query) ||
      String(bill.customerName || "")
        .toLowerCase()
        .includes(query) ||
      String(bill.customerPhone || "")
        .toLowerCase()
        .includes(query)
    );
  });

  // Reset to first page when search changes
  const handleSearch = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  // Summary calculations
  const totalSales = bills.reduce(
    (sum, bill) =>
      sum + Number(bill.totalAmount || 0),
    0
  );

  const totalCost = bills.reduce(
    (sum, bill) =>
      sum + Number(bill.totalCost || 0),
    0
  );

  const totalProfit = totalSales - totalCost;

  const money = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // Pagination calculations
  const totalPages = Math.ceil(
    filteredBills.length / pageSize
  );

  const startIndex = (currentPage - 1) * pageSize;

  const currentBills = filteredBills.slice(
    startIndex,
    startIndex + pageSize
  );

  const firstBill =
    filteredBills.length === 0 ? 0 : startIndex + 1;

  const lastBill = Math.min(
    startIndex + pageSize,
    filteredBills.length
  );

  return (
    <div className="billing-container">
      <div className="billing-header">
        <div>
          <h2>Billing History</h2>
          <p className="billing-subtitle">
            View and track all customer bills
          </p>
        </div>

        <input
          type="text"
          className="billing-search"
          placeholder="Search bill, customer or phone..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {error && (
        <p className="billing-error" role="alert">
          {error}
        </p>
      )}

      <div className="billing-summary">
        <div className="billing-summary-card">
          <p>Total Bills</p>
          <h3>{bills.length}</h3>
        </div>

        {isAdmin && (
          <>
            <div className="billing-summary-card">
              <p>Total Sales</p>
              <h3>{money(totalSales)}</h3>
            </div>

            <div className="billing-summary-card">
              <p>Total Profit</p>
              <h3>{money(totalProfit)}</h3>
            </div>
          </>
        )}
      </div>

      {loading ? (
        <p className="billing-loading">
          Loading billing history...
        </p>
      ) : (
        <>
          <div className="billing-table-wrapper">
            <table className="billing-table">
              <thead>
                <tr>
                  <th>Bill Number</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Date</th>
                  <th>Purchased Products</th>
                  <th>Total Amount</th>
                  {isAdmin && <th>Total Cost</th>}
                  {isAdmin && <th>Profit</th>}
                  <th>Export</th>
                </tr>
              </thead>

              <tbody>
                {currentBills.length > 0 ? (
                  currentBills.map((bill) => {
                    const amount = Number(
                      bill.totalAmount || 0
                    );

                    const cost = Number(
                      bill.totalCost || 0
                    );

                    const profit = amount - cost;
                    const items = billItems[bill.id];

                    return (
                      <tr key={bill.id}>
                        <td>
                          <strong>
                            {bill.billNumber || "-"}
                          </strong>
                        </td>

                        <td>
                          {bill.customerName || "-"}
                        </td>

                        <td>
                          {bill.customerPhone || "-"}
                        </td>

                        <td>
                          {bill.billDate
                            ? new Date(
                                bill.billDate
                              ).toLocaleString()
                            : "-"}
                        </td>

                        <td className="purchased-products-cell">
                          <button
                            type="button"
                            className="bill-cancel-btn"
                            onClick={() =>
                              toggleBillItems(bill.id)
                            }
                          >
                            {expandedBill === bill.id
                              ? "Hide Products"
                              : "View Products"}
                          </button>

                          {expandedBill === bill.id && (
                            <div className="purchased-products">
                              {!Object.prototype.hasOwnProperty.call(
                                billItems,
                                bill.id
                              ) ? (
                                <p>Loading products...</p>
                              ) : items.length === 0 ? (
                                <p>No products found.</p>
                              ) : (
                                items.map((item, index) => {
                                  const quantity = Number(
                                    item.quantity || 0
                                  );

                                  const unitPrice = Number(
                                    item.unitPrice ??
                                      item.price ??
                                      item.sellingPrice ??
                                      0
                                  );

                                  const subtotal = Number(
                                    item.subtotal ??
                                      item.totalPrice ??
                                      item.totalAmount ??
                                      quantity * unitPrice
                                  );

                                  const productName =
                                    item.product?.name ??
                                    item.productName ??
                                    item.product?.productName ??
                                    "Product";

                                  return (
                                    <div
                                      key={item.id ?? index}
                                      className="purchased-product-item"
                                    >
                                      <strong>
                                        {productName}
                                      </strong>

                                      <p>
                                        Quantity: {quantity}
                                      </p>

                                      <p>
                                        Unit Price:{" "}
                                        {money(unitPrice)}
                                      </p>

                                      <p>
                                        Subtotal:{" "}
                                        {money(subtotal)}
                                      </p>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          )}
                        </td>

                        <td className="billing-amount">
                          {money(amount)}
                        </td>

                        {isAdmin && (
                          <td>{money(cost)}</td>
                        )}

                        {isAdmin && (
                          <td
                            className={
                              profit >= 0
                                ? "billing-profit"
                                : "billing-loss"
                            }
                          >
                            {money(profit)}
                          </td>
                        )}

                        <td>
                          <button
                            type="button"
                            className="bill-cancel-btn"
                            onClick={() => exportBill(bill)}
                          >
                            Export PDF
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={isAdmin ? 9 : 7}
                      className="billing-empty"
                    >
                      {search
                        ? "No matching bills found."
                        : "No bills found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="billing-pagination">
            <div className="billing-page-size">
              <label htmlFor="billingPageSize">
                Show:
              </label>

              <select
                id="billingPageSize"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
              </select>

              <span>bills per page</span>
            </div>

            <div className="billing-page-controls">
              <span className="billing-page-info">
                Showing {firstBill}-{lastBill} of{" "}
                {filteredBills.length} bills
              </span>

              <button
                type="button"
                className="billing-page-btn"
                onClick={() =>
                  setCurrentPage((page) => page - 1)
                }
                disabled={currentPage === 1}
              >
                Previous
              </button>

              <span className="billing-page-number">
                Page {currentPage} of{" "}
                {Math.max(totalPages, 1)}
              </span>

              <button
                type="button"
                className="billing-page-btn"
                onClick={() =>
                  setCurrentPage((page) => page + 1)
                }
                disabled={
                  currentPage >= totalPages ||
                  totalPages === 0
                }
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* Hidden invoice used for PDF export */}
      {printData && (
        <div
          style={{
            position: "fixed",
            left: "-10000px",
            top: 0,
          }}
        >
          <BillInvoice
            ref={invoiceRef}
            bill={printData.bill}
            items={printData.items}
          />
        </div>
      )}
    </div>
  );
}

export default Billing;

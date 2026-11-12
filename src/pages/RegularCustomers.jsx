import { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../api";

function RegularCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    email: "",
    address: "",
  });

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [activities, setActivities] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);

  const token = localStorage.getItem("token");
console.log("TOKEN:", token);

 const api = axios.create({
  baseURL: BASE_URL,
  headers: { Authorization: `Bearer ${token}` },
});

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/customers");
      setCustomers(response.data);
    } catch (err) {
      console.error("Customer loading error:", err);
      setError(
        err.response?.data?.message ||
          `Unable to load customers (${err.response?.status || "network error"}).`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    // Initial customer loading
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    setError("");

    if (!/^\d{10,15}$/.test(formData.customerPhone)) {
      setError("Enter a valid phone number (10–15 digits).");
      return;
    }

    try {
      await api.post("/api/customers", formData);

      alert("Customer added successfully!");

      setFormData({
        customerName: "",
        customerPhone: "",
        email: "",
        address: "",
      });

      setShowForm(false);
      await fetchCustomers();
    } catch (err) {
      console.error("Add customer error:", err);
      setError(
        err.response?.data?.message ||
          `Unable to add customer (${err.response?.status || "network error"}).`
      );
    }
  };

  const handleViewActivities = async (customer) => {
    setSelectedCustomer(customer);
    setActivities([]);
    setActivityLoading(true);
    setError("");

    try {
      const response = await api.get(
        `/api/customers/${encodeURIComponent(customer.customerPhone)}/activities`
      );
      setActivities(response.data);
    } catch (err) {
      console.error("Customer activity error:", err);
      setError(
        err.response?.data?.message ||
          `Unable to load purchase history (${err.response?.status || "network error"}).`
      );
    } finally {
      setActivityLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    return Number.isNaN(parsedDate.getTime())
      ? date
      : parsedDate.toLocaleString("en-IN");
  };

  const totalPurchases = activities.reduce(
    (sum, activity) => sum + Number(activity.totalAmount || 0),
    0
  );

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Regular Customers</h1>
          <p style={styles.subtitle}>
            Manage customers and track their purchase activities.
          </p>
        </div>

        <button
          style={styles.primaryButton}
          onClick={() => {
            setShowForm(!showForm);
            setError("");
          }}
        >
          {showForm ? "Cancel" : "+ Add Customer"}
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {showForm && (
        <form onSubmit={handleAddCustomer} style={styles.form}>
          <h2 style={styles.sectionTitle}>Add New Customer</h2>

          <div style={styles.formGrid}>
            <input
              style={styles.input}
              type="text"
              name="customerName"
              placeholder="Customer name *"
              value={formData.customerName}
              onChange={handleInputChange}
              required
            />

            <input
              style={styles.input}
              type="tel"
              name="customerPhone"
              placeholder="Phone number *"
              value={formData.customerPhone}
              onChange={handleInputChange}
              minLength={10}
              maxLength={15}
              pattern="[0-9]{10,15}"
              required
            />

            <input
              style={styles.input}
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleInputChange}
            />

            <input
              style={styles.input}
              type="text"
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleInputChange}
            />
          </div>

          <button type="submit" style={styles.primaryButton}>
            Save Customer
          </button>
        </form>
      )}

      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Customer List</h2>

        {loading ? (
          <p>Loading customers...</p>
        ) : customers.length === 0 ? (
          <p>No customers found.</p>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Phone</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Address</th>
                  <th style={styles.th}>Activities</th>
                </tr>
              </thead>

              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id ?? customer.customerPhone}>
                    <td style={styles.td}>{customer.customerName}</td>
                    <td style={styles.td}>{customer.customerPhone}</td>
                    <td style={styles.td}>{customer.email || "-"}</td>
                    <td style={styles.td}>{customer.address || "-"}</td>
                    <td style={styles.td}>
                      <button
                        style={styles.viewButton}
                        onClick={() => handleViewActivities(customer)}
                      >
                        View History
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedCustomer && (
        <div style={styles.card}>
          <div style={styles.historyHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Purchase History</h2>
              <p style={styles.subtitle}>
                {selectedCustomer.customerName} ·{" "}
                {selectedCustomer.customerPhone}
              </p>
            </div>

            <button
              style={styles.closeButton}
              onClick={() => {
                setSelectedCustomer(null);
                setActivities([]);
              }}
            >
              Close
            </button>
          </div>

          {activityLoading ? (
            <p>Loading purchase history...</p>
          ) : activities.length === 0 ? (
            <p>No purchase activities found for this customer.</p>
          ) : (
            <>
              <div style={styles.summary}>
                <div style={styles.summaryBox}>
                  <span>Total Bills</span>
                  <strong>{activities.length}</strong>
                </div>

                <div style={styles.summaryBox}>
                  <span>Total Purchases</span>
                  <strong>
                    ₹
                    {totalPurchases.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </strong>
                </div>
              </div>

              {activities.map((activity) => (
                <div key={activity.billId} style={styles.billCard}>
                  <div style={styles.billHeader}>
                    <div>
                      <strong>
                        Bill: {activity.billNumber || activity.billId}
                      </strong>
                      <p style={styles.subtitle}>
                        {formatDate(activity.billDate)}
                      </p>
                    </div>

                    <strong>
                      ₹
                      {Number(activity.totalAmount || 0).toLocaleString(
                        "en-IN",
                        { minimumFractionDigits: 2 }
                      )}
                    </strong>
                  </div>

                  {activity.products?.length > 0 ? (
                    <div style={styles.tableWrapper}>
                      <table style={styles.table}>
                        <thead>
                          <tr>
                            <th style={styles.th}>Product</th>
                            <th style={styles.th}>Quantity</th>
                            <th style={styles.th}>Selling Price</th>
                            <th style={styles.th}>Subtotal</th>
                          </tr>
                        </thead>

                        <tbody>
                          {activity.products.map((product, index) => (
                            <tr key={`${activity.billId}-${index}`}>
                              <td style={styles.td}>
                                {product.productName}
                              </td>
                              <td style={styles.td}>{product.quantity}</td>
                              <td style={styles.td}>
                                ₹{Number(product.sellingPrice || 0).toFixed(2)}
                              </td>
                              <td style={styles.td}>
                                ₹{Number(product.subtotal || 0).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p>No product details available for this bill.</p>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    padding: "24px",
    background: "#f4f8f4",
    minHeight: "100vh",
    color: "#243528",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
    marginBottom: "24px",
  },
  title: {
    margin: "0 0 8px",
    fontSize: "28px",
    color: "#245c38",
  },
  subtitle: {
    margin: "6px 0",
    color: "#718074",
    fontSize: "14px",
  },
  primaryButton: {
    background: "#287a45",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "11px 18px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  viewButton: {
    background: "#e0f2e5",
    color: "#24683a",
    border: "none",
    borderRadius: "6px",
    padding: "8px 12px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  closeButton: {
    background: "#e8eee9",
    color: "#34483a",
    border: "none",
    borderRadius: "6px",
    padding: "9px 14px",
    cursor: "pointer",
  },
  error: {
    background: "#ffeded",
    color: "#a32121",
    border: "1px solid #ffcaca",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "16px",
  },
  form: {
    background: "#fff",
    border: "1px solid #e0e9e1",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "24px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px",
    marginBottom: "18px",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    border: "1px solid #d5e0d6",
    borderRadius: "7px",
    fontSize: "14px",
  },
  card: {
    background: "#fff",
    border: "1px solid #e0e9e1",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "24px",
    boxShadow: "0 3px 12px rgba(30, 70, 40, 0.04)",
  },
  sectionTitle: {
    margin: "0 0 18px",
    fontSize: "20px",
    color: "#285b38",
  },
  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },
  th: {
    textAlign: "left",
    padding: "12px",
    background: "#edf5ee",
    color: "#31583b",
    borderBottom: "1px solid #dce8de",
    whiteSpace: "nowrap",
  },
  td: {
    textAlign: "left",
    padding: "12px",
    borderBottom: "1px solid #edf1ed",
    verticalAlign: "top",
  },
  historyHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
  },
  summary: {
    display: "flex",
    flexWrap: "wrap",
    gap: "14px",
    margin: "12px 0 22px",
  },
  summaryBox: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    minWidth: "160px",
    padding: "16px",
    borderRadius: "9px",
    background: "#edf6ef",
    color: "#2c673c",
  },
  billCard: {
    border: "1px solid #e0e9e1",
    borderRadius: "10px",
    padding: "16px",
    marginBottom: "16px",
  },
  billHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "12px",
  },
};

export default RegularCustomers;


import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import BASE_URL from "../api";
export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const username = localStorage.getItem("username") || "there";
  const role = localStorage.getItem("role") || "";
  const isAdmin = role.toUpperCase().includes("ADMIN");

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

     try {
  const [productsResponse, lowStockResponse] = await Promise.all([
    axios.get(`${BASE_URL}/api/product`, { headers }),
    axios.get(`${BASE_URL}/api/product/low-stock`, {
      headers,
    }),
  ]);

        setProducts(
          Array.isArray(productsResponse.data)
            ? productsResponse.data
            : []
        );

        setLowStockProducts(
          Array.isArray(lowStockResponse.data)
            ? lowStockResponse.data
            : []
        );
      } catch (error) {
        console.error("Dashboard error:", error);

        setErrorMessage(
          error.response?.status === 401 ||
            error.response?.status === 403
            ? "Your session may have expired. Please sign in again."
            : "Unable to load dashboard data. Check that the backend is running."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalUnits = products.reduce(
    (sum, product) => sum + Number(product.quantity || 0),
    0
  );

  const totalValue = products.reduce(
    (sum, product) =>
      sum +
      Number(product.purchasePrice ?? product.purchase_price ?? 0) *
        Number(product.quantity || 0),
    0
  );

  const formatMoney = (value) =>
    `₹${Number(value).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;

  return (
    <main className="page-container">
      <header className="page-header dashboard-heading">
        <div>
          <div className="eyebrow green-eyebrow">YOUR WORKSPACE</div>
          <h1>
            Good day, {username} <span className="wave">✳</span>
          </h1>
          <p className="page-subtitle">
            Here’s what’s happening with your inventory today.
          </p>
        </div>

        <Link className="button-primary" to="/stock-management">
          ＋ Update stock
        </Link>
      </header>

      {errorMessage && (
        <div className="alert alert-error">{errorMessage}</div>
      )}

      {loading ? (
        <div className="panel loading-panel">
          <span className="spinner" /> Loading your inventory overview…
        </div>
      ) : (
        <>
          {/* Inventory Overview */}
          <section className="stats-grid">
            <article className="stat-card stat-card-featured">
              <div className="stat-top">
                <span>Total products</span>
                <span className="stat-icon">▦</span>
              </div>
              <div className="stat-number">{products.length}</div>
              <div className="stat-foot">
                <span className="stat-positive">●</span>
                Products in your catalogue
              </div>
            </article>

            <article className="stat-card">
              <div className="stat-top">
                <span>Total units in stock</span>
                <span className="stat-icon soft-icon">▤</span>
              </div>
              <div className="stat-number">
                {totalUnits.toLocaleString("en-IN")}
              </div>
              <div className="stat-foot">Across all products</div>
            </article>

            <article className="stat-card">
              <div className="stat-top">
                <span>Low-stock items</span>
                <span className="stat-icon warning-icon">⚑</span>
              </div>
              <div className="stat-number">
                {lowStockProducts.length}
              </div>
              <div className="stat-foot">
                {lowStockProducts.length ? (
                  <span className="text-warning">
                    Needs your attention
                  </span>
                ) : (
                  <span className="text-success">
                    Everything looks healthy
                  </span>
                )}
              </div>
            </article>

            {isAdmin && (
              <article className="stat-card">
                <div className="stat-top">
                  <span>Total stock cost</span>
                  <span className="stat-icon soft-icon">₹</span>
                </div>
                <div className="stat-number stat-money">
                  {formatMoney(totalValue)}
                </div>
                <div className="stat-foot">
                  Estimated value on hand
                </div>
              </article>
            )}
          </section>

          {/* Low Stock Watchlist */}
          <section className="panel dashboard-table-panel">
            <div className="section-heading">
              <div>
                <h2>Low-stock watchlist</h2>
                <p>
                  Products that have reached their minimum stock level.
                </p>
              </div>

              <Link className="text-link" to="/low-stock">
                View all <span>→</span>
              </Link>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">✓</span>
                <strong>All stocked up!</strong>
                <p>
                  No products are currently below their minimum stock level.
                </p>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Product code</th>
                      <th>Available</th>
                      <th>Minimum</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {lowStockProducts.slice(0, 6).map((product) => (
                      <tr key={product.id}>
                        <td>
                          <div className="product-cell">
                            <span className="product-avatar">
                              {String(product.name || "P")
                                .slice(0, 2)
                                .toUpperCase()}
                            </span>
                            <strong>{product.name}</strong>
                          </div>
                        </td>

                        <td>
                          <span className="code-text">
                            {product.product_code ?? product.productCode}
                          </span>
                        </td>

                        <td>
                          <strong className="text-warning">
                            {product.quantity}
                          </strong>
                        </td>

                        <td>{product.minimumStock}</td>

                        <td>
                          <span className="pill pill-warning">
                            Low stock
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Quick Actions */}
          <section className="quick-actions">
            <Link to="/products" className="quick-action">
              <span className="quick-icon">▦</span>
              <span>
                <strong>Manage products</strong>
                <small>View and update your catalogue</small>
              </span>
              <span className="quick-arrow">→</span>
            </Link>

            <Link to="/stock-history" className="quick-action">
              <span className="quick-icon quick-icon-mint">◷</span>
              <span>
                <strong>Transaction history</strong>
                <small>Review previous stock movements</small>
              </span>
              <span className="quick-arrow">→</span>
            </Link>
          </section>
        </>
      )}
    </main>
  );
}

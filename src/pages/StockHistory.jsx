
import { useEffect, useState } from "react";
import axios from "axios";

export default function StockHistory() {
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState("");
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/product", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        setProducts(
          Array.isArray(response.data) ? response.data : []
        );
      })
      .catch((error) => {
        console.error("Products error:", error);
        setErrorMessage(
          "Unable to load products. Please sign in again."
        );
      })
      .finally(() => setLoadingProducts(false));
  }, []);

  const loadHistory = async (e) => {
    e.preventDefault();

    if (!productId) {
      setHistory([]);
      setMessage("Please select a product first.");
      return;
    }

    setLoading(true);
    setHistory([]);
    setMessage("");
    setErrorMessage("");

    try {
      const response = await axios.get(
        `http://localhost:8080/api/product/${productId}/stock-history`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setHistory(
        Array.isArray(response.data) ? response.data : []
      );

      if (!response.data?.length) {
        setMessage(
          "No transaction history found for this product yet."
        );
      }
    } catch (error) {
      console.error("Stock history error:", error);
      setErrorMessage(
        `Unable to load transaction history${
          error.response?.status
            ? ` (status ${error.response.status})`
            : ""
        }.`
      );
    } finally {
      setLoading(false);
    }
  };

  const selectedProduct = products.find(
    (product) => String(product.id) === String(productId)
  );

  return (
    <main className="page-container">
      <header className="page-header">
        <div>
          <div className="eyebrow green-eyebrow">
            AUDIT TRAIL
          </div>
          <h1>Transactions</h1>
          <p className="page-subtitle">
            A clear record of stock movements for each product.
          </p>
        </div>

        <div className="role-chip">
          <span className="role-chip-dot" />
          Transaction history
        </div>
      </header>

      {errorMessage && (
        <div className="alert alert-error">
          <span>!</span>
          {errorMessage}
        </div>
      )}

      <section className="panel history-filter-panel">
        <div className="section-heading">
          <div>
            <h2>Find product history</h2>
            <p>
              Select a product to view its stock movement records.
            </p>
          </div>
        </div>

        <form className="history-filter-form" onSubmit={loadHistory}>
          <div className="form-field">
            <label htmlFor="productSelect">Product</label>

            <select
              id="productSelect"
              value={productId}
              onChange={(e) => {
                setProductId(e.target.value);
                setHistory([]);
                setMessage("");
                setErrorMessage("");
              }}
              required
            >
              <option value="">Choose a product…</option>

              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} — {product.product_code}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="button-primary"
            disabled={loading || loadingProducts}
          >
            {loading ? "Loading…" : "View history →"}
          </button>
        </form>
      </section>

      {selectedProduct && (
        <div className="history-product-summary">
          <span className="product-avatar">
            {String(selectedProduct.name || "P")
              .slice(0, 1)
              .toUpperCase()}
          </span>

          <div>
            <strong>{selectedProduct.name}</strong>
            <small>
              {selectedProduct.product_code} · Current stock:{" "}
              {selectedProduct.quantity}
            </small>
          </div>
        </div>
      )}

      {message && (
        <div className="alert alert-neutral">{message}</div>
      )}

      {(history.length > 0 || loading) && (
        <section className="panel history-table-panel">
          <div className="section-heading">
            <div>
              <h2>Movement records</h2>
              <p>
                {history.length} transaction
                {history.length === 1 ? "" : "s"} found
              </p>
            </div>
          </div>

          {loading ? (
            <div className="loading-panel">
              <span className="spinner" />
              Loading transaction history…
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Transaction</th>
                    <th>Type</th>
                    <th>Change</th>
                    <th>Previous</th>
                    <th>New stock</th>
                    <th>Customer Name</th>
                    <th>Username</th>
                    <th>Date &amp; time</th>
                  </tr>
                </thead>

                <tbody>
                  {history.map((item) => {
                    const incoming = String(
                      item.transactionType || ""
                    )
                      .toLowerCase()
                      .includes("in");

                    return (
                      <tr key={item.id}>
                        <td>
                          <span className="code-text">
                            #{item.id}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`pill ${
                              incoming
                                ? "pill-success"
                                : "pill-neutral"
                            }`}
                          >
                            {item.transactionType || "N/A"}
                          </span>
                        </td>

                        <td>
                          <strong
                            className={
                              incoming
                                ? "text-success"
                                : "text-warning"
                            }
                          >
                            {incoming ? "+" : "−"}
                            {item.quantity}
                          </strong>
                        </td>

                        <td>{item.quantityBefore ?? "—"}</td>

                        <td>
                          <strong>
                            {item.quantityAfter ?? "—"}
                          </strong>
                        </td>

                        <td>
                          {incoming
                            ? "—"
                            : item.customerName || "—"}
                        </td>

                        <td>{item.username || "—"}</td>

                        <td>
                          {item.transactionDate
                            ? new Date(
                                item.transactionDate
                              ).toLocaleString()
                            : "N/A"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </main>
  );
}

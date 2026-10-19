
import { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../api";
export default function StockManagement() {
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [type, setType] = useState("in");
  const [customerName, setCustomerName] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);

  const token = localStorage.getItem("token");

  const fetchProducts = async () => {
    try {
      const response = await axios.get(
       `${BASE_URL}/api/product`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setProducts(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (error) {
      console.error("Products error:", error);
      setErrorMessage(
        "Unable to load products. Please check your login and backend."
      );
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleStockUpdate = async (e) => {
    e.preventDefault();
    setMessage("");
    setErrorMessage("");

    if (!token) {
      setErrorMessage("Please log in again.");
      return;
    }

    if (!productId) {
      setErrorMessage("Please select a product.");
      return;
    }

    const qty = Number(quantity);

    if (
      quantity === "" ||
      !Number.isInteger(qty) ||
      qty <= 0
    ) {
      setErrorMessage("Enter a whole number greater than zero.");
      return;
    }

    if (type === "out" && !customerName.trim()) {
      setErrorMessage("Please enter customer name for Stock OUT.");
      return;
    }

    const selected = products.find(
      (product) => String(product.id) === String(productId)
    );

    if (!selected) {
      setErrorMessage("Selected product not found. Refresh and try again.");
      return;
    }

    if (type === "out" && qty > Number(selected.quantity)) {
      setErrorMessage(
        `Only ${selected.quantity} units are available.`
      );
      return;
    }

    setLoading(true);

    try {
      const params = { quantity: qty };

      // Customer name is sent only for Stock OUT
      if (type === "out") {
        params.customerName = customerName.trim();
      }

      const response = await axios.put(
        `${BASE_URL}/api/stock/${productId}/${type}`,
        null,
        {
          params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(
        typeof response.data === "string"
          ? response.data
          : "Stock updated successfully."
      );

      setQuantity("");
      setCustomerName("");

      await fetchProducts();
    } catch (error) {
      console.error("Stock update error:", error);

      const responseData = error.response?.data;

      setErrorMessage(
        typeof responseData === "string"
          ? responseData
          : responseData?.message ||
            `Stock update failed${
              error.response?.status
                ? ` (HTTP ${error.response.status})`
                : ""
            }. Check the backend console for details.`
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
            INVENTORY CONTROL
          </div>
          <h1>Stock movement</h1>
          <p className="page-subtitle">
            Record incoming stock or track items leaving your inventory.
          </p>
        </div>

        <div className="role-chip">
          <span className="role-chip-dot" />
          Stock operations
        </div>
      </header>

      {message && (
        <div className="alert alert-success">
          <span>✓</span>
          {message}
        </div>
      )}

      {errorMessage && (
        <div className="alert alert-error">
          <span>!</span>
          {errorMessage}
        </div>
      )}

      <div className="stock-layout">
        <section className="panel stock-form-panel">
          <div className="section-heading">
            <div>
              <h2>Record a movement</h2>
              <p>Choose the product and enter the quantity.</p>
            </div>
            <span className="form-step">STOCK UPDATE</span>
          </div>

          <form onSubmit={handleStockUpdate}>
            <div className="form-field">
              <label htmlFor="productSelect">Select product</label>

              <select
                id="productSelect"
                value={productId}
                onChange={(e) => {
                  setProductId(e.target.value);
                  setMessage("");
                  setErrorMessage("");
                }}
                required
              >
                <option value="">Choose a product…</option>

                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.product_code})
                  </option>
                ))}
              </select>
            </div>

            {selectedProduct && (
              <div className="selected-product">
                <span className="product-avatar">
                  {String(selectedProduct.name || "P")
                    .slice(0, 1)
                    .toUpperCase()}
                </span>

                <div>
                  <strong>{selectedProduct.name}</strong>
                  <small>
                    Current stock:{" "}
                    <b>{selectedProduct.quantity}</b> units
                  </small>
                </div>

                <span
                  className={`pill ${
                    Number(selectedProduct.quantity) <=
                    Number(selectedProduct.minimumStock)
                      ? "pill-warning"
                      : "pill-success"
                  }`}
                >
                  {Number(selectedProduct.quantity) <=
                  Number(selectedProduct.minimumStock)
                    ? "Low stock"
                    : "In stock"}
                </span>
              </div>
            )}

            <label>Movement type</label>

            <div className="movement-toggle">
              <button
                type="button"
                className={
                  type === "in"
                    ? "movement-option movement-in selected"
                    : "movement-option"
                }
                onClick={() => {
                  setType("in");
                  setCustomerName("");
                  setMessage("");
                  setErrorMessage("");
                }}
              >
                <span>↓</span>
                <strong>Stock IN</strong>
                <small>Receive new items</small>
              </button>

              <button
                type="button"
                className={
                  type === "out"
                    ? "movement-option movement-out selected"
                    : "movement-option"
                }
                onClick={() => {
                  setType("out");
                  setMessage("");
                  setErrorMessage("");
                }}
              >
                <span>↑</span>
                <strong>Stock OUT</strong>
                <small>Issue or remove items</small>
              </button>
            </div>

            {type === "out" && (
              <div className="form-field">
                <label htmlFor="customerName">Customer Name</label>

                <input
                  id="customerName"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                  required
                />
              </div>
            )}

            <div className="form-field">
              <label htmlFor="quantity">Quantity</label>

              <input
                id="quantity"
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter units"
                required
              />
            </div>

            {type === "out" &&
              selectedProduct &&
              Number(quantity) > Number(selectedProduct.quantity) && (
                <p className="field-hint text-warning">
                  Quantity exceeds current stock (
                  {selectedProduct.quantity}).
                </p>
              )}

            <button
              className="button-primary stock-submit"
              type="submit"
              disabled={loading || productsLoading}
            >
              {loading
                ? "Updating stock…"
                : `Confirm stock ${type.toUpperCase()}`}
            </button>
          </form>
        </section>

        <aside className="stock-side-column">
          <section className="stock-help-card">
            <div className="help-icon">✳</div>
            <h3>Stock IN</h3>
            <p>
              Use when you receive new products or replenish
              existing inventory. Quantity is added to current stock.
            </p>
          </section>

          <section className="stock-help-card stock-help-out">
            <div className="help-icon">↗</div>
            <h3>Stock OUT</h3>
            <p>
              Enter the customer name when issuing products.
              Make sure the available quantity is sufficient.
            </p>
          </section>

          <section className="mini-summary">
            <span className="mini-summary-icon">▦</span>
            <div>
              <small>Products available</small>
              <strong>{products.length}</strong>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}

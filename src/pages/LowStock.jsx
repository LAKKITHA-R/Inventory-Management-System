import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function LowStock() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get("http://localhost:8080/api/product/low-stock", {
      headers: { Authorization: `Bearer ${token}` }
    }).then((response) => {
      setProducts(Array.isArray(response.data) ? response.data : []);
    }).catch((error) => {
      console.error("Low stock error:", error);
      setErrorMessage(error.response?.status === 401 ? "Session expired. Please sign in again." : "Unable to load low-stock products.");
    }).finally(() => setLoading(false));
  }, []);

  return (
    <main className="page-container">
      <header className="page-header">
        <div><div className="eyebrow green-eyebrow">STOCK HEALTH</div><h1>Low-stock alerts</h1><p className="page-subtitle">Keep an eye on products that may need replenishment.</p></div>
        <Link to="/stock-management" className="button-primary">＋ Update stock</Link>
      </header>
      {errorMessage && <div className="alert alert-error">{errorMessage}</div>}
      <section className="alert-banner"><div className="alert-banner-icon">!</div><div><strong>{products.length} {products.length === 1 ? "product needs" : "products need"} attention</strong><p>Items at or below their minimum stock threshold appear here.</p></div></section>
      <section className="panel">
        <div className="section-heading"><div><h2>Products to review</h2><p>Stock levels compared with your minimum threshold.</p></div><span className="pill pill-warning">{products.length} alerts</span></div>
        {loading ? <div className="loading-panel"><span className="spinner" /> Checking stock levels…</div> : products.length === 0 ? (
          <div className="empty-state"><span className="empty-icon">✓</span><strong>No low-stock products</strong><p>Your current stock levels are looking good.</p></div>
        ) : (
          <div className="table-wrap"><table><thead><tr><th>Product</th><th>Product code</th><th>Available quantity</th><th>Minimum stock</th><th>Stock status</th></tr></thead>
            <tbody>{products.map((product) => <tr key={product.id}>
              <td><div className="product-cell"><span className="product-avatar">{String(product.name || "P").slice(0,1).toUpperCase()}</span><strong className="low-stock-product-name">
  {product.name}
</strong></div></td>
              <td><span className="code-text">{product.product_code}</span></td>
              <td><strong className="text-warning">{product.quantity}</strong></td><td>{product.minimumStock}</td><td><span className="pill pill-warning">Reorder suggested</span></td>
            </tr>)}</tbody></table></div>
        )}
      </section>
    </main>
  );
}

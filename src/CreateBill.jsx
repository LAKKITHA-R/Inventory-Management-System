import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:8080";

function CreateBill() {
  const [products, setProducts] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [billerName, setBillerName] = useState("");
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [gstRate, setGstRate] = useState(18);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const fetchProducts = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/api/product`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProducts(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error(
        "Product load failed:",
        err.response?.status,
        err.response?.data || err.message
      );
      setError(
        err.response?.status === 401 || err.response?.status === 403
          ? "Session expired. Please login again."
          : "Products load aagala. Check backend is running."
      );
    }
  }, [token]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Error / success vandha top-ku scroll pannum
  useEffect(() => {
    if (error || message) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [error, message]);

  const addProduct = (productId) => {
    setError("");
    setMessage("");

    const product = products.find((p) => String(p.id) === String(productId));

    if (!product) return;

    const existing = cart.find((item) => item.productId === product.id);

    if (existing) {
      if (Number(existing.quantity) >= Number(product.quantity)) {
        setError(`Only ${product.quantity} items available.`);
        return;
      }

      setCart(
        cart.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: Number(item.quantity) + 1 }
            : item
        )
      );
    } else if (Number(product.quantity) > 0) {
      setCart([
        ...cart,
        {
          productId: product.id,
          name: product.name,
          price: Number(product.price),
          stock: Number(product.quantity),
          quantity: 1,
        },
      ]);
    } else {
      setError("This product is out of stock.");
    }
  };

  const changeQuantity = (productId, quantity) => {
    setError("");
    setMessage("");

    const item = cart.find((i) => i.productId === productId);

    if (!item) return;

    if (quantity === "") {
      setCart(
        cart.map((i) =>
          i.productId === productId ? { ...i, quantity: "" } : i
        )
      );
      return;
    }

    const qty = Number(quantity);

    if (!Number.isInteger(qty) || qty < 1 || qty > item.stock) {
      setError(`Quantity must be between 1 and ${item.stock}.`);
      return;
    }

    setCart(
      cart.map((i) =>
        i.productId === productId ? { ...i, quantity: qty } : i
      )
    );
  };

  const total = cart.reduce(
    (sum, item) => sum + item.price * (Number(item.quantity) || 0),
    0
  );

  const removeProduct = (productId) => {
    setCart(cart.filter((item) => item.productId !== productId));
    setError("");
    setMessage("");
  };


const cgst = (total * Number(gstRate)) / 200;
const sgst = (total * Number(gstRate)) / 200;
const grandTotal = total + cgst + sgst;

  // Create bill in backend
  const createBill = async () => {
    console.log("Create Bill clicked", {
      billerName,
      customerName,
      customerPhone,
      cart,
    });

    setError("");
    setMessage("");

    if (!billerName.trim()) {
      setError("Please enter biller name.");
      return;
    }

    if (!customerName.trim()) {
      setError("Please enter customer name.");
      return;
    }

    if (!/^[0-9]{10}$/.test(customerPhone)) {
      setError("Please enter a valid 10-digit customer phone number.");
      return;
    }

    if (cart.length === 0) {
      setError("Please add at least one product.");
      return;
    }

    const invalidItem = cart.find(
      (item) =>
        !Number.isInteger(Number(item.quantity)) ||
        Number(item.quantity) < 1 ||
        Number(item.quantity) > item.stock
    );

    if (invalidItem) {
      setError(`Check quantity for ${invalidItem.name}.`);
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${API}/api/billing/create`,
        {
  billerName: billerName.trim(),
  customerName: customerName.trim(),
  customerPhone: customerPhone.trim(),
  gstRate: Number(gstRate),
  items: cart.map((item) => ({
    productId: item.productId,
    quantity: Number(item.quantity),
  })),
},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setMessage(
        `Bill created successfully! Bill No: ${
          response.data?.billNumber ??
          response.data?.bill?.billNumber ??
          response.data?.id ??
          response.data?.bill?.id ??
          "Created"
        }.`
      );

      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      setBillerName("");
      setSelectedProduct("");

      // Refresh product stock after successful sale
      await fetchProducts();
    } catch (err) {
      console.error(
        "Create bill failed:",
        err.response?.status,
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          (err.response?.status
            ? `Bill create failed (HTTP ${err.response.status}).`
            : "Cannot reach server. Is the backend running?")
      );
    } finally {
      setLoading(false);
    }
  };

  const errorBox = error && (
    <p className="bill-error" role="alert">
      {error}
    </p>
  );

  return (
    <div className="create-bill-container">
      <h2>Create New Bill</h2>

      {errorBox}

      {message && (
        <p className="bill-success" role="status">
          {message}
        </p>
      )}

      <div className="bill-form">
        <div>
          <label htmlFor="billerName">Biller Name</label>
          <input
            id="billerName"
            className="bill-input"
            type="text"
            placeholder="Enter biller name"
            value={billerName}
            onChange={(e) => setBillerName(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="customerName">Customer Name</label>
          <input
            id="customerName"
            className="bill-input"
            type="text"
            placeholder="Enter customer name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="customerPhone">Customer Phone</label>
          <input
            id="customerPhone"
            className="bill-input"
            type="tel"
            placeholder="Enter 10-digit phone number"
            value={customerPhone}
            maxLength={10}
            inputMode="numeric"
            onChange={(e) =>
              setCustomerPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
            }
            title="Enter exactly 10 digits"
          />
        </div>
      </div>

      <div className="bill-product-selection">
        <label htmlFor="productSelect">Select Product</label>

        <select
          id="productSelect"
          className="bill-select"
          value={selectedProduct}
          onChange={(e) => {
            if (e.target.value) {
              addProduct(e.target.value);
            }
            setSelectedProduct("");
          }}
        >
          <option value="">Choose a product</option>

          {products.map((product) => (
            <option
              key={product.id}
              value={product.id}
              disabled={Number(product.quantity) <= 0}
            >
              {product.name} — ₹{Number(product.price).toFixed(2)} — Stock:{" "}
              {product.quantity}
            </option>
          ))}
        </select>
      </div>

      <div className="bill-product-selection">
  <label htmlFor="gstRate">Select GST Rate</label>

  <select
    id="gstRate"
    className="bill-select"
    value={gstRate}
    onChange={(e) => setGstRate(Number(e.target.value))}
  >
    <option value={0}>0% GST</option>
    <option value={5}>5% GST</option>
    <option value={12}>12% GST</option>
    <option value={18}>18% GST</option>
    <option value={28}>28% GST</option>
  </select>
</div>


      <h3>Bill Items</h3>

      <div className="bill-table-wrapper">
        <table className="bill-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Subtotal</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {cart.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No products added yet.
                </td>
              </tr>
            ) : (
              cart.map((item) => (
                <tr key={item.productId}>
                  <td>{item.name}</td>

                  <td>₹{item.price.toFixed(2)}</td>

                  <td>
                    <input
                      type="number"
                      min="1"
                      max={item.stock}
                      value={item.quantity}
                      onChange={(e) =>
                        changeQuantity(item.productId, e.target.value)
                      }
                      aria-label={`Quantity for ${item.name}`}
                    />
                    <small> / {item.stock} available</small>
                  </td>

                  <td>
                    ₹{(item.price * (Number(item.quantity) || 0)).toFixed(2)}
                  </td>

                  <td>
                    <button
                      type="button"
                      className="bill-remove-btn"
                      onClick={() => removeProduct(item.productId)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="bill-total">
  <span>Subtotal</span>
  <span>₹{total.toFixed(2)}</span>
</div>

<div className="bill-total">
  <span>CGST ({gstRate / 2}%)</span>
  <span>₹{cgst.toFixed(2)}</span>
</div>

<div className="bill-total">
  <span>SGST ({gstRate / 2}%)</span>
  <span>₹{sgst.toFixed(2)}</span>
</div>

<div className="bill-total">
  <strong>Grand Total</strong>
  <strong>₹{grandTotal.toFixed(2)}</strong>
</div>

      {/* Error button-ku pakkathulaye theriya */}
      {errorBox}

      <div className="bill-actions">
        <button
          type="button"
          className="bill-save-btn"
          onClick={createBill}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Bill"}
        </button>

        <button
          type="button"
          className="bill-cancel-btn"
          onClick={() => navigate("/billing")}
        >
          View Billing History
        </button>
      </div>
    </div>
  );
}

export default CreateBill;
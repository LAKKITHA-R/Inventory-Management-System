import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BASE_URL from "../api";

const API = `${BASE_URL}/api/product`;
export default function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [productCode, setProductCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [minimumStock, setMinimumStock] = useState("");
  const [editId, setEditId] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("DEFAULT");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const role = (localStorage.getItem("role") || "").toUpperCase();
  const isAdmin = role === "ADMIN" || role === "ROLE_ADMIN";

  const loadProducts = async () => {
    const token = localStorage.getItem("token");
    
    try {
      const response = await axios.get(API, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProducts(Array.isArray(response.data) ? response.data : []);
      setErrorMessage("");
    } catch (error) {
      console.error("Product load error:", error);

      setErrorMessage(
        error.response?.status === 401 ||
          error.response?.status === 403
          ? "You are not authorised to view products. Please sign in again."
          : "Unable to load products. Check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Search, stock filter and sorting
  const filteredProducts = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    const filtered = products.filter((product) => {
      const matchesSearch =
        String(product.name || "").toLowerCase().includes(search) ||
        String(
          product.product_code ?? product.productCode ?? ""
        ).toLowerCase().includes(search) ||
        String(product.description || "").toLowerCase().includes(search);

      const low =
        Number(product.quantity) <=
        Number(product.minimumStock ?? product.minimum_stock ?? 0);

      const matchesFilter =
        stockFilter === "ALL" ||
        (stockFilter === "LOW" && low) ||
        (stockFilter === "AVAILABLE" && !low);

      return matchesSearch && matchesFilter;
    });

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "NAME":
          return String(a.name || "").localeCompare(
            String(b.name || "")
          );

        case "PRICE_LOW":
          return Number(a.price || 0) - Number(b.price || 0);

        case "PRICE_HIGH":
          return Number(b.price || 0) - Number(a.price || 0);

        case "QUANTITY_LOW":
          return Number(a.quantity || 0) - Number(b.quantity || 0);

        case "QUANTITY_HIGH":
          return Number(b.quantity || 0) - Number(a.quantity || 0);

        default:
          return 0;
      }
    });
  }, [products, searchTerm, stockFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / pageSize);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;

    return filteredProducts.slice(
      startIndex,
      startIndex + pageSize
    );
  }, [filteredProducts, currentPage, pageSize]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, stockFilter, sortBy, pageSize]);

  // Keep current page valid
  useEffect(() => {
    setCurrentPage((page) =>
      Math.max(1, Math.min(page, totalPages || 1))
    );
  }, [totalPages]);

  const clearForm = () => {
    setEditId(null);
    setProductCode("");
    setName("");
    setDescription("");
    setPrice("");
    setPurchasePrice("");
    setQuantity("");
    setMinimumStock("");
    setMessage("");
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAdmin) {
      setErrorMessage("Only Admin can add or update products.");
      return;
    }

    if (
      price === "" ||
      purchasePrice === "" ||
      quantity === "" ||
      minimumStock === ""
    ) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    if (
      Number(price) < 0 ||
      Number(purchasePrice) < 0 ||
      Number(quantity) < 0 ||
      Number(minimumStock) < 0
    ) {
      setErrorMessage("Values cannot be negative.");
      return;
    }

    setSaving(true);
    setMessage("");
    setErrorMessage("");

    const token = localStorage.getItem("token");

    const product = {
      product_code: productCode.trim(),
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      purchasePrice: Number(purchasePrice),
      quantity: Number(quantity),
      minimumStock: Number(minimumStock),
    };

    try {
      if (editId === null) {
        await axios.post(API, product, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setMessage("Product added successfully.");
      } else {
        await axios.put(`${API}/${editId}`, product, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setMessage("Product updated successfully.");
      }

      setEditId(null);
      setProductCode("");
      setName("");
      setDescription("");
      setPrice("");
      setPurchasePrice("");
      setQuantity("");
      setMinimumStock("");

      setCurrentPage(1);
      await loadProducts();

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Save product error:", error);

      setErrorMessage(
        error.response?.status === 403
          ? "You do not have permission to change products."
          : error.response?.data?.message ||
            "Could not save product. Please check the details and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product) => {
    if (!isAdmin) return;

    setEditId(product.id);
    setProductCode(
      String(product.product_code ?? product.productCode ?? "")
    );
    setName(product.name || "");
    setDescription(product.description || "");
    setPrice(String(product.price ?? ""));
    setPurchasePrice(
      String(product.purchasePrice ?? product.purchase_price ?? "")
    );
    setQuantity(String(product.quantity ?? ""));
    setMinimumStock(
      String(product.minimumStock ?? product.minimum_stock ?? "")
    );
    setMessage("");
    setErrorMessage("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!isAdmin) {
      setErrorMessage("Only Admin can delete products.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    setMessage("");
    setErrorMessage("");

    try {
      await axios.delete(`${API}/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setMessage("Product deleted successfully.");

      if (editId === id) clearForm();

      await loadProducts();
    } catch (error) {
      console.error("Delete product error:", error);

      setErrorMessage(
        error.response?.status === 403
          ? "You do not have permission to delete products."
          : "Failed to delete product."
      );
    }
  };

  const money = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;

  
  // Export Excel: Company Name + Purchase Price only for Admin
  const exportToExcel = () => {
    if (filteredProducts.length === 0) {
      alert("No products available to export");
      return;
    }

    const data = filteredProducts.map((p) => {
      const productData = {
        ID: p.id,
        "Product Name": p.name,
        "Product Code": p.product_code ?? p.productCode ?? "-",
        Description: p.description,
        "Selling Price": p.price ?? 0,
        Quantity: p.quantity ?? 0,
        "Minimum Stock":
          p.minimumStock ?? p.minimum_stock ?? 0,
      };

      if (isAdmin) {
        productData["Purchase Price"] =
          p.purchasePrice ?? p.purchase_price ?? 0;
      }

      return productData;
    });

    const worksheet = XLSX.utils.aoa_to_sheet([
      ["ROBOTICS COMPUTER SCALES AND SERVICE"],
      ["PRODUCT INVENTORY REPORT"],
      [],
    ]);

    XLSX.utils.sheet_add_json(worksheet, data, {
      origin: "A5",
    });

    // Set column widths
    worksheet["!cols"] = [
      { wch: 8 },
      { wch: 22 },
      { wch: 18 },
      { wch: 30 },
      { wch: 16 },
      { wch: 12 },
      { wch: 15 },
      ...(isAdmin ? [{ wch: 18 }] : []),
    ];

    // Merge company heading across the report columns
    worksheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: isAdmin ? 7 : 6 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: isAdmin ? 7 : 6 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: isAdmin ? 7 : 6 } },
    ];

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Inventory Report"
    );

    XLSX.writeFile(workbook, "ROBOTICS-inventory-report.xlsx");
  };

  // Export PDF: Company Name + Purchase Price only for Admin
  const exportToPDF = () => {
    if (filteredProducts.length === 0) {
      alert("No products available to export");
      return;
    }

    const doc = new jsPDF();

    // Company heading
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("ROBOTICS COMPUTER SCALES AND SERVICE", 14, 15);

    doc.setFontSize(10);
    doc.text("PRODUCT INVENTORY REPORT", 14, 29);

    const headers = [
      "ID",
      "Product",
      "Product Code",
    ];

    if (isAdmin) {
      headers.push("Purchase Price");
    }

    headers.push("Selling Price", "Quantity", "Min Stock");

    const rows = filteredProducts.map((p) => {
      const row = [
        p.id,
        p.name,
        p.product_code ?? p.productCode ?? "-",
      ];

      if (isAdmin) {
        row.push(
          money(p.purchasePrice ?? p.purchase_price ?? 0)
        );
      }

      row.push(
        money(p.price ?? 0),
        p.quantity ?? 0,
        p.minimumStock ?? p.minimum_stock ?? 0
      );

      return row;
    });

    autoTable(doc, {
      startY: 35,
      head: [headers],
      body: rows,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [40, 80, 140] },
    });

    doc.save("ROBOTICS-inventory-report.pdf");
  };

  return (
    <main className="page-container">
      <header className="page-header">
        <div>
          <div className="eyebrow green-eyebrow">CATALOGUE</div>
          <h1>Products</h1>
          <p className="page-subtitle">
            Manage product details and keep your stock information up to date.
          </p>
        </div>

        <div className="role-chip">
          <span className="role-chip-dot" />
          {isAdmin ? "Admin access" : "Staff access"}
        </div>
      </header>

      {message && (
        <div className="alert alert-success">
          <span>✓</span>
          {message}
          <button
            className="alert-dismiss"
            onClick={() => setMessage("")}
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="alert alert-error">
          <span>!</span>
          {errorMessage}
          <button
            className="alert-dismiss"
            onClick={() => setErrorMessage("")}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {isAdmin && (
        <section className="panel form-panel">
          <div className="section-heading">
            <div>
              <h2>{editId === null ? "Add a product" : "Edit product"}</h2>
              <p>
                {editId === null
                  ? "Enter the details to add a new item to your catalogue."
                  : `Updating product #${editId}`}
              </p>
            </div>

            <span className="form-step">
              {editId === null ? "＋ NEW ITEM" : "✎ EDIT MODE"}
            </span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="productCode">Product code</label>
                <input
                  id="productCode"
                  value={productCode}
                  onChange={(e) => setProductCode(e.target.value)}
                  placeholder="e.g. LAP002"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="productName">Product name</label>
                <input
                  id="productName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Wireless keyboard"
                  required
                />
              </div>

              <div className="form-field form-field-wide">
                <label htmlFor="description">Description</label>
                <input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short product description"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="price">Selling Price (₹)</label>
                <input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="purchasePrice">Purchase Price (₹)</label>
                <input
                  id="purchasePrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  placeholder="Enter buying cost"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="quantity">Quantity in stock</label>
                <input
                  id="quantity"
                  type="number"
                  min="0"
                  step="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="minimumStock">Minimum stock level</label>
                <input
                  id="minimumStock"
                  type="number"
                  min="0"
                  step="1"
                  value={minimumStock}
                  onChange={(e) => setMinimumStock(e.target.value)}
                  placeholder="5"
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="button-primary"
                disabled={saving}
              >
                {saving
                  ? "Saving…"
                  : editId === null
                    ? "＋ Add product"
                    : "Save changes"}
              </button>

              {editId !== null && (
                <button
                  type="button"
                  className="button-ghost"
                  onClick={clearForm}
                >
                  Cancel edit
                </button>
              )}
            </div>
          </form>
        </section>
      )}

      <section className="panel products-panel">
        <div className="section-heading">
          <div>
            <h2>Product catalogue</h2>
            <p>
              {filteredProducts.length} of {products.length} products
            </p>
          </div>

          <span className="catalogue-count">
            {products.length} <small>items</small>
          </span>
        </div>

        {!isAdmin && (
          <div className="info-banner">
            You have read-only access. Only Admin can add, edit, or delete products.
          </div>
        )}

        <div className="search-toolbar">
          <div className="search-input-wrap">
            <span>⌕</span>
            <input
              aria-label="Search products"
              placeholder="Search by name, code or description…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            aria-label="Filter by stock status"
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
          >
            <option value="ALL">All stock levels</option>
            <option value="LOW">Low stock</option>
            <option value="AVAILABLE">Sufficient stock</option>
          </select>

          <select
            aria-label="Sort products"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="DEFAULT">Default order</option>
            <option value="NAME">Name (A–Z)</option>
            <option value="PRICE_LOW">Price: Low to High</option>
            <option value="PRICE_HIGH">Price: High to Low</option>
            <option value="QUANTITY_LOW">Quantity: Low to High</option>
            <option value="QUANTITY_HIGH">Quantity: High to Low</option>
          </select>
        </div>

        <div className="export-buttons">
          <button type="button" onClick={exportToExcel}>
            Export Excel
          </button>

          <button type="button" onClick={exportToPDF}>
            Export PDF
          </button>
        </div>


        {loading ? (
          <div className="loading-panel">
            <span className="spinner" /> Loading products…
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Code</th>
                  {isAdmin && <th>Purchase Price</th>}
                  <th>Selling Price</th>
                  <th>Available</th>
                  <th>Minimum</th>
                  <th>Status</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>

              <tbody>
                {paginatedProducts.map((product) => {
                  const low =
                    Number(product.quantity) <=
                    Number(
                      product.minimumStock ??
                        product.minimum_stock ??
                        0
                    );

                  return (
                    <tr key={product.id}>
                      <td>
                        <div className="product-cell">
                          <span className="product-avatar">
                            {String(product.name || "P")
                              .slice(0, 1)
                              .toUpperCase()}
                          </span>

                          <div>
                            <strong>{product.name}</strong>
                            <small>{product.description}</small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="code-text">
                          {product.product_code ?? product.productCode ?? "-"}
                        </span>
                      </td>

                      {isAdmin && (
                        <td>
                          {money(
                            product.purchasePrice ??
                              product.purchase_price ??
                              0
                          )}
                        </td>
                      )}

                      <td>{money(product.price)}</td>

                      <td>
                        <strong
                          className={
                            low ? "text-warning" : "text-success"
                          }
                        >
                          {product.quantity}
                        </strong>
                      </td>

                      <td>
                        {product.minimumStock ?? product.minimum_stock ?? 0}
                      </td>

                      <td>
                        <span
                          className={`pill ${
                            low ? "pill-warning" : "pill-success"
                          }`}
                        >
                          <span />
                          {low ? "Low stock" : "In stock"}
                        </span>
                      </td>

                      {isAdmin && (
                        <td>
                          <div className="table-actions">
                            <button
                              type="button"
                              className="icon-button edit-button"
                              onClick={() => handleEdit(product)}
                              aria-label={`Edit ${product.name}`}
                              title="Edit"
                            >
                              ✎
                            </button>

                            <button
                              type="button"
                              className="icon-button delete-button"
                              onClick={() => handleDelete(product.id)}
                              aria-label={`Delete ${product.name}`}
                              title="Delete"
                            >
                              ⌫
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredProducts.length === 0 && (
              <div className="empty-state">
                <span className="empty-icon">⌕</span>
                <strong>No products found</strong>
                <p>Try another search term or change the stock filter.</p>
              </div>
            )}

            {filteredProducts.length > 0 && (
              <div className="pagination">
                <div className="pagination-info">
                  Showing {(currentPage - 1) * pageSize + 1}–
                  {Math.min(
                    currentPage * pageSize,
                    filteredProducts.length
                  )}{" "}
                  of {filteredProducts.length} products
                </div>

                <div className="pagination-controls">
                  <label htmlFor="pageSize">Per page:</label>

                  <select
                    id="pageSize"
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                  </select>

                  <button
                    type="button"
                    className="button-ghost"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                  >
                    Previous
                  </button>

                  <span>
                    Page {currentPage} of {Math.max(1, totalPages)}
                  </span>

                  <button
                    type="button"
                    className="button-ghost"
                    disabled={
                      currentPage >= totalPages || totalPages === 0
                    }
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.min(totalPages, page + 1)
                      )
                    }
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

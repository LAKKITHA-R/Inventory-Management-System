
import { useEffect, useState } from "react";
import axios from "axios";

export default function MonthlyAnalysis() {
  const today = new Date();

  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [sales, setSales] = useState({
    totalRevenue: 0,
    totalCost: 0,
    grossProfit: 0,
    totalBills: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const months = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December",
  ];

  const years = Array.from(
    { length: 5 },
    (_, i) => today.getFullYear() - i
  );

  useEffect(() => {
    const fetchSales = async () => {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          "http://localhost:8080/api/billing/monthly",
          {
            params: { year, month },
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setSales({
          totalRevenue: Number(response.data.totalRevenue || 0),
          totalCost: Number(response.data.totalCost || 0),
          grossProfit: Number(response.data.grossProfit || 0),
          totalBills: Number(response.data.totalBills || 0),
        });
      } catch (err) {
        setError(
          err.response?.status === 401 || err.response?.status === 403
            ? "Session expired. Please login again."
            : "Unable to load monthly sales details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, [month, year]);

  const money = (value) =>
    `₹${Number(value).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <main className="page-container">
      <header className="page-header">
        <div>
          <div className="eyebrow green-eyebrow">REPORTS</div>
          <h1>Monthly Sales Analysis</h1>
          <p className="page-subtitle">
            Sales performance for your selected month.
          </p>
        </div>
      </header>

      <section className="panel" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <label>
            Select Month
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              style={{ display: "block", padding: 10, marginTop: 8 }}
            >
              {months.map((name, i) => (
                <option key={name} value={i + 1}>
                  {name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Select Year
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              style={{ display: "block", padding: 10, marginTop: 8 }}
            >
              {years.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="panel" style={{ padding: 24 }}>
        <h2>{months[month - 1]} {year} — Sales Summary</h2>

        {loading ? (
          <p>Loading sales details...</p>
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : (
          <div className="stats-grid" style={{ marginTop: 20 }}>
            <article className="stat-card stat-card-featured">
              <div className="stat-top">
                <span>Total Revenue</span>
                <span className="stat-icon">₹</span>
              </div>
              <div className="stat-number stat-money">
                {money(sales.totalRevenue)}
              </div>
              <div className="stat-foot">Completed sales</div>
            </article>

            <article className="stat-card">
              <div className="stat-top">
                <span>Total Cost</span>
                <span className="stat-icon soft-icon">▤</span>
              </div>
              <div className="stat-number stat-money">
                {money(sales.totalCost)}
              </div>
              <div className="stat-foot">Cost of sold products</div>
            </article>

            <article className="stat-card">
              <div className="stat-top">
                <span>Gross Profit</span>
                <span className="stat-icon">↗</span>
              </div>
              <div className="stat-number stat-money">
                {money(sales.grossProfit)}
              </div>
              <div className="stat-foot">Revenue minus cost</div>
            </article>

            <article className="stat-card">
              <div className="stat-top">
                <span>Total Bills</span>
                <span className="stat-icon soft-icon">▧</span>
              </div>
              <div className="stat-number">{sales.totalBills}</div>
              <div className="stat-foot">Completed bills</div>
            </article>
          </div>
        )}
      </section>
    </main>
  );
}

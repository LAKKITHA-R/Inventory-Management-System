import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import LowStock from "./pages/LowStock";
import Navbar from "./components/Navbar";
import StockHistory from "./pages/StockHistory";
import StockManagement from "./pages/StockManagement";
import Billing from "./Billing";
import CreateBill from "./CreateBill";
import MonthlyAnalysis from "./MonthlyAnalysis.jsx";
function AppContent() {
  const location = useLocation();
  const isLogin = location.pathname === "/";
  const token = localStorage.getItem("token");

  return (
    <div className={isLogin ? "app app-login" : "app"}>
      {!isLogin && <Navbar />}
      <div className={isLogin ? "login-shell" : "workspace"}>
       
<Routes>
  <Route path="/" element={<Login />} />

  <Route
    path="/dashboard"
    element={token ? <Dashboard /> : <Navigate to="/" replace />}
  />

  <Route
    path="/products"
    element={token ? <Products /> : <Navigate to="/" replace />}
  />

  <Route
    path="/low-stock"
    element={token ? <LowStock /> : <Navigate to="/" replace />}
  />

  <Route
    path="/stock-history"
    element={token ? <StockHistory /> : <Navigate to="/" replace />}
  />

  <Route
    path="/stock-management"
    element={token ? <StockManagement /> : <Navigate to="/" replace />}
  />

  <Route
    path="/billing"
    element={token ? <Billing /> : <Navigate to="/" replace />}
  />

  <Route
    path="/createbill"
    element={token ? <CreateBill /> : <Navigate to="/" replace />}
  />

  <Route
  path="/monthly-analysis"
  element={token ? <MonthlyAnalysis /> : <Navigate to="/" replace />}
/>


  {/* Wildcard route always last */}
  <Route
    path="*"
    element={<Navigate to={token ? "/dashboard" : "/"} replace />}
  />
</Routes>

      </div>
    </div>
  );
}

export default function App() {
  return <BrowserRouter><AppContent /></BrowserRouter>;
}

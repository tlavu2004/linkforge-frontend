import { BrowserRouter, Routes, Route } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import AuthLayout from './layouts/AuthLayout'
import DashboardLayout from './layouts/DashboardLayout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AdInterstitial from './pages/AdInterstitial'
import VipUpgrade from './pages/VipUpgrade'
import VnPayReturn from './pages/VnPayReturn'
import PaymentSuccess from './pages/PaymentSuccess'
import AdminDashboard from './pages/AdminDashboard'
import AdminUserLinks from './pages/AdminUserLinks'
import NotFound from './pages/NotFound'
import DeleteLink from './pages/DeleteLink'
import Analytics from './pages/Analytics'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/ForgotPassword'
import ExpiredLink from './pages/ExpiredLink'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/ad" element={<AdInterstitial />} />
        <Route path="/buffer" element={<AdInterstitial />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />

        <Route path="/" element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="/expired" element={<ExpiredLink />} />
          <Route path="/delete" element={<DeleteLink />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/links/:shortCode/analytics" element={<Analytics />} />
          <Route path="/vip-upgrade" element={<VipUpgrade />} />
          <Route path="/vnpay-return" element={<VnPayReturn />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users/:userId/links" element={<AdminUserLinks />} />
        </Route>

      </Routes>
    </BrowserRouter>
  )
}

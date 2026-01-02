import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import EmployeeList from './pages/Employees/EmployeeList';
import PayrollDashboard from './pages/Payroll/PayrollDashboard';
import AttendanceDashboard from './pages/Attendance/AttendanceDashboard';
import RecruitmentDashboard from './pages/Recruitment/RecruitmentDashboard';
import ReportsDashboard from './pages/Reports/ReportsDashboard';
import OrganizationDashboard from './pages/Organization/OrganizationDashboard';
import LeaveManagement from './pages/LeaveManagement';
import ExpenseManagement from './pages/ExpenseManagement';
import DocumentsPage from './pages/DocumentsPage';
import NotificationsPage from './pages/NotificationsPage';

import LandingPage from './pages/LandingPage';
import Settings from './pages/Settings';
import Careers from './pages/Careers';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import LegalPage from './pages/LegalPage';

import { AuthProvider, useAuth } from './context/AuthContext';
import EmployeeDashboard from './pages/Employee/EmployeeDashboard';
import ProfilePage from './pages/Profile/ProfilePage';

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/careers" element={<Careers />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/privacy" element={<LegalPage />} />
      <Route path="/terms" element={<LegalPage />} />
      <Route path="/security" element={<LegalPage />} />

      {/* Protected Application Routes */}
      <Route path="/*" element={
        <ProtectedRoute>
          <Layout>
            <Routes>
              <Route
                path="/dashboard"
                element={user?.role === 'Employer' ? <Dashboard /> : <EmployeeDashboard />}
              />
              <Route path="/employees" element={<EmployeeList />} />
              <Route path="/payroll" element={<PayrollDashboard />} />
              <Route path="/attendance" element={<AttendanceDashboard />} />
              <Route path="/recruitment" element={<RecruitmentDashboard />} />
              <Route path="/leave" element={<LeaveManagement />} />
              <Route path="/expenses" element={<ExpenseManagement />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/reports" element={<ReportsDashboard />} />
              <Route path="/organization" element={<OrganizationDashboard />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              {/* Fallback to Dashboard */}
              <Route path="*" element={<Dashboard />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

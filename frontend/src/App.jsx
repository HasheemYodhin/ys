import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import EmployeeList from './pages/Employees/EmployeeList';
import PayrollDashboard from './pages/Payroll/PayrollDashboard';
import AttendanceDashboard from './pages/Attendance/AttendanceDashboard';
import RecruitmentDashboard from './pages/Recruitment/RecruitmentDashboard';
import ReportsDashboard from './pages/Reports/ReportsDashboard';
import OrganizationDashboard from './pages/Organization/OrganizationDashboard';
import LeaveManagement from './pages/LeaveManagement';
import ExpenseManagement from './pages/ExpenseManagement';
import DocumentsPage from './pages/DocumentsPage';

import LandingPage from './pages/LandingPage';
import Settings from './pages/Settings';
import Careers from './pages/Careers';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import LegalPage from './pages/LegalPage';

import { AuthProvider, useAuth } from './context/AuthContext';
import EmployeeDashboard from './pages/Employee/EmployeeDashboard';

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/careers" element={<Careers />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/privacy" element={<LegalPage />} />
      <Route path="/terms" element={<LegalPage />} />
      <Route path="/security" element={<LegalPage />} />

      {/* Protected Application Routes */}
      <Route path="/*" element={
        <Layout>
          <Routes>
            <Route
              path="/dashboard"
              element={<Dashboard />}
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
            {/* Fallback to Dashboard */}
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </Layout>
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

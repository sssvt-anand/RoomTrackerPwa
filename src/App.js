import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/UI/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import Dashboard from './pages/Dashboard';
import ExpensesPage from './pages/ExpensesPage';
import MembersPage from './pages/MembersPage';
import ReportsPage from './pages/ReportsPage';
import ProtectedRoute from './components/UI/ProtectedRoute';
import EditExpense from './components/Expenses/EditExpense';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ExpenseDetailsPage from './pages/ExpenseDetailsPage';
import BudgetPage from './pages/BudgetPage';

import './App.css';

function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Navbar />
            <div className="content">
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                

                {/* Protected Routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/expenses"
                  element={ 
                    <ProtectedRoute>
                      <ExpensesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/members"
                  element={
                    <ProtectedRoute>
                      <MembersPage />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/reports"
                  element={
                    <ProtectedRoute>
                      <ReportsPage />
                    </ProtectedRoute>
                  }
                />    
                <Route 
                  path="/expenses/edit/:id" 
                  element={
                    <ProtectedRoute>
                      <EditExpense />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/expenses/:id" element={<ExpenseDetailsPage />} />
                <Route
  path="/budget"
  element={
    <ProtectedRoute>
      <BudgetPage />
    </ProtectedRoute>
  }
/>
                
                {/* Fallback route - can be a 404 page */}
                <Route path="*" element={<LoginPage />} />
              </Routes>
            </div>
          </div>
        </Router>
      </AuthProvider>
    </LocalizationProvider>
  );
}

export default App;
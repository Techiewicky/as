// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Main from './Main';
import ProtectedRoute from './ProtectedRoute';
import { AuthProvider } from './AuthContext';
import Navbar from './Navbar';
import './App.css'; // Ensure Tailwind directives are included
import { useTranslation } from 'react-i18next';
import { ToastContainer } from 'react-toastify';

const App = () => {
  const { i18n } = useTranslation();

  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <ToastContainer />
        <div className="container mx-auto p-4">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Main />
                </ProtectedRoute>
              }
            />
            {/* Add more routes as needed */}
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;

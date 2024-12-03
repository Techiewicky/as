// src/Login.js
import React from 'react';
import { useAuth } from './AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const { currentUser, login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogin = async () => {
    try {
      await login();
      toast.success(t('loggedInSuccessfully')); // Ensure this key exists
      navigate('/');
    } catch (error) {
      console.error('Failed to login:', error);
      toast.error(t('loginFailed')); // Ensure this key exists
    }
  };

  if (currentUser) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <ToastContainer />
      <div className="bg-white p-8 rounded shadow-md w-80">
        <h2 className="text-2xl font-bold mb-6 text-center">{t('login')}</h2>
        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          {t('loginWithGoogle')}
        </button>
      </div>
    </div>
  );
};

export default Login;

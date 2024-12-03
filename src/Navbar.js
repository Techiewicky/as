// src/Navbar.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify'; // Import toast
import 'react-toastify/dist/ReactToastify.css'; // Import react-toastify styles
import { FaHome, FaSignOutAlt, FaSignInAlt, FaSun, FaMoon } from 'react-icons/fa'; // Import icons

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success(t('logoutSuccess'));
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
      toast.error(t('logoutFailure'));
    }
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <nav className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 flex justify-between items-center">
      <div className="text-white font-bold text-2xl flex items-center">
        <Link to="/">
          <span className="mr-2">{t('appName')}</span>
          {/* Optionally, add an icon */}
          {/* <FaGift /> */}
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        {currentUser && (
          <>
            <Link to="/" className="text-white hover:text-gray-200 flex items-center">
              <FaHome className="mr-1" /> {t('home')}
            </Link>
            <button onClick={handleLogout} className="text-white hover:text-gray-200 flex items-center">
              <FaSignOutAlt className="mr-1" /> {t('logout')}
            </button>
          </>
        )}
        {!currentUser && (
          <Link to="/login" className="text-white hover:text-gray-200 flex items-center">
            <FaSignInAlt className="mr-1" /> {t('login')}
          </Link>
        )}
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="text-white hover:text-gray-200 focus:outline-none"
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>
        {/* Language Switcher */}
        <select
          onChange={(e) => changeLanguage(e.target.value)}
          className="bg-transparent border border-white text-white p-1 rounded focus:outline-none"
          defaultValue={i18n.language}
        >
          <option value="en">🇬🇧 English</option>
          <option value="ar">🇸🇦 العربية</option>
        </select>
      </div>
    </nav>
  );
};

export default Navbar;

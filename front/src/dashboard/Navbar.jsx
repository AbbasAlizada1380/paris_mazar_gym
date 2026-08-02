import React, { useState, useEffect, useRef } from "react";
import {
  FaBell,
  FaSearch,
  FaUserCircle,
  FaCog,
  FaSignOutAlt,
  FaUser,
  FaChevronDown,
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { useSelector, useDispatch } from "react-redux";
import { signOutSuccess } from "./auth/userSlice/userSlice";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ProfileModal from "./ProfileModal";
import moment from "moment-jalaali";

moment.loadPersian({ usePersianDigits: true, dialect: "persian-modern" });

const Navbar = () => {
  const BRAND_NAME = import.meta.env.VITE_BRAND_NAME;
  const [dateInfo, setDateInfo] = useState({
    day: "",
    month: "",
    dateNumber: "",
    year: "",
    time: "",
  });
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [notifications] = useState([]);
  const profileDropdownRef = useRef(null);

  // ─── Get currentUser from Redux ──────────────────────────────
  const { currentUser } = useSelector((state) => state.user || {});

  // ─── Fallback to localStorage if Redux state is empty ────────
  const userFromStorage = JSON.parse(localStorage.getItem("authData"))?.userData;
  const user = currentUser || userFromStorage;

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // ─── Update date/time ─────────────────────────────────────────
  useEffect(() => {
    const updateDate = () => {
      const now = moment();
      const jMonthIndex = now.jMonth();
      const shamsiMonthName = jMonthIndex; // can map to Persian month names if needed

      setDateInfo({
        day: now.format("dddd"),
        year: now.format("jYYYY"),
        month: shamsiMonthName,
        dateNumber: now.format("jD"),
        time: now.format("HH:mm"),
      });
    };

    updateDate();
    const timer = setInterval(updateDate, 60000);
    return () => clearInterval(timer);
  }, []);

  // ─── Click outside dropdown ──────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ─── Handlers ──────────────────────────────────────────────────
  const handleLogout = () => {
    dispatch(signOutSuccess());
    setIsProfileDropdownOpen(false);
    navigate("/sign-in");
  };

  const handleOpenProfileModal = () => {
    setIsProfileModalOpen(true);
    setIsProfileDropdownOpen(false);
  };

  const handleCloseProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  // ─── Helper: get initials from fullname ──────────────────────
  const getInitials = (fullname = "") => {
    const parts = fullname.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return fullname.slice(0, 2).toUpperCase();
  };

  const notificationCount = notifications.length;

  return (
    <>
      <nav className="bg-white text-gray-800 py-2 shadow-sm px-6 grid grid-cols-3 border-b border-gray-200 sticky top-0 z-40 backdrop-blur-sm">
        {/* Left Section - Logo/Brand */}
        <div className="flex items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-xl shadow-lg">
              <MdDashboard size={20} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-800">{BRAND_NAME}</h1>
            </div>
          </div>
        </div>

        {/* Center Section - Date & Time */}
        <div className="hidden md:flex items-center justify-center">
          <div className="text-center flex items-center gap-4">
            <div className="text-right flex items-center gap-x-3">
              <p className="text-xl font-bold text-cyan-800">{dateInfo.day}</p>
              <p className="text-sm text-gray-600 font-medium">
                {dateInfo.dateNumber} {dateInfo.month} {dateInfo.year}
              </p>
            </div>
          </div>
        </div>

        {/* Right Section - User Menu & Notifications */}
        <div className="flex items-center justify-end gap-4">
          {/* Notifications Bell */}
          {/* <div className="relative">
            <button className="relative p-2 text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition-all duration-200 group">
              <FaBell size={18} />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {notificationCount}
                </span>
              )}
            </button>
          </div> */}

          {/* User Profile Dropdown */}
          <div ref={profileDropdownRef} className="relative">
            <button
              className="flex items-center gap-3 group bg-white hover:bg-gray-50 rounded-2xl px-3 py-2 transition-all duration-200 border border-transparent hover:border-cyan-200"
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            >
              <div className="flex items-center gap-3">
                {user?.photo ? (
                  <img
                    src={`${import.meta.env.VITE_BASE_URL}/uploads/photos/${user.photo}`}
                    alt="User Avatar"
                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 group-hover:border-cyan-500 transition-all duration-300 shadow-sm"
                  />
                ) : user?.fullname ? (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm border-2 border-white shadow-lg">
                    {getInitials(user.fullname)}
                  </div>
                ) : (
                  <FaUserCircle className="text-3xl text-gray-400 group-hover:text-cyan-600 transition-colors" />
                )}

                <div className="hidden lg:block text-right">
                  <p className="text-sm font-semibold text-gray-800 group-hover:text-cyan-800">
                    {user?.fullname || "کاربر"}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.role || "کاربر"}
                  </p>
                </div>

                <FaChevronDown
                  className={`text-gray-400 transition-transform duration-200 ${
                    isProfileDropdownOpen ? "rotate-180" : ""
                  }`}
                  size={12}
                />
              </div>
            </button>

            <AnimatePresence>
              {isProfileDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute end-0 z-50 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 backdrop-blur-sm"
                >
                  {/* User Info Header */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      {user?.photo ? (
                        <img
                          src={`${import.meta.env.VITE_BASE_URL}/uploads/photos/${user.photo}`}
                          alt="User Avatar"
                          className="w-12 h-12 rounded-full object-cover border-2 border-cyan-100"
                        />
                      ) : user?.fullname ? (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg border-2 border-white shadow-lg">
                          {getInitials(user.fullname)}
                        </div>
                      ) : (
                        <FaUserCircle className="text-4xl text-gray-400" />
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {user?.fullname || "کاربر"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user?.email || ""}
                        </p>
                        <p className="text-xs text-cyan-600 font-medium capitalize mt-1">
                          {user?.role || "کاربر"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Dropdown Menu Items */}
                  <div className="p-2 space-y-1">
                    <button
                      onClick={handleOpenProfileModal}
                      className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-cyan-50 rounded-xl transition-all duration-200 group"
                    >
                      <FaUser className="ml-3 text-gray-500 group-hover:text-cyan-600" />
                      <span className="flex-1 text-right">پروفایل کاربری</span>
                    </button>

                    <div className="border-t border-gray-100 pt-2 mt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group"
                      >
                        <FaSignOutAlt className="ml-3 text-red-500" />
                        <span className="flex-1 text-right">خروج از حساب</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={handleCloseProfileModal}
        currentUser={user}
      />
    </>
  );
};

export default Navbar;
import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { FaSpinner, FaEye } from "react-icons/fa";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function TakenCabinets() {
  const [cabinets, setCabinets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // ---------- Photo preview modal ----------
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");

  // ---------- Fetch taken cabinets ----------
  const fetchTakenCabinets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${BASE_URL}/fees/taken-cabinets`);
      setCabinets(res.data.data || []);
    } catch (err) {
      console.error("Error fetching taken cabinets:", err);
      setError("بارگذاری کابینت‌های اشغال شده ناموفق بود. لطفاً دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTakenCabinets();
  }, [fetchTakenCabinets]);

  // ---------- Filter cabinets based on search ----------
  const filteredCabinets = useMemo(() => {
    if (!searchQuery.trim()) return cabinets;
    const query = searchQuery.trim().toLowerCase();
    return cabinets.filter((item) => {
      const cabNum = item.cabinate_num?.toString().toLowerCase() || "";
      const athleteName = item.athlete?.full_name?.toLowerCase() || "";
      return cabNum.includes(query) || athleteName.includes(query);
    });
  }, [cabinets, searchQuery]);

  // ---------- View photo ----------
  const handleViewPhoto = (athlete) => {
    if (athlete?.photo) {
      setPhotoUrl(`${BASE_URL}/uploads/photos/${athlete.photo}`);
      setShowPhotoModal(true);
    } else {
      alert("این ورزشکار عکسی ندارد");
    }
  };

  // ---------- Render ----------
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6 space-y-8">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">کابینت‌های اشغال شده</h1>
        <p className="text-gray-600">جستجو بر اساس شماره کابینت یا نام ورزشکار</p>
      </div>

      {/* Stats + Search + Refresh */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-md border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500">کابینت‌های اشغال شده</p>
            <p className="text-2xl font-bold text-gray-800">
              {filteredCabinets.length}
              {searchQuery.trim() && cabinets.length !== filteredCabinets.length && (
                <span className="text-sm font-normal text-gray-500 mr-2">
                  (از {cabinets.length})
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="w-full md:w-72">
          <input
            type="text"
            placeholder="جستجوی شماره کابینت یا نام ورزشکار..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F3A76] focus:border-transparent outline-none transition"
          />
        </div>

        <button
          onClick={fetchTakenCabinets}
          className="px-4 py-2 bg-[#0F3A76] text-white rounded-lg hover:bg-[#0A2D5E] transition shadow flex items-center gap-2 whitespace-nowrap"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          بروزرسانی
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-[#0F3A76] text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold">لیست کابینت‌های اشغال شده</h2>
                <p className="text-sm text-white/80">
                  {filteredCabinets.length} کابینت نمایش داده شده
                  {loading && " • در حال بارگذاری..."}
                </p>
              </div>
            </div>
            {loading && (
              <div className="flex items-center gap-2 text-sm bg-white/20 px-3 py-1 rounded-full">
                <FaSpinner className="animate-spin" />
                در حال بارگذاری...
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FaSpinner className="text-4xl text-[#0F3A76] animate-spin mb-4" />
            <p className="text-gray-600">در حال بارگذاری لیست کابینت‌ها...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchTakenCabinets}
              className="mt-4 px-6 py-2 bg-[#0F3A76] text-white rounded-lg hover:bg-[#0A2D5E] transition"
            >
              تلاش مجدد
            </button>
          </div>
        ) : filteredCabinets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
            <p className="text-gray-500 text-lg">
              {searchQuery.trim()
                ? "نتیجه‌ای برای جستجوی شما یافت نشد"
                : "هیچ کابینتی اشغال نشده است"}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {searchQuery.trim()
                ? "لطفاً عبارت دیگری را جستجو کنید"
                : "همه کابینت‌ها در حال حاضر آزاد هستند"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-center">
              <thead className="bg-[#0F3A76] text-white">
                <tr>
                  <th className="p-3 border-b font-semibold">شماره کابینت</th>
                  <th className="p-3 border-b font-semibold">نام ورزشکار</th>
                  <th className="p-3 border-b font-semibold">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {filteredCabinets.map((item) => (
                  <tr
                    key={item.cabinate_num}
                    className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-3 font-bold text-lg text-[#0F3A76]">
                      {item.cabinate_num}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-3 justify-center">
                        {item.athlete?.photo && (
                          <img
                            src={`${BASE_URL}/uploads/photos/${item.athlete.photo}`}
                            alt={item.athlete?.full_name}
                            className="w-8 h-8 rounded-full object-cover border cursor-pointer"
                            onClick={() => handleViewPhoto(item.athlete)}
                            onError={(e) => (e.target.style.display = "none")}
                          />
                        )}
                        <span className="font-medium text-gray-800">
                          {item.athlete?.full_name || "ناشناس"}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleViewPhoto(item.athlete)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                        title="مشاهده عکس"
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Photo Preview Modal */}
      {showPhotoModal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center"
          onClick={() => setShowPhotoModal(false)}
        >
          <div
            className="relative bg-white rounded-lg shadow-xl w-[420px] h-[360px] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={photoUrl}
              alt="پیش‌نمایش عکس ورزشکار"
              className="max-w-full max-h-full object-contain p-4"
            />
            <button
              onClick={() => setShowPhotoModal(false)}
              className="absolute -top-3 -right-3 bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow hover:bg-red-700 transition"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
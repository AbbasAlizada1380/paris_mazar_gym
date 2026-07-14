import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Pagination from "../pagination/Pagination";
import AthletePaidFeesPDF from "./report/AthletePaidFeesPDF";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const ActiveAthletes = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showImage, setShowImage] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchActiveAthletes = useCallback(
    async (page = currentPage) => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${BASE_URL}/fees/active?page=${page}&limit=${limit}`
        );
        setFees(res.data.data);
        setCurrentPage(res.data.currentPage);
        setTotalPages(res.data.totalPages);
        setUpdateMessage("");
      } catch (error) {
        console.error("Error fetching active athletes:", error);
        setUpdateMessage("بارگذاری ورزشکاران فعال با خطا مواجه شد.");
      } finally {
        setLoading(false);
      }
    },
    [currentPage]
  );

  useEffect(() => {
    fetchActiveAthletes(currentPage);
  }, [currentPage, fetchActiveAthletes]);

  const handleUpdateActiveStatus = async () => {
    setIsUpdating(true);
    setUpdateMessage("");
    try {
      const res = await axios.get(`${BASE_URL}/fees/update-active`);
      setUpdateMessage(res.data.message || "وضعیت فعال‌سازی با موفقیت به‌روزرسانی شد!");
      await fetchActiveAthletes(currentPage);
    } catch (error) {
      console.error("Error updating active status:", error);
      setUpdateMessage(
        error.response?.data?.message || "به‌روزرسانی وضعیت فعال‌سازی ناموفق بود."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6 space-y-8">
      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-[#0F3A76] text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0c-.281.023-.562.045-.843.066a23.518 23.518 0 00-7.86-3.317 8.991 8.991 0 00-5.697 1.641 8.975 8.975 0 013.33 7.007h6.07z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold">ورزشکاران فعال</h2>
                <p className="text-sm text-white/80">لیست ورزشکاران دارای اشتراک فعال امروز</p>
              </div>
            </div>

            <button
              onClick={handleUpdateActiveStatus}
              disabled={isUpdating}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isUpdating
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-white/20 hover:bg-white/30 text-white"
              }`}
            >
              {isUpdating ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  در حال به‌روزرسانی...
                </>
              ) : (
                "به‌روزرسانی وضعیت فعال"
              )}
            </button>
          </div>
        </div>

        {/* Messages */}
        {updateMessage && (
          <div className="px-4 pt-4">
            <div
              className={`p-3 rounded-lg ${
                updateMessage.includes("Failed") || updateMessage.includes("خطا")
                  ? "bg-red-100 text-red-700 border border-red-300"
                  : "bg-green-100 text-green-700 border border-green-300"
              }`}
            >
              {updateMessage}
            </div>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-[#0F3A76] border-t-[#0F3A76] rounded-full animate-spin mb-3"></div>
            <p className="text-gray-600">در حال بارگذاری ورزشکاران فعال...</p>
          </div>
        ) : fees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
            <p className="text-gray-500 text-lg">امروز هیچ ورزشکار فعالی وجود ندارد</p>
            <p className="text-gray-400 text-sm mt-1">برای به‌روزرسانی وضعیت، دکمه بالا را بزنید</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-center">
                <thead className="bg-[#0F3A76] text-white">
                  <tr>
                    <th className="p-3 border-b font-semibold">#</th>
                    <th className="p-3 border-b font-semibold">نام</th>
                    <th className="p-3 border-b font-semibold">شماره ملی</th>
                    <th className="p-3 border-b font-semibold">تاریخ شروع</th>
                    <th className="p-3 border-b font-semibold">تاریخ پایان</th>
                    <th className="p-3 border-b font-semibold">مبلغ کل</th>
                    <th className="p-3 border-b font-semibold">دریافتی</th>
                    <th className="p-3 border-b font-semibold">باقیمانده</th>
                    {/* ✅ NEW cabinet columns */}
                    <th className="p-3 border-b font-semibold">کابینت</th>
                    <th className="p-3 border-b font-semibold">شماره کابینت</th>
                    <th className="p-3 border-b font-semibold">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {fees.map((fee, index) => (
                    <tr
                      key={fee.id}
                      className="hover:bg-gray-50 border-b last:border-0 transition-colors"
                    >
                      <td className="p-3 text-gray-600">
                        {(currentPage - 1) * limit + index + 1}
                      </td>
                      <td className="p-3 font-medium text-gray-800">
                        {fee.athlete?.full_name}
                      </td>
                      <td className="p-3 text-gray-600">{fee.athlete?.nic_number}</td>
                      <td className="p-3">{fee.startDate}</td>
                      <td className="p-3">{fee.endDate}</td>
                      <td className="p-3">
                        <span className="text-purple-700 font-bold">
                          {parseFloat(fee.total).toLocaleString()}
                        </span>
                      </td>
                      <td className="p-3 text-green-600 font-medium">
                        {parseFloat(fee.received).toLocaleString()}
                      </td>
                      <td className="p-3">
                        <span className={`font-semibold ${fee.remained > 0 ? "text-red-600" : "text-green-600"}`}>
                          {parseFloat(fee.remained).toLocaleString()}
                        </span>
                      </td>
                      {/* Cabinet info */}
                      <td className="p-3">
                        {fee.has_cabinate ? (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                            دارد
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                            ندارد
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-gray-600">
                        {fee.has_cabinate ? fee.cabinate_num || "—" : "—"}
                      </td>
                      <td className="p-3">
                        <AthletePaidFeesPDF athleteId={fee.athleteId} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-gray-200">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => setCurrentPage(page)}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Image Modal (if needed) */}
      {showImage && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
          <div className="absolute inset-0" onClick={() => setShowImage(false)} />
          <div className="relative z-10 bg-white rounded-lg shadow-xl w-[420px] h-[360px] flex items-center justify-center">
            <img src={imageUrl} alt="پیش‌نمایش" className="max-w-full max-h-full object-contain" />
            <button
              onClick={() => setShowImage(false)}
              className="absolute -top-3 -right-3 bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveAthletes;
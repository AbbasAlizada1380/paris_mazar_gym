// src/components/fees/Fees.jsx
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Pagination from "../pagination/Pagination";
import FeesSearchBar from "../searching/feeSearchBar";
import AthletePaidFeesPDF from "./report/AthletePaidFeesPDF";
import FeesReport from "./FeesReport";
import { FaEdit, FaTrash, FaCheck, FaSpinner, FaPrint } from "react-icons/fa";
import PrintFeePass from "./PrintFeePass";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function Fees() {
  // ---------- State ----------
  const [fees, setFees] = useState([]);
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMeta, setSearchMeta] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const limit = 20;
  const [feeModal, setFeeModal] = useState({ isOpen: false, fee: null });

  const [form, setForm] = useState({
    startDate: "",
    endDate: "",
    total: "",
    received: "",
    athleteId: "",
    cabinate_num: "",
    has_cabinate: false,
  });

  // ---------- Unified fetch function ----------
  const fetchData = useCallback(
    async (page = 1, query = null) => {
      setLoading(true);
      try {
        let res;
        if (query && query.trim()) {
          // Search mode
          res = await axios.get(`${BASE_URL}/fees/search`, {
            params: { query: query.trim(), page, limit },
          });
          setFees(res.data.data);
          setTotalPages(res.data.meta?.totalPages || 1);
          setTotalItems(res.data.meta?.totalItems || 0);
          setCurrentPage(res.data.meta?.currentPage || page);
          setIsSearching(true);
          setSearchMeta(res.data.meta);
          setSearchQuery(query.trim());
        } else {
          // Normal mode
          res = await axios.get(`${BASE_URL}/fees?page=${page}&limit=${limit}`);
          setFees(res.data.data);
          setTotalPages(res.data.totalPages || 1);
          setTotalItems(res.data.totalItems || 0);
          setCurrentPage(res.data.currentPage || page);
          setIsSearching(false);
          setSearchMeta(null);
          setSearchQuery("");
        }
      } catch (err) {
        alert("بارگذاری فیس‌ها ناموفق بود: " + (err.response?.data?.message || err.message));
        setFees([]);
        setTotalPages(0);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    },
    [limit]
  );

  // ---------- Fetch on page change ----------
  useEffect(() => {
    if (isSearching && searchQuery) {
      fetchData(currentPage, searchQuery);
    } else {
      fetchData(currentPage);
    }
  }, [currentPage, fetchData, isSearching, searchQuery]);

  // ---------- Search handler (called by SearchBar) ----------
  const handleSearch = (query) => {
    if (query.trim() === "") {
      // Clear search → go to normal list, page 1
      fetchData(1, null);
    } else {
      // New search → reset to page 1 with the query
      fetchData(1, query);
    }
  };

  // ---------- Clear search (manual button) ----------
  const handleClearSearch = () => {
    fetchData(1, null);
  };

  // ---------- Pagination handler ----------
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // useEffect will automatically fetch the new page with the current query
  };

  // ---------- Form handlers ----------
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const resetForm = () => {
    setForm({
      startDate: "",
      endDate: "",
      total: "",
      received: "",
      athleteId: "",
      cabinate_num: "",
      has_cabinate: false,
    });
    setEditingId(null);
  };

  const toggleForm = useCallback(async () => {
    if (!openForm) {
      try {
        const res = await axios.get(`${BASE_URL}/athletes`);
        setAthletes(res.data.data);
      } catch (err) {
        alert("بارگذاری ورزشکاران ناموفق بود: " + (err.response?.data?.message || err.message));
      }
    }
    setOpenForm((prev) => !prev);
    if (openForm) resetForm();
  }, [openForm]);

  // ---------- Submit (Create / Update) ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    const payload = {
      ...form,
      cabinate_num: form.cabinate_num ? Number(form.cabinate_num) : null,
    };

    try {
      if (editingId) {
        await axios.put(`${BASE_URL}/fees/${editingId}`, payload);
      } else {
        await axios.post(`${BASE_URL}/fees`, payload);
      }
      // Refresh current view (preserving search if any)
      if (isSearching && searchQuery) {
        fetchData(currentPage, searchQuery);
      } else {
        fetchData(currentPage);
      }
      resetForm();
      setOpenForm(false);
    } catch (err) {
      alert(err.response?.data?.message || "عملیات ناموفق بود");
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- Edit ----------
  const handleEdit = (fee) => {
    setForm({
      startDate: fee.startDate,
      endDate: fee.endDate,
      total: fee.total,
      received: fee.received,
      athleteId: fee.athleteId,
      cabinate_num: fee.cabinate_num || "",
      has_cabinate: fee.has_cabinate || false,
    });
    setEditingId(fee.id);
    setOpenForm(true);
  };

  // ---------- Delete ----------
  const handleDelete = async (id) => {
    if (!confirm("آیا از حذف این فیس مطمئن هستید؟")) return;
    try {
      await axios.delete(`${BASE_URL}/fees/${id}`);
      if (isSearching && searchQuery) {
        fetchData(currentPage, searchQuery);
      } else {
        fetchData(currentPage);
      }
    } catch (err) {
      alert("حذف ناموفق بود: " + (err.response?.data?.message || err.message));
    }
  };

  // ---------- Render ----------
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6 space-y-8">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">مدیریت فیس‌ها</h1>
        <p className="text-gray-600">ثبت و مدیریت فیس‌های ورزشکاران</p>
        {editingId && (
          <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 rounded-xl max-w-md mx-auto">
            <div className="flex items-center justify-center gap-2 text-yellow-800">
              <FaEdit className="h-5 w-5" />
              <span className="font-semibold">حالت ویرایش – فیس #{editingId}</span>
            </div>
          </div>
        )}
      </div>

      {/* Toggle Form Button + Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <button
          onClick={toggleForm}
          className="px-6 py-3 bg-[#0F3A76] text-white rounded-xl hover:bg-[#0A2D5E] transition font-medium shadow-md flex items-center gap-2"
        >
          {openForm ? "بستن فرم" : "افزودن فیس جدید"}
        </button>
        <div className="w-full md:w-96">
          <FeesSearchBar
            onSearch={handleSearch}   // <-- new prop
            placeholder="جستجو بر اساس نام ورزشکار، نام پدر یا شماره ملی..."
          />
        </div>
      </div>

      {/* Search status banner */}
      {isSearching && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-blue-600 font-medium">
              نمایش نتایج جستجو
              {searchMeta?.searchQuery && ` برای "${searchMeta.searchQuery}"`}
              {searchMeta?.matchingAthletesCount && ` (${searchMeta.matchingAthletesCount} ورزشکار)`}
            </span>
            <span className="text-blue-500 text-sm">• {totalItems} فیس یافت شد</span>
          </div>
          <button
            onClick={handleClearSearch}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 hover:bg-blue-100 rounded"
          >
            پاک کردن جستجو
          </button>
        </div>
      )}

      {/* Form Section */}
      {openForm && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-[#0F3A76] text-white p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v1m0-4.5A5.5 5.5 0 016.5 10.5 5.5 5.5 0 0012 16a5.5 5.5 0 005.5-5.5A5.5 5.5 0 0012 5.5z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {editingId ? "ویرایش فیس" : "افزودن فیس جدید"}
                </h2>
                <p className="text-sm text-white/80">
                  {editingId ? "ویرایش اطلاعات فیس" : "ثبت اطلاعات فیس جدید"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="text-red-500">*</span> ورزشکار
                </label>
                <select
                  name="athleteId"
                  value={form.athleteId}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#0F3A76] focus:border-[#0F3A76] transition"
                  required
                >
                  <option value="">انتخاب ورزشکار</option>
                  {athletes.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.full_name} ({a.nic_number})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="text-red-500">*</span> تاریخ شروع
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#0F3A76] focus:border-[#0F3A76] transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="text-red-500">*</span> تاریخ پایان
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#0F3A76] focus:border-[#0F3A76] transition"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="text-red-500">*</span> مبلغ کل (افغانی)
                  </label>
                  <input
                    type="number"
                    name="total"
                    placeholder="۰.۰۰"
                    value={form.total}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#0F3A76] focus:border-[#0F3A76] transition"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    مبلغ دریافتی (افغانی)
                  </label>
                  <input
                    type="number"
                    name="received"
                    placeholder="۰.۰۰"
                    value={form.received}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#0F3A76] focus:border-[#0F3A76] transition"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    کابینت دارد؟
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="has_cabinate"
                      checked={form.has_cabinate}
                      onChange={handleChange}
                      className="w-5 h-5 text-[#0F3A76] border-gray-300 rounded focus:ring-[#0F3A76]"
                    />
                    <span className="text-sm text-gray-600">
                      {form.has_cabinate ? "بله" : "خیر"}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    شماره کابینت
                  </label>
                  <input
                    type="number"
                    name="cabinate_num"
                    placeholder="مثلاً ۱۰۱"
                    value={form.cabinate_num}
                    onChange={handleChange}
                    disabled={!form.has_cabinate}
                    className={`w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#0F3A76] focus:border-[#0F3A76] transition ${
                      !form.has_cabinate ? "bg-gray-100 text-gray-500" : ""
                    }`}
                    min="1"
                    step="1"
                  />
                </div>
              </div>

              {form.total && form.received && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">باقیمانده:</span>
                    <span className={`font-semibold ${form.total - form.received > 0 ? "text-red-600" : "text-green-600"}`}>
                      {(form.total - form.received).toLocaleString()} افغانی
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setOpenForm(false);
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                  >
                    لغو ویرایش
                  </button>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-6 py-3 rounded-lg font-medium shadow-md transition flex items-center gap-2 ${
                    submitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#0F3A76] text-white hover:bg-[#0A2D5E]"
                  }`}
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="animate-spin h-5 w-5" />
                      در حال ذخیره...
                    </>
                  ) : (
                    <>
                      <FaCheck />
                      {editingId ? "ذخیره تغییرات" : "ثبت فیس"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-[#0F3A76] text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold">لیست فیس‌ها</h2>
                <p className="text-sm text-white/80">
                  {totalItems} فیس ثبت شده
                  {loading && " • در حال بارگذاری..."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {loading && (
                <div className="flex items-center gap-2 text-sm bg-white/20 px-3 py-1 rounded-full">
                  <FaSpinner className="animate-spin" />
                  در حال بارگذاری...
                </div>
              )}
              <FeesReport />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FaSpinner className="text-4xl text-[#0F3A76] animate-spin mb-4" />
            <p className="text-gray-600">در حال بارگذاری لیست فیس‌ها...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-center">
              <thead className="bg-[#0F3A76] text-white">
                <tr>
                  <th className="p-3 border-b font-semibold">ورزشکار</th>
                  <th className="p-3 border-b font-semibold">شماره ملی</th>
                  <th className="p-3 border-b font-semibold">دوره</th>
                  <th className="p-3 border-b font-semibold">مبلغ کل</th>
                  <th className="p-3 border-b font-semibold">دریافتی</th>
                  <th className="p-3 border-b font-semibold">باقیمانده</th>
                  <th className="p-3 border-b font-semibold">کابینت</th>
                  <th className="p-3 border-b font-semibold">شماره کابینت</th>
                  <th className="p-3 border-b font-semibold">وضعیت</th>
                  <th className="p-3 border-b font-semibold">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {fees.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="p-8">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                        </svg>
                        <p className="text-gray-500 text-lg">هیچ فیس‌ای ثبت نشده است</p>
                        <p className="text-gray-400 text-sm mt-1">برای شروع، فیس جدیدی اضافه کنید</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  fees.map((f) => (
                    <tr key={f.id} className="hover:bg-gray-50 border-b last:border-0 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2 justify-center">
                          {f.athlete?.photo && (
                            <img
                              src={`${BASE_URL}/uploads/${f.athlete.photo}`}
                              alt={f.athlete?.full_name}
                              className="w-8 h-8 rounded-full object-cover border"
                              onError={(e) => (e.target.style.display = "none")}
                            />
                          )}
                          <div>
                            <div className="font-medium text-gray-800">{f.athlete?.full_name || "ناشناس"}</div>
                            <div className="text-xs text-gray-500">{f.athlete?.father_name || ""}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-gray-600 font-mono text-sm">{f.athlete?.nic_number || "—"}</td>
                      <td className="p-3">
                        <div className="flex flex-col">
                          <span className="text-gray-700">{f.startDate}</span>
                          <span className="text-gray-400 text-xs">تا</span>
                          <span className="text-gray-700">{f.endDate}</span>
                        </div>
                      </td>
                      <td className="p-3 font-medium text-gray-900">{parseFloat(f.total).toLocaleString()} افغانی</td>
                      <td className="p-3 text-green-600 font-medium">{parseFloat(f.received || 0).toLocaleString()} افغانی</td>
                      <td className="p-3">
                        <span className={`font-semibold ${f.remained > 0 ? "text-red-600" : "text-green-600"}`}>
                          {parseFloat(f.remained || 0).toLocaleString()} افغانی
                        </span>
                      </td>
                      <td className="p-3">
                        {f.has_cabinate ? (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">دارد</span>
                        ) : (
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">ندارد</span>
                        )}
                      </td>
                      <td className="p-3">{f.has_cabinate ? f.cabinate_num || "—" : "—"}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            f.remained === 0
                              ? "bg-green-100 text-green-800"
                              : f.remained === f.total
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {f.remained === 0 ? "پرداخت شده" : f.remained === f.total ? "پرداخت نشده" : "بخشی"}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(f)}
                            className="p-2 text-[#0F3A76] hover:bg-blue-50 rounded-lg transition"
                            title="ویرایش"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(f.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="حذف"
                          >
                            <FaTrash />
                          </button>
                          <button
                            onClick={() => setFeeModal({ isOpen: true, fee: f })}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                            title="چاپ کارت ورود"
                          >
                            <FaPrint />
                          </button>
                          <AthletePaidFeesPDF athleteId={f.athleteId} />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="border-t border-gray-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* Print Modal */}
      <PrintFeePass
        isOpen={feeModal.isOpen}
        onClose={() => setFeeModal({ isOpen: false, fee: null })}
        fee={feeModal.fee}
        autoPrint={false}
      />
    </div>
  );
}
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Pagination from "../../pagination/Pagination";
import SearchBar from "../../searching/athleteSearchBar";
import AthletePaidFeesPDF from "../report/AthletePaidFeesPDF";
import AthleteForm from "./AthleteForm";
import { FaEdit, FaTrash, FaSpinner, FaEye, FaPlus, FaCheck } from "react-icons/fa";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function AthleteManager() {
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAthletes, setTotalAthletes] = useState(0);
  const itemsPerPage = 20;

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Image preview modal
  const [showImage, setShowImage] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  // ─── Fee modal state ─────────────────────────────────────────────
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [selectedAthleteId, setSelectedAthleteId] = useState(null);
  const [feeForm, setFeeForm] = useState({
    startDate: "",
    endDate: "",
    total: "",
    received: "",
    has_cabinate: false,
    cabinate_num: "",
  });
  const [feeSubmitting, setFeeSubmitting] = useState(false);

  // ─── Data fetching ──────────────────────────────────────────────
  const fetchData = useCallback(
    async (page = 1, query = null) => {
      setLoading(true);
      try {
        let res;
        if (query && query.trim()) {
          res = await axios.get(`${BASE_URL}/athletes/search`, {
            params: { query: query.trim(), page, limit: itemsPerPage },
          });
          setAthletes(res.data.data);
          setTotalAthletes(res.data.meta?.totalItems || 0);
          setTotalPages(res.data.meta?.totalPages || 1);
          setCurrentPage(res.data.meta?.currentPage || page);
          setIsSearching(true);
          setSearchQuery(query.trim());
        } else {
          res = await axios.get(`${BASE_URL}/athletes`, {
            params: { page, limit: itemsPerPage },
          });
          setAthletes(res.data.data);
          setTotalAthletes(res.data.totalItems || 0);
          setTotalPages(res.data.totalPages || 1);
          setCurrentPage(res.data.currentPage || page);
          setIsSearching(false);
          setSearchQuery("");
        }
        setSearchError("");
      } catch (err) {
        console.error("Fetch error:", err);
        setSearchError(err.response?.data?.message || "بارگذاری ناموفق بود");
        setAthletes([]);
        setTotalPages(0);
        setTotalAthletes(0);
      } finally {
        setLoading(false);
      }
    },
    [itemsPerPage]
  );

  useEffect(() => {
    fetchData(1, null);
  }, [fetchData]);

  // ─── Search ──────────────────────────────────────────────────────
  const handleSearch = (query) => {
    if (query.trim() === "") fetchData(1, null);
    else fetchData(1, query);
  };

  const handleClearSearch = () => fetchData(1, null);

  // ─── Pagination ──────────────────────────────────────────────────
  const handlePageChange = (page) => {
    if (isSearching && searchQuery) fetchData(page, searchQuery);
    else fetchData(page, null);
  };

  // ─── Form management ─────────────────────────────────────────────
  const toggleForm = () => {
    if (!openForm) setEditingId(null);
    setOpenForm((prev) => !prev);
  };

  const handleEdit = (athlete) => {
    setEditingId(athlete.id);
    setOpenForm(true);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setOpenForm(false);
  };

  // ─── Image preview ──────────────────────────────────────────────
  const handleViewPhoto = (athlete) => {
    if (athlete.photo) {
      setImageUrl(`${BASE_URL}/uploads/photos/${athlete.photo}`);
      setShowImage(true);
    } else {
      alert("این ورزشکار عکسی ندارد");
    }
  };

  // ─── Fee modal handlers ──────────────────────────────────────────
  const openFeeModal = (athleteId) => {
    setSelectedAthleteId(athleteId);
    setFeeForm({
      startDate: "",
      endDate: "",
      total: "",
      received: "",
      has_cabinate: false,
      cabinate_num: "",
    });
    setShowFeeModal(true);
  };

  const closeFeeModal = () => {
    setShowFeeModal(false);
    setSelectedAthleteId(null);
    setFeeForm({
      startDate: "",
      endDate: "",
      total: "",
      received: "",
      has_cabinate: false,
      cabinate_num: "",
    });
    setFeeSubmitting(false);
  };

  const handleFeeChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFeeForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFeeSubmit = async (e) => {
    e.preventDefault();
    if (feeSubmitting) return;
    setFeeSubmitting(true);

    const payload = {
      ...feeForm,
      athleteId: selectedAthleteId,
      cabinate_num: feeForm.cabinate_num ? Number(feeForm.cabinate_num) : null,
      received: feeForm.received || 0,
    };

    try {
      await axios.post(`${BASE_URL}/fees`, payload);
      alert("فیس با موفقیت ثبت شد!");
      closeFeeModal();
      // Refresh the athlete list (just in case, though not necessary)
      if (isSearching && searchQuery) fetchData(currentPage, searchQuery);
      else fetchData(currentPage);
    } catch (err) {
      alert(err.response?.data?.message || "ثبت فیس ناموفق بود");
    } finally {
      setFeeSubmitting(false);
    }
  };

  // ─── Submit (Athlete create/update) ─────────────────────────────
  const handleSubmit = async (formData) => {
    if (submitting) return;
    setSubmitting(true);

    const payload = {
      full_name: formData.full_name,
      father_name: formData.father_name,
      permanent_residence: formData.permanent_residence || null,
      current_residence: formData.current_residence || null,
      nic_number: formData.nic_number || null,
    };

    const hasFiles = formData.document_pdf || formData.photo;
    let dataToSend;
    if (hasFiles) {
      const fd = new FormData();
      Object.keys(payload).forEach((key) => {
        if (payload[key] !== null) fd.append(key, payload[key]);
      });
      if (formData.document_pdf) fd.append("document_pdf", formData.document_pdf);
      if (formData.photo) fd.append("photo", formData.photo);
      dataToSend = fd;
    } else {
      dataToSend = payload;
    }

    const config = hasFiles
      ? { headers: { "Content-Type": "multipart/form-data" } }
      : {};

    try {
      if (editingId) {
        await axios.put(`${BASE_URL}/athletes/${editingId}`, dataToSend, config);
      } else {
        await axios.post(`${BASE_URL}/athletes`, dataToSend, config);
      }
      if (isSearching && searchQuery) fetchData(currentPage, searchQuery);
      else fetchData(currentPage, null);
      setOpenForm(false);
      setEditingId(null);
    } catch (err) {
      alert(err.response?.data?.message || "عملیات ناموفق بود");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Delete ──────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!confirm("آیا مطمئن هستید که می‌خواهید این ورزشکار را حذف کنید؟")) return;
    try {
      await axios.delete(`${BASE_URL}/athletes/${id}`);
      if (isSearching && searchQuery) fetchData(currentPage, searchQuery);
      else fetchData(currentPage, null);
    } catch {
      alert("حذف ناموفق بود");
    }
  };

  // ─── Render ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6 space-y-8" dir="rtl">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">مدیریت ورزشکاران</h1>
        <p className="text-gray-600">ثبت و مدیریت اطلاعات ورزشکاران</p>
        {editingId && (
          <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 rounded-xl max-w-md mx-auto">
            <div className="flex items-center justify-center gap-2 text-yellow-800">
              <FaEdit className="h-5 w-5" />
              <span className="font-semibold">حالت ویرایش – ورزشکار #{editingId}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <button onClick={toggleForm} className="px-6 py-3 bg-[#0F3A76] text-white rounded-xl hover:bg-[#0A2D5E] transition font-medium shadow-md flex items-center gap-2">
          {openForm ? "بستن فرم" : "افزودن ورزشکار جدید"}
        </button>
        <div className="w-full md:w-96">
          <SearchBar onSearch={handleSearch} placeholder="جستجوی ورزشکاران بر اساس نام، نام پدر، یا شماره تذکره..." />
        </div>
      </div>

      {isSearching && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <span className="text-blue-600 font-medium">نتایج جستجو برای "{searchQuery}": {totalAthletes} ورزشکار پیدا شد</span>
          <button onClick={handleClearSearch} className="text-sm text-blue-600 hover:text-blue-800 font-medium">پاک کردن جستجو و نمایش همه</button>
        </div>
      )}
      {searchError && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600">{searchError}</div>}

      {openForm && (
        <AthleteForm
          initialData={editingId ? athletes.find((a) => a.id === editingId) || {} : {}}
          isEditing={!!editingId}
          onSubmit={handleSubmit}
          onCancel={handleCancelEdit}
          submitting={submitting}
        />
      )}

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-[#0F3A76] text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold">لیست ورزشکاران</h2>
                <p className="text-sm text-white/80">{totalAthletes} ورزشکار ثبت شده{loading && " • در حال بارگذاری..."}</p>
              </div>
            </div>
            {loading && (
              <div className="flex items-center gap-2 text-sm bg-white/20 px-3 py-1 rounded-full">
                <FaSpinner className="animate-spin" /> در حال بارگذاری...
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FaSpinner className="text-4xl text-[#0F3A76] animate-spin mb-4" />
            <p className="text-gray-600">در حال بارگذاری لیست ورزشکاران...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-center">
              <thead className="bg-[#0F3A76] text-white">
                <tr>
                  <th className="p-3 border-b font-semibold">نام کامل</th>
                  <th className="p-3 border-b font-semibold">نام پدر</th>
                  <th className="p-3 border-b font-semibold">شماره تذکره</th>
                  <th className="p-3 border-b font-semibold">محل سکونت فعلی</th>
                  <th className="p-3 border-b font-semibold">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {athletes.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="text-gray-500 text-lg">هیچ ورزشکاری ثبت نشده است</p>
                        <p className="text-gray-400 text-sm mt-1">برای شروع، ورزشکار جدیدی اضافه کنید</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  athletes.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50 border-b last:border-0 transition-colors">
                      <td className="p-3 font-medium text-gray-800">{a.full_name}</td>
                      <td className="p-3 text-gray-600">{a.father_name || "-"}</td>
                      <td className="p-3 text-gray-600 font-mono text-sm">{a.nic_number || "-"}</td>
                      <td className="p-3 text-gray-600 text-sm max-w-xs truncate">{a.current_residence || "-"}</td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          {/* View Photo */}
                          <button
                            onClick={() => handleViewPhoto(a)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                            title="مشاهده عکس"
                          >
                            <FaEye />
                          </button>
                          {/* Add Fee */}
                          <button
                            onClick={() => openFeeModal(a.id)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                            title="ثبت فیس"
                          >
                            <FaPlus />
                          </button>
                          {/* Edit */}
                          <button
                            onClick={() => handleEdit(a)}
                            className="p-2 text-[#0F3A76] hover:bg-blue-50 rounded-lg transition"
                            title="ویرایش"
                          >
                            <FaEdit />
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(a.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="حذف"
                          >
                            <FaTrash />
                          </button>
                          <AthletePaidFeesPDF athleteId={a.id} />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="border-t border-gray-200">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {showImage && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center" onClick={() => setShowImage(false)}>
          <div className="relative bg-white rounded-lg shadow-xl w-[420px] h-[360px] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={imageUrl}
              alt="پیش‌نمایش عکس ورزشکار"
              className="max-w-full max-h-full object-contain p-4"
            />
            <button
              onClick={() => setShowImage(false)}
              className="absolute -top-3 -right-3 bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow hover:bg-red-700 transition"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ─── Fee Modal ─────────────────────────────────────────────── */}
      {showFeeModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#0F3A76] text-white p-4 rounded-t-xl sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-full">
                    <FaPlus className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">ثبت فیس جدید</h2>
                    <p className="text-sm text-white/80">برای ورزشکار انتخاب‌شده</p>
                  </div>
                </div>
                <button
                  onClick={closeFeeModal}
                  className="text-white/80 hover:text-white text-2xl leading-none"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={handleFeeSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <span className="text-red-500">*</span> تاریخ شروع
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={feeForm.startDate}
                      onChange={handleFeeChange}
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
                      value={feeForm.endDate}
                      onChange={handleFeeChange}
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
                      value={feeForm.total}
                      onChange={handleFeeChange}
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
                      value={feeForm.received}
                      onChange={handleFeeChange}
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
                        checked={feeForm.has_cabinate}
                        onChange={handleFeeChange}
                        className="w-5 h-5 text-[#0F3A76] border-gray-300 rounded focus:ring-[#0F3A76]"
                      />
                      <span className="text-sm text-gray-600">
                        {feeForm.has_cabinate ? "بله" : "خیر"}
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
                      value={feeForm.cabinate_num}
                      onChange={handleFeeChange}
                      disabled={!feeForm.has_cabinate}
                      className={`w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#0F3A76] focus:border-[#0F3A76] transition ${
                        !feeForm.has_cabinate ? "bg-gray-100 text-gray-500" : ""
                      }`}
                      min="1"
                      step="1"
                    />
                  </div>
                </div>

                {feeForm.total && feeForm.received && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">باقیمانده:</span>
                      <span className={`font-semibold ${feeForm.total - feeForm.received > 0 ? "text-red-600" : "text-green-600"}`}>
                        {(feeForm.total - feeForm.received).toLocaleString()} افغانی
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closeFeeModal}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    disabled={feeSubmitting}
                    className={`px-6 py-3 rounded-lg font-medium shadow-md transition flex items-center gap-2 ${
                      feeSubmitting
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-[#0F3A76] text-white hover:bg-[#0A2D5E]"
                    }`}
                  >
                    {feeSubmitting ? (
                      <>
                        <FaSpinner className="animate-spin h-5 w-5" />
                        در حال ثبت...
                      </>
                    ) : (
                      <>
                        <FaCheck />
                        ثبت فیس
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
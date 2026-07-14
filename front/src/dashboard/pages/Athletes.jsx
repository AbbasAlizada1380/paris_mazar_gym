import { useEffect, useState } from "react";
import axios from "axios";
import Pagination from "../pagination/Pagination";
import SearchBar from "../searching/athleteSearchBar";
import AthletePaidFeesPDF from "./report/AthletePaidFeesPDF";
import { FaEdit, FaTrash, FaCheck, FaSpinner } from "react-icons/fa";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function Athletes() {
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [openForm, setOpenForm] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAthletes, setTotalAthletes] = useState(0);
  const [searchMode, setSearchMode] = useState(false);
  const itemsPerPage = 10;

  // Form state
  const [form, setForm] = useState({
    full_name: "",
    father_name: "",
    permanent_residence: "",
    current_residence: "",
    nic_number: "",
    document_pdf: null,
    photo: null,
  });
  const [submitting, setSubmitting] = useState(false);

  const [showImage, setShowImage] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [searchError, setSearchError] = useState("");

  /* ================= FETCH ================= */
  const fetchAthletes = async (page = 1) => {
    setLoading(true);
    setSearchMode(false);
    try {
      const res = await axios.get(`${BASE_URL}/athletes`, {
        params: { page, limit: itemsPerPage },
      });
      if (res.data.data) {
        setAthletes(res.data.data);
        setTotalAthletes(res.data.totalItems);
        setTotalPages(res.data.totalPages);
        setCurrentPage(res.data.currentPage);
      } else {
        setAthletes(res.data);
        setTotalAthletes(res.data.length);
        setTotalPages(Math.ceil(res.data.length / itemsPerPage));
      }
    } catch (err) {
      alert("بارگذاری ورزشکاران ناموفق بود");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAthletes(currentPage);
  }, [currentPage]);

  /* ================= SEARCH ================= */
  const handleSearchResults = (results) => {
    setSearchMode(true);
    setAthletes(results);
    setTotalAthletes(results.length);
    setTotalPages(1);
    setCurrentPage(1);
    setSearchError("");
  };

  const handleSearchError = (error) => setSearchError(error);
  const handleClearSearch = () => {
    setSearchMode(false);
    fetchAthletes(1);
  };

  /* ================= FORM HANDLERS ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setForm({ ...form, [name]: files[0] });
  };

  const resetForm = () => {
    setForm({
      full_name: "",
      father_name: "",
      permanent_residence: "",
      current_residence: "",
      nic_number: "",
      document_pdf: null,
      photo: null,
    });
    setEditingId(null);
  };

  const toggleForm = () => {
    if (!openForm) {
      // reset form when opening
      resetForm();
    }
    setOpenForm(!openForm);
  };

  /* ================= CREATE / UPDATE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    const payload = {
      full_name: form.full_name,
      father_name: form.father_name,
      permanent_residence: form.permanent_residence || null,
      current_residence: form.current_residence || null,
      nic_number: form.nic_number || null,
    };

    const hasFiles = form.document_pdf || form.photo;
    let dataToSend;

    if (hasFiles) {
      const formData = new FormData();
      formData.append("full_name", form.full_name);
      formData.append("father_name", form.father_name);
      formData.append("permanent_residence", form.permanent_residence || "");
      formData.append("current_residence", form.current_residence || "");
      formData.append("nic_number", form.nic_number || "");
      if (form.document_pdf) formData.append("document_pdf", form.document_pdf);
      if (form.photo) formData.append("photo", form.photo);
      dataToSend = formData;
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

      if (searchMode) fetchAthletes(1);
      else fetchAthletes(currentPage);

      resetForm();
      setOpenForm(false);
    } catch (err) {
      alert(err.response?.data?.message || "عملیات ناموفق بود");
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= EDIT ================= */
  const handleEdit = (athlete) => {
    setForm({
      full_name: athlete.full_name || "",
      father_name: athlete.father_name || "",
      permanent_residence: athlete.permanent_residence || "",
      current_residence: athlete.current_residence || "",
      nic_number: athlete.nic_number || "",
      document_pdf: null,
      photo: null,
    });
    setEditingId(athlete.id);
    setOpenForm(true);
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!confirm("آیا مطمئن هستید که می‌خواهید این ورزشکار را حذف کنید؟")) return;
    try {
      await axios.delete(`${BASE_URL}/athletes/${id}`);
      if (searchMode) fetchAthletes(1);
      else fetchAthletes(currentPage);
    } catch {
      alert("حذف ناموفق بود");
    }
  };

  /* ================= PAGINATION ================= */
  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (!searchMode) fetchAthletes(page);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6 space-y-8" dir="rtl">
      {/* Header */}
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

      {/* Toggle Form Button + Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <button
          onClick={toggleForm}
          className="px-6 py-3 bg-[#0F3A76] text-white rounded-xl hover:bg-[#0A2D5E] transition font-medium shadow-md flex items-center gap-2"
        >
          {openForm ? "بستن فرم" : "افزودن ورزشکار جدید"}
        </button>
        <div className="w-full md:w-96">
          <SearchBar
            onSearchResults={handleSearchResults}
            onSearchError={handleSearchError}
            placeholder="جستجوی ورزشکاران بر اساس نام، نام پدر، یا شماره تذکره..."
          />
        </div>
      </div>

      {/* Search status */}
      {searchMode && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <span className="text-blue-600 font-medium">
            نتایج جستجو: {athletes.length} ورزشکار پیدا شد
          </span>
          <button
            onClick={handleClearSearch}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            پاک کردن جستجو و نمایش همه
          </button>
        </div>
      )}

      {searchError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {searchError}
        </div>
      )}

      {/* Form Section */}
      {openForm && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-[#0F3A76] text-white p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0c-.281.023-.562.045-.843.066a23.518 23.518 0 00-7.86-3.317 8.991 8.991 0 00-5.697 1.641 8.975 8.975 0 013.33 7.007h6.07z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {editingId ? "ویرایش ورزشکار" : "افزودن ورزشکار جدید"}
                </h2>
                <p className="text-sm text-white/80">
                  {editingId ? "ویرایش اطلاعات ورزشکار" : "ثبت اطلاعات ورزشکار جدید"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="text-red-500">*</span> نام کامل
                  </label>
                  <input
                    name="full_name"
                    placeholder="نام کامل را وارد کنید"
                    value={form.full_name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#0F3A76] focus:border-[#0F3A76] transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="text-red-500">*</span> نام پدر
                  </label>
                  <input
                    name="father_name"
                    placeholder="نام پدر را وارد کنید"
                    value={form.father_name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#0F3A76] focus:border-[#0F3A76] transition"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    محل سکونت دایمی
                  </label>
                  <input
                    name="permanent_residence"
                    placeholder="محل سکونت دایمی را وارد کنید"
                    value={form.permanent_residence}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#0F3A76] focus:border-[#0F3A76] transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    محل سکونت فعلی
                  </label>
                  <input
                    name="current_residence"
                    placeholder="محل سکونت فعلی را وارد کنید"
                    value={form.current_residence}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#0F3A76] focus:border-[#0F3A76] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  شماره تذکره
                </label>
                <input
                  name="nic_number"
                  placeholder="شماره تذکره را وارد کنید"
                  value={form.nic_number}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#0F3A76] focus:border-[#0F3A76] transition"
                />
              </div>

              {/* Optional file uploads (commented out) */}

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
                      {editingId ? "ذخیره تغییرات" : "ثبت ورزشکار"}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold">لیست ورزشکاران</h2>
                <p className="text-sm text-white/80">
                  {totalAthletes} ورزشکار ثبت شده
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
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(a)}
                            className="p-2 text-[#0F3A76] hover:bg-blue-50 rounded-lg transition"
                            title="ویرایش"
                          >
                            <FaEdit />
                          </button>
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

        {/* Pagination */}
        {!searchMode && totalPages > 1 && (
          <div className="border-t border-gray-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
        <div className="p-4 text-sm text-gray-500">
          {searchMode
            ? `نمایش ${athletes.length} نتیجه جستجو`
            : `نمایش ${athletes.length} از ${totalAthletes} ورزشکار`}
        </div>
      </div>

      {/* Image Modal */}
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
}
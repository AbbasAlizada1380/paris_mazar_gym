import { useState, useEffect } from "react";
import { FaCheck, FaSpinner, FaUser } from "react-icons/fa";

// Set this to your backend base URL (or empty string if same origin)
const STATIC_BASE = ""; // e.g. "http://localhost:8038"

export default function AthleteForm({
  initialData = {},
  isEditing = false,
  onSubmit,
  onCancel,
  submitting = false,
}) {
  // ─── State ──────────────────────────────────────────────
  const [form, setForm] = useState({
    full_name: "",
    father_name: "",
    permanent_residence: "",
    current_residence: "",
    nic_number: "",
    document_pdf: null,
    photo: null,
  });

  const [photoPreview, setPhotoPreview] = useState(null);

  // ─── Sync with initialData when editing ────────────────
  useEffect(() => {
    setForm({
      full_name: initialData.full_name || "",
      father_name: initialData.father_name || "",
      permanent_residence: initialData.permanent_residence || "",
      current_residence: initialData.current_residence || "",
      nic_number: initialData.nic_number || "",
      document_pdf: null, // we never pre-fill file inputs for security
      photo: null,
    });

    if (initialData.photo) {
      setPhotoPreview(`${STATIC_BASE}/uploads/photos/${initialData.photo}`);
    } else {
      setPhotoPreview(null);
    }
  }, [initialData]);

  // ─── Handlers ───────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    if (!file) return;

    setForm((prev) => ({ ...prev, [name]: file }));

    if (name === "photo" && file.type.startsWith("image/")) {
      // Revoke old preview if it was a blob
      if (photoPreview && photoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

const handleSubmit = (e) => {
  e.preventDefault();

  // Base payload (all text fields)
  const payload = {
    full_name: form.full_name,
    father_name: form.father_name,
    permanent_residence: form.permanent_residence || "",
    current_residence: form.current_residence || "",
    nic_number: form.nic_number || "",
  };

  const hasPhoto = form.photo instanceof File;
  const hasDocument = form.document_pdf instanceof File;

  if (hasPhoto || hasDocument) {
    // Build FormData when files are present
    const formData = new FormData();
    Object.keys(payload).forEach((key) => {
      if (payload[key]) formData.append(key, payload[key]);
    });
    if (hasPhoto) formData.append("photo", form.photo);
    if (hasDocument) formData.append("document_pdf", form.document_pdf);
    onSubmit(formData);
  } else {
    // No files → send plain JSON
    onSubmit(payload);
  }
};

  // ─── Cleanup blob URLs ──────────────────────────────────
  useEffect(() => {
    return () => {
      if (photoPreview && photoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  // ─── Render ─────────────────────────────────────────────
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-[#0F3A76] text-white p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0c-.281.023-.562.045-.843.066a23.518 23.518 0 00-7.86-3.317 8.991 8.991 0 00-5.697 1.641 8.975 8.975 0 013.33 7.007h6.07z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold">
              {isEditing ? "ویرایش ورزشکار" : "افزودن ورزشکار جدید"}
            </h2>
            <p className="text-sm text-white/80">
              {isEditing ? "ویرایش اطلاعات ورزشکار" : "ثبت اطلاعات ورزشکار جدید"}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-500">*</span> نام کامل
              </label>
              <input
                name="full_name"
                type="text"
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
                type="text"
                placeholder="نام پدر را وارد کنید"
                value={form.father_name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#0F3A76] focus:border-[#0F3A76] transition"
                required
              />
            </div>
          </div>

          {/* Residence fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                محل سکونت دایمی
              </label>
              <input
                name="permanent_residence"
                type="text"
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
                type="text"
                placeholder="محل سکونت فعلی را وارد کنید"
                value={form.current_residence}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#0F3A76] focus:border-[#0F3A76] transition"
              />
            </div>
          </div>

          {/* NIC */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              شماره تذکره
            </label>
            <input
              name="nic_number"
              type="text"
              placeholder="شماره تذکره را وارد کنید"
              value={form.nic_number}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#0F3A76] focus:border-[#0F3A76] transition"
            />
          </div>

          {/* Photo upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              عکس ورزشکار
            </label>
            <div className="flex items-center gap-6">
              <div className="flex-shrink-0">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="پیش‌نمایش عکس"
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-300">
                    <FaUser className="text-gray-400 text-3xl" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  name="photo"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#0F3A76] focus:border-[#0F3A76] transition"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {isEditing
                    ? "برای تغییر عکس، فایل جدیدی انتخاب کنید (در غیر این صورت عکس قبلی حفظ می‌شود)"
                    : "فایل تصویر را انتخاب کنید (اختیاری)"}
                </p>
              </div>
            </div>
          </div>

          {/* Document PDF (optional) */}
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              مدارک (PDF)
            </label>
            <input
              type="file"
              name="document_pdf"
              accept=".pdf"
              onChange={handleFileChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#0F3A76] focus:border-[#0F3A76] transition"
            />
            <p className="text-xs text-gray-500 mt-1">
              {isEditing
                ? "برای تغییر مدرک، فایل جدیدی انتخاب کنید"
                : "فایل PDF را انتخاب کنید (اختیاری)"}
            </p>
          </div> */}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            {isEditing && (
              <button
                type="button"
                onClick={onCancel}
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
                  {isEditing ? "ذخیره تغییرات" : "ثبت ورزشکار"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
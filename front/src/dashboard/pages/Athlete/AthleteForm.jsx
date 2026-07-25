import { useState, useEffect } from "react";
import { FaCheck, FaSpinner, FaUser } from "react-icons/fa";

// Adjust this to your server's base URL (if frontend and backend are on different origins)
const STATIC_BASE = ""; // e.g. "http://localhost:8038" or leave empty for same origin

export default function AthleteForm({
  initialData = {},
  isEditing = false,
  onSubmit,
  onCancel,
  submitting = false,
}) {
  const [form, setForm] = useState({
    full_name: initialData.full_name || "",
    father_name: initialData.father_name || "",
    permanent_residence: initialData.permanent_residence || "",
    current_residence: initialData.current_residence || "",
    nic_number: initialData.nic_number || "",
    document_pdf: null,
    photo: null,
  });

  const [photoPreview, setPhotoPreview] = useState(null);

  // Build the photo URL when editing
  useEffect(() => {
    if (initialData.photo) {
      const photoUrl = `${STATIC_BASE}/uploads/photos/${initialData.photo}`;
      setPhotoPreview(photoUrl);
    } else {
      setPhotoPreview(null);
    }
  }, [initialData.photo]);

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
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  // Cleanup blob URLs
  useEffect(() => {
    return () => {
      if (photoPreview && photoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-[#0F3A76] text-white p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0c-.281.023-.562.045-.843.066a23.518 23.518 0 00-7.86-3.317 8.991 8.991 0 00-5.697 1.641 8.975 8.975 0 013.33 7.007h6.07z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold">{isEditing ? "ویرایش ورزشکار" : "افزودن ورزشکار جدید"}</h2>
            <p className="text-sm text-white/80">{isEditing ? "ویرایش اطلاعات ورزشکار" : "ثبت اطلاعات ورزشکار جدید"}</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2"><span className="text-red-500">*</span> نام کامل</label>
              <input name="full_name" placeholder="نام کامل را وارد کنید" value={form.full_name} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#0F3A76] focus:border-[#0F3A76] transition" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2"><span className="text-red-500">*</span> نام پدر</label>
              <input name="father_name" placeholder="نام پدر را وارد کنید" value={form.father_name} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#0F3A76] focus:border-[#0F3A76] transition" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">محل سکونت دایمی</label>
              <input name="permanent_residence" placeholder="محل سکونت دایمی را وارد کنید" value={form.permanent_residence} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#0F3A76] focus:border-[#0F3A76] transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">محل سکونت فعلی</label>
              <input name="current_residence" placeholder="محل سکونت فعلی را وارد کنید" value={form.current_residence} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#0F3A76] focus:border-[#0F3A76] transition" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">شماره تذکره</label>
            <input name="nic_number" placeholder="شماره تذکره را وارد کنید" value={form.nic_number} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#0F3A76] focus:border-[#0F3A76] transition" />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">عکس ورزشکار</label>
            <div className="flex items-center gap-6">
              <div className="flex-shrink-0">
                {photoPreview ? (
                  <img src={photoPreview} alt="پیش‌نمایش عکس" className="w-24 h-24 rounded-full object-cover border-2 border-gray-300" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-300">
                    <FaUser className="text-gray-400 text-3xl" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input type="file" name="photo" accept="image/*" onChange={handleFileChange} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#0F3A76] focus:border-[#0F3A76] transition" />
                <p className="text-xs text-gray-500 mt-1">
                  {isEditing ? "برای تغییر عکس، فایل جدیدی انتخاب کنید (در غیر این صورت عکس قبلی حفظ می‌شود)" : "فایل تصویر را انتخاب کنید (اختیاری)"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            {isEditing && (
              <button type="button" onClick={onCancel} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium">
                لغو ویرایش
              </button>
            )}
            <button type="submit" disabled={submitting} className={`px-6 py-3 rounded-lg font-medium shadow-md transition flex items-center gap-2 ${submitting ? "bg-gray-400 cursor-not-allowed" : "bg-[#0F3A76] text-white hover:bg-[#0A2D5E]"}`}>
              {submitting ? (
                <><FaSpinner className="animate-spin h-5 w-5" /> در حال ذخیره...</>
              ) : (
                <><FaCheck /> {isEditing ? "ذخیره تغییرات" : "ثبت ورزشکار"}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { FaCheck, FaSpinner, FaUser } from "react-icons/fa";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function FeeForm({
  form,
  onChange,
  onSubmit,
  editingId,
  athletes,
  athletePhoto,
  onCancel,
  submitting,
}) {
  // ---------- State for available cabinets ----------
  const [availableCabinets, setAvailableCabinets] = useState([]);
  const [loadingCabinets, setLoadingCabinets] = useState(true);

  // ---------- Fetch taken cabinets and compute available ----------
  useEffect(() => {
    const fetchTakenCabinets = async () => {
      setLoadingCabinets(true);
      try {
        const res = await axios.get(`${BASE_URL}/fees/taken-cabinets`);
        const takenData = res.data.data || [];

        // All possible cabinet numbers (1 to 120)
        const allNumbers = Array.from({ length: 120 }, (_, i) => i + 1);

        // Extract taken numbers, but EXCLUDE the current fee's own cabinet if editing
        const takenNumbers = takenData
          .filter((item) => {
            // If editing, allow this fee's own cabinet (so it stays available)
            if (editingId && item.feeId === editingId) return false;
            return true;
          })
          .map((item) => Number(item.cabinate_num));

        // Available = all numbers minus taken ones
        const available = allNumbers.filter(
          (num) => !takenNumbers.includes(num)
        );

        setAvailableCabinets(available);
      } catch (err) {
        console.error("Error fetching taken cabinets:", err);
        // On error, show no cabinets (or you can fallback to all numbers)
        setAvailableCabinets([]);
      } finally {
        setLoadingCabinets(false);
      }
    };

    fetchTakenCabinets();
  }, [editingId]); // Re‑fetch if editingId changes (e.g., new fee vs edit)

  // ---------- Render ----------
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
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
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v1m0-4.5A5.5 5.5 0 016.5 10.5 5.5 5.5 0 0012 16a5.5 5.5 0 005.5-5.5A5.5 5.5 0 0012 5.5z"
              />
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
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Athlete selection with photo */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-500">*</span> ورزشکار
              </label>
              <select
                name="athleteId"
                value={form.athleteId}
                onChange={onChange}
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

            {/* Athlete photo preview */}
            <div className="flex-shrink-0 mt-2 sm:mt-0">
              {athletePhoto ? (
                <img
                  src={athletePhoto}
                  alt="عکس ورزشکار"
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-300">
                  <FaUser className="text-gray-400 text-2xl" />
                </div>
              )}
            </div>
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
                onChange={onChange}
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
                onChange={onChange}
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
                onChange={onChange}
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
                onChange={onChange}
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
                  onChange={onChange}
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
              {form.has_cabinate ? (
                loadingCabinets ? (
                  <div className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-100 text-gray-500 flex items-center gap-2">
                    <FaSpinner className="animate-spin" />
                    بارگذاری کابینت‌ها...
                  </div>
                ) : availableCabinets.length === 0 ? (
                  <div className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-100 text-red-500">
                    هیچ کابینت آزادی موجود نیست
                  </div>
                ) : (
                  <select
                    name="cabinate_num"
                    value={form.cabinate_num || ""}
                    onChange={onChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#0F3A76] focus:border-[#0F3A76] transition"
                    required={form.has_cabinate}
                  >
                    <option value="">انتخاب شماره کابینت</option>
                    {availableCabinets.map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                )
              ) : (
                <input
                  type="number"
                  name="cabinate_num"
                  placeholder="غیرفعال"
                  value=""
                  disabled
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              )}
            </div>
          </div>

          {form.total && form.received && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">باقیمانده:</span>
                <span
                  className={`font-semibold ${
                    form.total - form.received > 0
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {(form.total - form.received).toLocaleString()} افغانی
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            {editingId && (
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
                  {editingId ? "ذخیره تغییرات" : "ثبت فیس"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
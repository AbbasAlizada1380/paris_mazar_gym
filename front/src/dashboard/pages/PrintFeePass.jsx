import React, { useRef, useEffect } from "react";
import jalaali from "jalaali-js";
import VazirmatnTTF from "../../../public/ttf/Vazirmatn.js"; // adjust path

const PrintFeePass = ({ isOpen, onClose, fee, autoPrint }) => {
  const hasPrinted = useRef(false);
  const BRAND_NAME = import.meta.env.VITE_BRAND_NAME;  
  useEffect(() => {
    if (autoPrint && isOpen && fee && !hasPrinted.current) {
      hasPrinted.current = true;
      setTimeout(() => window.print(), 500);
    }
    if (!isOpen) hasPrinted.current = false;
  }, [autoPrint, isOpen, fee]);

  if (!isOpen || !fee) return null;

  const athlete = fee.athlete || {};
  const passNo = fee.id?.toString().padStart(6, "0") || "------";
  const startDate = fee.startDate;
  const endDate = fee.endDate;
  const hasCabinet = fee.has_cabinate && fee.cabinate_num;
  const cabinetDisplay = hasCabinet ? `شماره ${fee.cabinate_num}` : "ندارد";

  // Convert Gregorian to Jalali for display
  const formatToJalali = (dateString) => {
    if (!dateString) return "----/--/--";
    const d = new Date(dateString);
    const { jy, jm, jd } = jalaali.toJalaali(
      d.getFullYear(),
      d.getMonth() + 1,
      d.getDate()
    );
    return `${jy}/${jm.toString().padStart(2, "0")}/${jd.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <div className={`fixed inset-0 ${isOpen ? 'flex' : 'hidden'} items-center justify-center z-50 bg-black/70 p-2`}>
        <div className="print-root">
          <div
            id="printable-area"
            className="bg-white text-black p-8 shadow-2xl border border-gray-200"
            style={{
              direction: "rtl",
              fontFamily: "'Vazirmatn', 'Tahoma', 'Segoe UI', Arial, sans-serif",
              margin: "0 auto",
              borderRadius: "8px",
              background: "linear-gradient(to bottom, #ffffff, #f9fafb)",
            }}
          >
            {/* Decorative border */}
            <div className="absolute inset-0 border-2 border-green-100 pointer-events-none rounded-lg"></div>

            {/* Header */}
            <div className="relative flex justify-between items-start border-green-200">
              {/* Left: Office Info */}
              <div className="text-right">
                <h1 className="text-xl text-green-900 mb-2 tracking-tight">کارت ورود به باشگاه</h1>
                <div className="bg-gradient-to-r from-green-50 to-gray-50 p-3 rounded-lg inline-block">
                  <p className="text-lg font-semibold text-gray-800">باشگاه {BRAND_NAME}</p>
                  <p className="text-gray-600 text-sm mt-1">کابل - افغانستان</p>
                </div>
              </div>

              {/* Center: Logo */}
              <div className="absolute left-1/2 transform -translate-x-1/2 top-0">
                <div className="w-32 h-32 flex items-center justify-center bg-green-50 rounded-full">
                  <img src="logo.png" alt="" />
                </div>
              </div>

              {/* Right: Pass Info */}
              <div className="text-left border-l-2 border-gray-300 pl-3 bg-gray-50 p-3 rounded-lg">
                <p className="text-sm mb-1">
                  <strong className="text-gray-700">شماره کارت:</strong>
                  <span className="text-red-600 font-bold text-base mr-1">{passNo}</span>
                </p>
                <p className="text-sm mb-1">
                  <strong className="text-gray-700">تاریخ صدور:</strong>
                  <span className="text-green-700 font-semibold">{formatToJalali(new Date())}</span>
                </p>
                <p className="text-sm">
                  <strong className="text-gray-700">زمان:</strong>
                  <span className="text-purple-700 font-semibold">
                    {new Date().toLocaleTimeString("en-GB")}
                  </span>
                </p>
              </div>
            </div>

            {/* Main Content */}
            <div className="text-sm leading-8 mt-2 p-5 border-green-200 rounded-lg shadow-sm bg-green-50/50">
              <div className="text-right bg-white p-6 rounded-lg border border-green-100 shadow-inner">
                <p className="text-base">
                  <span className="font-bold">ورزشکار محترم:</span>
                  <span className="text-xl font-extrabold text-blue-800 mx-2">{athlete.full_name || "................"}</span>
                </p>

                <p className="text-base mt-2">
                  <span className="font-bold">شماره ملی:</span>
                  <span className="mx-2">{athlete.nic_number || "................"}</span>
                </p>

                {/* 🔹 Cabinet information */}
                <p className="text-base mt-2">
                  <span className="font-bold">کابینت اختصاصی:</span>
                  <span className={`mx-2 font-semibold ${hasCabinet ? "text-blue-700" : "text-red-500"}`}>
                    {cabinetDisplay}
                  </span>
                </p>

                <p className="text-base mt-4">
                  <span className="font-bold">تاریخ اعتبار:</span>
                  <span className="bg-green-100 px-4 py-2 rounded-full mx-2 text-green-800 font-semibold">
                    از {startDate} تا {endDate}
                  </span>
                </p>
              </div>
            </div>

            {/* Footer & Signatures */}
            <div className="flex justify-between items-start mt-6">
              <div className="text-center w-1/3 px-2">
                <div className="h-16 w-full border-b-2 border-dashed border-gray-400 mb-2 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">امضاء مسئول</span>
                </div>
                <div className="bg-gradient-to-r from-gray-50 to-white p-2 rounded border border-gray-200">
                  <p className="text-sm font-bold text-gray-800">امضای مسئول باشگاه</p>
                </div>
              </div>

              <div className="text-center w-1/3 px-2">
                <div className="h-16 w-full flex items-center justify-center border-2 border-dashed border-green-300 bg-gradient-to-b from-green-50 to-white rounded-lg shadow-sm">
                  <p className="text-sm font-bold text-green-800 flex items-center gap-1">
                    <span className="text-lg">🏋️</span>
                    مهر باشگاه
                  </p>
                </div>
                <div className="mt-2 bg-gradient-to-r from-green-50 to-cyan-50 p-2 rounded border border-green-100">
                  <p className="text-xs font-bold text-gray-800">صادر شده توسط سیستم</p>
                  <p className="text-xs text-gray-600 mt-1">نمبر کارت:
                    <span className="font-bold text-green-700"> PASS-{passNo}</span>
                  </p>
                </div>
              </div>

              <div className="text-center w-1/3 px-2">
                <div className="h-16 w-full border-b-2 border-dashed border-gray-400 mb-2 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">امضاء ورزشکار</span>
                </div>
                <div className="bg-gradient-to-r from-gray-50 to-white p-2 rounded border border-gray-200">
                  <p className="text-sm font-bold text-gray-800">امضای ورزشکار</p>
                  <p className="text-gray-600 text-xs">({athlete.full_name || "................"})</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="fixed bottom-6 left-6 flex gap-4 p-4 rounded-xl">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-red-500 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg font-semibold"
          >
            بستن
          </button>
          <button
            onClick={() => window.print()}
            className="px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg font-semibold flex items-center gap-2"
          >
            <span className="text-lg">🖨️</span> چاپ کارت
          </button>
        </div>
      </div>

      {/* Print styles – same as PrintOrderBill */}
      <style jsx global>{`
        @font-face {
          font-family: 'Vazirmatn';
          src: url(${VazirmatnTTF}) format('truetype');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }

        @media print {
          html, body {
            width: 100%;
            height: 100%;
            margin: 0 !important;
            padding: 0 !important;
          }
          body { background: white !important; }
          body * { visibility: hidden !important; }
          .print-root, .print-root * { visibility: visible !important; }
          .print-root {
            position: fixed !important;
            inset: 0 !important;
            width: 100% !important;
            height: 100% !important;
            display: block !important;
          }
          #printable-area {
            width: 100% !important;
            height: 100% !important;
            padding: 10mm !important;
            box-sizing: border-box !important;
            margin: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            transform: none !important;
            font-family: 'Vazirmatn', 'Tahoma', 'Segoe UI', Arial, sans-serif !important;
          }
          button, .no-print { display: none !important; }
          @page { size: A5 landscape; margin: 0; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
    </>
  );
};

export default PrintFeePass;
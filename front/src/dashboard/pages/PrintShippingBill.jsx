import React from "react";
import moment from "moment-jalaali";
import { FaPhone, FaPrint, FaTimes } from "react-icons/fa";
import Regulation from "./Regulations";

const PrintShippingBill = ({ isOpen, onClose, data }) => {
  console.log(data);

  if (!isOpen || !data) return null;

  const formatCurrency = (num) => {
    const number = Number(num || 0);
    return number.toLocaleString("fa-IR") + " دالر";
  };

  const formatNumber = (num) => {
    return Number(num || 0).toLocaleString("fa-IR");
  };

  const handlePrint = () => window.print();

  const billNumber = data.id
    ? `${data.id}`
    : `${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

  const dueDate = moment(data.date).format("jYYYY/jMM/jDD");

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4 print:bg-transparent print:p-0">
      <div>
        <div
          id="printable-area"
          className="scale-[0.65] print:scale-[1] bg-white shadow-2xl rounded-lg overflow-hidden flex flex-col print:shadow-none print:rounded-none"
          style={{
            width: "210mm",
            height: "297mm",
            direction: "rtl",
          }}
        >
          {/* Header */}
          <div className="bg-gradient-to-l from-blue-800 to-blue-600 text-white p-4 border-b-4 border-blue-900 flex items-center justify-between">
            {/* Logo and Company Name */}
            <div className="flex items-center gap-3 mb-3 md:mb-0">
              <img
                src="/logo.png"
                alt="Afghan Cargo Logo"
                className="h-16 w-16 object-contain rounded-full border-2 border-white"
              />
              <div className="flex flex-col text-center md:text-left">
                <h1 className="text-2xl font-bold leading-tight">افغان کارگو</h1>
                <p className="text-sm opacity-90">Afghan Cargo Services</p>
              </div>
            </div>

            {/* Bill Info */}
            <div className="flex flex-col items-center md:items-end text-xs">
              <span className="mb-1">
                <strong>شماره بل:</strong> {formatNumber(billNumber)}
              </span>
              <span>
                <strong>تاریخ:</strong> {dueDate.replace(/\//g, "/")}
              </span>
            </div>
          </div>

          {/* Sender Info */}
          <div className="p-3 border-b border-gray-200">
            <h2 className="text-sm font-bold text-gray-700 mb-2 border-b pb-1 border-gray-300">
              معلومات ارسال‌کننده
            </h2>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <p>
                <span className="font-semibold">نام:</span> {data.Sender.name}
              </p>
              <p>
                <span className="font-semibold">شماره تماس:</span>{" "}
                {data.Sender.phoneNumber?.replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[d]) || "-"}
              </p>
              <p>
                <span className="font-semibold">آدرس:</span>{" "}
                {data.Sender.address}
              </p>
              <p>
                <span className="font-semibold">ایمیل:</span> {data.Sender.email || "-"}
              </p>
            </div>
          </div>

          {/* Receiver Info */}
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <h2 className="text-sm font-bold text-gray-700 mb-2 border-b pb-1 border-gray-300">
              معلومات دریافت‌کننده
            </h2>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <p>
                <span className="font-semibold">نام:</span> {data.Receiver.name}
              </p>
              <p>
                <span className="font-semibold">شماره تماس:</span>{" "}
                {data.Receiver.phoneNumber?.replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[d]) || "-"}
              </p>
              <p>
                <span className="font-semibold">آدرس:</span>{" "}
                {data.Receiver.address}
              </p>
              <p>
                <span className="font-semibold">ایمیل:</span> {data.Receiver.email || "-"}
              </p> <p>
                <span className="font-semibold">کشور:</span> {data.Receiver.country || "-"}
              </p>
            </div>
          </div>

          {/* Goods Details */}
          <div className="flex-1 p-3">
            <h3 className="text-sm font-bold text-blue-700 mb-2 bg-blue-50 p-2 rounded border-r-4 border-blue-500">
              جزئیات محموله
            </h3>
            <table className="w-full text-xs border border-gray-300">
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-1 font-semibold">
                    وزن:
                  </td>
                  <td className="border border-gray-300 p-1">
                    {formatNumber(data.totalWeight)} کیلوگرام
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-1 font-semibold">
                    تعداد:
                  </td>
                  <td className="border border-gray-300 p-1">{formatNumber(data.piece)}</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-1 font-semibold">
                    قیمت هر کیلو:
                  </td>
                  <td className="border border-gray-300 p-1">
                    {formatCurrency(data.perKgCash)}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-1 font-semibold">
                    ارزش اجناس:
                  </td>
                  <td className="border border-gray-300 p-1">
                    {formatCurrency(data.value)}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="mt-6">
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-3 rounded-t-lg">
                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                  </svg>
                  لیست بسته‌بندی
                </h3>
              </div>

              {/* Split tables if more than 7 items */}
             {data.packList && data.packList.length > 7 ? (
  <div className="grid grid-cols-2 gap-4 border border-gray-300 p-4">
    {/* First Table - Items 1-7 */}
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-3 text-center font-bold text-gray-700 border border-gray-300">#</th>
              <th className="py-2 px-3 text-right font-bold text-gray-700 border border-gray-300">نام جنس</th>
              <th className="py-2 px-3 text-center font-bold text-gray-700 border border-gray-300">تعداد</th>
              <th className="py-2 px-3 text-center font-bold text-gray-700 border border-gray-300">وزن</th>
              <th className="py-2 px-3 text-center font-bold text-gray-700 border border-gray-300">ارزش ($)</th>
            </tr>
          </thead>
          <tbody>
            {data.packList.slice(0, 7).map((item, index) => (
              <tr
                key={index}
                className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}
              >
                <td className="py-2 px-3 text-center font-bold text-gray-800 border border-gray-300">
                  {formatNumber(index + 1)}
                </td>
                <td className="py-2 px-3 text-right border border-gray-300 font-medium">
                  {item.description}
                </td>
                <td className="py-2 px-3 text-center border border-gray-300">
                  <span className="w-16 px-2 py-1 border border-gray-400 rounded text-center inline-block">
                    {formatNumber(item.qty || 0)}
                  </span>
                </td>
                <td className="py-2 px-3 text-center border border-gray-300">
                  <span className="w-16 px-2 py-1 border border-gray-400 rounded text-center inline-block">
                    {formatNumber(item.weight || 0)}
                  </span>
                </td>
                <td className="py-2 px-3 text-center border border-gray-300">
                  <span className="w-20 px-2 py-1 border border-gray-400 rounded text-center inline-block">
                    ${formatNumber(item.value || 0)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {/* Second Table - Items 8+ */}
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-3 text-center font-bold text-gray-700 border border-gray-300">#</th>
              <th className="py-2 px-3 text-right font-bold text-gray-700 border border-gray-300">نام جنس</th>
              <th className="py-2 px-3 text-center font-bold text-gray-700 border border-gray-300">تعداد</th>
              <th className="py-2 px-3 text-center font-bold text-gray-700 border border-gray-300">وزن</th>
              <th className="py-2 px-3 text-center font-bold text-gray-700 border border-gray-300">ارزش ($)</th>
            </tr>
          </thead>
          <tbody>
            {data.packList.slice(7).map((item, index) => (
              <tr
                key={index + 7}
                className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}
              >
                <td className="py-2 px-3 text-center font-bold text-gray-800 border border-gray-300">
                  {formatNumber(index + 8)}
                </td>
                <td className="py-2 px-3 text-right border border-gray-300 font-medium">
                  {item.description}
                </td>
                <td className="py-2 px-3 text-center border border-gray-300">
                  <span className="w-16 px-2 py-1 border border-gray-400 rounded text-center inline-block">
                    {formatNumber(item.qty || 0)}
                  </span>
                </td>
                <td className="py-2 px-3 text-center border border-gray-300">
                  <span className="w-16 px-2 py-1 border border-gray-400 rounded text-center inline-block">
                    {formatNumber(item.weight || 0)}
                  </span>
                </td>
                <td className="py-2 px-3 text-center border border-gray-300">
                  <span className="w-20 px-2 py-1 border border-gray-400 rounded text-center inline-block">
                    ${formatNumber(item.value || 0)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
) : (
  <div className="overflow-x-auto border border-gray-300">
    <table className="w-full text-xs">
      <thead>
        <tr className="bg-gray-100">
          <th className="py-2 px-3 text-center font-bold text-gray-700 border-l border-gray-300">#</th>
          <th className="py-2 px-3 text-right font-bold text-gray-700 border-l border-gray-300">نام جنس</th>
          <th className="py-2 px-3 text-center font-bold text-gray-700 border-l border-gray-300">تعداد</th>
          <th className="py-2 px-3 text-center font-bold text-gray-700 border-l border-gray-300">وزن (کیلو)</th>
          <th className="py-2 px-3 text-center font-bold text-gray-700 border-l border-gray-300">ارزش ($)</th>
        </tr>
      </thead>
      <tbody>
        {data.packList.map((item, index) => (
          <tr
            key={index}
            className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}
          >
            <td className="py-2 px-3 text-center font-bold text-gray-800 border-t border-gray-300 border-l">
              {formatNumber(index + 1)}
            </td>
            <td className="py-2 px-3 text-right border-t border-gray-300 border-l font-medium">
              {item.description}
            </td>
            <td className="py-2 px-3 text-center border border-gray-300">
              <span className="w-16 px-2 py-1 border border-gray-400 rounded text-center inline-block">
                {formatNumber(item.qty || 0)}
              </span>
            </td>
            <td className="py-2 px-3 text-center border-t border-gray-300 border-l">
              <span className="w-16 px-2 py-1 border border-gray-400 rounded text-center inline-block">
                {formatNumber(item.weight || 0)}
              </span>
            </td>
            <td className="py-2 px-3 text-center border-t border-gray-300 border-l">
              <span className="w-20 px-2 py-1 border border-gray-400 rounded text-center inline-block">
              {formatCurrency(item.value || 0)}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}
            </div>
          </div>

          {/* Bill Summary */}
          <div className="flex border-t h-[110px] border-gray-300 bg-gray-50">
            {/* LEFT 1/3 — Totals Section */}
            <div className="w-1/3 border-l border-gray-300 p-4">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between font-bold border-t border-gray-300 pt-1 text-sm">
                  <span>مجموع کل:</span>
                  <span className="text-cyan-800">{formatCurrency(data.totalCash)}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-gray-300 pt-1 text-sm">
                  <span>دریافتی:</span>
                  <span className="text-green-600">{formatCurrency(data.received || 0)}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-gray-300 pt-1">
                  <span className={data.remain > 0 ? "text-red-600" : "text-green-600"}>
                    باقیمانده:
                  </span>
                  <span className={data.remain > 0 ? "text-red-600" : "text-green-600"}>
                    {formatCurrency(data.remain)}
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT 2/3 — Signature Section */}
            <div className="w-2/3 flex border-r border-gray-300">
              {/* Office Signature */}
              <div className="w-1/2 flex flex-col items-center justify-center p-4 text-center border-gray-300">
                <div className="w-full border border-gray-400 h-28 rounded-lg flex flex-col items-center justify-center bg-gray-50">
                  <p className="text-gray-600 text-sm font-semibold mb-2">
                    محل امضاء و مُهر اداره
                  </p>
                  <p className="text-gray-500 text-xs">امضای مسئول</p>
                </div>
              </div>

              {/* Customer Signature */}
              <div className="w-1/2 flex flex-col items-center justify-center p-4 text-center">
                <div className="w-full border border-gray-400 h-28 rounded-lg flex flex-col items-center justify-center bg-gray-50">
                  <p className="text-gray-600 text-sm font-semibold mb-2">
                    محل امضاء فرستنده
                  </p>
                  <p className="text-gray-500 text-xs">امضای مشتری</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            id="footer-area"
            className="bg-gray-800 text-white p-3 text-center text-xs"
          >
            {/* Phone Numbers */}
            <div className="flex items-center justify-center gap-2 mb-1">
              <FaPhone className="text-cyan-300" />
              <span>تماس: ۰۷۸۹۳۸۴۷۰۰ - ۰۷۹۹۳۰۶۴۳۷ - ۰۷۴۸۸۵۲۵۶۹</span>
            </div>

            {/* Address */}
            <p className="text-cyan-200 mt-1">
              آدرس: مارکیت بهار سراب، تانک تیل، دشت برچی، کابل، افغانستان
            </p>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="absolute bottom-6 left-6 flex gap-3 print:hidden">
        <button
          onClick={onClose}
          className="px-2 h-12 align-center bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center shadow-lg transition-colors"
        >
          <FaTimes size={14} /> بستن
        </button>
        <button
          onClick={handlePrint}
          className="px-2 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center shadow-lg transition-colors"
        >
          <FaPrint size={14} /> چاپ بل
        </button>
        <button className="h-12 text-white rounded-lg flex items-center transition-colors">
          <Regulation data={data} />
        </button>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          body * {
            visibility: hidden;
          }
          #printable-area,
          #printable-area * {
            visibility: visible;
          }
          #printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm !important;
            height: 297mm !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PrintShippingBill;
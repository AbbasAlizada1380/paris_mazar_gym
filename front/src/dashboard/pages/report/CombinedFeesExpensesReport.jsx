import React, { useState } from "react";
import axios from "axios";
import moment from "moment";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import VazirmatnTTF from "../../../../public/ttf/Vazirmatn.js";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const CombinedFinancialReport = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [report, setReport] = useState(null);

  // ─── Fetch all data (fees, expenses, salaries) ──────────
  const fetchAll = async () => {
    if (!from || !to) {
      alert("لطفاً بازه زمانی را انتخاب کنید");
      return;
    }

    setLoading(true);
    setReport(null);

    try {
      const [feesRes, expRes, attRes] = await Promise.all([
        axios.get(`${BASE_URL}/fees/range`, { params: { startDate: from, endDate: to } }),
        axios.get(`${BASE_URL}/expense/date_range`, { params: { from, to } }),
        axios.get(`${BASE_URL}/attendance/date-range`, { params: { from, to } }),
      ]);

      const fees = feesRes.data || [];
      const expenses = expRes.data?.expenses || [];
      const attendance = attRes.data?.data || [];

      // ─── Fees totals ──────────────────────────────────────
      const totalFees = fees.reduce((sum, f) => sum + Number(f.total || 0), 0);
      const totalReceived = fees.reduce((sum, f) => sum + Number(f.received || 0), 0);
      const totalRemained = fees.reduce((sum, f) => sum + Number(f.remained || 0), 0);

      // ─── Expense totals ──────────────────────────────────
      const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

      // ─── Salary totals (from attendance) ─────────────────
      const totalSalaryBase = attendance.reduce((sum, r) => sum + Number(r.salary || 0), 0);
      const totalOvertime = attendance.reduce((sum, r) => sum + Number(r.overtime || 0), 0);
      const totalSalaryGrand = attendance.reduce((sum, r) => sum + Number(r.total || 0), 0); // salary + overtime

      // ─── Overall summary ─────────────────────────────────
      const incoming = totalReceived;
      const outgoing = totalExpenses + totalSalaryGrand;
      const balance = incoming - outgoing;

      setReport({
        dateRange: { from, to },
        fees: {
          list: fees,
          total: totalFees,
          received: totalReceived,
          remained: totalRemained,
          count: fees.length,
        },
        expenses: {
          list: expenses,
          total: totalExpenses,
          count: expenses.length,
        },
        salaries: {
          list: attendance,
          totalBase: totalSalaryBase,
          totalOvertime: totalOvertime,
          totalGrand: totalSalaryGrand,
          count: attendance.length,
        },
        summary: { incoming, outgoing, balance },
      });
    } catch (err) {
      console.error(err);
      alert("خطا در دریافت اطلاعات. لطفاً دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  const formatNum = (num) => Number(num || 0).toLocaleString();

  // ─── PDF Generation ──────────────────────────────────────
  const handlePDFDownload = () => {
    if (!report) return;
    setDownloading(true);

    try {
      const doc = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
      doc.setR2L(false);

      doc.addFileToVFS("Vazirmatn.ttf", VazirmatnTTF);
      doc.addFont("Vazirmatn.ttf", "Vazirmatn", "normal");
      doc.setFont("Vazirmatn", "normal");

      const { from, to } = report.dateRange;
      const formattedFrom = moment(from).format("YYYY/MM/DD");
      const formattedTo = moment(to).format("YYYY/MM/DD");
      const today = moment().format("YYYY/MM/DD");

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const rightX = pageWidth - 40;

      doc.setFontSize(16);
      doc.text(
        `گزارش جامع مالی از ${formattedFrom} تا ${formattedTo}`,
        rightX,
        50,
        { align: "right" }
      );

      // ── Helper: add a category table ────────────────────
      const addCategoryTable = (title, items, columns, total, count, startY, extraSummary = null) => {
        if (!items || items.length === 0) {
          doc.setFontSize(11);
          doc.setFont("Vazirmatn", "normal");
          doc.text(`هیچ داده‌ای برای ${title} یافت نشد.`, rightX, startY, { align: "right" });
          return startY + 20;
        }

        doc.setFontSize(12);
        doc.setFont("Vazirmatn", "normal");
        doc.text(title, rightX, startY, { align: "right" });
        startY += 20;

        const head = [columns];
        const body = items.map((item) =>
          columns.map((col) => getValueForPDF(item, col))
        );

        autoTable(doc, {
          startY: startY,
          head: head,
          body: body,
          theme: "grid",
          styles: {
            font: "Vazirmatn",
            fontSize: 9,
            halign: "center",
            valign: "middle",
            cellPadding: 4,
            lineColor: [200, 200, 200],
            lineWidth: 0.5,
          },
          headStyles: {
            font: "Vazirmatn",
            fontStyle: "normal",
            fillColor: [15, 58, 118],
            textColor: [255, 255, 255],
            fontSize: 10,
            halign: "center",
          },
          margin: { left: 20, right: 20 },
        });

        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(10);
        doc.setFont("Vazirmatn", "normal");

        let summaryText = `تعداد: ${count} | مجموع: ${formatNum(total)}`;
        if (extraSummary) summaryText += ` | ${extraSummary}`;
        doc.text(summaryText, rightX, finalY, { align: "right" });
        return finalY + 30;
      };

      // ── Helper to get cell values ──────────────────────
      const getValueForPDF = (item, col) => {
        // Fees
        if (item.athlete) {
          switch (col) {
            case "شماره": return item.id.toString();
            case "ورزشکار": return item.athlete?.full_name || "—";
            case "کد ملی": return item.athlete?.nic_number || "—";
            case "تاریخ شروع": return moment(item.startDate).format("YYYY/MM/DD");
            case "تاریخ پایان": return moment(item.endDate).format("YYYY/MM/DD");
            case "مجموع": return formatNum(item.total);
            case "دریافتی": return formatNum(item.received);
            case "باقیمانده": return formatNum(item.remained);
            case "وضعیت": return item.isactive ? "فعال" : "غیرفعال";
            default: return "—";
          }
        }
        // Expenses
        if (item.purpose !== undefined) {
          switch (col) {
            case "شماره": return item.id.toString();
            case "مبلغ": return formatNum(item.amount);
            case "بابت": return item.purpose || "—";
            case "توسط": return item.by || "نامشخص";
            case "تاریخ": return moment(item.createdAt).format("YYYY/MM/DD");
            default: return item[col] || "—";
          }
        }
        // Salaries (attendance)
        if (item.Staff) {
          switch (col) {
            case "شماره": return item.id.toString();
            case "کارمند": return item.Staff?.name || "نامشخص";
            case "معاش اصلی": return formatNum(item.salary);
            case "اضافه‌کاری": return formatNum(item.overtime);
            case "جمع کل": return formatNum(item.total);
            case "تاریخ": return moment(item.createdAt).format("YYYY/MM/DD");
            default: return "—";
          }
        }
        return "—";
      };

      let tableY = 90;

      // 1. Fees table
      tableY = addCategoryTable(
        "حق‌الاشتراک‌ها (دریافتی)",
        report.fees.list,
        ["شماره", "ورزشکار", "کد ملی", "تاریخ شروع", "تاریخ پایان", "مجموع", "دریافتی", "باقیمانده", "وضعیت"],
        report.fees.total,
        report.fees.count,
        tableY,
        `دریافتی: ${formatNum(report.fees.received)} | باقیمانده: ${formatNum(report.fees.remained)}`
      );
      if (tableY > 700) { doc.addPage(); tableY = 50; }

      // 2. Expenses table
      tableY = addCategoryTable(
        "مصارف (خروجی)",
        report.expenses.list,
        ["شماره", "مبلغ", "بابت", "توسط", "تاریخ"],
        report.expenses.total,
        report.expenses.count,
        tableY
      );
      if (tableY > 700) { doc.addPage(); tableY = 50; }

      // 3. Salaries table (attendance)
      tableY = addCategoryTable(
        "معاشات کارمندان (خروجی)",
        report.salaries.list,
        ["شماره", "کارمند", "معاش اصلی", "اضافه‌کاری", "جمع کل", "تاریخ"],
        report.salaries.totalGrand,
        report.salaries.count,
        tableY,
        `معاش اصلی: ${formatNum(report.salaries.totalBase)} | اضافه‌کاری: ${formatNum(report.salaries.totalOvertime)}`
      );
      if (tableY > 700) { doc.addPage(); tableY = 50; }

      // ── Summary ──
      let summaryY = tableY + 30;
      if (summaryY > pageHeight - 120) {
        doc.addPage();
        summaryY = 50;
      }

      doc.setFontSize(14);
      doc.setFont("Vazirmatn", "normal");
      doc.text("خلاصه مالی", rightX, summaryY, { align: "right" });
      summaryY += 25;

      doc.setFontSize(11);
      let lineY = summaryY;
      doc.setFont("Vazirmatn", "normal");

      doc.text(`دریافتی از حق‌الاشتراک‌ها: ${formatNum(report.fees.received)}`, rightX, lineY, { align: "right" });
      lineY += 18;
      doc.text(`مجموع مصارف: ${formatNum(report.expenses.total)}`, rightX, lineY, { align: "right" });
      lineY += 18;
      doc.text(`مجموع معاشات: ${formatNum(report.salaries.totalGrand)}`, rightX, lineY, { align: "right" });
      lineY += 22;
      doc.text(`مجموع خروجی (مصارف + معاشات): ${formatNum(report.summary.outgoing)}`, rightX, lineY, { align: "right" });
      lineY += 22;

      const balanceVal = report.summary.balance;
      const balanceSign = balanceVal >= 0 ? "+" : "-";
      const balanceAbs = Math.abs(balanceVal);
      doc.setFontSize(12);
      doc.text(`بیلانس (دریافتی − خروجی): ${balanceSign} ${formatNum(balanceAbs)}`, rightX, lineY, { align: "right" });
      lineY += 22;

      doc.setFontSize(10);
      doc.text(`تاریخ صدور: ${today}`, rightX, lineY + 10, { align: "right" });

      // Page numbers
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setFont("Vazirmatn", "normal");
        doc.text(`${i}/${pageCount}`, pageWidth - 40, pageHeight - 40, { align: "right" });
      }

      doc.save(`گزارش_جامع_مالی_${formattedFrom}_تا_${formattedTo}.pdf`);
    } catch (err) {
      console.error(err);
      alert("خطا در تولید PDF");
    } finally {
      setDownloading(false);
    }
  };

  // ─── UI Helpers ────────────────────────────────────────────
  const getValue = (item, col) => {
    if (item.athlete) {
      switch (col) {
        case "شماره": return item.id;
        case "ورزشکار": return item.athlete?.full_name || "—";
        case "کد ملی": return item.athlete?.nic_number || "—";
        case "تاریخ شروع": return moment(item.startDate).format("YYYY/MM/DD");
        case "تاریخ پایان": return moment(item.endDate).format("YYYY/MM/DD");
        case "مجموع": return formatNum(item.total);
        case "دریافتی": return formatNum(item.received);
        case "باقیمانده": return formatNum(item.remained);
        case "وضعیت": return item.isactive ? "فعال" : "غیرفعال";
        default: return "—";
      }
    }
    if (item.purpose !== undefined) {
      switch (col) {
        case "شماره": return item.id;
        case "مبلغ": return formatNum(item.amount);
        case "بابت": return item.purpose || "—";
        case "توسط": return item.by || "نامشخص";
        case "تاریخ": return moment(item.createdAt).format("YYYY/MM/DD");
        default: return item[col] || "—";
      }
    }
    if (item.Staff) {
      switch (col) {
        case "شماره": return item.id;
        case "کارمند": return item.Staff?.name || "نامشخص";
        case "معاش اصلی": return formatNum(item.salary);
        case "اضافه‌کاری": return formatNum(item.overtime);
        case "جمع کل": return formatNum(item.total);
        case "تاریخ": return moment(item.createdAt).format("YYYY/MM/DD");
        default: return "—";
      }
    }
    return "—";
  };

  const renderTable = (title, items, columns, total, count, extraSummary = null) => {
    if (!items || items.length === 0) {
      return (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-gray-500">هیچ داده‌ای یافت نشد.</p>
        </div>
      );
    }

    return (
      <div className="mb-8 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-[#0F3A76] text-white px-4 py-3 border-b flex flex-wrap justify-between items-center">
          <h3 className="text-md font-semibold">{title}</h3>
          <span className="text-sm text-white/80">
            تعداد: {count} | مجموع: {formatNum(total)}
            {extraSummary && ` | ${extraSummary}`}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-center">
            <thead className="bg-[#0F3A76] text-white">
              <tr>
                {columns.map((col, idx) => (
                  <th key={idx} className="px-4 py-3 border-b font-semibold">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="border-t hover:bg-gray-50 transition-colors">
                  {columns.map((col, idx2) => (
                    <td key={idx2} className="px-4 py-2 border-b">
                      {getValue(item, col)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ─── Main Render ──────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6 space-y-8" dir="rtl">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">گزارش جامع مالی</h1>
        <p className="text-gray-600">هزینه‌ها، حق‌الاشتراک‌ها و معاشات کارمندان</p>
      </div>

      {/* Filter & Actions */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#0F3A76] focus:border-[#0F3A76] transition"
            />
            <span className="text-gray-600">تا</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#0F3A76] focus:border-[#0F3A76] transition"
            />
          </div>
          <button
            onClick={fetchAll}
            disabled={loading}
            className="bg-[#0F3A76] text-white px-6 py-2 rounded-lg hover:bg-[#0A2D5E] transition disabled:opacity-50 shadow-md"
          >
            {loading ? "در حال دریافت..." : "نمایش گزارش"}
          </button>
          {report && (
            <button
              onClick={handlePDFDownload}
              disabled={downloading}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50 shadow-md"
            >
              {downloading ? "در حال ساخت PDF..." : "دانلود PDF"}
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-[#0F3A76] border-t-[#0F3A76] rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری داده‌ها...</p>
        </div>
      )}

      {report && !loading && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
              <div className="text-sm text-gray-600">حق‌الاشتراک (مجموع)</div>
              <div className="text-xl font-bold text-[#0F3A76]">{formatNum(report.fees.total)}</div>
              <div className="text-xs text-gray-500">{report.fees.count} مورد</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
              <div className="text-sm text-gray-600">دریافتی از حق‌الاشتراک</div>
              <div className="text-xl font-bold text-green-700">{formatNum(report.fees.received)}</div>
              <div className="text-xs text-gray-500">باقیمانده: {formatNum(report.fees.remained)}</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
              <div className="text-sm text-gray-600">مصارف (خروجی)</div>
              <div className="text-xl font-bold text-red-700">{formatNum(report.expenses.total)}</div>
              <div className="text-xs text-gray-500">{report.expenses.count} مورد</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
              <div className="text-sm text-gray-600">معاشات (خروجی)</div>
              <div className="text-xl font-bold text-orange-700">{formatNum(report.salaries.totalGrand)}</div>
              <div className="text-xs text-gray-500">{report.salaries.count} رکورد</div>
            </div>
            <div className={`bg-white rounded-xl shadow-lg border border-gray-100 p-4 ${report.summary.balance >= 0 ? 'border-green-200' : 'border-red-200'}`}>
              <div className="text-sm text-gray-600">بیلانس (دریافتی − خروجی)</div>
              <div className={`text-xl font-bold ${report.summary.balance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {formatNum(report.summary.balance)}
              </div>
              <div className="text-xs text-gray-500">
                {report.summary.balance >= 0 ? 'سود' : 'زیان'}
              </div>
            </div>
          </div>

          {/* Detailed summary */}
          <div className="bg-[#0F3A76] text-white p-4 rounded-xl shadow-lg flex flex-wrap justify-around items-center">
            <div className="text-center">
              <span className="block text-sm opacity-80">مجموع دریافتی</span>
              <span className="text-xl font-bold">{formatNum(report.fees.received)}</span>
            </div>
            <div className="text-center">
              <span className="block text-sm opacity-80">مجموع خروجی (مصارف + معاشات)</span>
              <span className="text-xl font-bold">{formatNum(report.summary.outgoing)}</span>
            </div>
            <div className="text-center">
              <span className="block text-sm opacity-80">بیلانس</span>
              <span className={`text-xl font-bold ${report.summary.balance >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                {formatNum(report.summary.balance)}
              </span>
            </div>
          </div>

          {/* Tables */}
          <div className="space-y-6">
            {renderTable(
              "حق‌الاشتراک‌ها (دریافتی)",
              report.fees.list,
              ["شماره", "ورزشکار", "کد ملی", "تاریخ شروع", "تاریخ پایان", "مجموع", "دریافتی", "باقیمانده", "وضعیت"],
              report.fees.total,
              report.fees.count,
              `دریافتی: ${formatNum(report.fees.received)} | باقیمانده: ${formatNum(report.fees.remained)}`
            )}
            {renderTable(
              "مصارف (خروجی)",
              report.expenses.list,
              ["شماره", "مبلغ", "بابت", "توسط", "تاریخ"],
              report.expenses.total,
              report.expenses.count
            )}
            {renderTable(
              "معاشات کارمندان (خروجی)",
              report.salaries.list,
              ["شماره", "کارمند", "معاش اصلی", "اضافه‌کاری", "جمع کل", "تاریخ"],
              report.salaries.totalGrand,
              report.salaries.count,
              `معاش اصلی: ${formatNum(report.salaries.totalBase)} | اضافه‌کاری: ${formatNum(report.salaries.totalOvertime)}`
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CombinedFinancialReport;
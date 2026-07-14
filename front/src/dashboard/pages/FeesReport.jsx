import React, { useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import moment from "moment";
import VazirmatnTTF from "../../../public/ttf/Vazirmatn.js";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const FeesReport = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(false);

  // ─── Fetch fees ─────────────────────────────────────────────
  const fetchFees = async () => {
    if (!startDate || !endDate) {
      alert("لطفاً هر دو تاریخ شروع و پایان را انتخاب کنید");
      return null;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/fees/range`, {
        params: { startDate, endDate },
      });
      const data = response.data;
      setFees(data);
      return data;
    } catch (error) {
      console.error("Error fetching fees:", error);
      alert("خطا در دریافت اطلاعات فیس‌ها");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ─── Download PDF (fetches data first if not already loaded) ──
  const handleDownload = async () => {
    let data = fees;
    // If no fees loaded, fetch them first
    if (data.length === 0) {
      data = await fetchFees();
    }
    // If still no data, abort
    if (!data || data.length === 0) {
      alert("هیچ داده‌ای برای دانلود وجود ندارد");
      return;
    }

    const doc = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });

    doc.addFileToVFS("Vazirmatn.ttf", VazirmatnTTF);
    doc.addFont("Vazirmatn.ttf", "Vazirmatn", "normal");
    doc.setFont("Vazirmatn");

    const pageWidth = doc.internal.pageSize.getWidth();
    const today = moment().format("YYYY/MM/DD");

    // Title
    doc.setFontSize(16);
    doc.text(
      `گزارش فیس‌ها از ${moment(startDate).format("YYYY/MM/DD")} تا ${moment(endDate).format("YYYY/MM/DD")}`,
      pageWidth - 40,
      60,
      { align: "right" }
    );

    // Table headers
    const headers = [["شماره", "ورزشکار", "کد ملی", "تاریخ شروع", "تاریخ پایان", "مجموع", "دریافتی", "باقیمانده"]];

    const body = data.map((fee) => [
      fee.id.toString(),
      fee.athlete?.full_name || "—",
      fee.athlete?.nic_number || "—",
      moment(fee.startDate).format("YYYY/MM/DD"),
      moment(fee.endDate).format("YYYY/MM/DD"),
      Number(fee.total).toLocaleString(),
      Number(fee.received).toLocaleString(),
      Number(fee.remained).toLocaleString(),
    ]);

    autoTable(doc, {
      margin: { top: 90, bottom: 60 },
      head: headers,
      body: body,
      theme: "grid",
      styles: {
        font: "Vazirmatn",
        fontSize: 10,
        halign: "center",
        valign: "middle",
        cellPadding: 8,
      },
      headStyles: {
        font: "Vazirmatn",
        fontStyle: "normal",
        fillColor: [70, 130, 180],
        textColor: [255, 255, 255],
        fontSize: 10,
        halign: "center",
      },
      didDrawCell: (data) => {
        if (data.cell) data.cell.styles.font = "Vazirmatn";
      },
    });

    // Summary
    const y = doc.lastAutoTable.finalY + 30;
    const totalSum = data.reduce((sum, f) => sum + Number(f.total), 0);
    const receivedSum = data.reduce((sum, f) => sum + Number(f.received), 0);
    const remainedSum = data.reduce((sum, f) => sum + Number(f.remained), 0);

    doc.setFontSize(11);
    doc.text(`تعداد فیس‌ها: ${data.length}`, pageWidth - 40, y, { align: "right" });
    doc.text(`مجموع کل: ${totalSum.toLocaleString()}`, pageWidth - 40, y + 20, { align: "right" });
    doc.text(`مجموع دریافتی: ${receivedSum.toLocaleString()}`, pageWidth - 40, y + 40, { align: "right" });
    doc.text(`مجموع باقیمانده: ${remainedSum.toLocaleString()}`, pageWidth - 40, y + 60, { align: "right" });
    doc.text(`تاریخ صدور: ${today}`, pageWidth - 40, y + 80, { align: "right" });

    // Page numbers
    const pageCount = doc.internal.getNumberOfPages();
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(10);
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(`${i} / ${pageCount}`, pageWidth - 40, pageHeight - 40, { align: "right" });
    }

    doc.save(`گزارش_فیس‌ها_${moment(startDate).format("YYYYMMDD")}_تا_${moment(endDate).format("YYYYMMDD")}.pdf`);
  };

  // ─── UI ────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-4xl mx-auto" dir="rtl">
      <h1 className="text-2xl font-bold mb-4 text-right">گزارش فیس‌ها</h1>

      <div className="flex flex-wrap gap-4 mb-4 justify-end">
        <div>
          <label className="block mb-1 text-right">تاریخ شروع:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border px-3 py-2 rounded w-full sm:w-auto"
          />
        </div>

        <div>
          <label className="block mb-1 text-right">تاریخ پایان:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border px-3 py-2 rounded w-full sm:w-auto"
          />
        </div>

        <button
          onClick={handleDownload}
          disabled={loading}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-green-700 self-end disabled:bg-gray-400"
        >
          {loading ? "در حال دریافت و ساخت PDF..." : "دانلود PDF"}
        </button>
      </div>

    </div>
  );
};

export default FeesReport;
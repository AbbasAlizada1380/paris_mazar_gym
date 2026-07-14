import React, { useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import moment from "moment";

import VazirmatnTTF from "../../../../public/ttf/Vazirmatn.js";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const AthletePaidFeesPDF = ({ athleteId }) => {
  const [loading, setLoading] = useState(false);

  const fetchAllPaidFees = async (athleteId) => {
    let allFees = [];
    let page = 1;
    const limit = 50;
    let totalPages = 1;

    try {
      while (page <= totalPages) {
        const response = await axios.get(`${BASE_URL}/fees/${athleteId}/paid`, {
          params: { page, limit },
        });

        const { data, meta } = response.data;
        allFees = allFees.concat(data);
        totalPages = meta.totalPages || 1;
        page++;
      }
      return allFees;
    } catch (error) {
      console.error("Error fetching paid fees:", error);
      throw error;
    }
  };

  const handleDownload = async () => {
    if (!athleteId) {
      alert("شناسه ورزشکار ضروری است");
      return;
    }

    try {
      setLoading(true);

      const fees = await fetchAllPaidFees(athleteId);

      if (!fees || fees.length === 0) {
        alert("هیچ هزینه پرداخت شده‌ای برای این ورزشکار یافت نشد");
        return;
      }

      const doc = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });

      doc.addFileToVFS("Vazirmatn.ttf", VazirmatnTTF);
      doc.addFont("Vazirmatn.ttf", "Vazirmatn", "normal");
      doc.setFont("Vazirmatn");

      const athlete = fees[0]?.athlete || {};
      const athleteName = athlete.full_name || "ورزشکار ناشناس";
      const athleteNic = athlete.nic_number || "";

      const today = moment().format("YYYY/MM/DD");
      const pageWidth = doc.internal.pageSize.getWidth();

      // Title
      doc.setFontSize(16);
      doc.text(
        `گزارش هزینه‌های پرداخت شده - ${athleteName}`,
        pageWidth - 40,
        60,
        { align: "right" }
      );

      doc.setFontSize(11);
      doc.text(
        `کد ملی: ${athleteNic}`,
        pageWidth - 40,
        85,
        { align: "right" }
      );

      // Table Headers
      const headers = [
        ["دوره", "مجموع", "دریافتی", "باقیمانده", "تاریخ ایجاد", "شماره"]
      ];

      // Table Body
      const body = fees.map((fee) => [
        `${moment(fee.startDate).format("YYYY/MM/DD")} – ${moment(fee.endDate).format("YYYY/MM/DD")}`,
        Number(fee.total).toLocaleString(),
        Number(fee.received).toLocaleString(),
        Number(fee.remained).toLocaleString(),
        moment(fee.createdAt).format("YYYY/MM/DD"),
        fee.id.toString(),
      ]);

      autoTable(doc, {
        margin: { top: 110, bottom: 60 },
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
      const totalSum = fees.reduce((sum, f) => sum + Number(f.total), 0);
      const receivedSum = fees.reduce((sum, f) => sum + Number(f.received), 0);
      const remainedSum = fees.reduce((sum, f) => sum + Number(f.remained), 0);

      doc.setFontSize(11);
      doc.text(`تعداد هزینه‌ها: ${fees.length}`, pageWidth - 40, y, { align: "right" });
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
        doc.text(
          `${i} / ${pageCount}`,
          pageWidth - 40,
          pageHeight - 40,
          { align: "right" }
        );
      }

      doc.save(`PaidFees_${athleteName}_${today}.pdf`);
    } catch (error) {
      console.error(error);
      alert("خطا در دریافت اطلاعات هزینه‌های پرداخت شده");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4 p-4">
      <button
        onClick={handleDownload}
        disabled={loading}
        className="bg-cyan-800 text-white px-6 py-2 rounded hover:bg-cyan-700 disabled:bg-gray-400"
      >
        {loading ? "در حال ساخت PDF..." : "دانلود گزارش هزینه‌های پرداخت شده"}
      </button>
    </div>
  );
};

export default AthletePaidFeesPDF;
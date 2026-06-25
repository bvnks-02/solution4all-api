import PDFDocument from "pdfkit";
import { catchAsyncError } from "../../utils/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import { analyticsEventModel } from "../../../Database/models/analyticsEvent.model.js";
import { orderModel } from "../../../Database/models/order.model.js";

// ---- Date filter helper (mirrors frontend logic) ----
function buildDateFilter(dateRange) {
  if (!dateRange || dateRange === "all") return {};
  const now = new Date();
  const days = dateRange === "today" ? 0 : dateRange === "7days" ? 7 : 30;
  const from = new Date(now);
  if (days === 0) {
    from.setHours(0, 0, 0, 0);
  } else {
    from.setDate(from.getDate() - days);
  }
  return { createdAt: { $gte: from } };
}

const exportReport = catchAsyncError(async (req, res, next) => {
  const { report_type, date_range } = req.body;

  if (!["analytics", "orders"].includes(report_type)) {
    return next(new AppError("Type de rapport invalide", 400));
  }

  const isAdmin = req.user.role === "admin";
  const dateFilter = buildDateFilter(date_range);
  let records = [];
  let title = "";

  if (report_type === "analytics") {
    title = "Rapport des Événements Analytics";
    records = await analyticsEventModel.find(dateFilter).sort({ createdAt: -1 }).limit(500);
  } else {
    title = "Rapport des Commandes";
    const query = { ...dateFilter };
    // ⚠️ SECURITY: standard users see only their own orders
    if (!isAdmin) query.customer_email = req.user.email;
    records = await orderModel.find(query).sort({ createdAt: -1 }).limit(500);
  }

  // ---- PDF generation ----
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="rapport_${report_type}_${Date.now()}.pdf"`
  );

  const doc = new PDFDocument({ margin: 50, size: "A4" });
  doc.pipe(res);

  // Header
  doc.fontSize(20).fillColor("#1C3F7A").text("Solution4All", 50, 50);
  doc.fontSize(14).fillColor("#333").text(title, 50, 80);
  doc.fontSize(10).fillColor("#666")
    .text(`Généré le : ${new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}`, 50, 100)
    .text(`Utilisateur : ${req.user.name || req.user.email} (${req.user.role})`, 50, 115)
    .text(`Période : ${date_range || "Tout"}  —  ${records.length} enregistrement(s)`, 50, 130);

  doc.moveTo(50, 150).lineTo(545, 150).strokeColor("#F5A800").lineWidth(2).stroke();

  // Table
  let y = 170;
  const COL = report_type === "analytics"
    ? [{ label: "Type", key: "event_type", w: 120 }, { label: "Page", key: "page_path", w: 200 }, { label: "Appareil", key: "device_type", w: 80 }, { label: "Date", key: "createdAt", w: 120 }]
    : [{ label: "N° Commande", key: "order_number", w: 120 }, { label: "Client", key: "customer_name", w: 150 }, { label: "Total (DA)", key: "total_dzd", w: 90 }, { label: "Statut", key: "status", w: 80 }, { label: "Date", key: "createdAt", w: 100 }];

  // Header row
  doc.fontSize(9).fillColor("#fff");
  let x = 50;
  COL.forEach(c => {
    doc.rect(x, y, c.w, 18).fill("#1C3F7A");
    doc.fillColor("#fff").text(c.label, x + 4, y + 4, { width: c.w - 8 });
    x += c.w;
  });
  y += 18;

  // Data rows
  records.forEach((rec, i) => {
    if (y > 760) { doc.addPage(); y = 50; }
    x = 50;
    doc.fontSize(8).fillColor("#333");
    const bg = i % 2 === 0 ? "#f9fafb" : "#fff";
    COL.forEach(c => {
      doc.rect(x, y, c.w, 16).fill(bg).stroke("#e5e7eb");
      let val = rec[c.key];
      if (c.key === "createdAt") val = new Date(val).toLocaleDateString("fr-FR");
      if (c.key === "total_dzd") val = `${Number(val).toLocaleString("fr-DZ")} DA`;
      doc.fillColor("#333").text(String(val ?? ""), x + 4, y + 3, { width: c.w - 8, ellipsis: true });
      x += c.w;
    });
    y += 16;
  });

  // Footer
  doc.fontSize(8).fillColor("#999")
    .text("© Solution4All — Document généré automatiquement", 50, 800, { align: "center" });

  doc.end();
});

export { exportReport };

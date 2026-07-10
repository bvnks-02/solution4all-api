import { catchAsyncError } from "../../utils/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import { parseSort } from "../../utils/parseSort.js";
import { paginate } from "../../utils/paginate.js";
import { buildSearchRegex } from "../../utils/searchRegex.js";
import { productModel } from "../../../Database/models/product.model.js";
import { orderModel } from "../../../Database/models/order.model.js";
import { sendMail } from "../../services/mailer.js";
import { orderConfirmationEmail, orderNotificationEmail } from "../../services/emailTemplates.js";

// Generate order number: CMD-YYYYMMDD-XXXX
async function generateOrderNumber() {
  const today = new Date();
  const dateStr = today.getFullYear().toString() +
    String(today.getMonth() + 1).padStart(2, "0") +
    String(today.getDate()).padStart(2, "0");

  const prefix = `CMD-${dateStr}-`;

  // Find the last order number for today
  const lastOrder = await orderModel
    .findOne({ order_number: new RegExp(`^${prefix}`) })
    .sort({ order_number: -1 });

  let seq = 1;
  if (lastOrder && lastOrder.order_number) {
    const lastSeq = parseInt(lastOrder.order_number.split("-").pop(), 10);
    seq = lastSeq + 1;
  }

  return `${prefix}${String(seq).padStart(4, "0")}`;
}

const createOrder = catchAsyncError(async (req, res, next) => {
  const { items, customer_name, customer_email, customer_phone, customer_company, wilaya, address, notes } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return next(new AppError("Order must have at least one item", 400));
  }

  // Validate each item and compute totals
  let subtotal_dzd = 0;
  const validatedItems = [];

  for (const item of items) {
    const product = await productModel.findById(item.product_id);
    if (!product) {
      return next(new AppError(`Product not found: ${item.product_id}`, 400));
    }
    if (!product.active) {
      return next(new AppError(`Product is not available: ${product.name_fr}`, 400));
    }
    if (product.stock < item.qty) {
      return next(new AppError(`Insufficient stock for: ${product.name_fr}`, 400));
    }

    const unit_price_dzd = product.price_dzd;
    const lineTotal = unit_price_dzd * item.qty;
    subtotal_dzd += lineTotal;

    validatedItems.push({
      product_id: item.product_id,
      name_fr: product.name_fr,
      qty: item.qty,
      unit_price_dzd,
    });
  }

  const order_number = await generateOrderNumber();

  const order = await orderModel.create({
    order_number,
    customer_name,
    customer_email,
    customer_phone: customer_phone || "",
    customer_company: customer_company || "",
    wilaya,
    address,
    notes: notes || "",
    items: validatedItems,
    subtotal_dzd,
    total_dzd: subtotal_dzd,
    source: "boutique",
    status: "pending",
  });

  // Decrement stock for each item
  for (const item of validatedItems) {
    await productModel.findByIdAndUpdate(item.product_id, {
      $inc: { stock: -item.qty },
    });
  }

  // Send notification emails (non-blocking)
  const notificationEmail = orderNotificationEmail(order);
  sendMail({
    to: process.env.ORDER_EMAIL || "websales@solution4all.dz",
    subject: notificationEmail.subject,
    html: notificationEmail.html,
  }).catch((err) => console.error("Failed to send order notification:", err.message));

  const confirmationEmail = orderConfirmationEmail(order);
  sendMail({
    to: order.customer_email,
    subject: confirmationEmail.subject,
    html: confirmationEmail.html,
  }).catch((err) => console.error("Failed to send order confirmation:", err.message));

  res.status(201).json({ success: true, data: order });
});

const getAllOrders = catchAsyncError(async (req, res, next) => {
  const query = { deletedAt: null };
  // Hide archived orders from the active list unless explicitly requested
  // (?archived=true returns only the archive view). Use $ne:true for the active
  // view so legacy orders (created before this field existed) still appear.
  query.archived = req.query.archived === "true" ? true : { $ne: true };
  if (req.query.status) query.status = req.query.status;
  if (req.query.search) {
    const regex = buildSearchRegex(req.query.search);
    query.$or = [
      { order_number: regex },
      { customer_name: regex },
      { customer_email: regex },
      { customer_company: regex },
    ];
  }
  const sort = parseSort(req.query.sort);
  const { items, meta } = await paginate(orderModel, query, { ...req.query, sort });
  res.status(200).json({ success: true, data: items, meta });
});

const getSpecificOrder = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const order = await orderModel.findById(id);

  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  res.status(200).json({ success: true, data: order });
});

const updateOrder = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { status, admin_notes, archived } = req.body;

  const updateData = {};
  if (status) updateData.status = status;
  if (admin_notes !== undefined) updateData.admin_notes = admin_notes;
  if (archived !== undefined) {
    updateData.archived = !!archived;
    updateData.archivedAt = archived ? new Date() : null;
  }

  const order = await orderModel.findByIdAndUpdate(id, updateData, { new: true });

  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  res.status(200).json({ success: true, data: order });
});

const deleteOrder = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const order = await orderModel.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true });
  if (!order) return next(new AppError("Order not found", 404));
  res.status(200).json({ success: true, message: "Commande déplacée dans la corbeille" });
});

const getTrashedOrders = catchAsyncError(async (req, res, next) => {
  const query = { deletedAt: { $ne: null } };
  if (req.query.status) query.status = req.query.status;
  if (req.query.search) {
    const regex = buildSearchRegex(req.query.search);
    query.$or = [
      { order_number: regex },
      { customer_name: regex },
      { customer_email: regex },
    ];
  }
  const sort = parseSort(req.query.sort);
  const { items, meta } = await paginate(orderModel, query, { ...req.query, sort });
  res.status(200).json({ success: true, data: items, meta });
});

const restoreOrder = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const order = await orderModel.findByIdAndUpdate(id, { deletedAt: null }, { new: true });
  if (!order) return next(new AppError("Order not found", 404));
  res.status(200).json({ success: true, data: order, message: "Commande restaurée avec succès" });
});

const hardDeleteOrder = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const order = await orderModel.findByIdAndDelete(id);
  if (!order) return next(new AppError("Order not found", 404));
  res.status(200).json({ success: true, message: "Commande supprimée définitivement" });
});

export { createOrder, getAllOrders, getSpecificOrder, updateOrder, deleteOrder, getTrashedOrders, restoreOrder, hardDeleteOrder };

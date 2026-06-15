import { catchAsyncError } from "../../utils/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import { parseSort } from "../../utils/parseSort.js";
import { paginate } from "../../utils/paginate.js";
import { analyticsEventModel } from "../../../Database/models/analyticsEvent.model.js";

const createEvent = catchAsyncError(async (req, res, next) => {
  const event = await analyticsEventModel.create(req.body);

  res.status(201).json({ success: true, data: event });
});

const getAllEvents = catchAsyncError(async (req, res, next) => {
  const query = {};
  if (req.query.event_type) query.event_type = req.query.event_type;
  if (req.query.device_type) query.device_type = req.query.device_type;
  if (req.query.dateFrom || req.query.dateTo) {
    query.createdAt = {};
    if (req.query.dateFrom) query.createdAt.$gte = new Date(req.query.dateFrom);
    if (req.query.dateTo) query.createdAt.$lte = new Date(req.query.dateTo);
  }
  const sort = parseSort(req.query.sort);
  const { items, meta } = await paginate(analyticsEventModel, query, { ...req.query, sort });
  res.status(200).json({ success: true, data: items, meta });
});

const getEventCount = catchAsyncError(async (req, res, next) => {
  const { event_type } = req.query;

  const query = {};
  if (event_type) query.event_type = event_type;

  const count = await analyticsEventModel.countDocuments(query);

  res.status(200).json({ success: true, data: { count } });
});

export { createEvent, getAllEvents, getEventCount };

import slugify from "slugify";
import { catchAsyncError } from "../../utils/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import { parseSort } from "../../utils/parseSort.js";
import { paginate } from "../../utils/paginate.js";
import { serviceModel } from "../../../Database/models/service.model.js";

const addService = catchAsyncError(async (req, res, next) => {
  if (req.body.title_fr) {
    req.body.slug = slugify(req.body.title_fr, { lower: true, strict: true });
  }

  const service = new serviceModel(req.body);
  await service.save();

  res.status(201).json({ success: true, data: service });
});

const getAllServices = catchAsyncError(async (req, res, next) => {
  const query = {};
  if (req.query.active !== undefined) query.active = req.query.active === "true";
  const sort = parseSort(req.query.sort, { sort_order: 1, createdAt: -1 });
  const { items, meta } = await paginate(serviceModel, query, { ...req.query, sort });
  res.status(200).json({ success: true, data: items, meta });
});

const getSpecificService = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const service = await serviceModel.findById(id);

  if (!service) {
    return next(new AppError("Service not found", 404));
  }

  res.status(200).json({ success: true, data: service });
});

const updateService = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  if (req.body.title_fr) {
    req.body.slug = slugify(req.body.title_fr, { lower: true, strict: true });
  }

  const service = await serviceModel.findByIdAndUpdate(id, req.body, { new: true });

  if (!service) {
    return next(new AppError("Service not found", 404));
  }

  res.status(200).json({ success: true, data: service });
});

const deleteService = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const service = await serviceModel.findByIdAndDelete(id);

  if (!service) {
    return next(new AppError("Service not found", 404));
  }

  res.status(200).json({ success: true, message: "Service deleted successfully" });
});

export { addService, getAllServices, getSpecificService, updateService, deleteService };

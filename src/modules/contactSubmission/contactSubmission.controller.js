import { catchAsyncError } from "../../utils/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import { parseSort } from "../../utils/parseSort.js";
import { paginate } from "../../utils/paginate.js";
import { contactSubmissionModel } from "../../../Database/models/contactSubmission.model.js";
import { sendMail } from "../../services/mailer.js";
import { contactRoutingEmail } from "../../services/emailTemplates.js";

const createSubmission = catchAsyncError(async (req, res, next) => {
  const submissionData = {
    ...req.body,
    status: "new",
    ip_address: req.ip || req.connection.remoteAddress || "",
    user_agent: req.headers["user-agent"] || "",
  };

  const submission = await contactSubmissionModel.create(submissionData);

  // Send routing email (non-blocking)
  const emailData = contactRoutingEmail(submission);
  sendMail({
    to: emailData.to,
    subject: emailData.subject,
    html: emailData.html,
  }).catch((err) => console.error("Failed to send contact routing email:", err.message));

  res.status(201).json({ success: true, data: submission });
});

const getAllSubmissions = catchAsyncError(async (req, res, next) => {
  const query = {};
  if (req.query.status) query.status = req.query.status;
  if (req.query.department) query.department = req.query.department;
  if (req.query.search) {
    const escaped = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.$or = [
      { full_name: { $regex: escaped, $options: "i" } },
      { email: { $regex: escaped, $options: "i" } },
      { subject: { $regex: escaped, $options: "i" } },
    ];
  }
  const sort = parseSort(req.query.sort);
  const { items, meta } = await paginate(contactSubmissionModel, query, { ...req.query, sort });
  res.status(200).json({ success: true, data: items, meta });
});

const getSubmissionCount = catchAsyncError(async (req, res, next) => {
  const { status } = req.query;

  const query = {};
  if (status) query.status = status;

  const count = await contactSubmissionModel.countDocuments(query);

  res.status(200).json({ success: true, data: { count } });
});

const getSpecificSubmission = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const submission = await contactSubmissionModel.findById(id);

  if (!submission) {
    return next(new AppError("Submission not found", 404));
  }

  res.status(200).json({ success: true, data: submission });
});

const updateSubmission = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  const updateData = {};
  if (status) updateData.status = status;

  const submission = await contactSubmissionModel.findByIdAndUpdate(id, updateData, { new: true });

  if (!submission) {
    return next(new AppError("Submission not found", 404));
  }

  res.status(200).json({ success: true, data: submission });
});

const deleteSubmission = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const submission = await contactSubmissionModel.findByIdAndDelete(id);

  if (!submission) {
    return next(new AppError("Submission not found", 404));
  }

  res.status(200).json({ success: true, message: "Submission deleted successfully" });
});

export {
  createSubmission,
  getAllSubmissions,
  getSubmissionCount,
  getSpecificSubmission,
  updateSubmission,
  deleteSubmission,
};

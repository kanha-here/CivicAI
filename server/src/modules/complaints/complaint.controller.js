import { body, param, query } from 'express-validator';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { successResponse } from '../../utils/apiResponse.js';
import { prisma } from '../../prisma/client.js';
import {
  addComplaintFeedback,
  addComplaintProgress,
  buildComplaintWorkReport,
  createComplaint,
  deleteComplaint,
  getComplaintById,
  listComplaints,
  updateComplaint,
} from './complaint.service.js';

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'Not available';
}

function buildWorkReportDocument(report) {
  const viewer = report.downloadedBy || {};
  const statusLabel = String(report.status || 'UNKNOWN').replaceAll('_', ' ');
  const progressRows = (report.progress || []).map((entry) => `
    <tr>
      <td>${escapeHtml(formatDate(entry.createdAt))}</td>
      <td>${escapeHtml(String(entry.newStatus || '').replaceAll('_', ' '))}</td>
      <td>${escapeHtml(entry.changedBy?.name || 'System')}</td>
      <td>${escapeHtml(entry.note || '')}</td>
    </tr>
  `).join('');

  const feedbackRows = (report.feedback || []).map((item) => `
    <tr>
      <td>${escapeHtml(formatDate(item.createdAt))}</td>
      <td>${escapeHtml(item.user?.name || 'Citizen')}</td>
      <td>${escapeHtml(item.rating)}/5</td>
      <td>${escapeHtml(item.review || '')}</td>
    </tr>
  `).join('');

  const images = (report.images || []).map((image, index) => `
    <div class="image-card">
      <img src="${escapeHtml(image.fileUrl)}" alt="${escapeHtml(image.fileName || 'Work image')}" />
      <p>Work image ${index + 1} - ${escapeHtml(formatDate(image.createdAt))}</p>
    </div>
  `).join('');

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Work Report ${escapeHtml(report.trackingId)}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #111827; line-height: 1.45; padding: 24px; background: #f9fafb; }
    .page { max-width: 980px; margin: 0 auto; background: white; border: 1px solid #e5e7eb; padding: 28px; }
    h1 { font-size: 24px; margin-bottom: 4px; }
    h2 { font-size: 16px; margin-top: 24px; border-bottom: 1px solid #d1d5db; padding-bottom: 6px; }
    .muted { color: #6b7280; font-size: 12px; }
    .header { border-bottom: 2px solid #111827; padding-bottom: 14px; margin-bottom: 18px; }
    .report-id { font-family: Consolas, monospace; font-size: 13px; background: #111827; color: white; display: inline-block; padding: 6px 8px; border-radius: 4px; }
    .status { display: inline-block; padding: 5px 8px; border-radius: 999px; background: #ecfdf5; color: #047857; font-size: 12px; font-weight: bold; }
    .tracking { font-family: Consolas, monospace; font-size: 16px; font-weight: bold; color: #111827; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .box { border: 1px solid #d1d5db; padding: 10px; border-radius: 6px; margin: 8px 0; word-break: break-word; }
    .transparency { background: #eff6ff; border-color: #bfdbfe; color: #1e3a8a; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th, td { border: 1px solid #d1d5db; padding: 8px; vertical-align: top; font-size: 12px; }
    th { background: #f3f4f6; text-align: left; }
    img { max-width: 320px; max-height: 240px; object-fit: contain; border: 1px solid #d1d5db; }
    .image-card { display: inline-block; margin: 8px 12px 8px 0; vertical-align: top; }
    .image-card p { font-size: 11px; color: #6b7280; max-width: 320px; }
    pre { white-space: pre-wrap; font-family: Arial, sans-serif; }
  </style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="report-id">${escapeHtml(report.reportId)}</div>
    <h1>Authenticated Grievance Work Report</h1>
    <div class="muted">Generated at ${escapeHtml(formatDate(report.generatedAt))}</div>
  </div>

  <div class="grid">
    <div class="box"><strong>Tracking ID</strong><br /><span class="tracking">${escapeHtml(report.trackingId)}</span></div>
    <div class="box"><strong>Current Report Status</strong><br /><span class="status">${escapeHtml(statusLabel)}</span></div>
  </div>

  <div class="box transparency">
    <strong>Transparency note</strong><br />
    This report is generated only for tracking ID <strong>${escapeHtml(report.trackingId)}</strong>.
    All status, officer work updates, images, and citizen feedback below are mapped from this exact complaint record.
  </div>

  <div class="box"><strong>Authenticated viewer</strong><br />${escapeHtml(viewer.name || 'Current user')} (${escapeHtml(viewer.role || 'user')})<br />${escapeHtml(viewer.email || '')}</div>

  <h2>Complaint Summary</h2>
  <div class="grid">
    <div class="box"><strong>Report ID</strong><br />${escapeHtml(report.reportId)}</div>
    <div class="box"><strong>Mapped Complaint ID</strong><br />${escapeHtml(report.trackingId)}</div>
    <div class="box"><strong>Priority</strong><br />${escapeHtml(report.priority)}</div>
    <div class="box"><strong>Department</strong><br />${escapeHtml(report.department?.name || 'Unassigned')}</div>
  </div>
  <div class="box"><strong>Title</strong><br />${escapeHtml(report.title)}</div>
  <div class="box"><strong>Complaint Given By Citizen</strong><pre>${escapeHtml(report.description)}</pre></div>

  <h2>People</h2>
  <div class="grid">
    <div class="box"><strong>Citizen</strong><br />${escapeHtml(report.citizen?.name || 'Citizen')}<br />${escapeHtml(report.citizen?.email || '')}</div>
    <div class="box"><strong>Assigned Officer</strong><br />${escapeHtml(report.assignedOfficer?.name || 'Unassigned')}<br />${escapeHtml(report.assignedOfficer?.email || '')}</div>
  </div>

  <h2>Work Timeline</h2>
  <table>
    <thead><tr><th>Time</th><th>Status</th><th>Updated By</th><th>Comment</th></tr></thead>
    <tbody>${progressRows || '<tr><td colspan="4">No progress updates yet.</td></tr>'}</tbody>
  </table>

  <h2>Work Images</h2>
  ${images || '<p>No work images attached.</p>'}

  <h2>Citizen Feedback</h2>
  <table>
    <thead><tr><th>Time</th><th>Citizen</th><th>Rating</th><th>Review</th></tr></thead>
    <tbody>${feedbackRows || '<tr><td colspan="4">No feedback submitted yet.</td></tr>'}</tbody>
  </table>
</div>
</body>
</html>`;
}

export const createComplaintValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('departmentId').optional().isUUID(),
  body('assignedOfficerId').optional().isUUID(),
  body('attachments').optional().isArray({ max: 10 }),
  body('attachments.*.fileUrl')
    .optional()
    .custom((value) => /^https?:\/\//i.test(value) || /^data:image\/(png|jpe?g|webp);base64,/i.test(value))
    .withMessage('Attachment must be an image data URL or a valid HTTP(S) URL'),
  body('attachments.*.fileName').optional().trim().isLength({ max: 255 }),
];

export const updateComplaintValidation = [
  param('id').isUUID().withMessage('Valid complaint id is required'),
  body('title').optional().trim().notEmpty(),
  body('description').optional().trim().notEmpty(),
  body('status').optional().isIn(['submitted', 'triaged', 'assigned', 'in_progress', 'resolved', 'rejected', 'closed']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('departmentId').optional().isUUID(),
  body('assignedOfficerId').optional().isUUID(),
];

export const getComplaintValidation = [param('id').isUUID().withMessage('Valid complaint id is required')];

export const progressValidation = [
  param('id').isUUID().withMessage('Valid complaint id is required'),
  body('comment').optional().trim().isLength({ max: 2000 }),
  body('status').optional().isIn(['assigned', 'in_progress', 'resolved']),
  body('imageUrl')
    .optional()
    .custom((value) => /^https?:\/\//i.test(value) || /^data:image\/(png|jpe?g|webp);base64,/i.test(value))
    .withMessage('Progress image must be an image data URL or a valid HTTP(S) URL'),
  body('fileName').optional().trim().isLength({ max: 255 }),
];

export const feedbackValidation = [
  param('id').isUUID().withMessage('Valid complaint id is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review').optional().trim().isLength({ max: 2000 }),
];

export const listComplaintValidation = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

export const createComplaintHandler = asyncHandler(async (req, res) => {
  const complaint = await createComplaint(req.body, req.user.id);
  return successResponse(res, complaint, 'Complaint created', 201);
});

export const listComplaintsHandler = asyncHandler(async (req, res) => {
  const result = await listComplaints(req.query, req.user);
  return successResponse(res, result, 'Complaints loaded');
});

export const getComplaintHandler = asyncHandler(async (req, res) => {
  const complaint = await getComplaintById(req.params.id, req.user);
  return successResponse(res, complaint, 'Complaint loaded');
});

export const updateComplaintHandler = asyncHandler(async (req, res) => {
  const complaint = await updateComplaint(req.params.id, req.body, req.user);
  return successResponse(res, complaint, 'Complaint updated');
});

export const progressHandler = asyncHandler(async (req, res) => {
  const complaint = await addComplaintProgress(req.params.id, req.body, req.user);
  return successResponse(res, complaint, 'Progress update shared');
});

export const feedbackHandler = asyncHandler(async (req, res) => {
  const feedback = await addComplaintFeedback(req.params.id, req.body, req.user);
  return successResponse(res, feedback, 'Feedback submitted', 201);
});

export const workReportHandler = asyncHandler(async (req, res) => {
  const report = await buildComplaintWorkReport(req.params.id, req.user);
  const viewer = req.user?.id
    ? await prisma.user.findUnique({ where: { id: req.user.id }, select: { id: true, name: true, email: true, role: true } }).catch(() => null)
    : null;
  report.downloadedBy = {
    id: viewer?.id || req.user?.id,
    name: viewer?.name || req.user?.email || 'Current user',
    email: viewer?.email || req.user?.email,
    role: String(viewer?.role || req.user?.role || 'user').toLowerCase(),
  };
  if (req.query.download === '1') {
    const fileName = `work-report-${req.params.id}-${String(report.status || 'status').toLowerCase()}.html`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    return res.send(buildWorkReportDocument(report));
  }
  return successResponse(res, report, 'Work report generated');
});

export const deleteComplaintHandler = asyncHandler(async (req, res) => {
  const result = await deleteComplaint(req.params.id, req.user);
  return successResponse(res, result, 'Complaint deleted');
});

import AuditLog from '../models/AuditLog.js';

export const logAudit = async (req, action, entityType, entityId, metadata = {}) => {
  try {
    const userId = req?.user?._id || null;
    await AuditLog.create({ user: userId, action, entityType, entityId, metadata });
  } catch (e) {
    // Do not block main flow on audit failures
    console.error('Audit log failed:', e?.message || e);
  }
};

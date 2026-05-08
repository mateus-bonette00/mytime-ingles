import { config } from '../config/env.js';

const securityLogger = {
  logLoginAttempt(email, success, ip) {
    const status = success ? 'SUCCESS' : 'FAILED';
    console.log(`[SECURITY] Login ${status}: ${email} | IP: ${ip} | ${new Date().toISOString()}`);
  },

  logAdminAction(adminId, adminEmail, action, details = '') {
    console.log(`[ADMIN] User ${adminId} (${adminEmail}): ${action} ${details} | ${new Date().toISOString()}`);
  },

  logPasswordChange(userId, email, success) {
    const status = success ? 'SUCCESS' : 'FAILED';
    console.log(`[SECURITY] Password change ${status}: ${email} (ID: ${userId}) | ${new Date().toISOString()}`);
  },

  logAccessDenied(userId, email, resource, reason) {
    console.log(`[SECURITY] Access denied: ${email || 'anonymous'} -> ${resource} | Reason: ${reason} | ${new Date().toISOString()}`);
  },

  logWebhook(type, paymentId, status) {
    console.log(`[WEBHOOK] Type: ${type} | PaymentID: ${paymentId} | Status: ${status} | ${new Date().toISOString()}`);
  },
};

export default securityLogger;

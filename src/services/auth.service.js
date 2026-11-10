import { api } from '../api/apiClient';
import { demoLogin, demoLogout, demoUser } from './demo.service';

export const authService = {
  async login(credentials) {
    const demo = demoLogin(credentials);
    if (demo) return demo;

    demoLogout();
    return api('/auth/login', {
      method: 'POST',
      body: credentials,
    });
  },

  verifyEmail: (values) =>
    api('/auth/verify-email', {
      method: 'POST',
      body: values,
      successMessage: 'Kích hoạt tài khoản thành công! Vui lòng đăng nhập.',
    }),
  sendOtp: (values) =>
    api('/auth/send-otp', {
      method: 'POST',
      body: values,
      successMessage: 'Mã OTP đã được gửi về email của bạn',
    }),
  resendOtp: (values) =>
    api('/auth/resend-otp', {
      method: 'POST',
      body: values,
      successMessage: 'Mã OTP đã được gửi về email của bạn',
    }),
  forgotPassword: (values) =>
    api('/auth/forgot-password', { method: 'POST', body: values }),
  resetPassword: (values) =>
    api('/auth/reset-password', { method: 'POST', body: values }),
  me: async () => demoUser() || api('/auth/me'),

  async logout() {
    if (demoUser()) {
      demoLogout();
      return;
    }
    await api('/auth/logout', { method: 'POST' });
  },
};

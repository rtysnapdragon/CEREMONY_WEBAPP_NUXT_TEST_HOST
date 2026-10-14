// helpers/api.js — Central API helper using useHttp1 composable

import { useHttp1 } from '~/composables/useHttp'

const api = {
  // ── AUTH ──
  auth: {
    login: (credentials) => useHttp1('/auth/login', { method: 'POST', body: credentials }),
    register: (data) => useHttp1('/auth/register', { method: 'POST', body: data }),
    logout: () => useHttp1('/auth/logout', { method: 'POST' }),
    me: () => useHttp1('/auth/me'),
    refreshToken: () => useHttp1('/auth/refresh', { method: 'POST' }),
    forgotPassword: (email) => useHttp1('/auth/forgot-password', { method: 'POST', body: { email } }),
    resetPassword: (data) => useHttp1('/auth/reset-password', { method: 'POST', body: data }),
    googleAuth: (token) => useHttp1('/auth/google', { method: 'POST', body: { token } }),
    facebookAuth: (token) => useHttp1('/auth/facebook', { method: 'POST', body: { token } }),
  },

  // ── EVENTS ──
  events: {
    list: (params) => useHttp1('/events', { params }),
    get: (id) => useHttp1(`/events/${id}`),
    create: (data) => useHttp1('/events', { method: 'POST', body: data }),
    update: (id, data) => useHttp1(`/events/${id}`, { method: 'PUT', body: data }),
    delete: (id) => useHttp1(`/events/${id}`, { method: 'DELETE' }),
    stats: (id) => useHttp1(`/events/${id}/stats`),
  },

  // ── GUESTS ──
  guests: {
    list: (eventId, params) => useHttp1(`/events/${eventId}/guests`, { params }),
    get: (eventId, guestId) => useHttp1(`/events/${eventId}/guests/${guestId}`),
    create: (eventId, data) => useHttp1(`/events/${eventId}/guests`, { method: 'POST', body: data }),
    update: (eventId, guestId, data) => useHttp1(`/events/${eventId}/guests/${guestId}`, { method: 'PUT', body: data }),
    delete: (eventId, guestId) => useHttp1(`/events/${eventId}/guests/${guestId}`, { method: 'DELETE' }),
    bulkImport: (eventId, data) => useHttp1(`/events/${eventId}/guests/import`, { method: 'POST', body: data }),
    export: (eventId) => useHttp1(`/events/${eventId}/guests/export`),
    updateRsvp: (eventId, guestId, status) =>
      useHttp1(`/events/${eventId}/guests/${guestId}/rsvp`, { method: 'PATCH', body: { status } }),
  },

  // ── TASKS ──
  tasks: {
    list: (eventId, params) => useHttp1(`/events/${eventId}/tasks`, { params }),
    get: (eventId, taskId) => useHttp1(`/events/${eventId}/tasks/${taskId}`),
    create: (eventId, data) => useHttp1(`/events/${eventId}/tasks`, { method: 'POST', body: data }),
    update: (eventId, taskId, data) => useHttp1(`/events/${eventId}/tasks/${taskId}`, { method: 'PUT', body: data }),
    delete: (eventId, taskId) => useHttp1(`/events/${eventId}/tasks/${taskId}`, { method: 'DELETE' }),
    complete: (eventId, taskId) => useHttp1(`/events/${eventId}/tasks/${taskId}/complete`, { method: 'PATCH' }),
  },

  // ── BUDGET ──
  budget: {
    get: (eventId) => useHttp1(`/events/${eventId}/budget`),
    update: (eventId, data) => useHttp1(`/events/${eventId}/budget`, { method: 'PUT', body: data }),
    addTransaction: (eventId, data) => useHttp1(`/events/${eventId}/budget/transactions`, { method: 'POST', body: data }),
    deleteTransaction: (eventId, txId) =>
      useHttp1(`/events/${eventId}/budget/transactions/${txId}`, { method: 'DELETE' }),
  },

  // ── CEREMONY ──
  ceremony: {
    get: (eventId) => useHttp1(`/events/${eventId}/ceremony`),
    update: (eventId, data) => useHttp1(`/events/${eventId}/ceremony`, { method: 'PUT', body: data }),
    addPhase: (eventId, data) => useHttp1(`/events/${eventId}/ceremony/phases`, { method: 'POST', body: data }),
    updatePhase: (eventId, phaseId, data) =>
      useHttp1(`/events/${eventId}/ceremony/phases/${phaseId}`, { method: 'PUT', body: data }),
    deletePhase: (eventId, phaseId) =>
      useHttp1(`/events/${eventId}/ceremony/phases/${phaseId}`, { method: 'DELETE' }),
  },

  // ── INVITATION ──
  invitation: {
    getLetter: (eventId) => useHttp1(`/events/${eventId}/invitation/letter`),
    saveLetter: (eventId, data) => useHttp1(`/events/${eventId}/invitation/letter`, { method: 'PUT', body: data }),
    send: (eventId, data) => useHttp1(`/events/${eventId}/invitation/send`, { method: 'POST', body: data }),
    stats: (eventId) => useHttp1(`/events/${eventId}/invitation/stats`),
  },

  // ── GIFTS ──
  gifts: {
    list: (eventId, params) => useHttp1(`/events/${eventId}/gifts`, { params }),
    create: (eventId, data) => useHttp1(`/events/${eventId}/gifts`, { method: 'POST', body: data }),
    update: (eventId, giftId, data) => useHttp1(`/events/${eventId}/gifts/${giftId}`, { method: 'PUT', body: data }),
    delete: (eventId, giftId) => useHttp1(`/events/${eventId}/gifts/${giftId}`, { method: 'DELETE' }),
  },

  // ── NOTIFICATIONS ──
  notifications: {
    list: (params) => useHttp1('/notifications', { params }),
    markRead: (id) => useHttp1(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllRead: () => useHttp1('/notifications/read-all', { method: 'PATCH' }),
    delete: (id) => useHttp1(`/notifications/${id}`, { method: 'DELETE' }),
  },

  // ── USER ──
  user: {
    getProfile: () => useHttp1('/user/profile'),
    updateProfile: (data) => useHttp1('/user/profile', { method: 'PUT', body: data }),
    updatePassword: (data) => useHttp1('/user/password', { method: 'PUT', body: data }),
    uploadAvatar: (formData) => useHttp1('/user/avatar', { method: 'POST', body: formData }),
    updateSettings: (data) => useHttp1('/user/settings', { method: 'PUT', body: data }),
  },
}


export default api
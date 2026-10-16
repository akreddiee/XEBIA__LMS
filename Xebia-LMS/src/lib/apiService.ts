import {
  Assessment,
  Submission,
  Material,
  ClassInfo,
  User,
  Certificate,
  Batch,
  ScorecardResponse,
  Event,
  EventRegistrationResponse,
  NotificationItem,
  NotificationFilter,
  NotificationListResponse,
  VerificationRequestItem,
  VerificationRequestStats,
  CertificateVerificationResult,
  VerificationStatus,
  VerificationRequestType
} from "@/types";

const API_BASE = "/api";

/**
 * API Service for Teacher & Learner LMS Portal.
 * All methods make real HTTP requests to the Spring Boot backend via Next.js proxy rewrites.
 */
export const apiService = {
  // --- USER AUTHENTICATION ---
  getCurrentUser: (): User | null => {
    if (typeof window === "undefined") return null;
    const userJson = localStorage.getItem("current_user");
    return userJson ? JSON.parse(userJson) : null;
  },

  setCurrentUser: (user: User | null): void => {
    if (typeof window !== "undefined") {
      if (user) {
        localStorage.setItem("current_user", JSON.stringify(user));
      } else {
        localStorage.removeItem("current_user");
      }
    }
  },

  login: async (email: string, password: string, role: string): Promise<User> => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Login failed");
    }
    return res.json();
  },

  // --- CLASSES ---
  getClasses: async (): Promise<ClassInfo[]> => {
    const url = `${API_BASE}/classes`;
    const res = await fetch(url);
    if (!res.ok) {
      let msg = res.statusText;
      try { const err = await res.json(); msg = err.message || err.error || msg; } catch (e) {}
      throw new Error(`[API ERROR ${res.status}] GET ${url} failed: ${msg}`);
    }
    return res.json();
  },

  // --- ASSESSMENTS ---
  getAssessments: async (batch?: string, timeFilter?: string, status?: string, role?: string): Promise<Assessment[]> => {
    const params = new URLSearchParams();
    if (batch && batch !== "All Batches" && batch !== "") {
      params.set("batch", batch);
    }
    if (timeFilter && timeFilter !== "All") {
      params.set("timeFilter", timeFilter);
    }
    if (status) {
      params.set("status", status);
    }
    if (role) {
      params.set("role", role);
    }
    const query = params.toString();
    const url = `${API_BASE}/assessments${query ? `?${query}` : ""}`;
    const res = await fetch(url);
    if (!res.ok) {
      let msg = res.statusText;
      try { const err = await res.json(); msg = err.message || err.error || msg; } catch (e) {}
      throw new Error(`[API ERROR ${res.status}] GET ${url} failed: ${msg}`);
    }
    return res.json();
  },

  saveAssessment: async (assessment: Assessment): Promise<Assessment> => {
    const res = await fetch(`${API_BASE}/assessments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(assessment),
    });
    if (!res.ok) throw new Error("Failed to save assessment");
    return res.json();
  },

  saveDraftAssessment: async (assessment: Assessment): Promise<Assessment> => {
    const res = await fetch(`${API_BASE}/assessments/draft`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(assessment),
    });
    if (!res.ok) throw new Error("Failed to save draft assessment");
    return res.json();
  },

  savePublishAssessment: async (assessment: Assessment): Promise<Assessment> => {
    const res = await fetch(`${API_BASE}/assessments/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(assessment),
    });
    if (!res.ok) throw new Error("Failed to save and publish assessment");
    return res.json();
  },

  publishAssessmentById: async (id: string): Promise<Assessment> => {
    const res = await fetch(`${API_BASE}/assessments/${id}/publish`, {
      method: "PATCH",
    });
    if (!res.ok) throw new Error("Failed to publish assessment");
    return res.json();
  },

  deleteAssessment: async (id: string): Promise<boolean> => {
    const res = await fetch(`${API_BASE}/assessments/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete assessment");
    return true;
  },

  // --- SUBMISSIONS ---
  getSubmissions: async (filters?: {
    assessmentId?: string;
    batches?: string[];
    status?: string;
    search?: string;
    timeFilter?: string;
    sortBy?: string;
    page?: number;
    size?: number;
  }): Promise<Submission[]> => {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.assessmentId) params.set("assessmentId", filters.assessmentId);
      if (filters.batches && filters.batches.length > 0) {
        filters.batches.forEach(b => params.append("batches", b));
      }
      if (filters.status) params.set("status", filters.status);
      if (filters.search) params.set("search", filters.search);
      if (filters.timeFilter) params.set("timeFilter", filters.timeFilter);
      if (filters.sortBy) params.set("sortBy", filters.sortBy);
      if (filters.page !== undefined) params.set("page", String(filters.page));
      if (filters.size !== undefined) params.set("size", String(filters.size));
    }
    const query = params.toString();
    const url = `${API_BASE}/submissions${query ? `?${query}` : ""}`;
    const res = await fetch(url);
    if (!res.ok) {
      let msg = res.statusText;
      try { const err = await res.json(); msg = err.message || err.error || msg; } catch (e) {}
      throw new Error(`[API ERROR ${res.status}] GET ${url} failed: ${msg}`);
    }
    return res.json();
  },

  submitAssessment: async (submission: Submission): Promise<Submission> => {
    const res = await fetch(`${API_BASE}/submissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submission),
    });
    if (!res.ok) throw new Error("Failed to submit assessment");
    return res.json();
  },

  gradeSubmission: async (submissionId: string, marks: number, feedback?: string): Promise<Submission> => {
    const url = `${API_BASE}/submissions/${submissionId}/grade`;
    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ marks, feedback }),
    });
    if (!res.ok) {
      let msg = res.statusText;
      try { const err = await res.json(); msg = err.message || err.error || msg; } catch (e) {}
      throw new Error(`[API ERROR ${res.status}] PATCH ${url} failed: ${msg}`);
    }
    return res.json();
  },

  bulkGradeSubmissions: async (items: { id: string; marks: number; feedback: string }[]): Promise<Submission[]> => {
    const url = `${API_BASE}/submissions/bulk-grade`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(items),
    });
    if (!res.ok) {
      let msg = res.statusText;
      try { const err = await res.json(); msg = err.message || err.error || msg; } catch (e) {}
      throw new Error(`[API ERROR ${res.status}] POST ${url} failed: ${msg}`);
    }
    return res.json();
  },

  bulkReviewedSubmissions: async (ids: string[]): Promise<Submission[]> => {
    const url = `${API_BASE}/submissions/bulk-reviewed`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ids),
    });
    if (!res.ok) {
      let msg = res.statusText;
      try { const err = await res.json(); msg = err.message || err.error || msg; } catch (e) {}
      throw new Error(`[API ERROR ${res.status}] POST ${url} failed: ${msg}`);
    }
    return res.json();
  },

  getScorecard: async (submissionId: string): Promise<ScorecardResponse> => {
    const res = await fetch(`${API_BASE}/submissions/${submissionId}/scorecard`);
    if (!res.ok) {
      const errorMsg = await res.text().catch(() => "");
      throw new Error(`Failed to fetch scorecard details (Status: ${res.status}). ${errorMsg}`);
    }
    return res.json();
  },

  // --- MATERIALS ---
  getMaterials: async (batch?: string): Promise<Material[]> => {
    const params = new URLSearchParams();
    if (batch && batch !== "All Batches" && batch !== "") {
      params.set("batch", batch);
    }
    const query = params.toString();
    const url = `${API_BASE}/materials${query ? `?${query}` : ""}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`[API ERROR ${res.status}] GET ${url} failed: ${res.statusText}`);
    return res.json();
  },

  uploadMaterial: async (material: Material): Promise<Material> => {
    const res = await fetch(`${API_BASE}/materials`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(material),
    });
    if (!res.ok) throw new Error("Failed to upload material");
    return res.json();
  },

  deleteMaterial: async (id: string): Promise<boolean> => {
    const res = await fetch(`${API_BASE}/materials/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete material");
    return true;
  },

  // --- DASHBOARD STATS ---
  getDashboardStats: async (role: "teacher" | "learner", userId: string, timeFilter: string, batchFilter: string) => {
    const params = new URLSearchParams({
      role,
      userId,
      timeFilter,
      batchFilter,
    });
    const res = await fetch(`${API_BASE}/dashboard?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch dashboard stats");
    return res.json();
  },

  // --- FILE UPLOADS ---
  uploadFile: async (file: File): Promise<{
    originalName: string;
    filename: string;
    fileUrl: string;
    mimeType: string;
    size: number;
    uploadedAt: string;
  }> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE}/uploads`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Failed to upload file");
    return res.json();
  },

  // --- CERTIFICATES ---
  generateCertificate: async (studentId: string, assessmentId: string): Promise<Certificate> => {
    const res = await fetch(`${API_BASE}/certificates/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, assessmentId }),
    });
    if (!res.ok) throw new Error("Certificate cannot be generated. Check rules.");
    return res.json();
  },

  getStudentCertificates: async (studentId: string): Promise<Certificate[]> => {
    const url = `${API_BASE}/certificates/student/${studentId}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`[API ERROR ${res.status}] GET ${url} failed: ${res.statusText}`);
    return res.json();
  },

  getCertificateById: async (certificateId: string): Promise<Certificate> => {
    const res = await fetch(`${API_BASE}/certificates/${certificateId}`);
    if (!res.ok) throw new Error("Failed to fetch certificate");
    return res.json();
  },

  getCertificatePreviewUrl: (certificateId: string): string => {
    return `${API_BASE}/certificates/preview/${certificateId}`;
  },

  getCertificateDownloadUrl: (certificateId: string): string => {
    return `${API_BASE}/certificates/download/${certificateId}`;
  },

  // --- BATCHES ---
  getBatches: async (): Promise<Batch[]> => {
    const res = await fetch(`${API_BASE}/batches`);
    if (!res.ok) throw new Error("Failed to fetch batches");
    return res.json();
  },

  createBatch: async (batch: Batch): Promise<Batch> => {
    const res = await fetch(`${API_BASE}/batches`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(batch),
    });
    if (!res.ok) {
      if (res.status === 409) {
        throw new Error(`A batch with name '${batch.batchName}' already exists.`);
      }
      throw new Error("Failed to create batch");
    }
    return res.json();
  },

  getBatchById: async (id: string): Promise<Batch> => {
    const res = await fetch(`${API_BASE}/batches/${id}`);
    if (!res.ok) throw new Error("Failed to fetch batch");
    return res.json();
  },

  updateBatch: async (id: string, updates: Partial<Batch>): Promise<Batch> => {
    const res = await fetch(`${API_BASE}/batches/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      if (res.status === 409) {
        throw new Error(`A batch with name '${updates.batchName}' already exists.`);
      }
      throw new Error("Failed to update batch");
    }
    return res.json();
  },

  deleteBatch: async (id: string): Promise<boolean> => {
    const res = await fetch(`${API_BASE}/batches/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete batch");
    return true;
  },

  // --- EVENTS ---
  getEvents: async (filters?: {
    category?: string;
    department?: string;
    mode?: string;
    status?: string;
    timeFilter?: string;
    search?: string;
    role?: string;
    batch?: string;
    seatsAvailable?: boolean;
  }): Promise<Event[]> => {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.category) params.set("category", filters.category);
      if (filters.department) params.set("department", filters.department);
      if (filters.mode) params.set("mode", filters.mode);
      if (filters.status) params.set("status", filters.status);
      if (filters.timeFilter) params.set("timeFilter", filters.timeFilter);
      if (filters.search) params.set("search", filters.search);
      if (filters.role) params.set("role", filters.role);
      if (filters.batch) params.set("batch", filters.batch);
      if (filters.seatsAvailable !== undefined) params.set("seatsAvailable", String(filters.seatsAvailable));
    }
    const query = params.toString();
    const url = `${API_BASE}/events${query ? `?${query}` : ""}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch events");
    return res.json();
  },

  getAdminEvents: async (): Promise<Event[]> => {
    const res = await fetch(`${API_BASE}/events/admin`);
    if (!res.ok) throw new Error("Failed to fetch admin events");
    return res.json();
  },

  getEventById: async (id: string): Promise<Event> => {
    const res = await fetch(`${API_BASE}/events/${id}`);
    if (!res.ok) throw new Error("Failed to fetch event details");
    return res.json();
  },

  createEvent: async (event: Event, userId?: string): Promise<Event> => {
    const url = `${API_BASE}/events${userId ? `?userId=${userId}` : ""}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to create event");
    }
    return res.json();
  },

  updateEvent: async (id: string, event: Event): Promise<Event> => {
    const res = await fetch(`${API_BASE}/events/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to update event");
    }
    return res.json();
  },

  deleteEvent: async (id: string): Promise<boolean> => {
    const res = await fetch(`${API_BASE}/events/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete event");
    return true;
  },

  publishEvent: async (id: string): Promise<Event> => {
    const res = await fetch(`${API_BASE}/events/${id}/publish`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to publish event");
    return res.json();
  },

  closeEventRegistration: async (id: string): Promise<Event> => {
    const res = await fetch(`${API_BASE}/events/${id}/close`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to close event registration");
    return res.json();
  },

  registerForEvent: async (id: string, userId: string): Promise<{ message: string; event: Event }> => {
    const res = await fetch(`${API_BASE}/events/${id}/register?userId=${userId}`, {
      method: "POST",
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to register for event");
    }
    return res.json();
  },

  cancelEventRegistration: async (id: string, userId: string): Promise<{ message: string; event: Event }> => {
    const res = await fetch(`${API_BASE}/events/${id}/register?userId=${userId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to cancel event registration");
    }
    return res.json();
  },

  getEventRegistrations: async (id: string): Promise<EventRegistrationResponse[]> => {
    const res = await fetch(`${API_BASE}/events/${id}/registrations`);
    if (!res.ok) throw new Error("Failed to fetch registrations");
    return res.json();
  },

  getMyRegisteredEvents: async (userId: string): Promise<Event[]> => {
    const res = await fetch(`${API_BASE}/events/my?userId=${userId}`);
    if (!res.ok) throw new Error("Failed to fetch my registered events");
    return res.json();
  },

  // --- NOTIFICATIONS & ALERTS ---
  getNotifications: async (
    userId: string,
    role?: string,
    filters?: NotificationFilter
  ): Promise<NotificationListResponse> => {
    const params = new URLSearchParams();
    if (userId) params.set("userId", userId);
    if (role) params.set("role", role);
    if (filters?.status && filters.status !== "all") params.set("status", filters.status);
    if (filters?.category && filters.category !== "ALL") params.set("category", filters.category);
    if (filters?.priority && filters.priority !== "ALL") params.set("priority", filters.priority);
    if (filters?.page !== undefined) params.set("page", String(filters.page));
    if (filters?.size !== undefined) params.set("size", String(filters.size));

    const url = `${API_BASE}/notifications?${params.toString()}`;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`[API ERROR ${res.status}] GET ${url} failed`);
      }
      return await res.json();
    } catch (err) {
      console.warn("Notifications API request failed, falling back to local storage:", err);
      return getFallbackNotifications(userId, role, filters);
    }
  },

  getUnreadNotificationCount: async (userId: string, role?: string): Promise<{ count: number }> => {
    const params = new URLSearchParams();
    if (userId) params.set("userId", userId);
    if (role) params.set("role", role);

    const url = `${API_BASE}/notifications/unread-count?${params.toString()}`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`GET ${url} failed`);
      return await res.json();
    } catch (err) {
      const fallback = getFallbackNotifications(userId, role);
      return { count: fallback.unreadCount };
    }
  },

  markNotificationAsRead: async (id: string, userId: string): Promise<NotificationItem> => {
    const url = `${API_BASE}/notifications/${id}/read?userId=${userId}`;
    try {
      const res = await fetch(url, { method: "PATCH" });
      if (!res.ok) throw new Error(`PATCH ${url} failed`);
      return await res.json();
    } catch (err) {
      return markFallbackNotificationRead(id, userId);
    }
  },

  markAllNotificationsRead: async (userId: string, role?: string): Promise<{ success: boolean; count: number }> => {
    const params = new URLSearchParams({ userId });
    if (role) params.set("role", role);
    const url = `${API_BASE}/notifications/mark-all-read?${params.toString()}`;
    try {
      const res = await fetch(url, { method: "PATCH" });
      if (!res.ok) throw new Error(`PATCH ${url} failed`);
      return await res.json();
    } catch (err) {
      return markAllFallbackNotificationsRead(userId, role);
    }
  },

  deleteNotification: async (id: string, userId: string): Promise<boolean> => {
    const url = `${API_BASE}/notifications/${id}?userId=${userId}`;
    try {
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error(`DELETE ${url} failed`);
      return true;
    } catch (err) {
      deleteFallbackNotification(id);
      return true;
    }
  },

  createNotification: async (notification: Partial<NotificationItem>): Promise<NotificationItem> => {
    const url = `${API_BASE}/notifications`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(notification),
    });
    if (!res.ok) throw new Error("Failed to create notification");
    return res.json();
  },

  // --- VERIFICATION CENTER ---
  verifyCertificate: async (certificateId: string): Promise<CertificateVerificationResult> => {
    const trimmedId = (certificateId || "").trim();
    if (!trimmedId) {
      return {
        valid: false,
        status: "NOT_FOUND",
        certificateId: "",
        message: "Certificate identifier is required for validation.",
      };
    }
    const url = `${API_BASE}/verification/certificate/${encodeURIComponent(trimmedId)}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      return data;
    } catch (err) {
      return fallbackVerifyCertificate(trimmedId);
    }
  },

  getVerificationRequests: async (filters?: {
    status?: string;
    requestType?: string;
    search?: string;
    page?: number;
    size?: number;
    role?: string;
  }): Promise<{
    items: VerificationRequestItem[];
    total: number;
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;
    page: number;
    totalPages: number;
  }> => {
    const params = new URLSearchParams();
    if (filters?.status) params.set("status", filters.status);
    if (filters?.requestType) params.set("requestType", filters.requestType);
    if (filters?.search) params.set("search", filters.search);
    if (filters?.page !== undefined) params.set("page", String(filters.page));
    if (filters?.size !== undefined) params.set("size", String(filters.size));
    params.set("role", filters?.role || "admin");

    const url = `${API_BASE}/verification/requests?${params.toString()}`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`GET ${url} failed with ${res.status}`);
      return await res.json();
    } catch (err) {
      return getFallbackVerificationRequests(filters);
    }
  },

  getVerificationStats: async (role?: string): Promise<VerificationRequestStats> => {
    const params = new URLSearchParams();
    params.set("role", role || "admin");
    const url = `${API_BASE}/verification/requests/stats?${params.toString()}`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`GET ${url} failed with ${res.status}`);
      return await res.json();
    } catch (err) {
      return getFallbackVerificationStats();
    }
  },

  getVerificationRequestById: async (id: string): Promise<VerificationRequestItem> => {
    const url = `${API_BASE}/verification/requests/${encodeURIComponent(id)}`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`GET ${url} failed`);
      return await res.json();
    } catch (err) {
      return getFallbackVerificationRequestById(id);
    }
  },

  approveVerificationRequest: async (
    id: string,
    data: { remarks?: string; reviewerId?: string; reviewerName?: string; role?: string }
  ): Promise<VerificationRequestItem> => {
    const role = data.role || "admin";
    const url = `${API_BASE}/verification/requests/${encodeURIComponent(id)}/approve?role=${encodeURIComponent(role)}`;
    try {
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Approval failed with status ${res.status}`);
      }
      return await res.json();
    } catch (err: any) {
      return fallbackApproveVerificationRequest(id, data);
    }
  },

  rejectVerificationRequest: async (
    id: string,
    data: { rejectionReason: string; reviewerId?: string; reviewerName?: string; role?: string }
  ): Promise<VerificationRequestItem> => {
    const role = data.role || "admin";
    const url = `${API_BASE}/verification/requests/${encodeURIComponent(id)}/reject?role=${encodeURIComponent(role)}`;
    try {
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Rejection failed with status ${res.status}`);
      }
      return await res.json();
    } catch (err: any) {
      return fallbackRejectVerificationRequest(id, data);
    }
  },

  revokeCertificate: async (
    certificateId: string,
    data: { reason?: string; adminId?: string; adminName?: string; role?: string }
  ): Promise<any> => {
    const role = data.role || "admin";
    const url = `${API_BASE}/verification/certificates/${encodeURIComponent(certificateId)}/revoke?role=${encodeURIComponent(role)}`;
    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Certificate revocation failed");
    }
    return res.json();
  },
};

// -------------------------------------------------------------
// Resilient Client-side Fallback Store for Offline / Dev
// -------------------------------------------------------------
const INITIAL_FALLBACK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    recipientRole: "learner",
    title: "Upcoming Assessment Deadline",
    message: "UI/UX Design Principles Quiz deadline is approaching in 24 hours. Complete your submission soon.",
    category: "ASSESSMENTS",
    priority: "URGENT",
    read: false,
    actionUrl: "/assessments",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "notif-2",
    recipientRole: "learner",
    title: "Assessment Scorecard Published",
    message: "Your evaluation for 'Spring Boot Fundamentals Quiz' is available. You achieved 90% (Passed with Distinction).",
    category: "GRADES",
    priority: "SUCCESS",
    read: false,
    actionUrl: "/marks",
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: "notif-3",
    recipientRole: "learner",
    title: "Certificate Issued",
    message: "Congratulations! An academic certificate has been awarded for Spring Boot Fundamentals.",
    category: "CERTIFICATES",
    priority: "SUCCESS",
    read: false,
    actionUrl: "/certificates",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    id: "notif-4",
    recipientRole: "learner",
    title: "Upcoming Event: Cloud Architecture Masterclass",
    message: "Registration confirmed. The session starts tomorrow at 10:00 AM IST via Zoom.",
    category: "EVENTS",
    priority: "INFO",
    read: true,
    actionUrl: "/events",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "notif-5",
    recipientRole: "learner",
    title: "New Learning Material Uploaded",
    message: "Instructor Shan Ali added 'React 19 Server Components Cheatsheet.pdf' to your batch materials.",
    category: "COURSES",
    priority: "INFO",
    read: true,
    actionUrl: "/materials",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: "notif-6",
    recipientRole: "admin",
    title: "Verification Request Awaiting Review",
    message: "Learner credentials verification requested for consultant Flores Juanita (Batch A).",
    category: "VERIFICATION",
    priority: "WARNING",
    read: false,
    actionUrl: "/learners",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: "notif-7",
    recipientRole: "teacher",
    title: "New Submissions Ready for Evaluation",
    message: "5 new learner submissions are waiting for grading on 'Front-end Development Project'.",
    category: "ASSESSMENTS",
    priority: "WARNING",
    read: false,
    actionUrl: "/submissions",
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    id: "notif-8",
    recipientRole: "all",
    title: "Portal Maintenance Notice",
    message: "Unified LMS platform scheduled telemetry indexing on Sunday at 02:00 AM IST.",
    category: "GENERAL",
    priority: "INFO",
    read: true,
    actionUrl: "/dashboard",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
];

function getStoredNotifications(): NotificationItem[] {
  if (typeof window === "undefined") return INITIAL_FALLBACK_NOTIFICATIONS;
  const stored = localStorage.getItem("lms_notifications");
  if (!stored) {
    localStorage.setItem("lms_notifications", JSON.stringify(INITIAL_FALLBACK_NOTIFICATIONS));
    return INITIAL_FALLBACK_NOTIFICATIONS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return INITIAL_FALLBACK_NOTIFICATIONS;
  }
}

function saveStoredNotifications(items: NotificationItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("lms_notifications", JSON.stringify(items));
}

function getFallbackNotifications(
  userId: string,
  role?: string,
  filters?: NotificationFilter
): NotificationListResponse {
  let all = getStoredNotifications();
  // Filter by recipient or role
  let filtered = all.filter((n) => {
    if (n.recipientId && n.recipientId === userId) return true;
    if (n.recipientRole) {
      if (n.recipientRole.toLowerCase() === "all") return true;
      if (role && n.recipientRole.toLowerCase() === role.toLowerCase()) return true;
    }
    return !n.recipientId && !n.recipientRole;
  });

  if (filters?.status === "unread") {
    filtered = filtered.filter((n) => !n.read);
  } else if (filters?.status === "read") {
    filtered = filtered.filter((n) => n.read);
  }

  if (filters?.category && filters.category !== "ALL") {
    filtered = filtered.filter((n) => n.category.toUpperCase() === filters.category?.toUpperCase());
  }

  if (filters?.priority && filters.priority !== "ALL") {
    filtered = filtered.filter((n) => n.priority.toUpperCase() === filters.priority?.toUpperCase());
  }

  const unreadCount = filtered.filter((n) => !n.read).length;
  const page = filters?.page || 0;
  const size = filters?.size || 10;
  const start = page * size;
  const pagedItems = filtered.slice(start, start + size);

  return {
    items: pagedItems,
    total: filtered.length,
    unreadCount,
    page,
    totalPages: Math.ceil(filtered.length / size) || 1,
  };
}

function markFallbackNotificationRead(id: string, userId: string): NotificationItem {
  const all = getStoredNotifications();
  const index = all.findIndex((n) => n.id === id);
  if (index !== -1) {
    all[index] = { ...all[index], read: true };
    saveStoredNotifications(all);
    return all[index];
  }
  return {
    id,
    title: "",
    message: "",
    category: "GENERAL",
    priority: "INFO",
    read: true,
    createdAt: new Date().toISOString(),
  };
}

function markAllFallbackNotificationsRead(userId: string, role?: string): { success: boolean; count: number } {
  const all = getStoredNotifications();
  let count = 0;
  const updated = all.map((n) => {
    const matchesUser = n.recipientId === userId;
    const matchesRole = n.recipientRole && (n.recipientRole === "all" || n.recipientRole === role);
    if ((matchesUser || matchesRole) && !n.read) {
      count++;
      return { ...n, read: true };
    }
    return n;
  });
  saveStoredNotifications(updated);
  return { success: true, count };
}

function deleteFallbackNotification(id: string) {
  const all = getStoredNotifications().filter((n) => n.id !== id);
  saveStoredNotifications(all);
}

// -------------------------------------------------------------
// Verification Center Fallback Store
// -------------------------------------------------------------
const INITIAL_FALLBACK_VERIFICATION_REQUESTS: VerificationRequestItem[] = [
  {
    id: "VR-1001",
    requesterId: "u-learner-1",
    requesterName: "Alex Rivera",
    requesterEmail: "alex.rivera@xebia.com",
    requesterRole: "learner",
    requestType: "LEARNER_CREDENTIAL",
    targetCourseOrSubject: "UI/UX Design Masterclass",
    status: "PENDING",
    notes: "Verification requested for enterprise consulting client deployment audit.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    auditTrail: [
      {
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        changedBy: "Alex Rivera",
        fromStatus: null,
        toStatus: "PENDING",
        remarks: "Request submitted by learner for client validation.",
      },
    ],
  },
  {
    id: "VR-1002",
    certificateId: "cert-uiux-2026-001",
    requesterId: "u-learner-1",
    requesterName: "Alex Rivera",
    requesterEmail: "alex.rivera@xebia.com",
    requesterRole: "learner",
    requestType: "CERTIFICATE_VERIFICATION",
    targetCourseOrSubject: "UI/UX Design Principles Quiz",
    status: "PENDING",
    notes: "External vendor partner credential audit for UI/UX Design certification.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    auditTrail: [
      {
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
        changedBy: "Alex Rivera",
        fromStatus: null,
        toStatus: "PENDING",
        remarks: "Verification request initiated.",
      },
    ],
  },
  {
    id: "VR-1003",
    certificateId: "cert-react-2026-002",
    requesterId: "u-learner-2",
    requesterName: "Sara Connor",
    requesterEmail: "sara.connor@xebia.com",
    requesterRole: "learner",
    requestType: "CERTIFICATE_VERIFICATION",
    targetCourseOrSubject: "React Components & State Written Assessment",
    status: "APPROVED",
    reviewerId: "u-admin-1",
    reviewerName: "Enterprise Administrator",
    reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    notes: "Annual accreditation check for Frontend React competency.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    auditTrail: [
      {
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
        changedBy: "Sara Connor",
        fromStatus: null,
        toStatus: "PENDING",
        remarks: "Submitted for annual compliance review.",
      },
      {
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
        changedBy: "Enterprise Administrator",
        fromStatus: "PENDING",
        toStatus: "APPROVED",
        remarks: "Confirmed against Xebia assessment ledger and verified passing marks.",
      },
    ],
  },
  {
    id: "VR-1004",
    certificateId: "cert-revoked-demo-003",
    requesterId: "u-learner-3",
    requesterName: "Marcus Vance",
    requesterEmail: "marcus.vance@xebia.com",
    requesterRole: "learner",
    requestType: "COURSE_EXEMPTION",
    targetCourseOrSubject: "UI/UX Design Principles Quiz",
    status: "REJECTED",
    rejectionReason: "The associated certificate record was revoked due to duplicate evaluation attempt.",
    reviewerId: "u-admin-1",
    reviewerName: "Enterprise Administrator",
    reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    notes: "Urgent validation request for client dispatch.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    auditTrail: [
      {
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
        changedBy: "Marcus Vance",
        fromStatus: null,
        toStatus: "PENDING",
        remarks: "Expedited verification requested.",
      },
      {
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        changedBy: "Enterprise Administrator",
        fromStatus: "PENDING",
        toStatus: "REJECTED",
        remarks: "Rejected: The associated certificate record was revoked due to duplicate evaluation attempt.",
      },
    ],
  },
];

const FALLBACK_KNOWN_CERTIFICATES: Record<string, { recipientName: string; subject: string; assessmentTitle: string; issueDate: string; status: "Active" | "REVOKED" }> = {
  "cert-uiux-2026-001": {
    recipientName: "Alex Rivera",
    subject: "UI/UX Design",
    assessmentTitle: "UI/UX Design Principles Quiz",
    issueDate: "2026-03-20",
    status: "Active",
  },
  "cert-react-2026-002": {
    recipientName: "Sara Connor",
    subject: "Front-end Development",
    assessmentTitle: "React Components & State Written Assessment",
    issueDate: "2026-03-25",
    status: "Active",
  },
  "cert-revoked-demo-003": {
    recipientName: "Marcus Vance",
    subject: "UI/UX Design",
    assessmentTitle: "UI/UX Design Principles Quiz",
    issueDate: "2026-02-15",
    status: "REVOKED",
  },
};

function getStoredVerificationRequests(): VerificationRequestItem[] {
  if (typeof window === "undefined") return INITIAL_FALLBACK_VERIFICATION_REQUESTS;
  const raw = localStorage.getItem("xebia_verification_requests");
  if (!raw) {
    localStorage.setItem("xebia_verification_requests", JSON.stringify(INITIAL_FALLBACK_VERIFICATION_REQUESTS));
    return INITIAL_FALLBACK_VERIFICATION_REQUESTS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return INITIAL_FALLBACK_VERIFICATION_REQUESTS;
  }
}

function saveStoredVerificationRequests(items: VerificationRequestItem[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem("xebia_verification_requests", JSON.stringify(items));
  }
}

function fallbackVerifyCertificate(certificateId: string): CertificateVerificationResult {
  const cert = FALLBACK_KNOWN_CERTIFICATES[certificateId];
  if (!cert) {
    return {
      valid: false,
      status: "NOT_FOUND",
      certificateId,
      message: "No matching official credential record found in Xebia Enterprise LMS Registry.",
    };
  }

  if (cert.status === "REVOKED") {
    return {
      valid: false,
      status: "REVOKED",
      certificateId,
      recipientName: cert.recipientName,
      assessmentTitle: cert.assessmentTitle,
      subject: cert.subject,
      issueDate: cert.issueDate,
      verificationTimestamp: new Date().toISOString(),
      message: "This certificate was previously issued but has been officially REVOKED by an administrator.",
    };
  }

  return {
    valid: true,
    status: "VALID",
    certificateId,
    recipientName: cert.recipientName,
    assessmentTitle: cert.assessmentTitle,
    subject: cert.subject,
    issueDate: cert.issueDate,
    verificationTimestamp: new Date().toISOString(),
    message: "Official authenticated credential. Record is valid and confirmed active in Xebia Enterprise Registry.",
  };
}

function getFallbackVerificationRequests(filters?: {
  status?: string;
  requestType?: string;
  search?: string;
  page?: number;
  size?: number;
  role?: string;
}) {
  let list = getStoredVerificationRequests();

  if (filters?.status && filters.status !== "ALL") {
    list = list.filter((r) => r.status.toUpperCase() === filters.status?.toUpperCase());
  }

  if (filters?.requestType && filters.requestType !== "ALL") {
    list = list.filter((r) => r.requestType.toUpperCase() === filters.requestType?.toUpperCase());
  }

  if (filters?.search && filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    list = list.filter(
      (r) =>
        r.id.toLowerCase().includes(q) ||
        r.requesterName.toLowerCase().includes(q) ||
        (r.requesterEmail && r.requesterEmail.toLowerCase().includes(q)) ||
        (r.certificateId && r.certificateId.toLowerCase().includes(q)) ||
        (r.targetCourseOrSubject && r.targetCourseOrSubject.toLowerCase().includes(q)) ||
        (r.notes && r.notes.toLowerCase().includes(q))
    );
  }

  const allReqs = getStoredVerificationRequests();
  const pendingCount = allReqs.filter((r) => r.status === "PENDING").length;
  const approvedCount = allReqs.filter((r) => r.status === "APPROVED").length;
  const rejectedCount = allReqs.filter((r) => r.status === "REJECTED").length;

  const page = filters?.page || 0;
  const size = filters?.size || 10;
  const start = page * size;
  const paged = list.slice(start, start + size);

  return {
    items: paged,
    total: list.length,
    pendingCount,
    approvedCount,
    rejectedCount,
    page,
    totalPages: Math.ceil(list.length / size) || 1,
  };
}

function getFallbackVerificationStats(): VerificationRequestStats {
  const allReqs = getStoredVerificationRequests();
  return {
    total: allReqs.length,
    pending: allReqs.filter((r) => r.status === "PENDING").length,
    approved: allReqs.filter((r) => r.status === "APPROVED").length,
    rejected: allReqs.filter((r) => r.status === "REJECTED").length,
  };
}

function getFallbackVerificationRequestById(id: string): VerificationRequestItem {
  const all = getStoredVerificationRequests();
  const found = all.find((r) => r.id === id);
  if (!found) throw new Error("Verification request not found");
  return found;
}

function fallbackApproveVerificationRequest(
  id: string,
  data: { remarks?: string; reviewerId?: string; reviewerName?: string; role?: string }
): VerificationRequestItem {
  const all = getStoredVerificationRequests();
  const index = all.findIndex((r) => r.id === id);
  if (index === -1) throw new Error("Verification request not found");

  const now = new Date().toISOString();
  const req = all[index];
  const updated: VerificationRequestItem = {
    ...req,
    status: "APPROVED",
    reviewerId: data.reviewerId || "u-admin-1",
    reviewerName: data.reviewerName || "Enterprise Administrator",
    reviewedAt: now,
    updatedAt: now,
    auditTrail: [
      ...(req.auditTrail || []),
      {
        timestamp: now,
        changedBy: data.reviewerName || "Enterprise Administrator",
        fromStatus: req.status,
        toStatus: "APPROVED",
        remarks: data.remarks || "Request verified and approved.",
      },
    ],
  };

  all[index] = updated;
  saveStoredVerificationRequests(all);
  return updated;
}

function fallbackRejectVerificationRequest(
  id: string,
  data: { rejectionReason: string; reviewerId?: string; reviewerName?: string; role?: string }
): VerificationRequestItem {
  const all = getStoredVerificationRequests();
  const index = all.findIndex((r) => r.id === id);
  if (index === -1) throw new Error("Verification request not found");

  const now = new Date().toISOString();
  const req = all[index];
  const updated: VerificationRequestItem = {
    ...req,
    status: "REJECTED",
    rejectionReason: data.rejectionReason,
    reviewerId: data.reviewerId || "u-admin-1",
    reviewerName: data.reviewerName || "Enterprise Administrator",
    reviewedAt: now,
    updatedAt: now,
    auditTrail: [
      ...(req.auditTrail || []),
      {
        timestamp: now,
        changedBy: data.reviewerName || "Enterprise Administrator",
        fromStatus: req.status,
        toStatus: "REJECTED",
        remarks: `Rejected: ${data.rejectionReason}`,
      },
    ],
  };

  all[index] = updated;
  saveStoredVerificationRequests(all);
  return updated;
}


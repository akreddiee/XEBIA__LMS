export type UserRole = "teacher" | "learner" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  batch?: string;
  rollNumber?: string;
}

export type QuestionType = "mcq" | "written";

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[]; // Used for MCQ
  correctAnswer?: string;
  marks: number;
  difficulty?: string;
  explanation?: string;
}

export interface Assessment {
  id: string;
  title: string;
  subject: string;
  batch: string;
  batches?: string[];
  instructions: string;
  questionType: QuestionType;
  questions: Question[];
  totalMarks: number;
  deadline: string; // ISO String or YYYY-MM-DDTHH:MM
  status: "draft" | "published";
  createdAt: string;
  fileUrl?: string; // Optional if teacher uploaded an existing file
  fileName?: string;
  fileSize?: string;
  file?: {
    originalName: string;
    filename: string;
    fileUrl: string;
    mimeType: string;
    size: number;
    uploadedAt: string;
  };
}

export interface Submission {
  id: string;
  assessmentId: string;
  assessmentTitle: string;
  subject: string;
  batch: string;
  learnerId: string;
  learnerName: string;
  rollNumber?: string;
  deadline?: string;
  answers: { [questionId: string]: string }; // Map of questionId to answer text/option
  status: "submitted" | "marked" | "pending" | "missing" | "late" | "Auto Graded";
  marksObtained?: number;
  percentage?: number;
  totalMarks: number;
  feedback?: string;
  submittedAt: string;
  submittedFileUrl?: string; // If student submitted a file instead
  submittedFileName?: string;
}

export interface Certificate {
  id: string;
  studentId: string;
  studentName: string;
  assessmentId: string;
  assessmentTitle: string;
  subject: string;
  percentage: number;
  marksObtained: number;
  totalMarks: number;
  issueDate: string;
  downloadCount: number;
  certificateUrl?: string;
  status: string;
}

export interface Material {
  id: string;
  title: string;
  subject: string;
  batch: string;
  fileName: string;
  fileSize: string;
  fileUrl: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface ClassInfo {
  id: string;
  name: string;
  batch: string;
  subject: string;
  time: string;
  teacherName: string;
  room?: string;
}

export interface Batch {
  id?: string;
  batchName: string;
  course: string;
  subject: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ScorecardAnswer {
  questionId: string;
  questionText: string;
  options: string[];
  studentAnswer?: string;
  correctAnswer?: string;
  isCorrect: boolean;
  marksAwarded: number;
  questionMarks: number;
  explanation?: string;
}

export interface ScorecardResponse {
  submissionId: string;
  assessmentId: string;
  assessmentTitle: string;
  subject: string;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  marksObtained?: number;
  totalMarks: number;
  percentage: number;
  status: "PASSED" | "FAILED";
  feedback?: string;
  submittedAt?: string;
  submittedFileName?: string;
  submittedFileUrl?: string;
  answers: ScorecardAnswer[];
}

export interface Event {
  id?: string;
  title: string;
  description: string;
  bannerImage: string;
  category: string;
  department: string;
  organizer: string;
  venue: string;
  location: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  maximumCapacity: number;
  currentRegistrations?: number;
  eligibility: string;
  batchRestrictions: string[];
  courseRestrictions?: string[];
  mode: "ONLINE" | "OFFLINE" | "HYBRID";
  meetingLink?: string;
  status: "DRAFT" | "PUBLISHED" | "CLOSED" | "CANCELLED";
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EventRegistrationResponse {
  id: string;
  eventId: string;
  learnerId: string;
  learnerName: string;
  learnerEmail: string;
  learnerBatch: string;
  learnerRollNumber?: string;
  registrationTime: string;
  status: string;
}

export type NotificationCategory =
  | "GENERAL"
  | "ASSESSMENTS"
  | "COURSES"
  | "EVENTS"
  | "GRADES"
  | "CERTIFICATES"
  | "VERIFICATION";

export type NotificationPriority = "URGENT" | "WARNING" | "INFO" | "SUCCESS";

export interface NotificationItem {
  id: string;
  recipientId?: string;
  recipientRole?: string;
  title: string;
  message: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface NotificationFilter {
  status?: "all" | "unread" | "read";
  category?: string;
  priority?: string;
  page?: number;
  size?: number;
}

export interface NotificationListResponse {
  items: NotificationItem[];
  total: number;
  unreadCount: number;
  page: number;
  totalPages: number;
}

export type VerificationStatus = "PENDING" | "APPROVED" | "REJECTED";

export type VerificationRequestType =
  | "CERTIFICATE_VERIFICATION"
  | "LEARNER_CREDENTIAL"
  | "COURSE_EXEMPTION"
  | "IDENTITY_VERIFICATION";

export interface VerificationStatusHistory {
  timestamp: string;
  changedBy: string;
  fromStatus?: string | null;
  toStatus: string;
  remarks?: string;
}

export interface VerificationRequestItem {
  id: string;
  requesterId?: string;
  requesterName: string;
  requesterEmail?: string;
  requesterRole?: string;
  requestType: VerificationRequestType;
  certificateId?: string;
  targetCourseOrSubject?: string;
  documentUrl?: string;
  notes?: string;
  status: VerificationStatus;
  reviewerId?: string;
  reviewerName?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt?: string;
  auditTrail: VerificationStatusHistory[];
}

export interface VerificationRequestStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface CertificateVerificationResult {
  valid: boolean;
  status: "VALID" | "REVOKED" | "NOT_FOUND" | "ERROR";
  certificateId: string;
  recipientName?: string;
  assessmentTitle?: string;
  subject?: string;
  issueDate?: string;
  verificationTimestamp?: string;
  message: string;
}


"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Eye,
  Check,
  X,
  History,
  User,
  Award,
  Calendar,
  Layers,
  ArrowUpRight,
  AlertCircle
} from "lucide-react";
import { apiService } from "@/lib/apiService";
import {
  VerificationRequestItem,
  VerificationRequestStats,
  VerificationStatus,
  VerificationRequestType
} from "@/types";

export default function AdminVerificationDashboard() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  // Role authorization
  const sessionUser = session?.user as any;
  const storedUser = typeof window !== "undefined" ? apiService.getCurrentUser() : null;
  const currentRole = sessionUser?.role || storedUser?.role || "learner";
  const isAdmin = currentRole === "admin";

  // Data states
  const [stats, setStats] = useState<VerificationRequestStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [requests, setRequests] = useState<VerificationRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters & Pagination
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Review Modal state
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequestItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [reviewRemarks, setReviewRemarks] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionError, setRejectionError] = useState("");
  const [actionSuccessMessage, setActionSuccessMessage] = useState("");

  // Load stats and list
  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [statsData, listData] = await Promise.all([
        apiService.getVerificationStats("admin"),
        apiService.getVerificationRequests({
          status: statusFilter,
          requestType: typeFilter,
          search: searchQuery,
          page: currentPage,
          size: 10,
          role: "admin",
        }),
      ]);

      setStats(statsData);
      setRequests(listData.items || []);
      setTotalPages(listData.totalPages || 1);
      setTotalCount(listData.total || 0);
    } catch (err) {
      console.error("Failed to load verification data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, typeFilter, searchQuery, currentPage]);

  useEffect(() => {
    if (authStatus === "authenticated") {
      loadData();
    }
  }, [authStatus, loadData]);

  // Handle Approve
  const handleApprove = async () => {
    if (!selectedRequest) return;
    setActionLoading(true);
    setActionSuccessMessage("");

    try {
      const updated = await apiService.approveVerificationRequest(selectedRequest.id, {
        remarks: reviewRemarks.trim() || "Verified and approved by Enterprise Administrator.",
        reviewerId: sessionUser?.id || storedUser?.id || "u-admin",
        reviewerName: sessionUser?.name || storedUser?.name || "Enterprise Administrator",
        role: "admin",
      });

      setSelectedRequest(updated);
      setActionSuccessMessage("Verification request successfully approved and notified to the learner.");
      await loadData(true);
      setTimeout(() => {
        setModalOpen(false);
        setActionSuccessMessage("");
      }, 1500);
    } catch (err: any) {
      alert(err.message || "Approval failed.");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Reject
  const handleReject = async () => {
    if (!selectedRequest) return;
    if (!rejectionReason.trim()) {
      setRejectionError("A rejection reason is mandatory.");
      return;
    }
    setRejectionError("");
    setActionLoading(true);
    setActionSuccessMessage("");

    try {
      const updated = await apiService.rejectVerificationRequest(selectedRequest.id, {
        rejectionReason: rejectionReason.trim(),
        reviewerId: sessionUser?.id || storedUser?.id || "u-admin",
        reviewerName: sessionUser?.name || storedUser?.name || "Enterprise Administrator",
        role: "admin",
      });

      setSelectedRequest(updated);
      setActionSuccessMessage("Verification request rejected and reason communicated to requester.");
      await loadData(true);
      setTimeout(() => {
        setModalOpen(false);
        setActionSuccessMessage("");
      }, 1500);
    } catch (err: any) {
      alert(err.message || "Rejection failed.");
    } finally {
      setActionLoading(false);
    }
  };

  // Unauthorized view
  if (authStatus === "authenticated" && !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white border border-rose-200 rounded-3xl p-8 max-w-md w-full text-center shadow-lg space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            The Verification Center Dashboard requires Enterprise Administrator privileges. Your current role is <strong>{currentRole}</strong>.
          </p>
          <button
            onClick={() => router.push("/verification")}
            className="w-full py-2.5 bg-[#84117C] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer hover:bg-[#6c0e66] transition-all"
          >
            Go to Public Certificate Verification
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#84117C] text-white flex items-center justify-center shadow-sm">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Verification Center</h1>
              <p className="text-xs text-slate-500 font-medium">Review and audit credential validation requests across the enterprise.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => router.push("/verification")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs border border-slate-200 transition-all cursor-pointer shadow-2xs"
          >
            <ExternalLink size={14} />
            Public Verification Portal
          </button>

          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Requests */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Requests</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.total}</p>
            <span className="text-[10px] text-slate-400 font-medium">Audit records logged</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-purple-50 text-[#84117C] flex items-center justify-center font-bold">
            <Layers size={22} />
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white border border-amber-200/80 rounded-2xl p-5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Pending Review</span>
            <p className="text-2xl font-black text-amber-700 mt-1">{stats.pending}</p>
            <span className="text-[10px] text-amber-500 font-medium">Action required</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock size={22} />
          </div>
        </div>

        {/* Approved */}
        <div className="bg-white border border-emerald-200/80 rounded-2xl p-5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Approved</span>
            <p className="text-2xl font-black text-emerald-700 mt-1">{stats.approved}</p>
            <span className="text-[10px] text-emerald-500 font-medium">Validated credentials</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 size={22} />
          </div>
        </div>

        {/* Rejected */}
        <div className="bg-white border border-rose-200/80 rounded-2xl p-5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">Rejected</span>
            <p className="text-2xl font-black text-rose-700 mt-1">{stats.rejected}</p>
            <span className="text-[10px] text-rose-500 font-medium">Declined or revoked</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <XCircle size={22} />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Request ID (VR-...), Requester Name, Certificate ID..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#84117C]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(0);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Only</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(0);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">All Request Types</option>
            <option value="CERTIFICATE_VERIFICATION">Certificate Verification</option>
            <option value="LEARNER_CREDENTIAL">Learner Credential</option>
            <option value="COURSE_EXEMPTION">Course Exemption</option>
            <option value="IDENTITY_VERIFICATION">Identity Verification</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw size={28} className="animate-spin text-[#84117C] mx-auto" />
            <p className="text-xs font-bold text-slate-500">Loading verification records...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <ShieldCheck size={28} />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No verification requests found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No records match your selected status, category filter, or search keyword.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-400 uppercase font-black tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Request ID</th>
                  <th className="py-3.5 px-4">Requester</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Subject / Certificate</th>
                  <th className="py-3.5 px-4">Submitted</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {req.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{req.requesterName}</div>
                      <div className="text-[11px] text-slate-400">{req.requesterEmail || req.requesterRole}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        {req.requestType ? req.requestType.replace(/_/g, " ") : "CREDENTIAL"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-700 truncate max-w-[200px]">
                        {req.targetCourseOrSubject || "General Credential"}
                      </div>
                      {req.certificateId && (
                        <div className="font-mono text-[10px] text-[#84117C]">
                          {req.certificateId}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : "-"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          req.status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : req.status === "REJECTED"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {req.status === "APPROVED" && <Check size={11} />}
                        {req.status === "REJECTED" && <X size={11} />}
                        {req.status === "PENDING" && <Clock size={11} />}
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedRequest(req);
                          setReviewRemarks("");
                          setRejectionReason("");
                          setRejectionError("");
                          setActionSuccessMessage("");
                          setModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-[#84117C] text-slate-700 hover:text-white font-bold rounded-lg text-xs transition-all cursor-pointer"
                      >
                        <Eye size={13} />
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalCount > 10 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {requests.length} of {totalCount} requests
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 0}
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <span className="font-semibold">
                Page {currentPage + 1} of {totalPages}
              </span>
              <button
                disabled={currentPage + 1 >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {modalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#84117C] flex items-center justify-center font-bold">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-slate-900">{selectedRequest.id}</span>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                        selectedRequest.status === "APPROVED"
                          ? "bg-emerald-100 text-emerald-800"
                          : selectedRequest.status === "REJECTED"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {selectedRequest.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Submitted on {selectedRequest.createdAt ? new Date(selectedRequest.createdAt).toLocaleString() : "-"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Success feedback inside modal */}
            {actionSuccessMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 size={16} />
                {actionSuccessMessage}
              </div>
            )}

            {/* Request Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">Requester</span>
                <p className="font-bold text-slate-900 text-sm">{selectedRequest.requesterName}</p>
                <p className="text-slate-500">{selectedRequest.requesterEmail || "N/A"}</p>
                <span className="inline-block mt-1 text-[10px] uppercase font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                  Role: {selectedRequest.requesterRole || "learner"}
                </span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">Request Type</span>
                <p className="font-bold text-slate-900 text-sm">
                  {selectedRequest.requestType ? selectedRequest.requestType.replace(/_/g, " ") : "CREDENTIAL"}
                </p>
                <p className="text-slate-500">{selectedRequest.targetCourseOrSubject || "Program Verification"}</p>
              </div>

              {selectedRequest.certificateId && (
                <div className="sm:col-span-2 bg-purple-50/70 p-3.5 rounded-xl border border-purple-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-purple-700">Associated Certificate</span>
                    <p className="font-mono font-bold text-slate-900 text-sm">{selectedRequest.certificateId}</p>
                  </div>
                  <button
                    onClick={() => window.open(`/verification?certId=${encodeURIComponent(selectedRequest.certificateId!)}`, "_blank")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#84117C] hover:bg-[#6c0e66] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                  >
                    <ExternalLink size={13} />
                    Test Public Verify
                  </button>
                </div>
              )}
            </div>

            {/* Notes / Submission Justification */}
            {selectedRequest.notes && (
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1 text-xs">
                <span className="text-[10px] font-bold uppercase text-slate-400">Requester Notes / Justification</span>
                <p className="text-slate-700 leading-relaxed font-medium">{selectedRequest.notes}</p>
              </div>
            )}

            {/* Rejection reason (if rejected) */}
            {selectedRequest.rejectionReason && (
              <div className="bg-rose-50 p-3.5 rounded-xl border border-rose-200 space-y-1 text-xs">
                <span className="text-[10px] font-bold uppercase text-rose-600">Rejection Reason Provided</span>
                <p className="text-rose-800 font-medium">{selectedRequest.rejectionReason}</p>
              </div>
            )}

            {/* Reviewer Stamp (if already decided) */}
            {selectedRequest.reviewedAt && (
              <div className="flex items-center justify-between bg-slate-100 p-3 rounded-xl text-xs text-slate-600 font-medium">
                <span>
                  Reviewed by: <strong>{selectedRequest.reviewerName || selectedRequest.reviewerId}</strong>
                </span>
                <span>{new Date(selectedRequest.reviewedAt).toLocaleString()}</span>
              </div>
            )}

            {/* Audit Trail / History */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                <History size={14} />
                Audit Trail & History
              </div>
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 divide-y divide-slate-200/60 text-xs">
                {selectedRequest.auditTrail && selectedRequest.auditTrail.length > 0 ? (
                  selectedRequest.auditTrail.map((item, idx) => (
                    <div key={idx} className="py-2.5 first:pt-1 last:pb-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{item.changedBy}</span>
                        <span className="text-[10px] text-slate-400">
                          {item.timestamp ? new Date(item.timestamp).toLocaleString() : "-"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold text-slate-500">Transition:</span>
                        <span className="font-mono text-[10px] bg-slate-200/80 px-1.5 py-0.5 rounded text-slate-700">
                          {item.fromStatus || "NEW"} → {item.toStatus}
                        </span>
                      </div>
                      {item.remarks && <p className="text-[11px] text-slate-600 italic">"{item.remarks}"</p>}
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-slate-400 py-2">No audit records recorded.</p>
                )}
              </div>
            </div>

            {/* Action Section (Only if PENDING) */}
            {selectedRequest.status === "PENDING" && (
              <div className="pt-4 border-t border-slate-200 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Administrative Decision</h4>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-600 block">
                    Review Remarks (Optional for Approval)
                  </label>
                  <input
                    type="text"
                    value={reviewRemarks}
                    onChange={(e) => setReviewRemarks(e.target.value)}
                    placeholder="e.g. Verified against assessment completion records."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#84117C]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 block">
                    Rejection Reason (Required if Rejecting)
                  </label>
                  <textarea
                    rows={2}
                    value={rejectionReason}
                    onChange={(e) => {
                      setRejectionReason(e.target.value);
                      if (rejectionError) setRejectionError("");
                    }}
                    placeholder="State reason for rejecting this verification request..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                  />
                  {rejectionError && (
                    <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {rejectionError}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={handleReject}
                    className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <X size={14} />
                    Reject Request
                  </button>

                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={handleApprove}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Check size={14} />
                    Approve Request
                  </button>
                </div>
              </div>
            )}

            {/* Close Button when not Pending */}
            {selectedRequest.status !== "PENDING" && (
              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Close Review
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

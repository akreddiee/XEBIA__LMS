"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Award,
  Calendar,
  BookOpen,
  User,
  QrCode,
  ArrowRight,
  Printer,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ShieldAlert
} from "lucide-react";
import { apiService } from "@/lib/apiService";
import { CertificateVerificationResult } from "@/types";

function VerificationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const sessionUser = session?.user as any;
  const storedUser = apiService.getCurrentUser();
  const isAdmin = sessionUser?.role === "admin" || storedUser?.role === "admin";

  const initialCertId = searchParams.get("certId") || searchParams.get("id") || "";

  const [inputCertId, setInputCertId] = useState(initialCertId);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CertificateVerificationResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  // Auto-verify if certId query parameter exists
  useEffect(() => {
    if (initialCertId && initialCertId.trim()) {
      setInputCertId(initialCertId.trim());
      handleVerify(initialCertId.trim());
    }
  }, [initialCertId]);

  const handleVerify = async (idToVerify?: string) => {
    const targetId = (idToVerify !== undefined ? idToVerify : inputCertId).trim();
    if (!targetId) return;

    setLoading(true);
    setHasSearched(true);
    setResult(null);

    try {
      const res = await apiService.verifyCertificate(targetId);
      setResult(res);
    } catch (err: any) {
      setResult({
        valid: false,
        status: "ERROR",
        certificateId: targetId,
        message: err.message || "A technical error prevented certificate verification. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined" && result?.certificateId) {
      const shareUrl = `${window.location.origin}/verification?certId=${encodeURIComponent(result.certificateId)}`;
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const quickExamples = [
    { label: "Valid: UI/UX Masterclass", id: "cert-uiux-2026-001", type: "valid" },
    { label: "Valid: React Components", id: "cert-react-2026-002", type: "valid" },
    { label: "Revoked Demo", id: "cert-revoked-demo-003", type: "revoked" },
  ];

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Admin Quick Switch Banner */}
        {isAdmin && (
          <div className="bg-gradient-to-r from-[#84117C]/10 via-[#84117C]/5 to-transparent border border-[#84117C]/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#84117C] text-white flex items-center justify-center font-bold shadow-xs">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Logged in as Enterprise Administrator</p>
                <p className="text-[11px] text-muted-foreground">Manage pending student requests, review credential audits, or revoke certificates.</p>
              </div>
            </div>
            <button
              onClick={() => router.push("/admin/verification")}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#84117C] hover:bg-[#6c0e66] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer whitespace-nowrap"
            >
              Open Admin Dashboard
              <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* Header Hero Section */}
        <div className="text-center space-y-3 pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-xs font-bold tracking-wide shadow-xs">
            <ShieldCheck size={14} className="text-emerald-600" />
            Official Xebia Credential Registry
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Certificate & Credential Verification
          </h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Instantly validate official certificates issued across the Unified Xebia Enterprise LMS. 
            All queries are verified against the authoritative ledger with full privacy protection.
          </p>
        </div>

        {/* Verification Input Card */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm backdrop-blur-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerify();
            }}
            className="space-y-4"
          >
            <label htmlFor="certificateIdInput" className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Enter Unique Certificate ID
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Search size={18} />
                </div>
                <input
                  id="certificateIdInput"
                  type="text"
                  value={inputCertId}
                  onChange={(e) => setInputCertId(e.target.value)}
                  placeholder="e.g. cert-uiux-2026-001 or UUID"
                  className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#84117C]/30 focus:border-[#84117C] transition-all"
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setQrModalOpen(true)}
                  title="Scan Certificate QR"
                  className="px-4 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs border border-slate-200"
                >
                  <QrCode size={18} />
                  <span className="hidden sm:inline">Scan QR</span>
                </button>

                <button
                  type="submit"
                  disabled={loading || !inputCertId.trim()}
                  className="px-6 py-3.5 bg-[#84117C] hover:bg-[#6c0e66] disabled:opacity-50 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs min-w-[120px]"
                >
                  {loading ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={16} />
                      Verify Now
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Demo Chips */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-400">Try demo ID:</span>
              {quickExamples.map((ex) => (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => {
                    setInputCertId(ex.id);
                    handleVerify(ex.id);
                  }}
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    ex.type === "valid"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100"
                      : "bg-rose-50 text-rose-700 border-rose-200/80 hover:bg-rose-100"
                  }`}
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </form>
        </div>

        {/* Result Display Section */}
        {loading && (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 shadow-sm animate-pulse">
            <div className="w-14 h-14 rounded-full bg-purple-50 text-[#84117C] flex items-center justify-center mx-auto">
              <RefreshCw size={28} className="animate-spin" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Querying Ledger Registry...</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Verifying cryptographic record signatures and authorization status in the enterprise registry.
            </p>
          </div>
        )}

        {!loading && hasSearched && result && (
          <div className="space-y-6">
            {/* Status Outcome Banner */}
            {result.status === "VALID" && (
              <div className="bg-emerald-50/90 border border-emerald-300 rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-emerald-200">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm shrink-0">
                      <CheckCircle2 size={26} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-black tracking-widest text-emerald-800 bg-emerald-200/80 px-2.5 py-0.5 rounded-full">
                          Authentic & Active
                        </span>
                        <span className="text-xs text-emerald-700 font-medium">Verified by LMS Ledger</span>
                      </div>
                      <h2 className="text-xl font-black text-emerald-950 mt-1">Certificate is Valid</h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={handleCopyLink}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-emerald-100/60 text-emerald-900 text-xs font-bold rounded-xl border border-emerald-300 transition-all cursor-pointer shadow-2xs"
                    >
                      {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      {copied ? "Link Copied" : "Share Proof"}
                    </button>
                    <button
                      onClick={handlePrint}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
                    >
                      <Printer size={14} />
                      Print Statement
                    </button>
                  </div>
                </div>

                {/* Privacy-Preserving Credential Attributes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
                  <div className="bg-white/80 border border-emerald-200/80 rounded-2xl p-4">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                      <User size={14} />
                      <span className="text-[11px] font-bold uppercase tracking-wider">Certificate Holder</span>
                    </div>
                    <p className="text-base font-extrabold text-slate-900">{result.recipientName || "Authorized Learner"}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Identity verified on record</p>
                  </div>

                  <div className="bg-white/80 border border-emerald-200/80 rounded-2xl p-4">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                      <BookOpen size={14} />
                      <span className="text-[11px] font-bold uppercase tracking-wider">Course / Curriculum</span>
                    </div>
                    <p className="text-base font-extrabold text-slate-900">{result.assessmentTitle || result.subject || "Enterprise Training Program"}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{result.subject || "Xebia Academy"}</p>
                  </div>

                  <div className="bg-white/80 border border-emerald-200/80 rounded-2xl p-4">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                      <Calendar size={14} />
                      <span className="text-[11px] font-bold uppercase tracking-wider">Date of Issuance</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900">{result.issueDate || "Official Ledger Record"}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Authoritative issue stamp</p>
                  </div>

                  <div className="bg-white/80 border border-emerald-200/80 rounded-2xl p-4">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                      <Award size={14} />
                      <span className="text-[11px] font-bold uppercase tracking-wider">Certificate Identifier</span>
                    </div>
                    <p className="text-xs font-mono font-bold text-slate-900 break-all select-all">{result.certificateId}</p>
                    <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Non-guessable tamper-resistant ID</p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-emerald-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-emerald-800 gap-2">
                  <span className="flex items-center gap-1.5 font-medium">
                    <ShieldCheck size={14} className="text-emerald-700" />
                    Authoritative verification generated on {result.verificationTimestamp ? new Date(result.verificationTimestamp).toLocaleString() : new Date().toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400">Strict privacy applied: Grades & internal IDs redacted</span>
                </div>
              </div>
            )}

            {result.status === "REVOKED" && (
              <div className="bg-rose-50/90 border border-rose-300 rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-sm shrink-0">
                    <ShieldAlert size={26} />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-black tracking-widest text-rose-800 bg-rose-200 px-2.5 py-0.5 rounded-full">
                      Revoked Credential
                    </span>
                    <h2 className="text-xl font-black text-rose-950">This Certificate Has Been Revoked</h2>
                    <p className="text-xs text-rose-700 leading-relaxed pt-1">
                      {result.message || "This certificate was previously issued but has been officially revoked by an Enterprise Administrator. It is no longer valid for qualification or credit."}
                    </p>
                  </div>
                </div>

                <div className="mt-6 bg-white/90 border border-rose-200 rounded-2xl p-5 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Reported Certificate ID</span>
                      <span className="font-mono font-bold text-slate-900">{result.certificateId}</span>
                    </div>
                    {result.recipientName && (
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Named Subject</span>
                        <span className="font-bold text-slate-900">{result.recipientName}</span>
                      </div>
                    )}
                    {result.assessmentTitle && (
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Course / Assessment</span>
                        <span className="font-bold text-slate-900">{result.assessmentTitle}</span>
                      </div>
                    )}
                    {result.issueDate && (
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Originally Issued</span>
                        <span className="font-bold text-slate-900">{result.issueDate}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 text-[11px] text-rose-600 font-semibold flex items-center gap-1.5">
                  <AlertTriangle size={14} />
                  If you believe this status is in error, contact your enterprise program manager or LMS administrator.
                </div>
              </div>
            )}

            {result.status === "NOT_FOUND" && (
              <div className="bg-amber-50/90 border border-amber-300 rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-sm shrink-0">
                    <HelpCircle size={26} />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-black tracking-widest text-amber-800 bg-amber-200 px-2.5 py-0.5 rounded-full">
                      Not Found / Invalid Record
                    </span>
                    <h2 className="text-xl font-black text-amber-950">No Matching Certificate Found</h2>
                    <p className="text-xs text-amber-800 leading-relaxed pt-1">
                      We could not find any active or historical certificate record matching ID <code className="font-mono font-bold bg-amber-100 px-1 py-0.5 rounded text-amber-900">{result.certificateId}</code>.
                    </p>
                  </div>
                </div>

                <div className="mt-6 bg-white/80 border border-amber-200 rounded-2xl p-4 text-xs text-slate-600 space-y-2">
                  <p className="font-bold text-slate-800">What could have caused this?</p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600 text-[11px]">
                    <li>Typographical error when copying the Certificate ID.</li>
                    <li>The certificate was issued on a different external tenant or staging environment.</li>
                    <li>The evaluation is still under administrative grading and has not produced an issued certificate.</li>
                  </ul>
                </div>
              </div>
            )}

            {result.status === "ERROR" && (
              <div className="bg-slate-100 border border-slate-300 rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-600 text-white flex items-center justify-center shadow-sm shrink-0">
                    <XCircle size={26} />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-700 bg-slate-200 px-2.5 py-0.5 rounded-full">
                      Service Interruption
                    </span>
                    <h2 className="text-xl font-black text-slate-900">Verification Could Not Be Completed</h2>
                    <p className="text-xs text-slate-600 leading-relaxed pt-1">
                      {result.message || "A technical error prevented the verification service from reaching the verification database."}
                    </p>
                  </div>
                </div>
                <div className="mt-5">
                  <button
                    onClick={() => handleVerify()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                  >
                    <RefreshCw size={14} />
                    Retry Verification
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Informational Guidance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <ShieldCheck size={18} />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Authoritative Ledger</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Every certificate contains an immutable unique hash recorded in Xebia LMS to prevent forgery or tampering.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#84117C] flex items-center justify-center font-bold">
              <User size={18} />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Privacy Safeguards</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              In compliance with privacy standards, private test marks, emails, and internal user IDs are strictly withheld from public view.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <QrCode size={18} />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Instant QR Compatibility</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Printed or digital certificates feature a direct verification link for hiring managers and enterprise partners.
            </p>
          </div>
        </div>

      </div>

      {/* QR Scanner Simulation / Input Modal */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-800">
                <QrCode size={20} className="text-[#84117C]" />
                <h3 className="font-bold text-sm">Certificate QR Reader</h3>
              </div>
              <button
                onClick={() => setQrModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-900 rounded-2xl p-8 text-center text-white space-y-3 relative overflow-hidden">
              <div className="w-32 h-32 mx-auto border-2 border-dashed border-[#84117C] rounded-xl flex items-center justify-center bg-black/40 relative">
                <div className="absolute inset-x-2 top-0 h-0.5 bg-[#84117C] animate-bounce" />
                <QrCode size={56} className="text-slate-500 opacity-60" />
              </div>
              <p className="text-xs font-semibold text-slate-200">Optical Scanner Ready</p>
              <p className="text-[11px] text-slate-400">
                Center the QR code printed on the bottom corner of your physical or digital PDF certificate.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Or Paste Extracted QR Payload / URL
              </label>
              <input
                type="text"
                placeholder="https://.../verification?certId=cert-uiux-2026-001"
                onChange={(e) => {
                  const val = e.target.value.trim();
                  if (val.includes("certId=")) {
                    const match = val.match(/certId=([^&]+)/);
                    if (match && match[1]) {
                      setInputCertId(decodeURIComponent(match[1]));
                    }
                  } else if (val) {
                    setInputCertId(val);
                  }
                }}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#84117C]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setQrModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setQrModalOpen(false);
                  handleVerify();
                }}
                className="px-4 py-2 bg-[#84117C] hover:bg-[#6c0e66] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Process Scanned Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerificationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="flex items-center gap-3 text-slate-500 text-sm font-semibold">
            <RefreshCw size={20} className="animate-spin text-[#84117C]" />
            Loading Verification Portal...
          </div>
        </div>
      }
    >
      <VerificationContent />
    </Suspense>
  );
}

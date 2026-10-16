"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Card, { CardBody, CardHeader } from "../../components/common/Card";
import Button from "../../components/common/Button";
import MetricCard from "../../components/common/MetricCard";
import StatusBadge from "../../components/common/StatusBadge";
import { useGetCourses } from "../../hooks/useCourses";
import { useGetCategories } from "../../hooks/useCategories";
import { useGetLearnerCredentials } from "../../hooks/useLearnerCredentials";
import { apiService } from "../../lib/apiService";
import useToast from "../../hooks/useToast";
import {
  Tag,
  BookOpen,
  FolderKanban,
  Sliders,
  Users,
  Award,
  ArrowRight,
  TrendingUp,
  FileCode2,
  UserPlus,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  ShieldAlert
} from "lucide-react";

export default function AdminDashboardPage() {
  const toast = useToast();
  const { data: categories } = useGetCategories();
  const { data: courses } = useGetCourses();
  const { data: learnerCredentials } = useGetLearnerCredentials();

  const [counts, setCounts] = useState({
    categories: 3,
    courses: 3,
    modules: 5,
    contents: 12,
    learners: 1,
    pendingApprovals: 3,
    completions: 1450,
  });
  const [verificationStats, setVerificationStats] = useState({ total: 4, pending: 2 });

  const [pendingApprovalsList, setPendingApprovalsList] = useState([
    { id: "appr-1", title: "Kubernetes Pod Deployment Tutorial Video", course: "Kubernetes in Production", author: "DevOps Architect", type: "video" },
    { id: "appr-2", title: "Next.js 15 Client vs Server Components Code snippet", course: "Next.js Production Architecture", author: "Frontend Lead", type: "code" },
    { id: "appr-3", title: "Spring DI and IOC Container quiz blocks", course: "Enterprise Backend Architecture", author: "Systems Architect", type: "quiz" },
  ]);

  const [recentAuditLogs, setRecentAuditLogs] = useState([
    { id: 1, action: "CREATE_COURSE", details: "Course 'Kubernetes in Production' created successfully.", user: "admin@xebia.com", time: "10 mins ago" },
    { id: 2, action: "PUBLISH_CONTENT", details: "Approved lesson 'Server vs. Client Components' content blocks.", user: "admin@xebia.com", time: "1 hour ago" },
    { id: 3, action: "CREATE_IAM_USER", details: "Learner credentials generated for 'learner@xebia.com'.", user: "admin@xebia.com", time: "1 day ago" },
    { id: 4, action: "UPDATE_CATEGORY", details: "Silo details updated for 'Cloud Engineering & DevOps'.", user: "admin@xebia.com", time: "2 days ago" },
  ]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const cats = JSON.parse(localStorage.getItem("lms_categories") || "[]");
      const crs = JSON.parse(localStorage.getItem("lms_courses") || "[]");
      const mods = JSON.parse(localStorage.getItem("lms_modules") || "[]");
      const conts = JSON.parse(localStorage.getItem("lms_contents") || "[]");
      const lrns = JSON.parse(localStorage.getItem("lms_learner_credentials") || "[]");
      
      setCounts({
        categories: cats.length || 3,
        courses: crs.length || 3,
        modules: mods.length || 5,
        contents: conts.length || 10,
        learners: lrns.length || 1,
        pendingApprovals: pendingApprovalsList.length,
        completions: 1450,
      });

      apiService.getVerificationStats("admin")
        .then((s) => setVerificationStats(s))
        .catch(() => {});
    }
  }, [categories, courses, learnerCredentials, pendingApprovalsList]);

  const handleApprove = (id, title) => {
    setPendingApprovalsList(prev => prev.filter(item => item.id !== id));
    setRecentAuditLogs(prev => [
      {
        id: Date.now(),
        action: "APPROVE_CONTENT",
        details: `Approved content block: "${title}"`,
        user: "admin@xebia.com",
        time: "Just now"
      },
      ...prev
    ]);
    toast.addToast(`Content block "${title}" has been approved and published!`, "success");
  };

  const handleReject = (id, title) => {
    setPendingApprovalsList(prev => prev.filter(item => item.id !== id));
    setRecentAuditLogs(prev => [
      {
        id: Date.now(),
        action: "REJECT_CONTENT",
        details: `Rejected content block: "${title}"`,
        user: "admin@xebia.com",
        time: "Just now"
      },
      ...prev
    ]);
    toast.addToast(`Content block "${title}" was returned to draft mode.`, "error");
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-primary">Admin Control Center</h1>
        <p className="text-sm text-text-muted">
          Manage capability taxonomies, course outlines, modules, submodule assets, and curriculum content blocks.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <MetricCard
          title="Total Categories"
          value={counts.categories}
          icon={Tag}
          trend="+1 this month"
          description="LMS capability taxonomies"
          gradientScheme="primary"
        />
        <MetricCard
          title="Total Courses"
          value={counts.courses}
          icon={BookOpen}
          trend="+2 vs last month"
          description="Curriculum pathways active"
          gradientScheme="primary"
        />
        <MetricCard
          title="Active Modules"
          value={counts.modules}
          icon={FolderKanban}
          trend="100% active state"
          description="Syllabus header sections"
          gradientScheme="primary"
        />
        <MetricCard
          title="Published Content"
          value={counts.contents}
          icon={Sliders}
          trend="+8 updates today"
          description="Total learning asset blocks"
          gradientScheme="primary"
        />
        <Link href="/admin/verification" className="block">
          <MetricCard
            title="Verification Center"
            value={verificationStats?.pending ?? 2}
            icon={ShieldCheck}
            trend={`${verificationStats?.total ?? 4} total requests`}
            description="Pending credential audits"
            gradientScheme="accent"
          />
        </Link>
      </div>

      {/* Core Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Pending Approvals & Audit Logs */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Pending Approvals Widget */}
          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-primary flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-accent" />
              <span>Pending Content Approvals ({pendingApprovalsList.length})</span>
            </h2>

            <Card>
              <CardBody className="p-0">
                {pendingApprovalsList.length === 0 ? (
                  <div className="p-8 text-center text-xs text-text-muted">
                    All submitted content blocks have been reviewed. Clean queue!
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {pendingApprovalsList.map((appr) => (
                      <div key={appr.id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-gray-50/20 transition-colors">
                        <div className="space-y-1 max-w-lg">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-primary/10 border border-primary/20 rounded-md text-[8px] font-bold text-primary uppercase">
                              {appr.type}
                            </span>
                            <span className="text-[10px] text-text-muted font-semibold">{appr.course}</span>
                          </div>
                          <h4 className="text-xs font-bold text-foreground leading-snug">{appr.title}</h4>
                          <span className="text-[10px] text-text-muted block">Submitted by: <strong className="font-semibold text-foreground/80">{appr.author}</strong></span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 sm:flex-none border-emerald-200 bg-emerald-50/30 hover:bg-emerald-50 text-emerald-700 hover:border-emerald-300"
                            onClick={() => handleApprove(appr.id, appr.title)}
                          >
                            <CheckCircle className="w-3.5 h-3.5 mr-1" />
                            <span>Approve</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 sm:flex-none border-rose-200 bg-rose-50/30 hover:bg-rose-50 text-rose-700 hover:border-rose-300"
                            onClick={() => handleReject(appr.id, appr.title)}
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" />
                            <span>Reject</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Audit Logs / Recent Activity */}
          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-primary flex items-center gap-2">
              <Clock className="w-5 h-5 text-accent" />
              <span>Security & Audit Trails</span>
            </h2>

            <Card>
              <div className="overflow-x-auto custom-scrollbar">
                <table className="min-w-full divide-y divide-border text-left text-xs font-semibold">
                  <thead className="bg-gray-50/50 text-[10px] text-text-muted font-black uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Action</th>
                      <th className="px-6 py-4">Details</th>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-foreground">
                    {recentAuditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={log.action} />
                        </td>
                        <td className="px-6 py-4 text-foreground/80 max-w-xs truncate">
                          {log.details}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-text-muted text-[10px]">
                          {log.user}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-text-muted text-[10px]">
                          {log.time}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

        </div>

        {/* Right Column: Hierarchy Shortcuts */}
        <div className="space-y-4">
          <h2 className="text-base font-extrabold text-primary">Hierarchy Shortcuts</h2>
          
          <Card>
            <CardBody className="p-5 flex flex-col gap-3">
              <Link href="/admin/categories" className="flex items-center justify-between p-3 border border-border hover:border-primary hover:bg-primary/5 rounded-xl transition-all group">
                <div className="flex items-center gap-3">
                  <Tag className="w-5 h-5 text-primary group-hover:scale-105 transition-transform" />
                  <div>
                    <span className="text-xs font-bold text-foreground block">Category Manager</span>
                    <span className="text-[10px] text-text-muted block">Create capability silos</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-foreground/30 group-hover:text-primary transition-colors" />
              </Link>

              <Link href="/admin/courses" className="flex items-center justify-between p-3 border border-border hover:border-primary hover:bg-primary/5 rounded-xl transition-all group">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-primary group-hover:scale-105 transition-transform" />
                  <div>
                    <span className="text-xs font-bold text-foreground block">Course Manager</span>
                    <span className="text-[10px] text-text-muted block">Manage course details & SEO</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-foreground/30 group-hover:text-primary transition-colors" />
              </Link>

              <Link href="/admin/modules" className="flex items-center justify-between p-3 border border-border hover:border-primary hover:bg-primary/5 rounded-xl transition-all group">
                <div className="flex items-center gap-3">
                  <FolderKanban className="w-5 h-5 text-primary group-hover:scale-105 transition-transform" />
                  <div>
                    <span className="text-xs font-bold text-foreground block">Module Manager</span>
                    <span className="text-[10px] text-text-muted block">Organize syllabus structures</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-foreground/30 group-hover:text-primary transition-colors" />
              </Link>

              <Link href="/admin/submodules" className="flex items-center justify-between p-3 border border-border hover:border-primary hover:bg-primary/5 rounded-xl transition-all group">
                <div className="flex items-center gap-3">
                  <Sliders className="w-5 h-5 text-primary group-hover:scale-105 transition-transform" />
                  <div>
                    <span className="text-xs font-bold text-foreground block">Submodule Lessons</span>
                    <span className="text-[10px] text-text-muted block">Configure lesson pages</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-foreground/30 group-hover:text-primary transition-colors" />
              </Link>

              <Link href="/admin/content" className="flex items-center justify-between p-3 border border-border hover:border-primary hover:bg-primary/5 rounded-xl transition-all group">
                <div className="flex items-center gap-3">
                  <FileCode2 className="w-5 h-5 text-primary group-hover:scale-105 transition-transform" />
                  <div>
                    <span className="text-xs font-bold text-foreground block">Content Builder</span>
                    <span className="text-[10px] text-text-muted block">Assemble code & video blocks</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-foreground/30 group-hover:text-primary transition-colors" />
              </Link>

              <Link href="/admin/learners" className="flex items-center justify-between p-3 border border-border hover:border-primary hover:bg-primary/5 rounded-xl transition-all group">
                <div className="flex items-center gap-3">
                  <UserPlus className="w-5 h-5 text-primary group-hover:scale-105 transition-transform" />
                  <div>
                    <span className="text-xs font-bold text-foreground block">Learner Credentials</span>
                    <span className="text-[10px] text-text-muted block">Provision IAM learner logins</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-foreground/30 group-hover:text-primary transition-colors" />
              </Link>

              <Link href="/admin/verification" className="flex items-center justify-between p-3 border border-primary/30 bg-primary/[0.02] hover:border-primary hover:bg-primary/5 rounded-xl transition-all group">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-primary group-hover:scale-105 transition-transform" />
                  <div>
                    <span className="text-xs font-bold text-foreground block">Verification Center</span>
                    <span className="text-[10px] text-text-muted block">Audit requests & credential approvals</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-foreground/30 group-hover:text-primary transition-colors" />
              </Link>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

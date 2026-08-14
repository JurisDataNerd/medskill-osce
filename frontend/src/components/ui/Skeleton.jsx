import React from "react";
import ParticipantNavbar from "@/features/participant/components/ParticipantNavbar";

/**
 * Base Skeleton primitive component with smooth shimmer/pulse animation
 */
export function Skeleton({ className = "", variant = "rectangular", ...props }) {
  const baseClasses = "animate-pulse bg-slate-200/80 dark:bg-slate-700/50";
  
  let variantClasses = "";
  if (variant === "circular" || variant === "circle") {
    variantClasses = "rounded-full";
  } else if (variant === "text") {
    variantClasses = "rounded-md h-4 my-1";
  } else if (variant === "rounded") {
    variantClasses = "rounded-2xl";
  } else {
    variantClasses = "rounded-xl";
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses} ${className}`}
      {...props}
    />
  );
}

/**
 * Skeleton for individual Session Cards in Participant Dashboard
 */
export function SessionCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs flex flex-col justify-between">
      <div className="space-y-3">
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-5 w-28 rounded-full" />
        </div>

        {/* Title */}
        <Skeleton className="h-6 w-3/4 rounded-lg" />
        <Skeleton className="h-4 w-1/2 rounded-md" />

        {/* Info Items */}
        <div className="pt-2 space-y-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-4 w-20 rounded-md" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="h-4 w-24 rounded-md" />
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
        <Skeleton className="h-4 w-20 rounded-md" />
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
    </div>
  );
}

/**
 * Full Page Skeleton for Participant Dashboard Page
 */
export function ParticipantDashboardSkeleton() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans">
      {/* Top Navbar */}
      <ParticipantNavbar />

      {/* Main Content Area */}
      <main className="mx-auto max-w-6xl p-6 space-y-6">
        {/* Banner Skeleton */}
        <div className="rounded-3xl border border-slate-200 bg-slate-900/90 p-7 text-white shadow-xl relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl w-full">
              <Skeleton className="h-6 w-56 rounded-full bg-slate-700" />
              <Skeleton className="h-8 w-3/4 rounded-xl bg-slate-700" />
              <Skeleton className="h-4 w-full rounded-md bg-slate-800" />
              <div className="flex gap-4 pt-2">
                <Skeleton className="h-4 w-40 rounded-md bg-slate-800" />
                <Skeleton className="h-4 w-32 rounded-md bg-slate-800" />
              </div>
            </div>
            <Skeleton className="h-14 w-52 rounded-2xl bg-slate-700" />
          </div>
        </div>

        {/* Filter & Search Bar Card Skeleton */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="space-y-2">
              <Skeleton className="h-6 w-52 rounded-lg" />
              <Skeleton className="h-4 w-72 rounded-md" />
            </div>
            <Skeleton className="h-9 w-60 rounded-xl" />
          </div>

          {/* Filter Tabs Skeleton */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
            <Skeleton className="h-9 w-32 rounded-xl" />
            <Skeleton className="h-9 w-32 rounded-xl" />
            <Skeleton className="h-9 w-36 rounded-xl" />
          </div>

          {/* Cards Grid Skeleton (4 cards) */}
          <div className="grid gap-4 sm:grid-cols-2">
            <SessionCardSkeleton />
            <SessionCardSkeleton />
            <SessionCardSkeleton />
            <SessionCardSkeleton />
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * Full Page Skeleton for Participant History / Transcript Page
 */
export function ParticipantHistorySkeleton() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans pb-12">
      {/* Top Navbar */}
      <ParticipantNavbar />

      {/* Main Content Area */}
      <main className="mx-auto max-w-6xl p-6 space-y-6">
        {/* Banner Header Skeleton */}
        <div className="rounded-3xl border border-slate-200 bg-slate-900 p-7 text-white shadow-xl flex items-center justify-between">
          <div className="space-y-3 max-w-2xl w-full">
            <Skeleton className="h-6 w-48 rounded-full bg-slate-700" />
            <Skeleton className="h-8 w-2/3 rounded-xl bg-slate-700" />
            <Skeleton className="h-4 w-1/2 rounded-md bg-slate-800" />
          </div>
        </div>

        {/* List Section Skeleton */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <Skeleton className="h-6 w-48 rounded-lg" />
            <Skeleton className="h-9 w-60 rounded-xl" />
          </div>

          <div className="space-y-3">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * Skeleton for Profile Edit Form
 */
export function UserProfileSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Banner Skeleton */}
      <div className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-xl flex items-center gap-6">
        <Skeleton className="h-24 w-24 rounded-full bg-slate-700 shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-36 rounded-full bg-slate-700" />
          <Skeleton className="h-8 w-1/2 rounded-xl bg-slate-700" />
          <Skeleton className="h-4 w-1/3 rounded-md bg-slate-800" />
        </div>
      </div>

      {/* Form Skeleton */}
      <div className="rounded-3xl border border-slate-200 bg-white p-7 space-y-6">
        <div className="flex justify-between border-b pb-4">
          <Skeleton className="h-6 w-52 rounded-lg" />
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for Examiner Portal Dashboard
 */
export function ExaminerDashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Welcome Banner Skeleton */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 text-white shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-5 w-full max-w-2xl">
          <Skeleton className="h-16 w-16 rounded-2xl bg-slate-700 shrink-0" />
          <div className="space-y-2.5 w-full">
            <Skeleton className="h-5 w-48 rounded-full bg-slate-700" />
            <Skeleton className="h-7 w-2/3 rounded-xl bg-slate-700" />
            <Skeleton className="h-4 w-1/2 rounded-md bg-slate-800" />
          </div>
        </div>
      </div>

      {/* Assigned Sessions Card Skeleton */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <Skeleton className="h-6 w-60 rounded-lg" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>

        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for Examiner History Page
 */
export function ExaminerHistorySkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="rounded-3xl border border-slate-200 bg-slate-900 p-7 text-white shadow-xl flex justify-between items-center">
        <div className="space-y-2 max-w-xl w-full">
          <Skeleton className="h-6 w-40 rounded-full bg-slate-700" />
          <Skeleton className="h-8 w-3/4 rounded-xl bg-slate-700" />
          <Skeleton className="h-4 w-1/2 rounded-md bg-slate-800" />
        </div>
      </div>

      {/* History List Skeleton */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <Skeleton className="h-6 w-48 rounded-lg" />
          <Skeleton className="h-9 w-60 rounded-xl" />
        </div>

        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for Examiner History Detail Page
 */
export function ExaminerHistoryDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-36 rounded-md" />
      
      {/* Header Banner Skeleton */}
      <div className="rounded-3xl border border-slate-200 bg-slate-900 p-7 text-white shadow-xl flex justify-between items-center">
        <div className="space-y-2 max-w-xl w-full">
          <Skeleton className="h-6 w-44 rounded-full bg-slate-700" />
          <Skeleton className="h-8 w-3/4 rounded-xl bg-slate-700" />
          <Skeleton className="h-4 w-1/2 rounded-md bg-slate-800" />
        </div>
      </div>

      {/* Examinee Cards Skeleton */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <Skeleton className="h-6 w-56 rounded-lg" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
      </div>
    </div>
  );
}

export default Skeleton;

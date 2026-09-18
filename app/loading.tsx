import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Sparkles } from "lucide-react";

export default function Loading() {
  return (
    <div className="relative flex flex-col h-screen w-full bg-background overflow-hidden select-none">
      {/* Centered Loading Indicator Overlay */}
      {/* <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/40 backdrop-blur-[2px]">
        <div className="flex flex-col items-center gap-3 px-6 py-5 rounded-2xl bg-card/90 border border-border/70 shadow-xl">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Loader2 className="size-5 animate-spin" />
          </div>
          <div className="flex flex-col items-center gap-1 text-center">
            <span className="text-xs font-semibold text-foreground tracking-tight">
              Loading workspace
            </span>
            <span className="text-[11px] text-muted-foreground">
              Preparing your markdown editor...
            </span>
          </div>
        </div>
      </div> */}

      {/* Header Skeleton */}
      <header className="flex h-12 items-center justify-between border-b px-4 lg:px-6 bg-background/95 shrink-0">
        <div className="flex items-center gap-3">
          {/* <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Sparkles className="size-4 opacity-40" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="h-4 w-px bg-border/60 mx-1 hidden sm:block" /> */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16 hidden sm:block" />
            <Skeleton className="h-7 w-36 rounded-lg" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="size-8 rounded-md" />
        </div>
      </header>

      {/* Main Workspace Skeleton */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Skeleton */}
        <aside className="w-64 border-r bg-sidebar p-3 flex flex-col gap-4 shrink-0 hidden md:flex">
          {/* Project Switcher Skeleton */}
          <div className="flex items-center gap-2.5 p-2 rounded-lg border border-sidebar-border bg-sidebar-accent/40">
            <Skeleton className="size-8 rounded-lg" />
            <div className="flex flex-col gap-1.5 flex-1">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-2.5 w-16" />
            </div>
          </div>

          {/* File Tree Toolbar Skeleton */}
          <div className="flex items-center justify-between px-1">
            <Skeleton className="h-3 w-12" />
            <div className="flex items-center gap-1">
              <Skeleton className="size-5 rounded" />
              <Skeleton className="size-5 rounded" />
            </div>
          </div>

          {/* File Tree Items Skeleton */}
          <div className="flex flex-col gap-2 px-1">
            <div className="flex items-center gap-2">
              <Skeleton className="size-4 rounded" />
              <Skeleton className="h-3.5 w-20" />
            </div>
            <div className="pl-6 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Skeleton className="size-3.5 rounded" />
                <Skeleton className="h-3 w-28" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="size-3.5 rounded" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Skeleton className="size-4 rounded" />
              <Skeleton className="h-3.5 w-28" />
            </div>
            <div className="pl-6 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Skeleton className="size-3.5 rounded" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Skeleton className="size-4 rounded" />
              <Skeleton className="h-3.5 w-24" />
            </div>
          </div>
        </aside>

        {/* Editor Panel Skeleton */}
        <div className="flex-1 flex flex-col border-r overflow-hidden min-w-[200px]">
          <div className="flex items-center justify-between border-b px-3 py-2 bg-muted/20">
            <Skeleton className="h-3.5 w-16" />
            <Skeleton className="h-3.5 w-12" />
          </div>
          <div className="flex flex-1 p-4 gap-4 overflow-hidden">
            {/* Line numbers gutter skeleton */}
            <div className="flex flex-col gap-2.5 w-6 shrink-0 opacity-40">
              {Array.from({ length: 16 }).map((_, i) => (
                <Skeleton key={i} className="h-3 w-4" />
              ))}
            </div>
            {/* Code text lines skeleton */}
            <div className="flex flex-col gap-3 flex-1 pt-0.5">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3.5 w-3/4" />
              <Skeleton className="h-3.5 w-5/6" />
              <Skeleton className="h-3.5 w-1/2" />
              <div className="h-2" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3.5 w-4/5" />
              <Skeleton className="h-3.5 w-2/3" />
              <Skeleton className="h-3.5 w-11/12" />
              <Skeleton className="h-3.5 w-3/5" />
            </div>
          </div>
        </div>

        {/* Viewer Panel Skeleton */}
        <div className="flex-1 flex flex-col border-r overflow-hidden hidden lg:flex min-w-[200px]">
          <div className="flex items-center justify-between border-b px-3 py-2 bg-muted/20">
            <Skeleton className="h-3.5 w-16" />
            <Skeleton className="h-3.5 w-14" />
          </div>
          <div className="flex flex-col gap-4 p-6 overflow-hidden">
            <Skeleton className="h-7 w-56 rounded-md" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-4/5" />
            <div className="h-2" />
            <Skeleton className="h-5 w-40 rounded" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="p-4 rounded-lg bg-muted/40 border flex flex-col gap-2">
              <Skeleton className="h-3.5 w-2/3" />
              <Skeleton className="h-3.5 w-1/2" />
            </div>
          </div>
        </div>

        {/* Outlines Panel Skeleton */}
        <aside className="w-56 p-4 flex flex-col gap-3 shrink-0 hidden xl:flex">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3.5 w-16" />
          </div>
          <div className="flex flex-col gap-2.5 pt-2">
            <Skeleton className="h-3 w-36" />
            <Skeleton className="h-3 w-28 pl-3" />
            <Skeleton className="h-3 w-32 pl-3" />
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-3 w-24 pl-3" />
          </div>
        </aside>
      </div>

      {/* Footer Skeleton */}
      <footer className="flex h-7 items-center justify-between border-t px-4 bg-muted/30 text-xs shrink-0">
        <div className="flex items-center gap-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3 w-12" />
        </div>
      </footer>
    </div>
  );
}

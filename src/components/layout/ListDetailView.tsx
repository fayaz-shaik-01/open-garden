"use client";

import { ReactNode } from "react";

interface ListDetailViewProps {
  list: ReactNode;
  detail?: ReactNode;
  hasDetail?: boolean;
}

export function ListDetailView({ list, detail, hasDetail }: ListDetailViewProps) {
  return (
    <div className="flex h-full">
      {/* List panel */}
      <div
        className={`w-full lg:w-[320px] xl:w-[380px] shrink-0 border-r border-border overflow-y-auto scrollbar-none ${
          hasDetail ? "hidden lg:block" : ""
        }`}
      >
        {list}
      </div>

      {/* Detail panel */}
      {detail && (
        <div className="flex-1 overflow-y-auto scrollbar-none">
          {detail}
        </div>
      )}

      {/* Empty state when no detail selected (desktop only) */}
      {!detail && (
        <div className="hidden lg:flex flex-1 items-center justify-center text-muted-foreground text-sm">
          Select an item to view details
        </div>
      )}
    </div>
  );
}

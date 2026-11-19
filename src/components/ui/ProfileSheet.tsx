"use client";

import { useState } from "react";
import { Settings, X, LogOut, User } from "lucide-react";
import { logoutAction } from "@/app/(app)/actions";
import BrandLogo from "./BrandLogo";
import { BRAND } from "@/lib/brand";

interface ProfileSheetProps {
  name: string;
  email: string;
}

export default function ProfileSheet({ name, email }: ProfileSheetProps) {
  const [open, setOpen] = useState(false);

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-brand-tint transition-colors active:scale-95"
      >
        <Settings size={20} className="text-ink" />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-end"
          onClick={() => setOpen(false)}
        >
          {/* Sheet */}
          <div
            className="w-full bg-white rounded-t-[28px] p-6 flex flex-col gap-6 mb-[72px]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="w-10 h-1 bg-line rounded-full mx-auto -mt-1" />

            {/* Header */}
            <div className="flex justify-between items-center">
              <h2
                className="text-[18px] font-semibold text-ink"
                style={{ fontFamily: "var(--font-manrope)" }}
              >
                Account
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-brand-tint transition-colors"
              >
                <X size={18} className="text-ink-soft" />
              </button>
            </div>

            {/* Profile info */}
            <div className="flex items-center gap-4 p-4 bg-canvas rounded-[20px]">
              <div className="w-14 h-14 rounded-full bg-brand flex items-center justify-center flex-shrink-0">
                <BrandLogo size={28} />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-[16px] font-semibold text-ink truncate"
                  style={{ fontFamily: "var(--font-manrope)" }}
                >
                  {name}
                </p>
                <p className="text-[13px] text-ink-soft truncate mt-0.5">
                  {email}
                </p>
              </div>
            </div>

            {/* Shop info */}
            <div className="flex items-center gap-3 px-1">
              <User size={16} className="text-ink-muted" />
              <p className="text-[13px] text-ink-soft">
                Owner — {BRAND.name} {BRAND.tagline}
              </p>
            </div>

            {/* Logout */}
            <form action={logoutAction}>
              <button
                type="submit"
                className="w-full h-12 flex items-center justify-center gap-2 border border-danger text-danger rounded-xl text-[14px] font-semibold active:scale-95 transition-transform"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </form>

            {/* Safe area spacer for iPhone home indicator */}
            <div
              style={{
                paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}

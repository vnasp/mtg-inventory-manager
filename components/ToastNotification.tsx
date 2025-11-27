"use client";
import React, { useEffect, useState } from "react";
import { Toast } from "flowbite-react";

type ToastNotificationProps = {
  message: string;
  type?: "success" | "error";
  duration?: number; // ms
  onClose?: () => void;
};

export default function ToastNotification({
  message,
  type = "success",
  duration = 4000,
  onClose,
}: ToastNotificationProps) {
  const [visible, setVisible] = useState<boolean>(!!message);

  useEffect(() => {
    if (!message) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const t = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, duration);
    return () => clearTimeout(t);
  }, [message, duration, onClose]);

  if (!visible) return null;

  const isSuccess = type === "success";

  const accentBg = isSuccess ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200";
  const accentText = isSuccess ? "text-emerald-700" : "text-red-700";
  const icon = isSuccess ? (
    <svg
      className="h-5 w-5"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path d="M7.5 13.5L4 10l1.1-1.1L7.5 11.3 14.9 3.9 16 5l-8.5 8.5z" fill="currentColor" />
    </svg>
  ) : (
    <svg
      className="h-5 w-5"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M11.41 10l3.3-3.29a1 1 0 10-1.42-1.42L10 8.59 6.71 5.29a1 1 0 10-1.42 1.42L8.59 10l-3.3 3.29a1 1 0 101.42 1.42L10 11.41l3.29 3.3a1 1 0 001.42-1.42L11.41 10z"
        fill="currentColor"
      />
    </svg>
  );

  return (
    <div className="fixed right-4 bottom-4 z-50">
      <Toast>
        <div className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isSuccess ? "bg-emerald-100 text-emerald-500" : "bg-red-100 text-red-500"}`}>
          {icon}
        </div>
        <div className={`ml-3 text-sm font-normal ${accentText}`}>{message}</div>
        <Toast.Toggle onClick={() => { setVisible(false); onClose?.(); }} />
      </Toast>
    </div>
  );
}

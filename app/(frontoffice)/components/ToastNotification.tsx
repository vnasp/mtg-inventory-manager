'use client';
import React, { useEffect, useState } from 'react';
import { Toast } from 'flowbite-react';
import { MdCheckCircle, MdCancel, MdClose } from 'react-icons/md';

type ToastNotificationProps = {
  message: string;
  type?: 'success' | 'error';
  duration?: number; // ms
  onClose?: () => void;
};

export default function ToastNotification({
  message,
  type = 'success',
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

  const isSuccess = type === 'success';

  const accentBg = isSuccess
    ? 'bg-emerald-50 border-emerald-200'
    : 'bg-red-50 border-red-200';
  const accentText = isSuccess ? 'text-emerald-700' : 'text-red-700';
  const icon = isSuccess ? (
    <MdCheckCircle className="h-5 w-5" />
  ) : (
    <MdCancel className="h-5 w-5" />
  );

  return (
    <div className="fixed right-4 bottom-4 z-50">
      <Toast>
        <div
          className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isSuccess ? 'bg-emerald-100 text-emerald-500' : 'bg-red-100 text-red-500'}`}
        >
          {icon}
        </div>
        <div className={`ml-3 text-sm font-normal ${accentText}`}>
          {message}
        </div>
        <button
          type="button"
          aria-label="close"
          onClick={() => {
            setVisible(false);
            onClose?.();
          }}
          className="ml-3 inline-flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-900"
        >
          <MdClose className="h-4 w-4" />
        </button>
      </Toast>
    </div>
  );
}

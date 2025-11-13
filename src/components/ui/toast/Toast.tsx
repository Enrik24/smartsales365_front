'use client';

// Import the toast styles
import { toast } from 'sonner';
//import "sonner/styles";

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  title: string;
  description?: string;
  type?: ToastType;
  duration?: number;
}

export const showToast = ({
  title,
  description,
  type = 'success',
  duration = 3000,
}: ToastProps) => {
  const toastOptions = {
    duration,
  };

  switch (type) {
    case 'success':
      toast.success(title, {
        ...toastOptions,
        description,
      });
      break;
    case 'error':
      toast.error(title, {
        ...toastOptions,
        description,
      });
      break;
    case 'info':
      toast.info(title, {
        ...toastOptions,
        description,
      });
      break;
    case 'warning':
      toast.warning(title, {
        ...toastOptions,
        description,
      });
      break;
    default:
      toast(title, {
        ...toastOptions,
        description,
      });
  }
};

// Export the toast instance for direct use if needed
export { toast };

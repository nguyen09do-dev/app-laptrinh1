import toast from 'react-hot-toast';

export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#10b981',
        color: '#fff',
        fontWeight: '500',
      },
    });
  },
  error: (message: string) => {
    toast.error(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#ef4444',
        color: '#fff',
        fontWeight: '500',
      },
    });
  },
  loading: (message: string) => {
    return toast.loading(message, {
      position: 'top-right',
    });
  },
  dismiss: (toastId: string) => {
    toast.dismiss(toastId);
  },
};

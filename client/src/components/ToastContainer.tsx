import { useToastStore } from '../game/toastStore';
import clsx from 'clsx';

export const ToastContainer = () => {
    const { toasts, removeToast } = useToastStore();

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={clsx(
                        "px-4 py-2 rounded shadow-lg text-white font-bold transition-all animate-bounce", // simple bounce in
                        toast.type === 'info' && "bg-blue-500",
                        toast.type === 'success' && "bg-green-500",
                        toast.type === 'error' && "bg-red-500",
                        toast.type === 'warning' && "bg-yellow-500",
                    )}
                    onClick={() => removeToast(toast.id)}
                >
                    {toast.message}
                </div>
            ))}
        </div>
    );
};

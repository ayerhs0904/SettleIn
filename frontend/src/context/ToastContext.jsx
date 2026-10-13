import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const addToast = useCallback(({ type = 'info', message, title, duration = 3800 }) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const newToast = { id, type, message, title, duration };

        setToasts((prev) => [...prev, newToast]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }

        return id;
    }, [removeToast]);

    const success = useCallback((message, title = 'Success') => {
        return addToast({ type: 'success', message, title });
    }, [addToast]);

    const error = useCallback((message, title = 'Error') => {
        return addToast({ type: 'error', message, title, duration: 4500 });
    }, [addToast]);

    const info = useCallback((message, title = 'Notice') => {
        return addToast({ type: 'info', message, title });
    }, [addToast]);

    const bookmark = useCallback((itemTitle, isBookmarked) => {
        if (isBookmarked) {
            return addToast({
                type: 'bookmark-add',
                title: 'Saved to Bookmarks',
                message: itemTitle ? `"${itemTitle}" was added to your dashboard.` : 'Item saved.'
            });
        } else {
            return addToast({
                type: 'bookmark-remove',
                title: 'Removed from Bookmarks',
                message: itemTitle ? `"${itemTitle}" removed from saved list.` : 'Item removed.'
            });
        }
    }, [addToast]);

    return (
        <ToastContext.Provider value={{ addToast, removeToast, success, error, info, bookmark }}>
            {children}
            {/* Floating Toast Notification Container */}
            <div className="fixed top-5 right-5 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={`pointer-events-auto rounded-2xl border p-4 shadow-2xl backdrop-blur-xl transition-all duration-300 transform animate-toastSlideIn flex items-start space-x-3 text-left ${
                            t.type === 'success'
                                ? 'bg-emerald-950/90 border-emerald-500/50 text-white shadow-emerald-950/50'
                                : t.type === 'error'
                                ? 'bg-red-950/90 border-red-500/50 text-white shadow-red-950/50'
                                : t.type === 'bookmark-add'
                                ? 'bg-gradient-to-r from-pink-950/90 to-purple-950/90 border-pink-500/60 text-white shadow-pink-950/50'
                                : t.type === 'bookmark-remove'
                                ? 'bg-gray-900/90 border-gray-700/80 text-gray-200'
                                : 'bg-gray-900/95 border-blue-500/50 text-white shadow-blue-950/50'
                        }`}
                    >
                        <div className="text-xl shrink-0 mt-0.5">
                            {t.type === 'success' && '✅'}
                            {t.type === 'error' && '⚠️'}
                            {t.type === 'bookmark-add' && '💖'}
                            {t.type === 'bookmark-remove' && '💔'}
                            {t.type === 'info' && 'ℹ️'}
                        </div>
                        <div className="flex-1 min-w-0">
                            {t.title && (
                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-200 mb-0.5">
                                    {t.title}
                                </h4>
                            )}
                            <p className="text-sm font-medium text-gray-100 leading-snug break-words">
                                {t.message}
                            </p>
                        </div>
                        <button
                            onClick={() => removeToast(t.id)}
                            className="text-gray-400 hover:text-white shrink-0 p-1 text-xs rounded-lg hover:bg-white/10 transition"
                            aria-label="Close notification"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

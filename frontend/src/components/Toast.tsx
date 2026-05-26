import { useState, useCallback, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
    id: number;
    message: string;
    type: ToastType;
}

let toastCounter = 0;

export function useToast() {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = ++toastCounter;
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = useCallback((id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return { toasts, showToast, removeToast };
}

interface ToastItemProps {
    toast: ToastMessage;
    onRemove: (id: number) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
    const [visible, setVisible] = useState(false);
    const [leaving, setLeaving] = useState(false);

    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));
        const timer = setTimeout(() => {
            setLeaving(true);
            setTimeout(() => onRemove(toast.id), 350);
        }, 3650);
        return () => clearTimeout(timer);
    }, [toast.id, onRemove]);

    const handleClose = () => {
        setLeaving(true);
        setTimeout(() => onRemove(toast.id), 350);
    };

    const colors: Record<ToastType, { bg: string; border: string; icon: string; iconColor: string }> = {
        success: { bg: '#f4f9e9', border: '#a5c926', icon: '✓', iconColor: '#a5c926' },
        error:   { bg: '#fdf0ed', border: '#e74c3c', icon: '✕', iconColor: '#e74c3c' },
        warning: { bg: '#fffbea', border: '#f1c40f', icon: '!', iconColor: '#d4a017' },
        info:    { bg: '#f0f7ff', border: '#0284c7', icon: 'i', iconColor: '#0284c7' },
    };

    const c = colors[toast.type];

    return (
        <div
            onClick={handleClose}
            style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '14px 16px',
                borderRadius: '10px',
                border: `1.5px solid ${c.border}`,
                backgroundColor: c.bg,
                boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                cursor: 'pointer',
                minWidth: '280px',
                maxWidth: '380px',
                transform: visible && !leaving ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(0.95)',
                opacity: visible && !leaving ? 1 : 0,
                transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.35s ease',
                userSelect: 'none',
            }}
        >
            <div style={{
                width: '22px', height: '22px', borderRadius: '50%',
                backgroundColor: c.iconColor, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 'bold', fontSize: '12px', flexShrink: 0, marginTop: '1px'
            }}>
                {c.icon}
            </div>
            <span style={{ fontSize: '14px', lineHeight: '1.5', color: '#333', fontWeight: '500', flex: 1 }}>
                {toast.message}
            </span>
        </div>
    );
}

interface ToastContainerProps {
    toasts: ToastMessage[];
    onRemove: (id: number) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
    return (
        <div style={{
            position: 'fixed',
            top: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            pointerEvents: 'none',
        }}>
            {toasts.map(toast => (
                <div key={toast.id} style={{ pointerEvents: 'auto' }}>
                    <ToastItem toast={toast} onRemove={onRemove} />
                </div>
            ))}
        </div>
    );
}

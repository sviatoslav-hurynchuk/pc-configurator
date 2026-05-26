import { type CSSProperties } from 'react';

interface ConfirmModalProps {
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmLabel?: string;
    danger?: boolean;
}

export default function ConfirmModal({ isOpen, message, onConfirm, onCancel, confirmLabel = 'Підтвердити', danger = true }: ConfirmModalProps) {
    if (!isOpen) return null;

    const overlay: CSSProperties = {
        position: 'fixed', inset: 0,
        backgroundColor: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 10000,
        animation: 'fadeIn 0.15s ease'
    };

    const box: CSSProperties = {
        background: '#fff',
        borderRadius: '14px',
        padding: '32px 36px',
        maxWidth: '420px',
        width: '90%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        animation: 'slideUp 0.2s cubic-bezier(0.34,1.56,0.64,1)',
        fontFamily: "'Outfit','Inter',sans-serif"
    };

    const btnBase: CSSProperties = {
        padding: '10px 24px',
        borderRadius: '8px',
        fontWeight: 700,
        fontSize: '14px',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    };

    return (
        <div style={overlay} onClick={onCancel}>
            <div style={box} onClick={e => e.stopPropagation()}>
                <div style={{ fontSize: '22px', marginBottom: '8px' }}>
                    {danger ? '⚠️' : 'ℹ️'}
                </div>
                <p style={{ margin: '0 0 24px 0', color: '#1e293b', fontSize: '15px', lineHeight: '1.6' }}>
                    {message}
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button
                        style={{ ...btnBase, background: '#f1f5f9', color: '#475569' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#e2e8f0')}
                        onMouseLeave={e => (e.currentTarget.style.background = '#f1f5f9')}
                        onClick={onCancel}
                    >
                        Скасувати
                    </button>
                    <button
                        style={{ ...btnBase, background: danger ? '#ef4444' : '#a5c926', color: '#fff' }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                        onClick={onConfirm}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
                @keyframes slideUp { from { opacity:0; transform:translateY(20px) scale(0.97) } to { opacity:1; transform:translateY(0) scale(1) } }
            `}</style>
        </div>
    );
}

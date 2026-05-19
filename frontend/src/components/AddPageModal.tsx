import { type SyntheticEvent, useEffect, useState } from 'react';
import { createPage, updatePage } from '../services/api';
import type { DynamicPage } from '../types';

interface AddPageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    pageToEdit: DynamicPage | null;
}

export default function AddPageModal({ isOpen, onClose, onSuccess, pageToEdit }: AddPageModalProps) {
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [content, setContent] = useState('');
    const [isPublished, setIsPublished] = useState(true);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const generateSlug = (text: string) => {
        return text
            .toLowerCase()
            .trim()
            .replace(/а/g, 'a').replace(/б/g, 'b').replace(/в/g, 'v').replace(/г/g, 'g')
            .replace(/д/g, 'd').replace(/е/g, 'e').replace(/є/g, 'ye').replace(/ж/g, 'zh')
            .replace(/з/g, 'z').replace(/и/g, 'y').replace(/і/g, 'i').replace(/ї/g, 'yi')
            .replace(/й/g, 'y').replace(/к/g, 'k').replace(/л/g, 'l').replace(/м/g, 'm')
            .replace(/н/g, 'n').replace(/о/g, 'o').replace(/п/g, 'p').replace(/р/g, 'r')
            .replace(/с/g, 's').replace(/т/g, 't').replace(/у/g, 'u').replace(/ф/g, 'f')
            .replace(/х/g, 'kh').replace(/ц/g, 'ts').replace(/ч/g, 'ch').replace(/ш/g, 'sh')
            .replace(/щ/g, 'shch').replace(/ь/g, '').replace(/ю/g, 'yu').replace(/я/g, 'ya')
            .replace(/[^a-z0-9 -]/g, '') 
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    };

    useEffect(() => {
        if (pageToEdit) {
            setTitle(pageToEdit.title);
            setSlug(pageToEdit.slug);
            setContent(pageToEdit.content);
            setIsPublished(pageToEdit.is_published === 1);
        } else {
            setTitle('');
            setSlug('');
            setContent('');
            setIsPublished(true);
        }
        setError('');
    }, [isOpen, pageToEdit]);

    const handleTitleChange = (val: string) => {
        setTitle(val);
        if (!pageToEdit) {
            setSlug(generateSlug(val));
        }
    };

    const handleSubmit = async (e: SyntheticEvent) => {
        e.preventDefault();
        setError('');

        if (!title.trim() || !slug.trim() || !content.trim()) {
            setError('Будь ласка, заповніть всі обов\'язкові поля');
            return;
        }

        setSubmitting(true);
        const data = {
            title: title.trim(),
            slug: slug.trim(),
            content: content.trim(),
            is_published: isPublished ? 1 : 0
        };

        try {
            const res = pageToEdit 
                ? await updatePage(pageToEdit.id, data)
                : await createPage(data);

            if (res.status === 'success') {
                onSuccess();
            } else {
                setError(res.message || 'Сталася помилка при збереженні сторінки');
            }
        } catch {
            setError('Помилка з\'єднання з сервером');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
        }}>
            <div style={{
                backgroundColor: '#fff',
                width: '100%',
                maxWidth: '750px',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                border: '1px solid #f1f5f9',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: '90vh'
            }}>

                <div style={{
                    padding: '20px 25px',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#f8fafc'
                }}>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#1e293b' }}>
                        {pageToEdit ? 'Редагувати сторінку / новину' : 'Додати нову сторінку / новину'}
                    </h2>
                    <button 
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '24px',
                            cursor: 'pointer',
                            color: '#94a3b8'
                        }}
                    >
                        ✕
                    </button>
                </div>


                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', flex: 1, padding: '25px' }}>
                    {error && (
                        <div style={{
                            padding: '12px 16px',
                            backgroundColor: '#fef2f2',
                            border: '1px solid #fee2e2',
                            borderRadius: '8px',
                            color: '#991b1b',
                            marginBottom: '20px',
                            fontSize: '14px',
                            fontWeight: '600'
                        }}>
                            {error}
                        </div>
                    )}

                    <div style={{ marginBottom: '20px' }}>
                        <label style={labelStyle}>Заголовок <span style={{ color: '#ef4444' }}>*</span></label>
                        <input 
                            type="text" 
                            value={title}
                            onChange={(e) => handleTitleChange(e.target.value)}
                            placeholder="Наприклад: Про нас або Новинка: Процесори Ryzen 9000"
                            style={inputStyle}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={labelStyle}>
                            Посилання <span style={{ color: '#ef4444' }}>*</span>
                            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'normal', marginLeft: '10px' }}>
                                (Лише англійські літери, цифри та дефіси)
                            </span>
                        </label>
                        <input 
                            type="text" 
                            value={slug}
                            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                            placeholder="about-us або news-ryzen-9000"
                            style={inputStyle}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <label style={labelStyle}>Вміст сторінки <span style={{ color: '#ef4444' }}>*</span></label>
                        <textarea 
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Напишіть текст статті чи новини тут..."
                            style={{ ...inputStyle, minHeight: '200px', flex: 1, resize: 'vertical', fontFamily: 'inherit' }}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input 
                            type="checkbox" 
                            id="is_published"
                            checked={isPublished}
                            onChange={(e) => setIsPublished(e.target.checked)}
                            style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#a5c926' }}
                        />
                        <label htmlFor="is_published" style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '14px', cursor: 'pointer' }}>
                            Опублікувати сторінку
                        </label>
                    </div>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '15px',
                        borderTop: '1px solid #f1f5f9',
                        paddingTop: '20px',
                        marginTop: 'auto'
                    }}>
                        <button 
                            type="button" 
                            onClick={onClose}
                            style={{
                                padding: '10px 24px',
                                border: '1px solid #cbd5e1',
                                borderRadius: '25px',
                                background: '#fff',
                                color: '#475569',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                        >
                            Скасувати
                        </button>
                        <button 
                            type="submit" 
                            disabled={submitting}
                            style={{
                                padding: '10px 30px',
                                background: '#a5c926',
                                border: 'none',
                                borderRadius: '25px',
                                color: '#fff',
                                fontWeight: 'bold',
                                cursor: submitting ? 'not-allowed' : 'pointer',
                                opacity: submitting ? 0.7 : 1
                            }}
                        >
                            {submitting ? 'Збереження...' : 'Зберегти'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 'bold',
    fontSize: '14px',
    color: '#334155'
};

const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#1e293b',
    outline: 'none',
    boxSizing: 'border-box' as const,
    transition: 'border-color 0.2s',
    ':focus': {
        borderColor: '#a5c926'
    }
};

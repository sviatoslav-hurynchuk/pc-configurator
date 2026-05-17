import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchPages, fetchPageBySlug } from '../services/api';
import type { DynamicPage } from '../types';
import { BsArrowLeft, BsCalendarEvent, BsJournalBookmarkFill } from 'react-icons/bs';

function PagesPage() {
    const navigate = useNavigate();
    const { slug } = useParams<{ slug: string }>();
    const [pages, setPages] = useState<DynamicPage[]>([]);
    const [currentPage, setCurrentPage] = useState<DynamicPage | null>(null);
    const [loadingList, setLoadingList] = useState(true);
    const [loadingContent, setLoadingContent] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadPagesList = async () => {
            try {
                const res = await fetchPages();
                if (res.status === 'success' && Array.isArray(res.data)) {
                    setPages(res.data);
                    
                    // Redirect to first page if no slug in URL
                    if (!slug && res.data.length > 0) {
                        navigate(`/pages/${res.data[0].slug}`);
                    }
                }
            } catch (err) {
                console.error("Помилка завантаження сторінок:", err);
            } finally {
                setLoadingList(false);
            }
        };

        loadPagesList();
    }, [navigate, slug]);

    useEffect(() => {
        if (!slug) return;

        const loadPageContent = async () => {
            setLoadingContent(true);
            setError('');
            try {
                const res = await fetchPageBySlug(slug);
                if (res.status === 'success' && res.data) {
                    setCurrentPage(res.data);
                } else {
                    setError(res.message || 'Не вдалося завантажити сторінку');
                }
            } catch (err) {
                setError('Помилка з\'єднання з сервером');
            } finally {
                setLoadingContent(false);
            }
        };

        loadPageContent();
    }, [slug]);

    return (
        <div style={{
            background: '#f8fafc',
            minHeight: '100vh',
            color: '#1e293b',
            fontFamily: "'Outfit', 'Inter', sans-serif",
            paddingBottom: '50px'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px 40px',
                background: '#fff',
                borderBottom: '1px solid #e2e8f0',
                position: 'sticky',
                top: 0,
                zIndex: 10
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button 
                        onClick={() => navigate('/')}
                        style={{
                            background: '#f1f5f9',
                            border: '1px solid #cbd5e1',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: '#475569',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#e2e8f0';
                            e.currentTarget.style.color = '#0f172a';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#f1f5f9';
                            e.currentTarget.style.color = '#475569';
                        }}
                    >
                        <BsArrowLeft size={18} />
                    </button>
                    <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e293b', letterSpacing: '0.5px' }}>
                        PC <span style={{ color: '#a5c926' }}>NEWS & INFO</span>
                    </div>
                </div>

                <button
                    onClick={() => navigate('/')}
                    style={{
                        padding: '10px 25px',
                        backgroundColor: '#a5c926',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '25px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        boxShadow: '0 4px 10px rgba(165, 201, 38, 0.2)',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 15px rgba(165, 201, 38, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 10px rgba(165, 201, 38, 0.2)';
                    }}
                >
                    Конфігуратор ПК
                </button>
            </div>

            {/* Content Body */}
            <div style={{
                maxWidth: '1400px',
                margin: '30px auto 0 auto',
                padding: '0 20px',
                display: 'grid',
                gridTemplateColumns: '350px 1fr',
                gap: '30px',
                alignItems: 'start'
            }}>
                
                {/* Sidebar Navigation */}
                <div style={{
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '20px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
                    position: 'sticky',
                    top: '100px'
                }}>
                    <h3 style={{
                        marginTop: 0,
                        marginBottom: '20px',
                        fontSize: '18px',
                        borderBottom: '1px solid #e2e8f0',
                        paddingBottom: '10px',
                        color: '#475569',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <BsJournalBookmarkFill style={{ color: '#a5c926' }} /> Розділи та Новини
                    </h3>

                    {loadingList ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>Завантаження...</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {pages.map((p) => {
                                const isActive = p.slug === slug;
                                const isNews = p.slug.startsWith('news-');

                                return (
                                    <div
                                        key={p.id}
                                        onClick={() => navigate(`/pages/${p.slug}`)}
                                        style={{
                                            padding: '14px 18px',
                                            borderRadius: '10px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            background: isActive ? '#f4f9e9' : '#fff',
                                            border: isActive ? '1px solid #dce8b0' : '1px solid #e2e8f0',
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isActive) {
                                                e.currentTarget.style.background = '#f8fafc';
                                                e.currentTarget.style.transform = 'translateX(5px)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isActive) {
                                                e.currentTarget.style.background = '#fff';
                                                e.currentTarget.style.transform = 'translateX(0)';
                                            }
                                        }}
                                    >
                                        <div style={{
                                            fontWeight: 'bold',
                                            color: isActive ? '#7a961a' : '#1e293b',
                                            fontSize: '14px',
                                            marginBottom: '6px',
                                            lineHeight: '1.4'
                                        }}>{p.title}</div>
                                        
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            fontSize: '11px',
                                            color: '#64748b'
                                        }}>
                                            <BsCalendarEvent size={12} />
                                            <span>{new Date(p.created_at).toLocaleDateString('uk-UA')}</span>
                                            <span style={{
                                                backgroundColor: isNews ? '#eff6ff' : '#f0fdf4',
                                                color: isNews ? '#2563eb' : '#16a34a',
                                                border: isNews ? '1px solid #dbeafe' : '1px solid #dcfce7',
                                                padding: '2px 8px',
                                                borderRadius: '20px',
                                                fontSize: '9px',
                                                fontWeight: 'bold',
                                                marginLeft: 'auto'
                                            }}>
                                                {isNews ? 'Новина' : 'Інфо'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Main Article Container */}
                <div style={{
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '40px',
                    minHeight: '600px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)'
                }}>
                    {loadingContent ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
                            <div style={{
                                width: '50px',
                                height: '50px',
                                border: '3px solid rgba(165, 201, 38, 0.1)',
                                borderTop: '3px solid #a5c926',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite',
                                marginBottom: '20px'
                            }} />
                            <div style={{ color: '#64748b' }}>Завантаження контенту...</div>
                        </div>
                    ) : error ? (
                        <div style={{ textAlign: 'center', padding: '100px 0' }}>
                            <h2 style={{ color: '#dc2626', marginBottom: '10px' }}>Помилка</h2>
                            <p style={{ color: '#64748b' }}>{error}</p>
                        </div>
                    ) : currentPage ? (
                        <article>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                color: '#64748b',
                                fontSize: '14px',
                                marginBottom: '15px'
                            }}>
                                <BsCalendarEvent />
                                <span>Опубліковано: {new Date(currentPage.created_at).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            </div>

                            <h1 style={{
                                fontSize: '36px',
                                fontWeight: 'bold',
                                color: '#0f172a',
                                marginTop: 0,
                                marginBottom: '25px',
                                lineHeight: '1.2',
                                borderBottom: '2px solid #f1f5f9',
                                paddingBottom: '20px'
                            }}>{currentPage.title}</h1>

                            <div style={{
                                fontSize: '17px',
                                color: '#334155',
                                lineHeight: '1.8',
                                whiteSpace: 'pre-wrap'
                            }}>
                                {currentPage.content}
                            </div>
                        </article>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '100px 0', color: '#64748b' }}>
                            <h2>Оберіть статтю або новину зі списку зліва</h2>
                        </div>
                    )}
                </div>
            </div>
            
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

export default PagesPage;

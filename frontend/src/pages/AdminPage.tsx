import {type CSSProperties, type ReactNode, useEffect, useState} from 'react';
import {fetchComponents, fetchOrders, deleteComponent, fetchAdminPages, deletePage} from '../services/api';
import type {PcComponent, DynamicPage} from '../types';
import {PC_CATEGORIES} from '../constants';
import AddComponentModal from '../components/AddComponentModal';
import AddPageModal from '../components/AddPageModal';

import {BsBoxArrowLeft, BsBoxSeam, BsCart3, BsGrid1X2, BsPerson, BsFileText} from "react-icons/bs";

interface AdminOrder {
    id: number;
    user_name: string;
    user_email: string;
    total_price: string;
    status: string;
    created_at: string;
}

export default function AdminPage() {
    const [components, setComponents] = useState<PcComponent[]>([]);
    const [orders, setOrders] = useState<AdminOrder[]>([]);
    const [pages, setPages] = useState<DynamicPage[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'components' | 'orders' | 'pages'>('dashboard');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingComponent, setEditingComponent] = useState<PcComponent | null>(null);
    const [isPageModalOpen, setIsPageModalOpen] = useState(false);
    const [editingPage, setEditingPage] = useState<DynamicPage | null>(null);

    const handleComponentAdded = async () => {
        setIsAddModalOpen(false);
        setEditingComponent(null);
        setLoading(true);
        const updatedComponents = await fetchComponents();
        setComponents(updatedComponents);
        setLoading(false);
    };

    const handlePageSaved = async () => {
        setIsPageModalOpen(false);
        setEditingPage(null);
        setLoading(true);
        const res = await fetchAdminPages();
        if (res.status === 'success' && Array.isArray(res.data)) {
            setPages(res.data);
        }
        setLoading(false);
    };

    const handleDeletePage = async (id: number) => {
        if (!confirm('Ви впевнені, що хочете видалити цю сторінку/новину?')) return;
        setLoading(true);
        const res = await deletePage(id);
        if (res.status === 'success') {
            const updated = await fetchAdminPages();
            if (updated.status === 'success' && Array.isArray(updated.data)) {
                setPages(updated.data);
            }
        } else {
            alert(res.message || 'Помилка видалення');
        }
        setLoading(false);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Ви впевнені, що хочете видалити цю деталь?')) return;
        setLoading(true);
        const res = await deleteComponent(id);
        if (res.status === 'success') {
            const updatedComponents = await fetchComponents();
            setComponents(updatedComponents);
        } else {
            alert(res.message || 'Помилка видалення');
        }
        setLoading(false);
    };
    useEffect(() => {
        const loadData = async () => {
            try {
                const [componentsData, ordersData, pagesData] = await Promise.all([
                    fetchComponents(),
                    fetchOrders(),
                    fetchAdminPages()
                ]);
                setComponents(componentsData || []);

                if (Array.isArray(ordersData)) {
                    setOrders(ordersData);
                } else if (ordersData && ordersData.data && Array.isArray(ordersData.data)) {
                    setOrders(ordersData.data);
                } else {
                    setOrders([]);
                }

                if (pagesData && pagesData.status === 'success' && Array.isArray(pagesData.data)) {
                    setPages(pagesData.data);
                } else {
                    setPages([]);
                }
            } catch (error) {
                console.error("Fetch error:", error);
                setOrders([]);
                setPages([]);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const totalComponents = components.length;
    const totalPrice = components.reduce((sum, item) => sum + parseFloat(item.price), 0);
    const avgPrice = totalComponents > 0 ? (totalPrice / totalComponents).toFixed(0) : 0;

    const categoryStats = PC_CATEGORIES.map(cat => ({
        name: cat.name,
        count: components.filter(c => c.category_id === cat.id).length
    })).filter(s => s.count > 0);

    const getCategoryName = (id: number) => {
        const category = PC_CATEGORIES.find(c => c.id === id);
        return category ? category.name : 'Невідомо';
    };

    const renderSidebarItem = (id: typeof activeTab, label: string, icon: ReactNode) => {
        const isActive = activeTab === id;
        return (
            <div
                onClick={() => setActiveTab(id)}
                style={{
                    padding: '16px 25px', cursor: 'pointer',
                    backgroundColor: isActive ? '#f8fbfc' : 'transparent',
                    borderRight: isActive ? '4px solid #a5c926' : '4px solid transparent',
                    color: isActive ? '#333' : '#666',
                    display: 'flex', alignItems: 'center', gap: '16px',
                    fontWeight: isActive ? 'bold' : 'normal',
                    transition: 'all 0.2s ease'
                }}
            >
                <div style={{display: 'flex', alignItems: 'center', color: isActive ? '#a5c926' : '#999'}}>
                    {icon}
                </div>
                {label}
            </div>
        );
    };

    return (
        <div style={{display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: '#f8fafc', fontFamily: 'Arial, sans-serif'}}>

            <div style={{
                width: '280px',
                backgroundColor: '#fff',
                borderRight: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column'
            }}>

                <div style={{padding: '25px', backgroundColor: '#f4f9e9', borderBottom: '1px solid #e2e8f0'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: '#fff',
                            border: '1px solid #dce8b0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#a5c926'
                        }}>
                            <BsPerson size={24}/>
                        </div>
                        <div>
                            <div style={{fontSize: '13px', color: '#64748b'}}>Панель керування</div>
                            <div style={{fontWeight: 'bold', color: '#1e293b', fontSize: '15px'}}>Admin</div>
                        </div>
                    </div>
                </div>

                <div style={{padding: '20px 0', flex: 1}}>
                    {renderSidebarItem('dashboard', 'Дашборд', <BsGrid1X2 size={20}/>)}
                    {renderSidebarItem('components', 'Комплектуючі', <BsBoxSeam size={20}/>)}
                    {renderSidebarItem('orders', 'Замовлення', <BsCart3 size={20}/>)}
                    {renderSidebarItem('pages', 'Сторінки / Новини', <BsFileText size={20}/>)}
                </div>

                <div style={{padding: '20px 25px', borderTop: '1px solid #e2e8f0'}}>
                    <a href="/" style={{
                        color: '#475569',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        fontWeight: 'bold',
                        transition: 'color 0.2s'
                    }}>
                        <BsBoxArrowLeft size={20} style={{color: '#94a3b8'}}/> Вийти на сайт
                    </a>
                </div>
            </div>

            <div style={{flex: 1, padding: '40px 60px', overflowY: 'auto'}}>

                {activeTab === 'dashboard' && (
                    <>
                        <h1 style={pageTitleStyle}>Загальна статистика</h1>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                            gap: '25px',
                            marginBottom: '40px'
                        }}>
                            <div style={cardStyle}>
                                <div style={cardLabelStyle}>Всього товарів</div>
                                <div style={cardValueStyle}>{totalComponents}</div>
                            </div>
                            <div style={cardStyle}>
                                <div style={cardLabelStyle}>Середня ціна</div>
                                <div style={cardValueStyle}>{avgPrice} ₴</div>
                            </div>
                            <div style={cardStyle}>
                                <div style={cardLabelStyle}>Всього замовлень</div>
                                <div style={cardValueStyle}>{orders.length}</div>
                            </div>
                        </div>

                        <h2 style={sectionTitleStyle}>Товарів за категоріями</h2>
                        <div style={cardStyle}>
                            {categoryStats.map(stat => (
                                <div key={stat.name}
                                     style={{display: 'flex', alignItems: 'center', marginBottom: '18px', gap: '20px'}}>
                                    <div style={{
                                        width: '180px',
                                        fontSize: '14px',
                                        color: '#475569',
                                        fontWeight: '600'
                                    }}>{stat.name}</div>
                                    <div style={{
                                        flex: 1,
                                        height: '8px',
                                        backgroundColor: '#f1f5f9',
                                        borderRadius: '4px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: `${(stat.count / totalComponents) * 100}%`,
                                            height: '100%',
                                            backgroundColor: '#a5c926',
                                            borderRadius: '4px'
                                        }}></div>
                                    </div>
                                    <div style={{
                                        width: '40px',
                                        fontSize: '15px',
                                        textAlign: 'right',
                                        fontWeight: 'bold',
                                        color: '#1e293b'
                                    }}>{stat.count}</div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {activeTab === 'components' && (
                    <>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '30px'
                        }}>
                            <h1 style={pageTitleStyle}>Управління комплектуючими</h1>
                            <button onClick={() => { setEditingComponent(null); setIsAddModalOpen(true); }}
                                    style={btnPrimaryStyle}>+ Додати деталь
                            </button>
                        </div>

                        <div style={{...cardStyle, padding: 0, overflow: 'hidden'}}>
                            {loading ? (
                                <div style={{padding: '60px', textAlign: 'center', color: '#64748b'}}>Завантаження
                                    товарів...</div>
                            ) : (
                                <table style={{width: '100%', borderCollapse: 'collapse'}}>
                                    <thead style={{backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0'}}>
                                    <tr>
                                        <th style={thStyle}>Назва</th>
                                        <th style={thStyle}>Категорія</th>
                                        <th style={thStyle}>Ціна</th>
                                        <th style={{...thStyle, textAlign: 'right'}}>Дії</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {components.map((item) => (
                                        <tr key={item.id} style={{borderBottom: '1px solid #f1f5f9'}}>
                                            <td style={{
                                                ...tdStyle,
                                                fontWeight: 'bold',
                                                color: '#1e293b'
                                            }}>{item.name}</td>
                                            <td style={tdStyle}>
                                                <span style={badgeStyle}>{getCategoryName(item.category_id)}</span>
                                            </td>
                                            <td style={{...tdStyle, color: '#1e293b', fontWeight: 'bold'}}>
                                                {parseFloat(item.price).toFixed(0)} ₴
                                            </td>
                                            <td style={{...tdStyle, textAlign: 'right', display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
                                                <button style={btnEditStyle} onClick={() => { setEditingComponent(item); setIsAddModalOpen(true); }}>Редагувати</button>
                                                <button style={{...btnEditStyle, color: '#dc2626', backgroundColor: '#fef2f2'}} onClick={() => handleDelete(item.id)}>Видалити</button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </>
                )}

                {activeTab === 'orders' && (
                    <>
                        <h1 style={pageTitleStyle}>Замовлення клієнтів</h1>

                        <div style={{...cardStyle, padding: 0, overflow: 'hidden'}}>
                            {loading ? (
                                <div style={{padding: '60px', textAlign: 'center', color: '#64748b'}}>Завантаження
                                    замовлень...</div>
                            ) : (
                                <table style={{width: '100%', borderCollapse: 'collapse'}}>
                                    <thead style={{backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0'}}>
                                    <tr>
                                        <th style={thStyle}>ID / Дата</th>
                                        <th style={thStyle}>Клієнт</th>
                                        <th style={thStyle}>Сума</th>
                                        <th style={thStyle}>Статус</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {orders.map((order) => (
                                        <tr key={order.id} style={{borderBottom: '1px solid #f1f5f9'}}>
                                            <td style={tdStyle}>
                                                <div style={{fontWeight: 'bold', color: '#1e293b'}}>#{order.id}</div>
                                                <div style={{fontSize: '12px', color: '#64748b', marginTop: '4px'}}>
                                                    {new Date(order.created_at).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td style={tdStyle}>
                                                <div style={{
                                                    fontWeight: 'bold',
                                                    color: '#1e293b'
                                                }}>{order.user_name}</div>
                                                <div style={{
                                                    fontSize: '12px',
                                                    color: '#64748b',
                                                    marginTop: '4px'
                                                }}>{order.user_email}</div>
                                            </td>
                                            <td style={{...tdStyle, color: '#1e293b', fontWeight: 'bold'}}>
                                                {parseFloat(order.total_price).toFixed(0)} ₴
                                            </td>
                                            <td style={tdStyle}>
                                                <span
                                                    style={order.status === 'processing' ? badgeProcessingStyle : badgeSavedStyle}>
                                                    {order.status === 'processing' ? 'В обробці' : 'Збережено'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {orders.length === 0 && (
                                        <tr>
                                            <td colSpan={4}
                                                style={{padding: '40px', textAlign: 'center', color: '#64748b'}}>
                                                Замовлень ще немає
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </>
                )}

                {activeTab === 'pages' && (
                    <>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '30px'
                        }}>
                            <h1 style={pageTitleStyle}>Управління сторінками та новинами</h1>
                            <button onClick={() => { setEditingPage(null); setIsPageModalOpen(true); }}
                                    style={btnPrimaryStyle}>+ Додати сторінку
                            </button>
                        </div>

                        <div style={{...cardStyle, padding: 0, overflow: 'hidden'}}>
                            {loading ? (
                                <div style={{padding: '60px', textAlign: 'center', color: '#64748b'}}>Завантаження сторінок...</div>
                            ) : (
                                <table style={{width: '100%', borderCollapse: 'collapse'}}>
                                    <thead style={{backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0'}}>
                                    <tr>
                                        <th style={thStyle}>Заголовок</th>
                                        <th style={thStyle}>Посилання</th>
                                        <th style={thStyle}>Дата створення</th>
                                        <th style={thStyle}>Статус</th>
                                        <th style={{...thStyle, textAlign: 'right'}}>Дії</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {pages.map((page) => (
                                        <tr key={page.id} style={{borderBottom: '1px solid #f1f5f9'}}>
                                            <td style={{
                                                ...tdStyle,
                                                fontWeight: 'bold',
                                                color: '#1e293b'
                                            }}>{page.title}</td>
                                            <td style={tdStyle}>
                                                <code style={{backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '12px'}}>/pages/{page.slug}</code>
                                            </td>
                                            <td style={tdStyle}>
                                                {new Date(page.created_at).toLocaleDateString('uk-UA')}
                                            </td>
                                            <td style={tdStyle}>
                                                <span style={page.is_published === 1 ? badgePublishedStyle : badgeDraftStyle}>
                                                    {page.is_published === 1 ? 'Опубліковано' : 'Чернетка'}
                                                </span>
                                            </td>
                                            <td style={{...tdStyle, textAlign: 'right', display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
                                                <button style={btnEditStyle} onClick={() => { setEditingPage(page); setIsPageModalOpen(true); }}>Редагувати</button>
                                                <button style={{...btnEditStyle, color: '#dc2626', backgroundColor: '#fef2f2'}} onClick={() => handleDeletePage(page.id)}>Видалити</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {pages.length === 0 && (
                                        <tr>
                                            <td colSpan={5} style={{padding: '40px', textAlign: 'center', color: '#64748b'}}>
                                                Сторінок ще немає
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </>
                )}
            </div>
            <AddComponentModal
                isOpen={isAddModalOpen}
                onClose={() => { setIsAddModalOpen(false); setEditingComponent(null); }}
                onSuccess={handleComponentAdded}
                componentToEdit={editingComponent}
            />
            <AddPageModal
                isOpen={isPageModalOpen}
                onClose={() => { setIsPageModalOpen(false); setEditingPage(null); }}
                onSuccess={handlePageSaved}
                pageToEdit={editingPage}
            />
        </div>
    );
}

const pageTitleStyle: CSSProperties = {
    margin: '0 0 30px 0',
    fontSize: '28px',
    color: '#1e293b',
    fontWeight: 'bold',
    letterSpacing: '-0.5px'
};
const sectionTitleStyle: CSSProperties = {margin: '0 0 20px 0', fontSize: '18px', color: '#1e293b', fontWeight: 'bold'};

const cardStyle: CSSProperties = {
    backgroundColor: '#fff',
    padding: '30px',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.03)'
};

const cardLabelStyle: CSSProperties = {
    color: '#64748b',
    fontSize: '14px',
    marginBottom: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
};
const cardValueStyle: CSSProperties = {fontSize: '32px', fontWeight: 'bold', color: '#1e293b'};

const btnPrimaryStyle: CSSProperties = {
    padding: '12px 28px', backgroundColor: '#a5c926', color: '#fff',
    border: 'none', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px',
    boxShadow: '0 4px 10px rgba(165, 201, 38, 0.2)'
};

const btnEditStyle: CSSProperties = {
    padding: '8px 20px', backgroundColor: '#f1f5f9', color: '#475569',
    border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold',
    transition: 'all 0.2s ease'
};

const thStyle: CSSProperties = {
    padding: '16px 25px', textAlign: 'left' as const, color: '#64748b',
    fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px'
};
const tdStyle: CSSProperties = {padding: '20px 25px', fontSize: '14px'};
const badgeStyle: CSSProperties = {
    backgroundColor: '#f4f9e9', color: '#7a961a', padding: '6px 12px',
    borderRadius: '20px', fontSize: '12px', fontWeight: 'bold',
    border: '1px solid #dce8b0'
};

const badgeProcessingStyle: CSSProperties = {
    ...badgeStyle,
    backgroundColor: '#fff7ed', color: '#c2410c', border: '1px solid #ffedd5'
};

const badgeSavedStyle: CSSProperties = {
    ...badgeStyle,
    backgroundColor: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0'
};

const badgePublishedStyle: CSSProperties = {
    ...badgeStyle,
    backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #d1fae5'
};

const badgeDraftStyle: CSSProperties = {
    ...badgeStyle,
    backgroundColor: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0'
};
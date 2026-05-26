import {type CSSProperties, type ReactNode, useEffect, useState} from 'react';
import {fetchComponents, fetchOrders, deleteComponent, fetchAdminPages, deletePage, updateAdminOrderStatus} from '../services/api';
import type {PcComponent, DynamicPage} from '../types';
import {PC_CATEGORIES} from '../constants';
import AddComponentModal from '../components/AddComponentModal';
import AddPageModal from '../components/AddPageModal';
import { useToast, ToastContainer } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import {BsBoxArrowLeft, BsBoxSeam, BsCart3, BsGrid1X2, BsPerson, BsFileText, BsCheck2, BsCheck2All} from "react-icons/bs";


interface AdminOrder {
    id: number;
    user_name: string;
    user_email: string;
    total_price: string;
    status: string;
    created_at: string;
    items?: {
        name: string;
        image_url: string;
        price_at_purchase: string;
    }[];
}

export default function AdminPage() {
    const { toasts, showToast, removeToast } = useToast();
    const [components, setComponents] = useState<PcComponent[]>([]);
    const [orders, setOrders] = useState<AdminOrder[]>([]);
    const [pages, setPages] = useState<DynamicPage[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'components' | 'orders' | 'pages'>('dashboard');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingComponent, setEditingComponent] = useState<PcComponent | null>(null);
    const [isPageModalOpen, setIsPageModalOpen] = useState(false);
    const [editingPage, setEditingPage] = useState<DynamicPage | null>(null);
    const [confirmState, setConfirmState] = useState<{ open: boolean; message: string; onConfirm: () => void }>({ open: false, message: '', onConfirm: () => {} });
    const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

    const openConfirm = (message: string, onConfirm: () => void) => {
        setConfirmState({ open: true, message, onConfirm });
    };
    const closeConfirm = () => setConfirmState(s => ({ ...s, open: false }));

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
        openConfirm('Ви впевнені, що хочете видалити цю сторінку/новину?', async () => {
            closeConfirm();
            setLoading(true);
            const res = await deletePage(id);
            if (res.status === 'success') {
                const updated = await fetchAdminPages();
                if (updated.status === 'success' && Array.isArray(updated.data)) {
                    setPages(updated.data);
                }
            } else {
                showToast(res.message || 'Помилка видалення', 'error');
            }
            setLoading(false);
        });
    };

    const handleStatusChange = async (orderId: number, newStatus: string) => {
        setLoading(true);
        const res = await updateAdminOrderStatus(orderId, newStatus);
        if (res.status === 'success') {
            const ordersData = await fetchOrders();
            if (Array.isArray(ordersData)) {
                setOrders(ordersData);
            } else if (ordersData && ordersData.data && Array.isArray(ordersData.data)) {
                setOrders(ordersData.data);
            } else {
                setOrders([]);
            }
        } else {
            showToast(res.message || 'Помилка оновлення статусу', 'error');
        }
        setLoading(false);
    };

    const handleDelete = async (id: number) => {
        openConfirm('Ви впевнені, що хочете видалити цю деталь?', async () => {
            closeConfirm();
            setLoading(true);
            const res = await deleteComponent(id);
            if (res.status === 'success') {
                const updatedComponents = await fetchComponents();
                setComponents(updatedComponents);
            } else {
                showToast(res.message || 'Помилка видалення', 'error');
            }
            setLoading(false);
        });
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
                    border: isActive ? '2px solid #a5c926' : '1px solid #e0e0e0',
                    borderRadius: '8px',
                    backgroundColor: isActive ? '#f4f9e9' : '#fff',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease',
                    boxShadow: isActive ? '0 0 10px rgba(165, 201, 38, 0.2)' : 'none'
                }}>
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '20px', backgroundColor: isActive ? '#f9f9f9' : 'transparent',
                    cursor: 'pointer'
                }}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '15px', fontWeight: 'bold', color: '#333'}}>
                        <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isActive ? '#a5c926' : '#666' }}>
                            {icon}
                        </div>
                        <span>{label}</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div style={{ backgroundColor: '#fafafa', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
            <ConfirmModal
                isOpen={confirmState.open}
                message={confirmState.message}
                onConfirm={confirmState.onConfirm}
                onCancel={closeConfirm}
                confirmLabel="Видалити"
            />
            <ToastContainer toasts={toasts} onRemove={removeToast} />
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px 40px',
                backgroundColor: '#fff',
                borderBottom: '1px solid #eee',
                marginBottom: '20px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                    <div style={{fontSize: '24px', fontWeight: 'bold', color: '#333'}}>ADMIN PANEL</div>
                    <button
                        onClick={() => window.location.href = '/'}
                        style={{
                            padding: '8px 20px', borderRadius: '20px',
                            backgroundColor: '#f1f1f1', color: '#333', border: 'none',
                            fontWeight: 'bold', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '8px'
                        }}>
                        <BsBoxArrowLeft size={18} /> На сайт
                    </button>
                </div>

                <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: '#f4f9e9',
                        border: '1px solid #dce8b0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#a5c926'
                    }}>
                        <BsPerson size={24}/>
                    </div>
                    <div style={{fontWeight: 'bold', color: '#333'}}>Адміністратор</div>
                </div>
            </div>

            <div style={{
                padding: '20px',
                maxWidth: '1400px',
                margin: '0 auto',
                display: 'flex',
                gap: '30px',
                alignItems: 'flex-start'
            }}>
                <div style={{
                    flex: '3',
                    position: 'sticky',
                    top: '20px'
                }}>
                    <div style={{marginBottom: '40px'}}>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                            {renderSidebarItem('dashboard', 'Дашборд', <BsGrid1X2 size={20}/>)}
                            {renderSidebarItem('components', 'Комплектуючі', <BsBoxSeam size={20}/>)}
                            {renderSidebarItem('orders', 'Замовлення', <BsCart3 size={20}/>)}
                            {renderSidebarItem('pages', 'Сторінки / Новини', <BsFileText size={20}/>)}
                        </div>
                    </div>
                </div>

                <div style={{
                    flex: '7',
                    border: '1px solid #e0e0e0',
                    padding: '30px',
                    borderRadius: '8px',
                    backgroundColor: '#fff',
                    minHeight: '600px'
                }}>
                    {activeTab === 'dashboard' && (
                        <>
                            <h2 style={{color: '#666', marginBottom: '20px', fontSize: '24px'}}>
                                Загальна статистика
                            </h2>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '20px',
                                marginBottom: '40px'
                            }}>
                                <div style={statCardStyle}>
                                    <div style={statLabelStyle}>Всього товарів</div>
                                    <div style={statValueStyle}>{totalComponents}</div>
                                </div>
                                <div style={statCardStyle}>
                                    <div style={statLabelStyle}>Середня ціна</div>
                                    <div style={statValueStyle}>{avgPrice} ₴</div>
                                </div>
                                <div style={statCardStyle}>
                                    <div style={statLabelStyle}>Всього замовлень</div>
                                    <div style={statValueStyle}>{orders.length}</div>
                                </div>
                            </div>

                            <h3 style={{color: '#666', marginBottom: '20px', fontSize: '20px'}}>
                                Товари категоріями
                            </h3>
                            <div style={{
                                padding: '20px', border: '1px solid #e0e0e0',
                                borderRadius: '8px', backgroundColor: '#f9f9f9'
                            }}>
                                {categoryStats.map(stat => (
                                    <div key={stat.name} style={{display: 'flex', alignItems: 'center', marginBottom: '15px', gap: '20px'}}>
                                        <div style={{
                                            width: '180px', fontSize: '14px', color: '#666', fontWeight: 'bold'
                                        }}>{stat.name}</div>
                                        <div style={{
                                            flex: 1, height: '8px', backgroundColor: '#eee',
                                            borderRadius: '4px', overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                width: `${(stat.count / totalComponents) * 100}%`,
                                                height: '100%', backgroundColor: '#a5c926', borderRadius: '4px'
                                            }}></div>
                                        </div>
                                        <div style={{
                                            width: '40px', fontSize: '15px', textAlign: 'right',
                                            fontWeight: 'bold', color: '#333'
                                        }}>{stat.count}</div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {activeTab === 'components' && (
                        <>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                                <h2 style={{color: '#666', margin: 0, fontSize: '24px'}}>
                                    Управління комплектуючими
                                </h2>
                                <button onClick={() => { setEditingComponent(null); setIsAddModalOpen(true); }}
                                        style={btnPrimaryStyle}>+ Додати деталь
                                </button>
                            </div>

                            <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
                                {loading ? (
                                    <div style={{padding: '40px', textAlign: 'center', color: '#666'}}>Завантаження товарів...</div>
                                ) : (
                                    <table style={{width: '100%', borderCollapse: 'collapse'}}>
                                        <thead style={{backgroundColor: '#f9f9f9', borderBottom: '1px solid #e0e0e0'}}>
                                        <tr>
                                            <th style={thStyle}>Назва</th>
                                            <th style={thStyle}>Категорія</th>
                                            <th style={thStyle}>Ціна</th>
                                            <th style={{...thStyle, textAlign: 'right'}}>Дії</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {components.map((item) => (
                                            <tr key={item.id} style={{borderBottom: '1px solid #eee'}}>
                                                <td style={{...tdStyle, fontWeight: 'bold', color: '#333'}}>{item.name}</td>
                                                <td style={tdStyle}>
                                                    <span style={badgeStyle}>{getCategoryName(item.category_id)}</span>
                                                </td>
                                                <td style={{...tdStyle, color: '#f1580c', fontWeight: 'bold'}}>
                                                    {parseFloat(item.price).toFixed(0)} ₴
                                                </td>
                                                <td style={{...tdStyle, textAlign: 'right'}}>
                                                    <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
                                                        <button style={btnEditStyle} onClick={() => { setEditingComponent(item); setIsAddModalOpen(true); }}>Редагувати</button>
                                                        <button style={{...btnEditStyle, color: '#e74c3c', border: '1px solid #fdf0ed', backgroundColor: '#fdf0ed'}} onClick={() => handleDelete(item.id)}>Видалити</button>
                                                    </div>
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
                            <h2 style={{color: '#666', marginBottom: '20px', fontSize: '24px'}}>
                                Замовлення клієнтів
                            </h2>

                            <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
                                {loading ? (
                                    <div style={{padding: '40px', textAlign: 'center', color: '#666'}}>Завантаження замовлень...</div>
                                ) : (
                                    <table style={{width: '100%', borderCollapse: 'collapse'}}>
                                        <thead style={{backgroundColor: '#f9f9f9', borderBottom: '1px solid #e0e0e0'}}>
                                        <tr>
                                            <th style={thStyle}>ID / Дата</th>
                                            <th style={thStyle}>Клієнт</th>
                                            <th style={thStyle}>Сума</th>
                                            <th style={thStyle}>Статус</th>
                                        </tr>
                                        </thead>
                                        {orders.length === 0 ? (
                                            <tbody>
                                                <tr>
                                                    <td colSpan={4} style={{padding: '40px', textAlign: 'center', color: '#999'}}>
                                                        Замовлень ще немає
                                                    </td>
                                                </tr>
                                            </tbody>
                                        ) : (
                                            orders.map((order) => (
                                                <tbody key={order.id} style={{
                                                    outline: expandedOrderId === order.id ? '2px solid #a5c926' : 'none',
                                                    outlineOffset: '-1px',
                                                    backgroundColor: expandedOrderId === order.id ? '#fdfdfd' : 'transparent'
                                                }}>
                                                    <tr style={{borderBottom: expandedOrderId === order.id ? 'none' : '1px solid #eee'}}>
                                                <td style={tdStyle}>
                                                    <div style={{fontWeight: 'bold', color: '#333'}}>#{order.id}</div>
                                                    <div style={{fontSize: '12px', color: '#999', marginTop: '4px'}}>
                                                        {new Date(order.created_at).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td style={tdStyle}>
                                                    <div style={{fontWeight: 'bold', color: '#333'}}>{order.user_name}</div>
                                                    <div style={{fontSize: '12px', color: '#999', marginTop: '4px'}}>{order.user_email}</div>
                                                </td>
                                                <td style={{...tdStyle, color: '#f1580c', fontWeight: 'bold'}}>
                                                    {parseFloat(order.total_price).toFixed(0)} ₴
                                                </td>
                                                <td style={tdStyle}>
                                                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                                        <span style={
                                                            order.status === 'processing' ? badgeProcessingStyle :
                                                            order.status === 'accepted' ? badgeAcceptedStyle :
                                                            order.status === 'completed' ? badgePublishedStyle :
                                                            badgeSavedStyle
                                                        }>
                                                            {order.status === 'processing' ? 'В обробці' :
                                                             order.status === 'accepted' ? 'Прийнято' :
                                                             order.status === 'completed' ? 'Виконано' :
                                                             'Збережено'}
                                                        </span>

                                                        {order.status === 'processing' && (
                                                            <button 
                                                                onClick={() => handleStatusChange(order.id, 'accepted')}
                                                                title="Прийняти замовлення"
                                                                style={{
                                                                    display: 'flex', alignItems: 'center', gap: '4px',
                                                                    padding: '6px 12px', borderRadius: '20px', cursor: 'pointer',
                                                                    border: 'none', backgroundColor: '#0284c7', color: '#fff',
                                                                    fontSize: '11px', fontWeight: 'bold', transition: 'all 0.2s',
                                                                    boxShadow: '0 2px 4px rgba(2, 132, 199, 0.2)'
                                                                }}
                                                            >
                                                                Прийняти <BsCheck2 size={14}/>
                                                            </button>
                                                        )}
                                                        {order.status === 'accepted' && (
                                                            <button 
                                                                onClick={() => handleStatusChange(order.id, 'completed')}
                                                                title="Позначити як виконано"
                                                                style={{
                                                                    display: 'flex', alignItems: 'center', gap: '4px',
                                                                    padding: '6px 12px', borderRadius: '20px', cursor: 'pointer',
                                                                    border: 'none', backgroundColor: '#16a34a', color: '#fff',
                                                                    fontSize: '11px', fontWeight: 'bold', transition: 'all 0.2s',
                                                                    boxShadow: '0 2px 4px rgba(22, 163, 74, 0.2)'
                                                                }}
                                                            >
                                                                Виконати <BsCheck2All size={14}/>
                                                            </button>
                                                        )}
                                                        <button 
                                                            onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                                                            style={{
                                                                marginLeft: '10px', padding: '6px 12px', borderRadius: '20px', cursor: 'pointer',
                                                                border: '1px solid #ccc', backgroundColor: '#fff', color: '#333',
                                                                fontSize: '11px', fontWeight: 'bold'
                                                            }}
                                                        >
                                                            {expandedOrderId === order.id ? 'Сховати деталі' : 'Деталі'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {expandedOrderId === order.id && order.items && (
                                                <tr style={{ backgroundColor: '#fdfdfd' }}>
                                                    <td colSpan={4} style={{ padding: '15px 20px', borderBottom: '1px solid #eee' }}>
                                                        <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#666' }}>Склад замовлення:</div>
                                                        {order.items.length > 0 ? (
                                                            <ul style={{ margin: 0, paddingLeft: '20px', color: '#333' }}>
                                                                {order.items.map((item, idx) => (
                                                                    <li key={idx} style={{ marginBottom: '5px', fontSize: '13px' }}>
                                                                        {item.name} — <span style={{ fontWeight: 'bold', color: '#f1580c' }}>{parseFloat(item.price_at_purchase).toFixed(0)} ₴</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            <div style={{ color: '#999', fontSize: '13px', fontStyle: 'italic' }}>
                                                                Вміст недоступний (товари були видалені до оновлення системи бази даних).
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            )}
                                                </tbody>
                                            ))
                                        )}
                                    </table>
                                )}
                            </div>
                        </>
                    )}

                    {activeTab === 'pages' && (
                        <>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                                <h2 style={{color: '#666', margin: 0, fontSize: '24px'}}>
                                    Управління сторінками
                                </h2>
                                <button onClick={() => { setEditingPage(null); setIsPageModalOpen(true); }}
                                        style={btnPrimaryStyle}>+ Додати сторінку
                                </button>
                            </div>

                            <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
                                {loading ? (
                                    <div style={{padding: '40px', textAlign: 'center', color: '#666'}}>Завантаження сторінок...</div>
                                ) : (
                                    <table style={{width: '100%', borderCollapse: 'collapse'}}>
                                        <thead style={{backgroundColor: '#f9f9f9', borderBottom: '1px solid #e0e0e0'}}>
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
                                            <tr key={page.id} style={{borderBottom: '1px solid #eee'}}>
                                                <td style={{...tdStyle, fontWeight: 'bold', color: '#333'}}>{page.title}</td>
                                                <td style={tdStyle}>
                                                    <code style={{backgroundColor: '#f1f1f1', padding: '4px 8px', borderRadius: '4px', fontSize: '12px'}}>/pages/{page.slug}</code>
                                                </td>
                                                <td style={tdStyle}>
                                                    {new Date(page.created_at).toLocaleDateString('uk-UA')}
                                                </td>
                                                <td style={tdStyle}>
                                                    <span style={page.is_published === 1 ? badgePublishedStyle : badgeDraftStyle}>
                                                        {page.is_published === 1 ? 'Опубліковано' : 'Чернетка'}
                                                    </span>
                                                </td>
                                                <td style={{...tdStyle, textAlign: 'right'}}>
                                                    <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
                                                        <button style={btnEditStyle} onClick={() => { setEditingPage(page); setIsPageModalOpen(true); }}>Редагувати</button>
                                                        <button style={{...btnEditStyle, color: '#e74c3c', border: '1px solid #fdf0ed', backgroundColor: '#fdf0ed'}} onClick={() => handleDeletePage(page.id)}>Видалити</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {pages.length === 0 && (
                                            <tr>
                                                <td colSpan={5} style={{padding: '40px', textAlign: 'center', color: '#999'}}>
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
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </div>
    );
}

const statCardStyle: CSSProperties = {
    padding: '20px', border: '1px solid #e0e0e0',
    borderRadius: '8px', backgroundColor: '#f9f9f9'
};

const statLabelStyle: CSSProperties = {
    color: '#666', fontSize: '14px', marginBottom: '10px'
};

const statValueStyle: CSSProperties = {
    fontWeight: 'bold', fontSize: '28px', color: '#333'
};

const btnPrimaryStyle: CSSProperties = {
    padding: '10px 25px', backgroundColor: '#a5c926', color: '#fff',
    border: 'none', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px',
};

const btnEditStyle: CSSProperties = {
    padding: '8px 15px', borderRadius: '20px',
    border: '1px solid #ccc', background: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold'
};

const thStyle: CSSProperties = {
    padding: '15px 20px', textAlign: 'left', color: '#666',
    fontSize: '14px', fontWeight: 'bold'
};
const tdStyle: CSSProperties = {padding: '15px 20px', fontSize: '14px'};

const badgeStyle: CSSProperties = {
    backgroundColor: '#f4f9e9', color: '#7a961a', padding: '6px 12px',
    borderRadius: '20px', fontSize: '12px', fontWeight: 'bold',
    border: '1px solid #dce8b0'
};

const badgeProcessingStyle: CSSProperties = {
    ...badgeStyle,
    backgroundColor: '#fdf0ed', color: '#e74c3c', border: '1px solid #fadbd8'
};

const badgeSavedStyle: CSSProperties = {
    ...badgeStyle,
    backgroundColor: '#f1f1f1', color: '#666', border: '1px solid #ccc'
};

const badgePublishedStyle: CSSProperties = {
    ...badgeStyle,
    backgroundColor: '#e8f5e9', color: '#2e7d32', border: '1px solid #c8e6c9'
};

const badgeAcceptedStyle: CSSProperties = {
    ...badgeStyle,
    backgroundColor: '#f0f9ff', color: '#0284c7', border: '1px solid #bae6fd'
};

const badgeDraftStyle: CSSProperties = {
    ...badgeStyle,
    backgroundColor: '#f1f1f1', color: '#666', border: '1px solid #ccc'
};

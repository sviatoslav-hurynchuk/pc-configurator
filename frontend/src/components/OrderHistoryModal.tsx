import { useEffect, useState } from 'react';
import {fetchUserOrders, updateOrderStatus} from '../services/api';
import { useToast, ToastContainer } from './Toast';

interface OrderHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function OrderHistoryModal({ isOpen, onClose }: OrderHistoryModalProps) {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const { toasts, showToast, removeToast } = useToast();

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            fetchUserOrders()
                .then(res => {
                    if (res.status === 'success') {
                        setOrders(res.orders);
                    }
                })
                .finally(() => setLoading(false));
        }
    }, [isOpen]);

    if (!isOpen) return null;
    const handleCheckoutSaved = async (orderId: number) => {
        try {
            const res = await updateOrderStatus(orderId, 'processing');
            if (res.status === 'success') {
                showToast('Замовлення успішно оформлено!', 'success');
                const updatedOrders = await fetchUserOrders();
                if (updatedOrders.status === 'success') {
                    setOrders(updatedOrders.orders);
                }
            } else {
                showToast(res.message || 'Помилка', 'error');
            }
        } catch (err) {
            showToast('Помилка з\'єднання з сервером', 'error');
        }
    };
    return (
        <>
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div style={{
                backgroundColor: '#fff', padding: '30px', borderRadius: '12px',
                width: '600px', maxWidth: '90%', maxHeight: '85vh', display: 'flex',
                flexDirection: 'column', position: 'relative'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '-15px', right: '-15px', width: '36px', height: '36px',
                        backgroundColor: '#fff', border: '1px solid #e3e3e3', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        fontSize: '16px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                    }}
                >
                    ✕
                </button>

                <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#333' }}>Мої збережені збірки</h2>

                <div style={{ overflowY: 'auto', flex: 1, paddingRight: '10px' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>Завантаження...</div>
                    ) : orders.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>У вас ще немає збережених збірок.</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {orders.map(order => (
                                <div key={order.id} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '20px', backgroundColor: '#fdfdfd' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>
                                        <div>
                                            <div style={{ fontWeight: 'bold', color: '#333' }}>Збірка #{order.id}</div>
                                            <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                                                {new Date(order.created_at).toLocaleString('uk-UA')}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                padding: '4px 10px',
                                                borderRadius: '12px',
                                                display: 'inline-block',
                                                ...(order.status === 'processing'
                                                    ? { backgroundColor: '#fff9e6', color: '#d4a017' }
                                                    : order.status === 'accepted'
                                                    ? { backgroundColor: '#f0f9ff', color: '#0284c7' }
                                                    : order.status === 'completed'
                                                    ? { backgroundColor: '#e8f5e9', color: '#2e7d32' }
                                                    : { backgroundColor: '#f4f9e9', color: '#a5c926' })
                                            }}>
                                                {order.status === 'processing' ? 'В обробці'
                                                    : order.status === 'accepted' ? 'Прийнято'
                                                    : order.status === 'completed' ? 'Виконано'
                                                    : 'Збережено'}
                                            </div>
                                            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f1580c', marginTop: '5px' }}>
                                                {parseFloat(order.total_price).toFixed(0)} ₴
                                            </div>

                                            {order.status === 'saved' && (
                                                <button
                                                    onClick={() => handleCheckoutSaved(order.id)}
                                                    style={{
                                                        marginTop: '10px', padding: '6px 15px', backgroundColor: '#a5c926',
                                                        color: 'white', border: 'none', borderRadius: '20px',
                                                        fontWeight: 'bold', cursor: 'pointer', fontSize: '13px'
                                                    }}
                                                >
                                                    Купити зараз
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {order.items.map((item: any, idx: number) => (
                                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                                <span style={{ color: '#555' }}>- {item.name}</span>
                                                <span style={{ fontWeight: 'bold', color: '#333' }}>{parseFloat(item.price_at_purchase).toFixed(0)} ₴</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>);
}
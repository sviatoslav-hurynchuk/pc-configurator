import type { PcComponent } from '../types';
import { PC_CATEGORIES } from '../constants';

interface BuildOverviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    build: Record<number, PcComponent>;
    totalItems: number;
    onSelectCategory: (categoryId: number) => void;
}

export default function BuildOverviewModal({ isOpen, onClose, build, totalItems, onSelectCategory }: BuildOverviewModalProps) {
    if (!isOpen) return null;

    const coreCategoryIds = [1, 2, 3, 4];
    const otherCategories = PC_CATEGORIES.filter(c => !coreCategoryIds.includes(c.id));

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div style={{
                backgroundColor: '#fff', borderRadius: '12px',
                width: '1000px', maxWidth: '95%', maxHeight: '90vh',
                position: 'relative', display: 'flex'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '-15px', right: '-15px', width: '40px', height: '40px',
                        backgroundColor: '#fff', border: '1px solid #e3e3e3', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        fontSize: '18px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', zIndex: 10
                    }}
                >
                    ✕
                </button>

                <div style={{ flex: '1', padding: '30px', borderRight: '1px solid #eee' }}>
                    <h2 style={{ margin: '0 0 10px 0', fontSize: '22px' }}>Основа збірки</h2>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                        <span style={{ fontSize: '14px', color: '#666' }}>
                            Уся ваша збірка: <strong style={{ color: '#a5c926' }}>{totalItems} / {PC_CATEGORIES.length}</strong>
                        </span>
                        <div style={{ flex: 1, height: '6px', backgroundColor: '#eee', borderRadius: '3px' }}>
                            <div style={{
                                width: `${(totalItems / PC_CATEGORIES.length) * 100}%`,
                                height: '100%', backgroundColor: '#a5c926', borderRadius: '3px'
                            }}></div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {coreCategoryIds.map(catId => {
                            const category = PC_CATEGORIES.find(c => c.id === catId);
                            const item = build[catId];
                            if (!category) return null;

                            return (
                                <div key={catId} style={{ display: 'flex', alignItems: 'center', padding: '15px 0', borderBottom: '1px dashed #eee' }}>
                                    <div style={{ width: '40px', display: 'flex', justifyContent: 'center', color: '#666' }}>{category.icon}</div>
                                    <div style={{ flex: 1, paddingLeft: '15px' }}>
                                        <div style={{ fontSize: '12px', color: '#888' }}>{category.name}</div>
                                        {item ? (
                                            <div style={{ fontWeight: 'bold', fontSize: '14px', marginTop: '4px' }}>{item.name}</div>
                                        ) : (
                                            <div style={{ fontWeight: 'bold', fontSize: '14px', marginTop: '4px', color: '#ccc' }}>Не обрано</div>
                                        )}
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        {item ? (
                                            <>
                                                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{parseFloat(item.price).toFixed(0)} ₴</div>
                                                <button onClick={() => onSelectCategory(catId)} style={{ padding: '6px 12px', border: '1px solid #ddd', borderRadius: '20px', background: '#fff', fontSize: '12px', cursor: 'pointer', marginTop: '5px' }}>Замінити</button>
                                            </>
                                        ) : (
                                            <button onClick={() => onSelectCategory(catId)} style={{ padding: '6px 15px', border: '1px solid #ccc', borderRadius: '20px', background: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>Обрати</button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div style={{ flex: '1', padding: '30px', overflowY: 'auto' }}>
                    <h2 style={{ margin: '0 0 25px 0', fontSize: '18px' }}>Інші комплектуючі:</h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {otherCategories.map(category => {
                            const item = build[category.id];

                            return (
                                <div key={category.id} style={{ display: 'flex', alignItems: 'center', borderBottom: '1px dashed #eee', paddingBottom: '15px' }}>
                                    <div style={{ width: '30px', color: '#666' }}>{category.icon}</div>
                                    <div style={{ flex: 1, paddingLeft: '15px' }}>
                                        <div style={{ fontSize: '12px', color: '#888' }}>{category.name}</div>
                                        {item && <div style={{ fontSize: '14px', marginTop: '2px' }}>{item.name}</div>}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        {item ? (
                                            <>
                                                <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{parseFloat(item.price).toFixed(0)} ₴</div>
                                                <button onClick={() => onSelectCategory(category.id)} style={{ padding: '6px 12px', border: '1px solid #ddd', borderRadius: '20px', background: '#fff', fontSize: '12px', cursor: 'pointer' }}>Замінити</button>
                                            </>
                                        ) : (
                                            <button onClick={() => onSelectCategory(category.id)} style={{ padding: '6px 15px', border: '1px solid #ccc', borderRadius: '20px', background: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>Обрати</button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
}
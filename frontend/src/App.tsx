import { useState, useEffect } from 'react';
import { fetchComponents } from './services/api';
import type { PcComponent } from './types';
import { PC_CATEGORIES } from './constants';

function App() {
    const [components, setComponents] = useState<PcComponent[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const [build, setBuild] = useState<Record<number, PcComponent>>({});
    const [activeCategory, setActiveCategory] = useState<number | null>(null);

    useEffect(() => {
        const loadData = async () => {
            const data = await fetchComponents();
            setComponents(data);
            setLoading(false);
        };
        loadData();
    }, []);

    const addToBuild = (item: PcComponent) => {
        setBuild(prevBuild => ({
            ...prevBuild,
            [item.category_id]: item
        }));
        setActiveCategory(null);
    };

    const removeComponent = (categoryId: number) => {
        setBuild(prev => {
            const newBuild = { ...prev };
            delete newBuild[categoryId];
            return newBuild;
        });
    };

    const totalPrice = Object.values(build).reduce((sum, item) => sum + parseFloat(item.price), 0);
    const totalItems = Object.values(build).length;

    if (loading) return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>Завантаження...</h2>;

    const basicCategories = PC_CATEGORIES.filter(c => [1, 2, 3, 4].includes(c.id));
    const mandatoryCategories = PC_CATEGORIES.filter(c => [5, 6, 7, 8, 10, 11].includes(c.id));

    const renderCategoryGroup = (title: string, categories: typeof PC_CATEGORIES) => (
        <div style={{ marginBottom: '40px' }}>
            <h3 style={{ color: '#666', marginBottom: '15px', fontSize: '20px' }}>
                {title} <span style={{ color: '#a5c926' }}>*</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {categories.map(category => {
                    const selectedItem = build[category.id];
                    const isExpanded = activeCategory === category.id;
                    const categoryProducts = components.filter(c => c.category_id === category.id);

                    return (
                        <div key={category.id} style={{
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            backgroundColor: selectedItem && !isExpanded ? '#f4f9e9' : '#fff',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '20px', backgroundColor: isExpanded ? '#f9f9f9' : 'transparent',
                                cursor: 'pointer'
                            }} onClick={() => setActiveCategory(isExpanded ? null : category.id)}>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', fontWeight: 'bold' }}>
                                    <div style={{ width: '40px', height: '40px', border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {category.icon}
                                    </div>
                                    <span>{category.name}</span>
                                </div>

                                {selectedItem && !isExpanded ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                        <span style={{ fontSize: '14px' }}>{selectedItem.name}</span>
                                        <strong style={{ whiteSpace: 'nowrap' }}>{selectedItem.price} ₴</strong>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setActiveCategory(category.id); }}
                                            style={{ padding: '8px 15px', borderRadius: '20px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <span>🔄</span> Замінити
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); removeComponent(category.id); }}
                                            style={{ padding: '8px 15px', borderRadius: '20px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}>
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        style={{ padding: '10px 20px', borderRadius: '20px', border: 'none', background: isExpanded ? '#e0e0e0' : '#f1f1f1', fontWeight: 'bold', cursor: 'pointer' }}
                                    >
                                        {isExpanded ? 'Згорнути' : '+ Додати'}
                                    </button>
                                )}
                            </div>

                            {isExpanded && (
                                <div style={{ padding: '20px', borderTop: '1px solid #e0e0e0' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <tbody>
                                        {categoryProducts.map(product => (
                                            <tr key={product.id} style={{ borderBottom: '1px solid #eee' }}>
                                                <td style={{ padding: '15px 0' }}>
                                                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{product.name}</div>
                                                </td>
                                                <td style={{ textAlign: 'center', color: '#f39c12' }}>★ 4.8</td>
                                                <td style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '16px' }}>{product.price} ₴</td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <button
                                                        onClick={() => addToBuild(product)}
                                                        style={{ padding: '8px 20px', borderRadius: '20px', border: '1px solid #ccc', background: '#fff', fontWeight: 'bold', cursor: 'pointer', marginLeft: '15px' }}>
                                                        + Обрати
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1400px', margin: '0 auto', display: 'flex', gap: '30px', alignItems: 'flex-start' }}>

            <div style={{ flex: '7' }}>
                <h1 style={{ fontSize: '24px', marginBottom: '30px' }}>Конфігуратор комп'ютера</h1>

                {renderCategoryGroup('Базові', basicCategories)}
                {renderCategoryGroup('Обов\'язкові', mandatoryCategories)}
            </div>

            <div style={{ flex: '3', padding: '25px', height: 'fit-content', position: 'sticky', top: '20px', backgroundColor: '#fff' }}>

                <span>Уся ваша збірка: <strong>{totalItems} / {PC_CATEGORIES.length}</strong></span>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '14px' }}>

                    <a href="#" style={{ color: '#000', textDecoration: 'none', fontWeight: 'bold' }}>Дивитись збірку</a>

                </div>



                <div style={{ width: '100%', height: '6px', backgroundColor: '#eee', borderRadius: '3px', marginBottom: '20px' }}>

                    <div style={{ width: `${(totalItems / PC_CATEGORIES.length) * 100}%`, height: '100%', backgroundColor: '#a5c926', borderRadius: '3px', transition: 'width 0.3s ease' }}></div>

                </div>

                <div style={{ flex: '3', border: '1px solid #e0e0e0', padding: '25px', borderRadius: '8px', height: 'fit-content', position: 'sticky', top: '20px', backgroundColor: '#fff' }}>





                    <div style={{ padding: '15px', border: '1px solid #e0e0e0', borderRadius: '8px', marginBottom: '20px' }}>

                        <div style={{ color: '#a5c926', fontWeight: 'bold', marginBottom: '10px' }}>✓ Комплектуючі сумісні</div>

                        <div style={{ color: '#e74c3c', fontSize: '14px' }}>↓ {PC_CATEGORIES.length - totalItems} елементів не вистачає до повної збірки</div>

                    </div>



                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>

                        <h2 style={{ color: '#e67e22', margin: 0, fontSize: '28px' }}>{totalPrice.toFixed(0)} ₴</h2>

                        <button style={{ padding: '15px 40px', backgroundColor: '#a5c926', color: '#fff', border: 'none', borderRadius: '30px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>

                            Купити

                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default App;
import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchComponents, logoutUser, saveBuild } from '../services/api';
import type { ComponentSpecs, PcComponent } from '../types';
import { PC_CATEGORIES } from '../constants';
import { BsEmojiFrown, BsNewspaper, BsShieldShaded, BsList } from "react-icons/bs";
import { AuthContext } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';
import OrderHistoryModal from "../components/OrderHistoryModal";
import BuildOverviewModal from "../components/BuildOverviewModal";
import { useToast, ToastContainer } from '../components/Toast';

function ConfiguratorPage() {
    const navigate = useNavigate();
    const { toasts, showToast, removeToast } = useToast();
    const [components, setComponents] = useState<PcComponent[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const [build, setBuild] = useState<Record<number, PcComponent>>({});
    const [activeCategory, setActiveCategory] = useState<number | null>(null);

    const { user, setUser, loading: authLoading } = useContext(AuthContext);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const [isOrderHistoryModalOpen, setIsOrderHistoryModalOpen] = useState(false);
    const [isBuildOverviewModalOpen, setIsBuildOverviewModalOpen] = useState(false);
    const [orderLoading, setOrderLoading] = useState(false);

    const getComponentSpec = (component: PcComponent | undefined, key: string): string | null => {
        if (!component || !component.specs) return null;

        try {
            const rawSpecs = component.specs as unknown;

            const specsObj: ComponentSpecs = typeof rawSpecs === 'string'
                ? JSON.parse(rawSpecs)
                : component.specs;

            return specsObj[key] ? String(specsObj[key]) : null;
        } catch (e) {
            return null;
        }
    };

    const cpu = build[1];
    const mobo = build[2];
    const ram = build[4];

    const cpuSocket = getComponentSpec(cpu, 'socket');
    const moboSocket = getComponentSpec(mobo, 'socket');
    const ramType = getComponentSpec(ram, 'type');
    const moboRamType = getComponentSpec(mobo, 'ram_type');

    const psu = build[10];
    const psuWattageStr = getComponentSpec(psu, 'wattage');
    const psuWattage = psuWattageStr ? Number(psuWattageStr) : 0;

    const totalWattage = Object.values(build).reduce((sum, item) => {
        return sum + (Number(item.power_draw_watts) || 0);
    }, 0);

    const compatibilityErrors: string[] = [];

    if (cpuSocket && moboSocket && cpuSocket !== moboSocket) {
        compatibilityErrors.push(`Процесор (сокет ${cpuSocket}) не підходить до материнської плати (сокет ${moboSocket}).`);
    }

    if (moboRamType && ramType && moboRamType !== ramType) {
        compatibilityErrors.push(`Материнська плата підтримує ${moboRamType}, але обрано пам'ять ${ramType}.`);
    } else if ((cpuSocket === 'AM5' || moboSocket === 'AM5') && ramType && ramType !== 'DDR5') {
        compatibilityErrors.push(`Платформа AM5 підтримує лише пам'ять DDR5 (обрано ${ramType}).`);
    }

    if (psu && psuWattage > 0 && totalWattage > psuWattage) {
        compatibilityErrors.push(`Блоку живлення на ${psuWattage} Вт недостатньо! Система споживає ${totalWattage} Вт.`);
    } else if (psu && psuWattage > 0 && totalWattage > psuWattage * 0.9) {
        compatibilityErrors.push(`Блок живлення працюватиме на межі можливостей (${totalWattage} Вт / ${psuWattage} Вт). Рекомендуємо взяти потужніший.`);
    }
    const hasErrors = compatibilityErrors.length > 0;

    useEffect(() => {
        if (isAuthModalOpen || isOrderHistoryModalOpen || isBuildOverviewModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isAuthModalOpen, isOrderHistoryModalOpen, isBuildOverviewModalOpen]);

    useEffect(() => {
        const loadData = async () => {
            const data = await fetchComponents();
            setComponents(data);
            setLoading(false);
        };
        loadData()
            .catch(console.error);
    }, []);

    const handleLogout = async () => {
        await logoutUser();
        setUser(null);
    };

    const addToBuild = (item: PcComponent) => {
        setBuild(prevBuild => ({
            ...prevBuild,
            [item.category_id]: item
        }));
        setActiveCategory(null);
    };

    const removeComponent = (categoryId: number) => {
        setBuild(prev => {
            const newBuild = {...prev};
            delete newBuild[categoryId];
            return newBuild;
        });
    };

    const handleSaveBuild = async () => {
        if (!user) {
            setIsAuthModalOpen(true);
            return;
        }

        const componentIds = Object.values(build)
            .filter((item: any) => item !== null)
            .map((item: any) => item.id);

        if (componentIds.length === 0) {
            showToast('Збірка порожня. Додайте хоча б одну деталь.', 'warning');
            return;
        }

        if (hasErrors) {
            showToast('Помилка сумісності! Перевірте обрані комплектуючі перед збереженням.', 'error');
            return;
        }

        setOrderLoading(true);
        try {
            const res = await saveBuild({ componentIds, totalPrice, status: 'saved' });
            if (res.status === 'success') {
                showToast('Збірку успішно збережено!', 'success');
            } else {
                showToast(res.message || 'Помилка збереження', 'error');
            }
        } catch (err) {
            showToast('Помилка з\'єднання з сервером', 'error');
        } finally {
            setOrderLoading(false);
        }
    };

    const handleBuyBuild = async () => {
        if (!user) {
            setIsAuthModalOpen(true);
            return;
        }

        const componentIds = Object.values(build)
            .filter((item: any) => item !== null)
            .map((item: any) => item.id);

        if (componentIds.length === 0) {
            showToast('Збірка порожня. Додайте хоча б одну деталь перед покупкою.', 'warning');
            return;
        }

        if (hasErrors) {
            showToast('Помилка сумісності! Перевірте обрані комплектуючі перед покупкою.', 'error');
            return;
        }

        setOrderLoading(true);
        try {
            const res = await saveBuild({ componentIds, totalPrice, status: 'processing' });
            if (res.status === 'success') {
                showToast('Замовлення успішно оформлено! Переходимо до оплати...', 'success');
                setBuild({});
                setActiveCategory(null);
            } else {
                showToast(res.message || 'Помилка оформлення замовлення', 'error');
            }
        } catch (err) {
            showToast('Помилка з\'єднання з сервером', 'error');
        } finally {
            setOrderLoading(false);
        }
    };

    const totalPrice = Object.values(build).reduce((sum, item) => sum + parseFloat(item.price), 0);
    const totalItems = Object.values(build).length;

    if (loading) return <h2 style={{textAlign: 'center', marginTop: '50px'}}>Завантаження...</h2>;

    const basicCategories = PC_CATEGORIES.filter(c => [1, 2, 3, 4].includes(c.id));
    const mandatoryCategories = PC_CATEGORIES.filter(c => [5, 6, 7, 8, 9, 10, 11].includes(c.id));
    const optionalCategories = PC_CATEGORIES.filter(c => [12, 13, 14].includes(c.id));

    const renderCategoryGroup = (title: string, categories: typeof PC_CATEGORIES) => (
        <div style={{marginBottom: '40px'}}>
            <h3 style={{color: '#666', marginBottom: '15px', fontSize: '20px'}}>
                {title} <span style={{color: '#a5c926'}}>*</span>
            </h3>

            <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                {categories.map(category => {
                    const selectedItem = build[category.id];
                    const isExpanded = activeCategory === category.id;
                    const categoryProducts = components.filter(c => c.category_id === category.id);

                    return (
                        <div key={category.id} id={`category-${category.id}`} style={{
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

                                <div style={{display: 'flex', alignItems: 'center', gap: '15px', fontWeight: 'bold'}}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {category.icon}
                                    </div>
                                    <span>{category.name}</span>
                                </div>

                                {selectedItem && !isExpanded ? (
                                    <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            {selectedItem.image_url && (
                                                <img 
                                                    src={selectedItem.image_url} 
                                                    alt={selectedItem.name}
                                                    style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '4px' }}
                                                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/40/40?random=1'; }}
                                                />
                                            )}
                                            <span style={{fontSize: '14px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={selectedItem.name}>{selectedItem.name}</span>
                                        </div>
                                        <div style={{textAlign: 'right', whiteSpace: 'nowrap'}}>
                                            <span style={{
                                                textDecoration: 'line-through',
                                                color: '#999',
                                                fontSize: '12px',
                                                display: 'block',
                                                marginBottom: '2px'
                                            }}>
                                                {(parseFloat(selectedItem.price) * 1.05).toFixed(0)} ₴
                                            </span>
                                            <strong style={{fontSize: '16px', color: '#f1580c'}}>
                                                {parseFloat(selectedItem.price).toFixed(0)} ₴
                                            </strong>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveCategory(category.id);
                                            }}
                                            style={{
                                                padding: '8px 15px',
                                                borderRadius: '20px',
                                                border: '1px solid #ccc',
                                                background: '#fff',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px'
                                            }}>
                                            Замінити
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeComponent(category.id);
                                            }}
                                            style={{
                                                padding: '8px 15px',
                                                borderRadius: '20px',
                                                border: '1px solid #ccc',
                                                background: '#fff',
                                                cursor: 'pointer'
                                            }}>
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        style={{
                                            padding: '10px 20px',
                                            borderRadius: '20px',
                                            border: 'none',
                                            background: isExpanded ? '#e0e0e0' : '#f1f1f1',
                                            fontWeight: 'bold',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {isExpanded ? 'Згорнути' : '+ Додати'}
                                    </button>
                                )}
                            </div>

                            {isExpanded && (
                                <div style={{padding: '20px', borderTop: '1px solid #e0e0e0'}}>
                                    <table style={{width: '100%', borderCollapse: 'collapse'}}>
                                        <tbody>
                                        {categoryProducts.map(product => (
                                            <tr key={product.id} style={{borderBottom: '1px solid #eee'}}>
                                                <td style={{padding: '15px 0'}}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                        {product.image_url && (
                                                            <img 
                                                                src={product.image_url} 
                                                                alt={product.name}
                                                                style={{ width: '50px', height: '50px', objectFit: 'contain', borderRadius: '4px' }}
                                                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/50/50?random=1'; }}
                                                            />
                                                        )}
                                                        <div style={{
                                                            fontWeight: 'bold',
                                                            fontSize: '14px'
                                                        }}>{product.name}</div>
                                                    </div>
                                                </td>
                                                <td style={{textAlign: 'right'}}>
                                                    <span style={{
                                                        textDecoration: 'line-through',
                                                        color: '#999',
                                                        fontSize: '12px',
                                                        display: 'block',
                                                        marginBottom: '2px'
                                                    }}>
                                                        {(parseFloat(product.price) * 1.05).toFixed(0)} ₴
                                                    </span>
                                                    <strong style={{
                                                        fontWeight: 'bold',
                                                        fontSize: '16px',
                                                        color: '#f1580c'
                                                    }}>
                                                        {parseFloat(product.price).toFixed(0)} ₴
                                                    </strong>
                                                </td>
                                                <td style={{textAlign: 'right'}}>
                                                    <button
                                                        onClick={() => addToBuild(product)}
                                                        style={{
                                                            padding: '8px 20px',
                                                            borderRadius: '20px',
                                                            border: '1px solid #ccc',
                                                            background: '#fff',
                                                            fontWeight: 'bold',
                                                            cursor: 'pointer',
                                                            marginLeft: '15px'
                                                        }}>
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
        <>
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
                    <div style={{fontSize: '24px', fontWeight: 'bold', color: '#333'}}>PC CONFIGURATOR</div>
                    <button
                        onClick={() => navigate('/catalog')}
                        style={{
                            padding: '8px 20px', borderRadius: '20px',
                            backgroundColor: '#f1f1f1', color: '#333', border: 'none',
                            fontWeight: 'bold', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '8px'
                        }}>
                        <BsList size={18} /> Каталог
                    </button>
                    <button
                        onClick={() => navigate('/pages/about-us')}
                        style={{
                            padding: '8px 20px', borderRadius: '20px',
                            backgroundColor: '#f1f1f1', color: '#333', border: 'none',
                            fontWeight: 'bold', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '8px'
                        }}>
                        <BsNewspaper size={18} /> Новини & Інфо
                    </button>
                </div>

                <div>
                    {!authLoading && (
                        user ? (
                            <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                                <span>Привіт, <strong>{user.name}</strong>!</span>
                                {user.role === 'admin' && (
                                    <button
                                        onClick={() => navigate('/admin')}
                                        style={{
                                            padding: '8px 15px', borderRadius: '20px',
                                            backgroundColor: '#475569', color: '#fff', border: 'none',
                                            fontWeight: 'bold', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', gap: '6px',
                                        }}
                                    >
                                        <BsShieldShaded size={14} /> Панель адміна
                                    </button>
                                )}
                                <button
                                    onClick={() => navigate('/profile')}
                                    style={{
                                        padding: '8px 15px', borderRadius: '20px',
                                        backgroundColor: '#f1f1f1', color: '#333', border: 'none',
                                        fontWeight: 'bold', cursor: 'pointer'
                                    }}>
                                    Профіль
                                </button>
                                <button
                                    onClick={() => setIsOrderHistoryModalOpen(true)}
                                    style={{
                                        padding: '8px 15px', borderRadius: '20px',
                                        backgroundColor: '#a5c926', color: '#fff', border: 'none',
                                        fontWeight: 'bold', cursor: 'pointer'
                                    }}>
                                    Мої збірки
                                </button>
                                <button onClick={handleLogout} style={{
                                    padding: '8px 15px', borderRadius: '20px',
                                    border: '1px solid #ccc', background: '#fff', cursor: 'pointer'
                                }}>
                                    Вийти
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsAuthModalOpen(true)}
                                style={{
                                    padding: '10px 25px',
                                    backgroundColor: '#f5f5f5',
                                    border: 'none',
                                    borderRadius: '20px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                }}
                            >
                                Увійти / Реєстрація
                            </button>
                        )
                    )}
                </div>
            </div>
            <div style={{
                padding: '20px',
                fontFamily: 'Arial, sans-serif',
                maxWidth: '1400px',
                margin: '0 auto',
                display: 'flex',
                gap: '30px',
                alignItems: 'flex-start'
            }}>

                <div style={{flex: '7'}}>
                    {renderCategoryGroup('Базові', basicCategories)}
                    {renderCategoryGroup('Обов\'язкові', mandatoryCategories)}
                    {renderCategoryGroup('Додаткові', optionalCategories)}
                </div>

                <div style={{
                    flex: '3',
                    padding: '25px',
                    height: 'fit-content',
                    position: 'sticky',
                    top: '20px',
                    backgroundColor: '#fff'
                }}>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '15px',
                        fontSize: '14px'
                    }}>
                        <span>Уся ваша збірка: <strong>{totalItems} / {PC_CATEGORIES.length}</strong></span>
                        <button
                            onClick={() => setIsBuildOverviewModalOpen(true)}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#f5f5f5',
                                border: 'none',
                                borderRadius: '20px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                fontSize: '13px'
                            }}>
                            Дивитись збірку
                        </button>
                    </div>

                    <div style={{
                        width: '100%',
                        height: '6px',
                        backgroundColor: '#eee',
                        borderRadius: '3px',
                        marginBottom: '20px'
                    }}>

                        <div style={{
                            width: `${(totalItems / PC_CATEGORIES.length) * 100}%`,
                            height: '100%',
                            backgroundColor: '#a5c926',
                            borderRadius: '3px',
                            transition: 'width 0.3s ease'
                        }}></div>

                    </div>

                    <div style={{
                        flex: '3',
                        border: '1px solid #e0e0e0',
                        padding: '25px',
                        borderRadius: '8px',
                        height: 'fit-content',
                        position: 'sticky',
                        top: '20px',
                        backgroundColor: '#fff'
                    }}>

                        {totalItems === 0 ? (
                            <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                                <div style={{
                                    width: '45px', height: '45px', backgroundColor: '#f5f5f5',
                                    borderRadius: '50%', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', color: '#888'
                                }}>
                                    <BsEmojiFrown size={24}/>
                                </div>
                                <div>
                                    <div style={{color: '#888', fontSize: '14px', marginBottom: '4px'}}>Нічого не обрано</div>
                                    <div style={{fontWeight: 'bold', fontSize: '18px'}}>Почніть збирати свій ПК</div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {hasErrors ? (
                                    <div style={{
                                        padding: '15px', border: '1px solid #e74c3c',
                                        borderRadius: '8px', marginBottom: '20px', backgroundColor: '#fdf0ed'
                                    }}>
                                        <div style={{ color: '#e74c3c', fontWeight: 'bold', marginBottom: '10px' }}>
                                            Помилка сумісності!
                                        </div>
                                        <div style={{ color: '#c0392b', fontSize: '14px', lineHeight: '1.4' }}>
                                            {compatibilityErrors.map((err, index) => (
                                                <div key={index} style={{ marginBottom: '4px' }}>• {err}</div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{
                                        padding: '15px', border: '1px solid #e0e0e0',
                                        borderRadius: '8px', marginBottom: '20px'
                                    }}>
                                        <div style={{ color: '#a5c926', fontWeight: 'bold', marginBottom: '10px' }}>
                                            Комплектуючі сумісні
                                        </div>
                                        <div style={{ color: '#e74c3c', fontSize: '14px' }}>
                                            {PC_CATEGORIES.length - totalItems > 0
                                                ? `↓ ${PC_CATEGORIES.length - totalItems} елементів не вистачає до повної збірки`
                                                : `✓ Усі необхідні елементи зібрано!`}
                                        </div>
                                    </div>
                                )}

                                <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                                    {totalWattage > 0 && (
                                        <div style={{
                                            display: 'flex', justifyContent: 'space-between',
                                            alignItems: 'center', paddingBottom: '10px',
                                            borderBottom: '1px dashed #eee', fontSize: '14px'
                                        }}>
                                            <span style={{color: '#666'}}>Енергоспоживання:</span>
                                            <strong style={{
                                                color: (psu && totalWattage > psuWattage * 0.9) ? '#e74c3c' : '#333'
                                            }}>
                                                {totalWattage} Вт {psu ? `/ ${psuWattage} Вт` : ''}
                                            </strong>
                                        </div>
                                    )}
                                    <div style={{marginBottom: '5px'}}>
                                        <span style={{
                                            textDecoration: 'line-through',
                                            color: '#999',
                                            fontSize: '14px',
                                            display: 'block',
                                            marginBottom: '4px'
                                        }}>
                                            {(totalPrice * 1.05).toFixed(0)} ₴
                                        </span>
                                        <h2 style={{
                                            color: '#f1580c',
                                            margin: 0,
                                            fontSize: '28px'
                                        }}>{totalPrice.toFixed(0)} ₴</h2>
                                    </div>

                                    <button
                                        onClick={handleSaveBuild}
                                        disabled={hasErrors || orderLoading}
                                        style={{
                                            width: '100%', padding: '15px 40px',
                                            backgroundColor: hasErrors ? '#ccc' : (orderLoading ? '#bce03a' : '#a5c926'),
                                            color: '#fff', border: 'none', borderRadius: '30px',
                                            fontSize: '16px', fontWeight: 'bold',
                                            cursor: (hasErrors || orderLoading) ? 'not-allowed' : 'pointer',
                                            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px'
                                        }}>
                                        {orderLoading ? 'Збереження...' : 'Зберегти збірку'}
                                    </button>

                                    <button
                                        onClick={handleBuyBuild}
                                        disabled={hasErrors}
                                        style={{
                                            width: '100%', padding: '15px 40px',
                                            backgroundColor: hasErrors ? '#ccc' : '#a5c926',
                                            color: '#fff', border: 'none', borderRadius: '30px',
                                            fontSize: '16px', fontWeight: 'bold',
                                            cursor: hasErrors ? 'not-allowed' : 'pointer'
                                        }}>
                                        Купити
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
            <OrderHistoryModal isOpen={isOrderHistoryModalOpen} onClose={() => setIsOrderHistoryModalOpen(false)} />
            <ToastContainer toasts={toasts} onRemove={removeToast} />
            <BuildOverviewModal
                isOpen={isBuildOverviewModalOpen}
                onClose={() => setIsBuildOverviewModalOpen(false)}
                build={build}
                totalItems={totalItems}
                onSelectCategory={(categoryId) => {
                    setIsBuildOverviewModalOpen(false);
                    setActiveCategory(categoryId);

                    setTimeout(() => {
                        const element = document.getElementById(`category-${categoryId}`);
                        if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            element.style.transition = 'all 1s ease';
                            element.style.border = '2px solid #a5c926';
                            element.style.boxShadow = '0 0 15px rgba(165, 201, 38, 0.6)';

                            setTimeout(() => {
                                element.style.border = '1px solid #e0e0e0';
                                element.style.boxShadow = 'none';
                            }, 2000);
                        }
                    }, 100);
                }}
            />
        </>
    );
}

export default ConfiguratorPage;
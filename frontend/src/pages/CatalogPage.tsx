import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchComponents } from '../services/api';
import type { PcComponent } from '../types';
import { PC_CATEGORIES } from '../constants';
import ComponentCard from '../components/ComponentCard';
import { BsNewspaper } from 'react-icons/bs';

function CatalogPage() {
    const navigate = useNavigate();
    const [components, setComponents] = useState<PcComponent[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await fetchComponents();
                setComponents(data);
            } catch (error) {
                console.error("Failed to load components:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const filteredComponents = components.filter(comp => {
        const matchesSearch = comp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              (comp.description || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || comp.category_id === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div style={{ backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
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
                    <div style={{fontSize: '24px', fontWeight: 'bold', color: '#333'}}>PC CATALOG</div>
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

                <button
                    onClick={() => navigate('/')}
                    style={{
                        padding: '10px 25px',
                        backgroundColor: '#a5c926',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '20px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    Назад до Конфігуратора
                </button>
            </div>

            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
                
                <div style={{
                    display: 'flex', 
                    gap: '20px', 
                    marginBottom: '30px', 
                    backgroundColor: '#fff', 
                    padding: '20px', 
                    borderRadius: '8px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
                            Пошук (Search)
                        </label>
                        <input 
                            type="text" 
                            placeholder="Назва або опис..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 15px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                fontSize: '16px'
                            }}
                        />
                    </div>
                    
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
                            Категорія (Category)
                        </label>
                        <select 
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                            style={{
                                width: '100%',
                                padding: '10px 15px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                fontSize: '16px',
                                backgroundColor: '#fff'
                            }}
                        >
                            <option value="all">Усі категорії</option>
                            {PC_CATEGORIES.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <h2 style={{textAlign: 'center', marginTop: '50px', color: '#666'}}>Завантаження...</h2>
                ) : (
                    <div>
                        <div style={{ marginBottom: '15px', color: '#666' }}>
                            Знайдено компонентів: <strong>{filteredComponents.length}</strong>
                        </div>
                        
                        {filteredComponents.length > 0 ? (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                                gap: '20px',
                                paddingBottom: '40px'
                            }}>
                                {filteredComponents.map(item => (
                                    <ComponentCard 
                                        key={item.id} 
                                        item={item} 
                                    />
                                ))}
                            </div>
                        ) : (
                            <div style={{
                                textAlign: 'center', 
                                padding: '50px', 
                                backgroundColor: '#fff', 
                                borderRadius: '8px',
                                color: '#888'
                            }}>
                                <h3>За вашим запитом нічого не знайдено.</h3>
                                <p>Спробуйте змінити критерії пошуку.</p>
                                <button 
                                    onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
                                    style={{
                                        marginTop: '15px',
                                        padding: '10px 20px',
                                        backgroundColor: '#f1f1f1',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Скинути фільтри
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default CatalogPage;

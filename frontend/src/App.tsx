import { useState, useEffect } from 'react';
import { fetchComponents } from './services/api';
import ComponentCard from './components/ComponentCard';
import type {PcComponent} from './types';

function App() {
    // Вказуємо TS, що цей масив міститиме лише об'єкти PcComponent
    const [components, setComponents] = useState<PcComponent[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const loadData = async () => {
            const data = await fetchComponents();
            setComponents(data);
            setLoading(false);
        };

        loadData();
    }, []);

    if (loading) {
        return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>Loading catalog...</h2>;
    }

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
            <h1>PC Builder</h1>
            <p>Select components for your build.</p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '20px' }}>
                {components.length === 0 ? (
                    <p>No items found.</p>
                ) : (
                    components.map(item => (
                        <ComponentCard key={item.id} item={item} />
                    ))
                )}
            </div>
        </div>
    );
}

export default App;
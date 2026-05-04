import { useState, useEffect } from 'react';
import { fetchComponents } from './services/api';
import ComponentCard from './components/ComponentCard';
import type { PcComponent } from './types';

function App() {
    const [components, setComponents] = useState<PcComponent[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const [build, setBuild] = useState<Record<number, PcComponent>>({});

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
    };

    const totalPrice = Object.values(build).reduce((sum, item) => sum + parseFloat(item.price), 0);
    const totalPower = Object.values(build).reduce((sum, item) => sum + item.power_draw_watts, 0);

    if (loading) {
        return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>Loading catalog...</h2>;
    }

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '20px' }}>

            <div style={{ flex: '2' }}>
                <h1>PC Builder Catalog</h1>
                <p>Select components for your build.</p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '20px' }}>
                    {components.length === 0 ? (
                        <p>No items found.</p>
                    ) : (
                        components.map(item => (
                            <ComponentCard key={item.id} item={item} onAdd={() => addToBuild(item)} />
                        ))
                    )}
                </div>
            </div>

            <div style={{ flex: '1', backgroundColor: '#f1f2f6', padding: '20px', borderRadius: '8px', height: 'fit-content', position: 'sticky', top: '20px' }}>
                <h2>Your Build</h2>

                {Object.values(build).length === 0 ? (
                    <p style={{ color: '#7f8fa6' }}>No components selected yet.</p>
                ) : (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {Object.values(build).map(item => (
                            <li key={item.id} style={{ borderBottom: '1px solid #dcdde1', padding: '10px 0' }}>
                                <strong>{item.name}</strong> <br/>
                                <span style={{ color: '#2ecc71' }}>${item.price}</span> | <span style={{ color: '#e1b12c' }}>{item.power_draw_watts}W</span>
                            </li>
                        ))}
                    </ul>
                )}

                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '2px solid #2f3640' }}>
                    <h3>Total Price: <span style={{ color: '#2ecc71' }}>${totalPrice.toFixed(2)}</span></h3>
                    <h3>Estimated Power: <span style={{ color: '#e1b12c' }}>{totalPower}W</span></h3>

                    <button style={{
                        width: '100%', padding: '12px', marginTop: '10px',
                        backgroundColor: '#2ecc71', color: 'white', border: 'none',
                        borderRadius: '4px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold'
                    }} disabled={Object.values(build).length === 0}>
                        Save Build
                    </button>
                </div>
            </div>

        </div>
    );
}

export default App;
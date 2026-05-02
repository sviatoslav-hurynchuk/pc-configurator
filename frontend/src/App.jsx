import { useState, useEffect } from 'react';
import { fetchComponents } from './services/api';
import ComponentCard from './components/ComponentCard';

function App() {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchComponents();
      setComponents(data);
      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) {
    return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>Завантаження каталогу...</h2>;
  }

  return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
        <h1>Онлайн-Конфігуратор ПК</h1>
        <p>Оберіть комплектуючі для вашої збірки.</p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '20px' }}>
          {components.length === 0 ? (
              <p>Немає товарів у базі.</p>
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
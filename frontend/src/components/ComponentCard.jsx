export default function ComponentCard({ item }) {
    return (
        <div style={{
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '16px',
            margin: '10px',
            width: '250px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
            <img
                src={item.image_url}
                alt={item.name}
                style={{ width: '100%', height: '150px', objectFit: 'contain' }}
                onError={(e) => { e.target.src = 'https://picsum.photos/300/200?random=1'; }}
            />
            <h3 style={{ fontSize: '1.1rem', margin: '10px 0' }}>{item.name}</h3>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>{item.description}</p>
            <h2 style={{ color: '#2ecc71', margin: '10px 0' }}>${item.price}</h2>

            <div style={{ backgroundColor: '#f9f9f9', padding: '8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                <strong>Специфікації:</strong>
                <ul style={{ paddingLeft: '20px', margin: '5px 0' }}>
                    {item.specs && Object.entries(item.specs).map(([key, value]) => (
                        <li key={key}>{key}: {value}</li>
                    ))}
                </ul>
            </div>

            <button style={{
                width: '100%', padding: '10px', marginTop: '10px',
                backgroundColor: '#3498db', color: 'white', border: 'none',
                borderRadius: '4px', cursor: 'pointer'
            }}>
                Додати до збірки
            </button>
        </div>
    );
}
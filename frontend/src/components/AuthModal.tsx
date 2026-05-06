import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { loginUser, registerUser } from '../services/api';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const { setUser } = useContext(AuthContext);

    const [isLoginView, setIsLoginView] = useState(true);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            if (isLoginView) {
                const res = await loginUser({ email, password });
                if (res.status === 'success') {
                    setUser(res.user);
                    onClose();
                } else {
                    setError(res.message || 'Помилка входу');
                }
            } else {
                const res = await registerUser({ name, email, password });
                if (res.status === 'success') {
                    setUser(res.user);
                    onClose();
                } else {
                    setError(res.message || 'Помилка реєстрації');
                }
            }
        } catch (err) {
            setError('Сталася помилка з\'єднання з сервером');
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div style={{
                backgroundColor: '#fff', padding: '30px', borderRadius: '8px',
                width: '400px', maxWidth: '90%', position: 'relative'
            }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}
                >✕</button>

                <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>
                    {isLoginView ? 'Вхід в акаунт' : 'Реєстрація'}
                </h2>

                {error && <div style={{ color: 'red', marginBottom: '15px', textAlign: 'center', fontSize: '14px' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

                    {!isLoginView && (
                        <input
                            type="text" placeholder="Ваше ім'я" required
                            value={name} onChange={(e) => setName(e.target.value)}
                            style={{ padding: '12px', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                    )}

                    <input
                        type="email" placeholder="Email" required
                        value={email} onChange={(e) => setEmail(e.target.value)}
                        style={{ padding: '12px', border: '1px solid #ccc', borderRadius: '4px' }}
                    />

                    <input
                        type="password" placeholder="Пароль" required
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        style={{ padding: '12px', border: '1px solid #ccc', borderRadius: '4px' }}
                    />

                    <button type="submit" style={{
                        padding: '12px', backgroundColor: '#a5c926', color: 'white',
                        border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px'
                    }}>
                        {isLoginView ? 'Увійти' : 'Зареєструватися'}
                    </button>
                </form>

                <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
                    {isLoginView ? 'Немає акаунту? ' : 'Вже є акаунт? '}
                    <span
                        onClick={() => { setIsLoginView(!isLoginView); setError(''); }}
                        style={{ color: '#e67e22', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        {isLoginView ? 'Зареєструйтесь' : 'Увійдіть'}
                    </span>
                </div>
            </div>
        </div>
    );
}
import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { updateUserProfile, deleteUserAccount, logoutUser } from '../services/api';
import { BsList, BsNewspaper, BsShieldShaded } from 'react-icons/bs';

function ProfilePage() {
    const navigate = useNavigate();
    const { user, setUser, loading: authLoading } = useContext(AuthContext);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/');
        } else if (user) {
            setName(user.name);
            setEmail(user.email);
        }
    }, [user, authLoading, navigate]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!name.trim() || !email.trim()) {
            setError('Ім\'я та email обов\'язкові');
            return;
        }

        if (password) {
            if (password.length < 6) {
                setError('Пароль має бути не менше 6 символів');
                return;
            }
            if (password !== confirmPassword) {
                setError('Паролі не збігаються');
                return;
            }
        }

        setLoading(true);
        try {
            const data = await updateUserProfile({
                name: name.trim(),
                email: email.trim(),
                ...(password && { password })
            });

            if (data.status === 'success') {
                setUser(data.user);
                setSuccess('Профіль успішно оновлено!');
                setPassword('');
                setConfirmPassword('');
            } else {
                setError(data.message || 'Помилка оновлення профілю');
            }
        } catch (err) {
            setError('Помилка з\'єднання з сервером');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        const confirmDelete = window.confirm(
            'Ви дійсно бажаєте видалити свій акаунт? Цю дію неможливо скасувати, а всі ваші збірки будуть видалені назавжди.'
        );

        if (!confirmDelete) return;

        setLoading(true);
        try {
            const data = await deleteUserAccount();
            if (data.status === 'success') {
                setUser(null);
                alert('Ваш акаунт успішно видалено.');
                navigate('/');
            } else {
                setError(data.message || 'Помилка видалення акаунта');
            }
        } catch (err) {
            setError('Помилка з\'єднання з сервером');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logoutUser();
        setUser(null);
        navigate('/');
    };

    if (authLoading || !user) {
        return <h2 style={{ textAlign: 'center', marginTop: '50px', color: '#666' }}>Завантаження...</h2>;
    }

    return (
        <div style={{ backgroundColor: '#f9f9f9', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
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
                    <div 
                        onClick={() => navigate('/')} 
                        style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', cursor: 'pointer' }}
                    >
                        PC CONFIGURATOR
                    </div>
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

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
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
                    <button onClick={handleLogout} style={{
                        padding: '8px 15px', borderRadius: '20px',
                        border: '1px solid #ccc', background: '#fff', cursor: 'pointer'
                    }}>
                        Вийти
                    </button>
                </div>
            </div>

            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
                <div style={{
                    backgroundColor: '#fff',
                    padding: '30px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                    marginBottom: '30px'
                }}>
                    <h2 style={{ marginBottom: '20px', color: '#333', borderBottom: '2px solid #f1f1f1', paddingBottom: '10px' }}>
                        Профіль користувача
                    </h2>

                    {error && (
                        <div style={{
                            padding: '10px 15px',
                            backgroundColor: '#fdf0ed',
                            border: '1px solid #e74c3c',
                            color: '#e74c3c',
                            borderRadius: '4px',
                            marginBottom: '20px',
                            fontWeight: 'bold'
                        }}>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div style={{
                            padding: '10px 15px',
                            backgroundColor: '#f4f9e9',
                            border: '1px solid #a5c926',
                            color: '#5b7a13',
                            borderRadius: '4px',
                            marginBottom: '20px',
                            fontWeight: 'bold'
                        }}>
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleUpdate}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
                                Ім'я
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 15px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    fontSize: '16px',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 15px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    fontSize: '16px',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
                                Новий пароль (необов'язково)
                            </label>
                            <input
                                type="password"
                                placeholder="Залиште порожнім, якщо не бажаєте змінювати"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 15px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    fontSize: '16px',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '30px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
                                Підтвердження пароля
                            </label>
                            <input
                                type="password"
                                placeholder="Введіть новий пароль ще раз"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 15px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    fontSize: '16px',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    padding: '12px 30px',
                                    backgroundColor: loading ? '#ccc' : '#a5c926',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '30px',
                                    fontWeight: 'bold',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    fontSize: '16px'
                                }}
                            >
                                Зберегти зміни
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/')}
                                style={{
                                    padding: '12px 30px',
                                    backgroundColor: '#f1f1f1',
                                    color: '#333',
                                    border: 'none',
                                    borderRadius: '30px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    fontSize: '16px'
                                }}
                            >
                                Назад
                            </button>
                        </div>
                    </form>
                </div>

                {user.role !== 'admin' && (
                    <div style={{
                        backgroundColor: '#fff',
                        padding: '30px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                        border: '1px solid #f9d5d5'
                    }}>
                        <h3 style={{ color: '#e74c3c', marginBottom: '15px', fontSize: '18px' }}>
                            Небезпечна зона
                        </h3>
                        <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px', lineHeight: '1.5' }}>
                            Видалення акаунта призведе до повного та незворотного видалення вашого профілю, збережених збірок та всіх пов'язаних файлів.
                        </p>
                        <button
                            onClick={handleDeleteAccount}
                            disabled={loading}
                            style={{
                                padding: '12px 30px',
                                backgroundColor: loading ? '#ccc' : '#e74c3c',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '30px',
                                fontWeight: 'bold',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: '16px'
                            }}
                        >
                            Видалити акаунт
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProfilePage;

import {useState, useContext, type SyntheticEvent} from 'react';
import { AuthContext } from '../context/AuthContext';
import { loginUser, registerUser } from '../services/api';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CustomInput = ({ label, type = 'text', value, onChange, bgColor = '#fff', required = false, isError = false, errorMsg = '' }: any) => (
    <div style={{ position: 'relative', marginBottom: '16px' }}>
        <label style={{
            position: 'absolute', top: '-8px', left: '12px', background: bgColor,
            padding: '0 4px', fontSize: '12px', color: isError ? '#e74c3c' : '#777', zIndex: 1
        }}>
            {label}
        </label>
        <input
            type={type} required={required} value={value} onChange={onChange}
            style={{
                width: '100%', padding: '14px 15px', border: `1px solid ${isError ? '#e74c3c' : '#ccc'}`,
                borderRadius: '8px', boxSizing: 'border-box', backgroundColor: bgColor, outline: 'none',
                fontSize: '14px', color: '#333'
            }}
        />
        {isError && <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px' }}>{errorMsg}</div>}
    </div>
);

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const { setUser } = useContext(AuthContext);

    const [isLoginView, setIsLoginView] = useState(true);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const [hoverLogin, setHoverLogin] = useState(false);
    const [hoverRegister, setHoverRegister] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: SyntheticEvent) => {
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
            backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>

            <div style={{
                backgroundColor: '#fff', padding: '30px 40px', borderRadius: '12px',
                width: '300px', maxWidth: '90%', position: 'relative', maxHeight: '90vh'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '-20px',
                        right: '-20px',
                        width: '40px',
                        height: '40px',
                        backgroundColor: '#fff',
                        border: '1px solid #e3e3e3',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0,
                        margin: 0,
                        zIndex: 10,
                        cursor: 'pointer',
                        color: '#000',
                        fontSize: '16px',
                        outline: 'none'
                    }}
                >
                    ✕
                </button>
                <div style={{
                    display: 'flex', border: '1px solid #eee', borderRadius: '50px',
                    marginBottom: '25px'
                }}>

                    <button
                        type="button"
                        onClick={() => { setIsLoginView(true); setError(''); }}
                        onMouseEnter={() => setHoverLogin(true)}
                        onMouseLeave={() => setHoverLogin(false)}
                        style={{
                            flex: 1, padding: '10px', border: 'none', borderRadius: '50px',
                            backgroundColor: isLoginView || hoverLogin ? 'rgba(148, 184, 10, 0.1)' : 'transparent',
                            boxShadow: isLoginView || hoverLogin ? 'inset 0 0 2px #A2C617' : 'none',
                            fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s ease'
                        }}>
                        Вхід
                    </button>
                    <button
                        type="button"
                        onClick={() => { setIsLoginView(false); setError(''); }}
                        onMouseEnter={() => setHoverRegister(true)}
                        onMouseLeave={() => setHoverRegister(false)}
                        style={{
                            flex: 1, padding: '10px', border: 'none', borderRadius: '50px',
                            backgroundColor: !isLoginView || hoverRegister ? 'rgba(148, 184, 10, 0.1)' : 'transparent',
                            boxShadow: !isLoginView || hoverRegister ? 'inset 0 0 2px #A2C617' : 'none',
                            fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s ease'
                        }}>
                        Реєстрація
                    </button>
                </div>

                {error && <div style={{ color: '#e74c3c', marginBottom: '15px', textAlign: 'center', fontSize: '14px', fontWeight: 'bold' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>

                    {isLoginView ? (
                        <>
                            <CustomInput label="E-mail" type="email" value={email} onChange={(e: any) => setEmail(e.target.value)} required />
                            <CustomInput label="Пароль" type="password" value={password} onChange={(e: any) => setPassword(e.target.value)} required />

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', fontSize: '14px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input type="checkbox" defaultChecked style={{ accentColor: '#a5c926', width: '16px', height: '16px' }} />
                                    Запам'ятати пароль
                                </label>
                                <span style={{ color: '#666', borderBottom: '1px dashed #666', cursor: 'pointer' }}>Забув пароль</span>
                            </div>

                            <button type="submit" style={{
                                width: '100%', padding: '14px', backgroundColor: '#a5c926', color: 'white',
                                border: 'none', borderRadius: '30px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer'
                            }}>
                                Увійти
                            </button>
                        </>
                    ) : (
                        <>
                            <CustomInput label="Ім'я" value={name} onChange={(e: any) => setName(e.target.value)} required />
                            <CustomInput label="E-mail" type="email" value={email} onChange={(e: any) => setEmail(e.target.value)} required />
                            <CustomInput label="Пароль" type="password" value={password} onChange={(e: any) => setPassword(e.target.value)} required />

                            <button type="submit" style={{
                                width: '100%', padding: '14px', backgroundColor: '#111', color: 'white',
                                border: 'none', borderRadius: '30px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '10px'
                            }}>
                                Зареєструватися
                            </button>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
}
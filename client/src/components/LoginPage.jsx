/**
 * LoginPage – premium login form with the same green design system.
 */

import { useState } from 'react';

export default function LoginPage({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username.trim() || !password.trim()) {
            setError('Ingresa usuario y contraseña');
            return;
        }
        setError('');
        setLoading(true);
        try {
            await onLogin(username.trim(), password.trim());
        } catch (err) {
            setError(err.message || 'Error de autenticación');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-header">
                    <div className="login-brand-icon">EC</div>
                    <h1>Estadísticas de Cursos</h1>
                    <p>Inicia sesión para acceder al dashboard</p>
                </div>

                {error && <div className="login-error">{error}</div>}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="login-field">
                        <label htmlFor="username">
                            <span className="material-icons-outlined" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 6 }}>person</span>
                            Usuario
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Tu nombre de usuario"
                            autoComplete="username"
                            autoFocus
                        />
                    </div>

                    <div className="login-field">
                        <label htmlFor="password">
                            <span className="material-icons-outlined" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 6 }}>lock</span>
                            Contraseña
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Tu contraseña"
                            autoComplete="current-password"
                        />
                    </div>

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? (
                            <>
                                <span className="login-spinner" />
                                Ingresando…
                            </>
                        ) : (
                            <>
                                <span className="material-icons-outlined" style={{ fontSize: 18 }}>login</span>
                                Ingresar
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

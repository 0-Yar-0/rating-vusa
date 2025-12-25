import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Api } from '../api.js';
import { useAuth } from '../App.jsx';

export default function ChangePassword() {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [logoutAfter, setLogoutAfter] = useState(false);
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (newPassword !== confirm) {
            setError('Новые пароли не совпадают');
            return;
        }
        setBusy(true);
        try {
            await Api.changePassword({ oldPassword, newPassword });
            setSuccess('Пароль успешно изменён');
            setOldPassword('');
            setNewPassword('');
            setConfirm('');
            if (logoutAfter) {
                await logout();
                navigate('/login');
            }
        } catch (err) {
            setError(err.message || 'Ошибка');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1 className="auth-title">Сменить пароль</h1>
                <form onSubmit={handleSubmit} className="auth-form">
                    <input
                        className="auth-input"
                        type="password"
                        placeholder="Текущий пароль"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        required
                    />
                    <input
                        className="auth-input"
                        type="password"
                        placeholder="Новый пароль"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                    <input
                        className="auth-input"
                        type="password"
                        placeholder="Подтвердите новый пароль"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        required
                    />

                    <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input type="checkbox" checked={logoutAfter} onChange={(e) => setLogoutAfter(e.target.checked)} />
                        Выйти после смены пароля
                    </label>

                    {error && <div className="auth-error">{error}</div>}
                    {success && <div className="auth-success">{success}</div>}

                    <button className="primary-btn spinner-btn" type="submit" disabled={busy}>
                        {busy ? 'Сохранение...' : 'Сменить пароль'}
                    </button>
                </form>
            </div>
        </div>
    );
}
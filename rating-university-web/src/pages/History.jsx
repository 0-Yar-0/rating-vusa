import React, { useEffect, useState } from 'react';
import { Api } from '../api';

const STORAGE_KEY_ITERATION = 'selected_iteration';

export default function History({ items, setRows, selectedIteration, setSelectedIteration }) {
    // Удаление всей истории (как ты уже делал через Api.clearHistory)
    const handleClearHistory = async () => {
        if (!window.confirm('Точно удалить всю историю расчётов?')) return;
        try {
            await Api.clearHistory();
            localStorage.removeItem(STORAGE_KEY_ITERATION);
            setSelectedIteration(0)
        } catch (e) {
            alert('Ошибка при очистке истории: ' + (e?.message || e));
        }
    };

    const handleOpenIteration = (iter) => () => {
        setSelectedIteration(iter)
        localStorage.setItem(STORAGE_KEY_ITERATION, String(iter));
    };

    if (!items.length) {
        return (
            <div className="card">
                <h2>Сохранённые сессии</h2>
                <p>История пока пуста.</p>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="history-header">
                <h2>Сохранённые сессии</h2>
            </div>

            <div className="history-list">
                {items.sort((a, b) => b.iter - a.iter).map((it) => (
                    <div key={it.iter} className={`history-item ${it.iter === selectedIteration ? "selected" : ""}`} onClick={handleOpenIteration(it.iter)}>
                        <div className="history-main">
                            <span className="history-title">Расчёт #{it.iter}</span>
                            <span className="history-classes">Класс B</span>
                        </div>
                        <div className="history-summary">
                            {it.results?.map((row) => (
                                <span key={row.year} className="history-chip">
                                    {row.year}: {row.sumB.toFixed(2)}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="display-flex">
                <button className="secondary-btn" type="button" onClick={handleClearHistory}>
                    Очистить историю
                </button>
            </div>
        </div>
    );
}

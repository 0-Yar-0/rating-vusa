// src/components/ResultsTable.jsx
import React, { useState } from 'react';

export default function ResultsTable({
    rows,
    metricNames,
    onMetricNamesChange,
    visibleYears,
    onToggleYear,
}) {
    const [editingKey, setEditingKey] = useState(null);
    const [editValue, setEditValue] = useState('');

    const startEdit = (key, current) => {
        setEditingKey(key);
        setEditValue(current);
    };

    const cancelEdit = () => {
        setEditingKey(null);
        setEditValue('');
    };

    const commitEdit = () => {
        if (!editingKey) return;

        const patch = { [editingKey]: editValue || editingKey.toUpperCase() };
        console.log('commitEdit, patch = ', patch);

        // 👉 только говорим родителю, что поменялось
        onMetricNamesChange(patch);

        setEditingKey(null);
        setEditValue('');
    };

    const renderHeaderCell = (key, label) => (
        <th className="results-table-header">
            {editingKey === key ? (
                <input
                    className="metric-edit-input"
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') commitEdit();
                        if (e.key === 'Escape') cancelEdit();
                    }}
                />
            ) : (
                <button
                    type="button"
                    className="metric-header-btn"
                    onClick={() => startEdit(key, label)}
                    title="Изменить название метрики"
                >
                    {label}
                </button>
            )}
        </th>
    );

    return (
        <div className="card results-table-wrapper">
            <table className="results-table">
                <thead>
                    <tr>
                        <th className="results-table-header">Год</th>
                        {renderHeaderCell('codeB11', metricNames.codeB11 || 'B11')}
                        {renderHeaderCell('codeB12', metricNames.codeB12 || 'B12')}
                        {renderHeaderCell('codeB13', metricNames.codeB13 || 'B13')}
                        {renderHeaderCell('codeB21', metricNames.codeB21 || 'B21')}
                        <th className="results-table-header">Total B</th>
                        <th className="results-table-header">Показать</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r) => (
                        <tr key={`${r.year}-${r.iteration}`} className="results-table-row">
                            <td className="results-table-cell">{r.year}</td>
                            <td className="results-table-cell">{r.b11.toFixed(2)}</td>
                            <td className="results-table-cell">{r.b12.toFixed(2)}</td>
                            <td className="results-table-cell">{r.b13.toFixed(2)}</td>
                            <td className="results-table-cell">{r.b21.toFixed(2)}</td>
                            <td className="results-table-cell">{r.sumB.toFixed(2)}</td>
                            <td className="results-table-cell" style={{ textAlign: 'center' }}>
                                <input
                                    type="checkbox"
                                    checked={!!visibleYears[r.year]}
                                    onChange={() => onToggleYear(r.year)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
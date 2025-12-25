import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

export default function LineGraphBlock({ rows }) {
    if (!rows || !rows.length) return (
        <div className="card radar-card">
            <h3>Линейный график</h3>
            <p>Нет данных для диаграммы</p>
        </div>
    )

    const data = rows.map((r) => ({
        year: r.year,
        total: r.sumB,
    }));

    return (
        <div className="card flex-1">
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data} margin={{ top: 20, right: 40, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="total" stroke="#82ca9d" dot />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

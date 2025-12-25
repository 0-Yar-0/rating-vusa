// src/pages/AnalyticsPage.jsx
import { useEffect, useState  } from 'react';
import { Api } from '../api.js';
import ResultsTable from '../components/ResultsTable.jsx';
import RadarBlock from '../components/RadarBlock.jsx';
import LineGraphBlock from '../components/LineGraphBlock.jsx';

const STORAGE_KEY = 'unirating_b_params_v2';

export default function AnalyticsPage({rows, metricNames, setMetricNames}) {
    // какие годы отображать (true = показываем)
    const [visibleYears, setVisibleYears] = useState({});

    // грузим последний расчёт класса B
    useEffect(() => {
        if (rows.length) {
            const vis = {};
            for (const r of rows) vis[r.year] = true;
            setVisibleYears(vis);
        }
    }, [rows]);

    const handleMetricNamesChange = (patch) => {
        setMetricNames((prev) => {
            const next = { ...prev, ...patch };
            const first = rows[0];
            if (first && first.calcResultId) {
                Api.updateMetricNames({
                    calcResultId: first.calcResultId,
                    codeB11: next.codeB11,
                    codeB12: next.codeB12,
                    codeB13: next.codeB13,
                    codeB21: next.codeB21,
                }).catch((e) => console.warn('Ошибка сохранения имён метрик', e));
            } else {
                console.warn('Нет calcResultId, имена метрик не отправлены на сервер');
            }

            return next;
        });
    };

    // включить/выключить год
    const handleToggleYear = (year) => {
        setVisibleYears((prev) => ({
            ...prev,
            [year]: !prev[year],
        }));
    };

    if (!rows.length) {
        return (
            <div className="card big-card">
                <h2>Аналитика</h2>
                <p>Нет данных для отображения. Сначала выполните расчёт.</p>
            </div>
        );
    }

    // строки, которые реально показываем в графиках
    const activeRows = rows.filter((r) => visibleYears[r.year]);

    return (
        <>
            <div className="display-flex">
                <RadarBlock rows={activeRows} metricNames={metricNames} />
                <LineGraphBlock rows={activeRows} />
            </div>

            <ResultsTable
                rows={rows}
                metricNames={metricNames}
                onMetricNamesChange={handleMetricNamesChange}
                visibleYears={visibleYears}
                onToggleYear={handleToggleYear}
            />
        </>

    );
}

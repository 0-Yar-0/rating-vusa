import React from 'react';
import NumericField from './NumericField'; // Adjust the import path as needed

const ClassList = ({ className, fieldsByGroup, params, handleParamChange, metricNames }) => {
    const metricNamesArray = Object.values(metricNames);

    return (
        <div className="class-list">
            <h2>{className}</h2>
            {Object.keys(fieldsByGroup).map((group, i) => (
                <div key={group} className="group-list">
                    <h3>{metricNamesArray[i] || `Параметр ${group}`}</h3>
                    <div className="params-grid">
                        {fieldsByGroup[group].map(([key, label]) => (
                            <NumericField
                                key={key}
                                label={label}
                                value={params[key]}
                                onChange={(v) => handleParamChange(key, v)}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ClassList;
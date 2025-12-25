import React, { useState } from 'react';

export default function MenuDropdown({ menuItems, disabled = false, className = '', triggerLabel = '⋯' }) {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className={`menu-dropdown ${className}`}>
            <button
                className="icon-btn menu-btn"
                type="button"
                disabled={disabled}
                onClick={() => setMenuOpen((v) => !v)}
            >
                {triggerLabel}
            </button>
            {menuOpen && (
                <div className="menu-dropdown-list">
                    {menuItems.map((item, index) => (
                        <button key={index} type="button" onClick={item.onClick}>
                            {item.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
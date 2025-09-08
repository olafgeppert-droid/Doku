/** @jsxImportSource react */
import React from 'react';

interface HeaderProps {
    onToggleNav: () => void;
}

const Header = ({ onToggleNav }: HeaderProps) => {
    const currentDate = new Date().toLocaleDateString('de-DE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <header className="app-header">
            <button className="hamburger-menu" onClick={onToggleNav} aria-label="Navigation umschalten">
                ☰
            </button>
            <h1>Dokumentation pädagogische Arbeit</h1>
            <span className="header-date">{currentDate}</span>
        </header>
    );
};

export default Header;

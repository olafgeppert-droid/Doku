/** @jsxImportSource react */
import React, { useState } from 'react';
import type { Settings } from './types';

interface SettingsModalProps {
    onClose: () => void;
    onSave: (settings: Settings) => void;
    currentSettings: Settings;
    version: string;
}

const SettingsModal = ({ onClose, onSave, currentSettings, version }: SettingsModalProps) => {
    const [settings, setSettings] = useState(currentSettings);

    const handleThemeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSettings(s => ({ ...s, theme: e.target.value as Settings['theme'] }));
    };

    const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSettings(s => ({ ...s, fontSize: parseInt(e.target.value, 10) }));
    };

    const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(s => ({
            ...s,
            customColors: {
                ...s.customColors,
                [name]: value,
            }
        }));
    };

    const handleSave = () => {
        onSave(settings);
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h2>Einstellungen</h2>
                <div className="settings-group">
                    <h3>Farbschema</h3>
                    <div className="theme-options">
                        <label>
                            <input type="radio" name="theme" value="default" checked={settings.theme === 'default'} onChange={handleThemeChange} />
                            Standard (Hell)
                        </label>
                        <label>
                            <input type="radio" name="theme" value="dark" checked={settings.theme === 'dark'} onChange={handleThemeChange} />
                            Dunkel
                        </label>
                        <label>
                            <input type="radio" name="theme" value="high-contrast" checked={settings.theme === 'high-contrast'} onChange={handleThemeChange} />
                            Hoher Kontrast
                        </label>
                        <label>
                            <input type="radio" name="theme" value="custom" checked={settings.theme === 'custom'} onChange={handleThemeChange} />
                            Farbig (Benutzerdefiniert)
                        </label>
                    </div>
                     {settings.theme === 'custom' && (
                        <div className="custom-colors">
                            <div className="custom-color-option">
                                <label htmlFor="sidebar">Navigation</label>
                                <input type="color" id="sidebar" name="sidebar" value={settings.customColors.sidebar} onChange={handleCustomColorChange} />
                            </div>
                            <div className="custom-color-option">
                                <label htmlFor="header">Header</label>
                                <input type="color" id="header" name="header" value={settings.customColors.header} onChange={handleCustomColorChange} />
                            </div>
                            <div className="custom-color-option">
                                <label htmlFor="toolbar">Werkzeugleiste</label>
                                <input type="color" id="toolbar" name="toolbar" value={settings.customColors.toolbar} onChange={handleCustomColorChange} />
                            </div>
                            <div className="custom-color-option">
                                <label htmlFor="entryBackground">Protokoll-Hintergrund</label>
                                <input type="color" id="entryBackground" name="entryBackground" value={settings.customColors.entryBackground} onChange={handleCustomColorChange} />
                            </div>
                        </div>
                    )}
                </div>
                <div className="settings-group">
                    <h3>Schriftgröße</h3>
                    <div className="font-size-slider">
                        <span>A</span>
                        <input type="range" min="12" max="35" step="1" value={settings.fontSize} onChange={handleFontSizeChange} />
                        <span>A</span>
                        <span>{settings.fontSize}px</span>
                    </div>
                </div>
                <div className="modal-actions">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>❌ Abbrechen</button>
                    <button type="button" className="btn btn-primary" onClick={handleSave}>✔️ Übernehmen</button>
                </div>
                <div className="settings-footer">
                    Version {version}
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
/** @jsxImportSource react */
import React, { useState } from 'react';
import type { Settings, MasterData } from './types';
import MasterDataModal from './MasterDataModal';

interface SettingsModalProps {
    onClose: () => void;
    onSave: (settings: Settings) => void;
    currentSettings: Settings;
    version: string;
}

const SettingsModal = ({ onClose, onSave, currentSettings, version }: SettingsModalProps) => {
    const [settings, setSettings] = useState(currentSettings);
    const [isMasterDataModalOpen, setIsMasterDataModalOpen] = useState(false);

    const handleThemeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSettings(s => ({ ...s, theme: e.target.value as Settings['theme'] }));
    };

    const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSettings(s => ({ ...s, fontSize: parseInt(e.target.value, 10) }));
    };

    const handleInputFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSettings(s => ({ ...s, inputFontSize: parseInt(e.target.value, 10) }));
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

    const handleMasterDataUpdate = (newMasterData: MasterData) => {
        setSettings(s => ({ ...s, masterData: newMasterData }));
        setIsMasterDataModalOpen(false);
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h2>Einstellungen</h2>

                {/* Farbschema */}
                <div className="settings-group">
                    <h3>Farbschema</h3>
                    <div className="theme-options">
                        <label><input type="radio" name="theme" value="default" checked={settings.theme === 'default'} onChange={handleThemeChange} /> Standard (Hell)</label>
                        <label><input type="radio" name="theme" value="dark" checked={settings.theme === 'dark'} onChange={handleThemeChange} /> Dunkel</label>
                        <label><input type="radio" name="theme" value="high-contrast" checked={settings.theme === 'high-contrast'} onChange={handleThemeChange} /> Hoher Kontrast</label>
                        <label><input type="radio" name="theme" value="custom" checked={settings.theme === 'custom'} onChange={handleThemeChange} /> Farbig (Benutzerdefiniert)</label>
                    </div>
                    {settings.theme === 'custom' && (
                        <div className="custom-colors">
                            {['sidebar','header','toolbar','entryBackground'].map(colorKey => (
                                <div className="custom-color-option" key={colorKey}>
                                    <label htmlFor={colorKey}>{colorKey.charAt(0).toUpperCase() + colorKey.slice(1)}</label>
                                    <input type="color" id={colorKey} name={colorKey} value={settings.customColors[colorKey]} onChange={handleCustomColorChange} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Schriftgröße Labels */}
                <div className="settings-group">
                    <h3>Schriftgröße Labels</h3>
                    <div className="font-size-slider">
                        <span>A</span>
                        <input type="range" min="12" max="35" step="1" value={settings.fontSize} onChange={handleFontSizeChange} />
                        <span>A</span>
                        <span>{settings.fontSize}px</span>
                    </div>
                </div>

                {/* Schriftgröße Eingabefelder */}
                <div className="settings-group">
                    <h3>Schriftgröße Eingabefelder</h3>
                    <div className="font-size-slider">
                        <span>A</span>
                        <input type="range" min="10" max="30" step="1" value={settings.inputFontSize ?? 16} onChange={handleInputFontSizeChange} />
                        <span>A</span>
                        <span>{settings.inputFontSize ?? 16}px</span>
                    </div>
                </div>

                {/* Stammdaten */}
                <div className="settings-group">
                    <h3>Stammdaten</h3>
                    <button type="button" className="btn btn-secondary" onClick={() => setIsMasterDataModalOpen(true)}>
                        Stammdaten verwalten...
                    </button>
                </div>

                <div className="modal-actions">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>❌ Abbrechen</button>
                    <button type="button" className="btn btn-primary" onClick={handleSave}>✔️ Übernehmen</button>
                </div>

                <div className="settings-footer">Version {version}</div>
            </div>

            {isMasterDataModalOpen && (
                <MasterDataModal
                    masterData={settings.masterData}
                    onSave={handleMasterDataUpdate}
                    onClose={() => setIsMasterDataModalOpen(false)}
                />
            )}
        </div>
    );
};

export default SettingsModal;

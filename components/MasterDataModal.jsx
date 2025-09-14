/** @jsxImportSource react */
import React, { useState } from 'react';

/**
 * @typedef {Object} MasterData
 * @property {string[]} schoolYears
 * @property {Object.<string, string[]>} schools
 */

/**
 * MasterDataModal component
 * @param {Object} props
 * @param {MasterData} props.masterData
 * @param {(newMasterData: MasterData) => void} props.onSave
 * @param {() => void} props.onClose
 */
const MasterDataModal = ({ masterData, onSave, onClose }) => {
    const [localMasterData, setLocalMasterData] = useState(masterData);
    const [newSchoolYear, setNewSchoolYear] = useState('');
    const [newSchool, setNewSchool] = useState('');
    const [selectedSchool, setSelectedSchool] = useState('');
    const [newClass, setNewClass] = useState('');

    // Schuljahr hinzufügen
    const handleAddSchoolYear = () => {
        if (newSchoolYear && !localMasterData.schoolYears.includes(newSchoolYear)) {
            setLocalMasterData(prev => ({
                ...prev,
                schoolYears: [...prev.schoolYears, newSchoolYear].sort()
            }));
            setNewSchoolYear('');
        }
    };

    const handleDeleteSchoolYear = (year) => {
        setLocalMasterData(prev => ({
            ...prev,
            schoolYears: prev.schoolYears.filter(y => y !== year)
        }));
    };

    // Schule hinzufügen/löschen
    const handleAddSchool = () => {
        if (newSchool && !localMasterData.schools[newSchool]) {
            setLocalMasterData(prev => ({
                ...prev,
                schools: { ...prev.schools, [newSchool]: [] }
            }));
            setNewSchool('');
        }
    };

    const handleDeleteSchool = (school) => {
        const { [school]: _, ...remainingSchools } = localMasterData.schools;
        setLocalMasterData(prev => ({ ...prev, schools: remainingSchools }));
        if (selectedSchool === school) setSelectedSchool('');
    };

    // Klasse hinzufügen/löschen
    const handleAddClass = () => {
        if (newClass && selectedSchool && !localMasterData.schools[selectedSchool].includes(newClass)) {
            setLocalMasterData(prev => ({
                ...prev,
                schools: {
                    ...prev.schools,
                    [selectedSchool]: [...prev.schools[selectedSchool], newClass].sort()
                }
            }));
            setNewClass('');
        }
    };

    const handleDeleteClass = (cls) => {
        if (selectedSchool) {
            setLocalMasterData(prev => ({
                ...prev,
                schools: {
                    ...prev.schools,
                    [selectedSchool]: prev.schools[selectedSchool].filter(c => c !== cls)
                }
            }));
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content" style={{ maxWidth: '800px', textAlign: 'left' }}>
                <h2>Stammdaten verwalten</h2>
                <div style={{ maxHeight: '60vh', overflowY: 'auto', padding: '0 1rem' }}>
                    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                        {/* Schuljahre */}
                        <div style={{ flex: 1, minWidth: '300px' }}>
                            <h3>Schuljahre</h3>
                            <div className="form-group">
                                <input type="text" value={newSchoolYear} onChange={e => setNewSchoolYear(e.target.value)} placeholder="z.B. 2025/2026" />
                                <button type="button" onClick={handleAddSchoolYear} className="btn btn-primary" style={{ marginTop: '0.5rem', width: '100%' }}>Hinzufügen</button>
                            </div>
                            <ul style={{ listStyle: 'none', maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.5rem' }}>
                                {localMasterData.schoolYears.map(year => (
                                    <li key={year} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                        {year}
                                        <button onClick={() => handleDeleteSchoolYear(year)} style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Schulen & Klassen */}
                        <div style={{ flex: 2, minWidth: '300px' }}>
                            <h3>Schulen und Klassen</h3>
                            <div className="form-group">
                                <input type="text" value={newSchool} onChange={e => setNewSchool(e.target.value)} placeholder="Neue Schule hinzufügen" />
                                <button type="button" onClick={handleAddSchool} className="btn btn-primary" style={{ marginTop: '0.5rem', width: '100%' }}>Hinzufügen</button>
                            </div>
                            <div className="form-group">
                                <label>Schule zur Bearbeitung auswählen</label>
                                <select value={selectedSchool} onChange={e => setSelectedSchool(e.target.value)}>
                                    <option value="">Bitte wählen...</option>
                                    {Object.keys(localMasterData.schools).sort().map(school => (
                                        <option key={school} value={school}>{school}</option>
                                    ))}
                                </select>
                                {selectedSchool && <button type="button" onClick={() => handleDeleteSchool(selectedSchool)} className="btn btn-danger" style={{ marginTop: '0.5rem', width: '100%' }}>Ausgewählte Schule löschen</button>}
                            </div>

                            {selectedSchool && (
                                <div>
                                    <h4>Klassen für "{selectedSchool}"</h4>
                                    <div className="form-group">
                                        <input type="text" value={newClass} onChange={e => setNewClass(e.target.value)} placeholder="Neue Klasse hinzufügen" />
                                        <button type="button" onClick={handleAddClass} className="btn btn-primary" style={{ marginTop: '0.5rem', width: '100%' }}>Hinzufügen</button>
                                    </div>
                                    <ul style={{ listStyle: 'none', maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.5rem' }}>
                                        {localMasterData.schools[selectedSchool].map(cls => (
                                            <li key={cls} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                                {cls}
                                                <button onClick={() => handleDeleteClass(cls)} style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="modal-actions">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>❌ Schließen</button>
                    <button type="button" className="btn btn-primary" onClick={() => onSave(localMasterData)}>✔️ Änderungen übernehmen</button>
                </div>
            </div>
        </div>
    );
};

export default MasterDataModal;

/** @jsxImportSource react */
import React, { useState } from 'react';

const MasterDataModal = ({ masterData, onSave, onClose }) => {
    const [localMasterData, setLocalMasterData] = useState(masterData);
    const [newSchoolYear, setNewSchoolYear] = useState('');
    const [newSchool, setNewSchool] = useState('');
    const [selectedSchool, setSelectedSchool] = useState('');
    const [newClass, setNewClass] = useState('');

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
        const newSchools = { ...localMasterData.schools };
        delete newSchools[school];
        setLocalMasterData(prev => ({ ...prev, schools: newSchools }));
        if (selectedSchool === school) setSelectedSchool('');
    };

    const handleAddClass = () => {
        if (selectedSchool && newClass) {
            const classes = localMasterData.schools[selectedSchool] || [];
            if (!classes.includes(newClass)) {
                setLocalMasterData(prev => ({
                    ...prev,
                    schools: {
                        ...prev.schools,
                        [selectedSchool]: [...classes, newClass].sort()
                    }
                }));
                setNewClass('');
            }
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
            <div className="modal-content">
                <h2>Stammdaten verwalten</h2>

                <div className="settings-group">
                    <h3>Schuljahre</h3>
                    <ul>
                        {localMasterData.schoolYears.map(year => (
                            <li key={year}>
                                {year}
                                <button type="button" className="btn btn-danger" onClick={() => handleDeleteSchoolYear(year)}>🗑️</button>
                            </li>
                        ))}
                    </ul>
                    <input type="text" value={newSchoolYear} onChange={(e) => setNewSchoolYear(e.target.value)} placeholder="Neues Schuljahr" />
                    <button type="button" className="btn btn-primary" onClick={handleAddSchoolYear}>➕ Hinzufügen</button>
                </div>

                <div className="settings-group">
                    <h3>Schulen</h3>
                    <ul>
                        {Object.keys(localMasterData.schools).map(school => (
                            <li key={school}>
                                <span onClick={() => setSelectedSchool(school)} style={{ cursor: 'pointer', fontWeight: selectedSchool === school ? 'bold' : 'normal' }}>
                                    {school}
                                </span>
                                <button type="button" className="btn btn-danger" onClick={() => handleDeleteSchool(school)}>🗑️</button>
                            </li>
                        ))}
                    </ul>
                    <input type="text" value={newSchool} onChange={(e) => setNewSchool(e.target.value)} placeholder="Neue Schule" />
                    <button type="button" className="btn btn-primary" onClick={handleAddSchool}>➕ Hinzufügen</button>
                </div>

                {selectedSchool && (
                    <div className="settings-group">
                        <h3>Klassen für {selectedSchool}</h3>
                        <ul>
                            {localMasterData.schools[selectedSchool].map(cls => (
                                <li key={cls}>
                                    {cls}
                                    <button type="button" className="btn btn-danger" onClick={() => handleDeleteClass(cls)}>🗑️</button>
                                </li>
                            ))}
                        </ul>
                        <input type="text" value={newClass} onChange={(e) => setNewClass(e.target.value)} placeholder="Neue Klasse" />
                        <button type="button" className="btn btn-primary" onClick={handleAddClass}>➕ Hinzufügen</button>
                    </div>
                )}

                <div className="modal-actions">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>❌ Abbrechen</button>
                    <button type="button" className="btn btn-primary" onClick={() => onSave(localMasterData)}>✔️ Speichern</button>
                </div>
            </div>
        </div>
    );
};

export default MasterDataModal;

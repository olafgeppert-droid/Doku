/** @jsxImportSource react */
import React, { useState, useEffect, useMemo } from 'react';
import type { Student, MasterData } from './types';
import { capitalizeWords } from './utils';
import { FAVORITE_NATIONALITIES, ALL_NATIONALITIES } from './nationalities';

interface StudentModalProps {
    onClose: () => void;
    onSaveStudent: (student: Student | Omit<Student, 'id'>) => void;
    onDeleteStudent: (student: Student) => void;
    studentToEdit?: Student | null;
    masterData: MasterData;
}

const StudentModal = ({ onClose, onSaveStudent, onDeleteStudent, studentToEdit, masterData }: StudentModalProps) => {
    const [formData, setFormData] = useState({ 
        name: '', 
        schoolYear: '', 
        school: '', 
        className: '',
        gender: '',
        nationality: '',
        germanLevel: '',
        notes: ''
    });
    const [validationError, setValidationError] = useState('');

    useEffect(() => {
        if (studentToEdit) {
            setFormData({
                name: studentToEdit.name || '',
                schoolYear: studentToEdit.schoolYear || '',
                school: studentToEdit.school || '',
                className: studentToEdit.className || '',
                gender: studentToEdit.gender || '',
                nationality: studentToEdit.nationality || '',
                germanLevel: studentToEdit.germanLevel || '',
                notes: studentToEdit.notes || ''
            });
        }
    }, [studentToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'school') {
            setFormData(prev => ({...prev, school: value, className: ''}));
        } else {
            setFormData(prev => ({...prev, [name]: value}));
        }
    }
    
    const classOptions = useMemo(() => {
        if (!formData.school || !masterData.schools[formData.school]) return [];
        return masterData.schools[formData.school];
    }, [formData.school, masterData.schools]);

    const handleSubmit = () => {
        const { name, schoolYear, school, gender } = formData;
        const errors: string[] = [];
        if (!name.trim()) errors.push('Name');
        if (!schoolYear) errors.push('Schuljahr');
        if (!school) errors.push('Schule');
        if (!gender) errors.push('Geschlecht');

        if (errors.length > 0) {
            setValidationError(`Bitte füllen Sie die Pflichtfelder aus: ${errors.join(', ')}.`);
            return;
        }

        setValidationError('');
        const formattedData = { ...formData, name: capitalizeWords(name.trim()) };
        
        if (studentToEdit) {
            onSaveStudent({ ...formattedData, id: studentToEdit.id });
        } else {
            onSaveStudent(formattedData);
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h2>{studentToEdit ? 'Kind bearbeiten' : 'Neues Kind anlegen'}</h2>
                <div>
                    <div className="form-group">
                        <label htmlFor="name">Name des Kindes *</label>
                        <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} autoFocus />
                    </div>
                    <div className="form-group">
                        <label htmlFor="schoolYear">Schuljahr *</label>
                        <select id="schoolYear" name="schoolYear" value={formData.schoolYear} onChange={handleChange}>
                            <option value="">Bitte wählen...</option>
                            {masterData.schoolYears.map(year => <option key={year} value={year}>{year}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="school">Schule *</label>
                        <select id="school" name="school" value={formData.school} onChange={handleChange}>
                            <option value="">Bitte wählen...</option>
                            {Object.keys(masterData.schools).sort().map(school => <option key={school} value={school}>{school}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="className">Klasse</label>
                        <select id="className" name="className" value={formData.className} onChange={handleChange} disabled={!formData.school}>
                            <option value="">Bitte wählen...</option>
                            {classOptions.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="gender">Geschlecht *</label>
                        <select id="gender" name="gender" value={formData.gender} onChange={handleChange}>
                            <option value="">Bitte wählen...</option>
                            <option value="männlich">Männlich</option>
                            <option value="weiblich">Weiblich</option>
                            <option value="divers">Divers</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="nationality">Nationalität</label>
                        <select id="nationality" name="nationality" value={formData.nationality} onChange={handleChange}>
                            <option value="">Keine Angabe</option>
                            <optgroup label="Favoriten">
                                {FAVORITE_NATIONALITIES.map(nation => (
                                    <option key={nation} value={nation}>{nation}</option>
                                ))}
                            </optgroup>
                            <optgroup label="Alle Nationen">
                                {ALL_NATIONALITIES.filter(nation => !FAVORITE_NATIONALITIES.includes(nation)).map(nation => (
                                    <option key={nation} value={nation}>{nation}</option>
                                ))}
                            </optgroup>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="germanLevel">Spricht Deutsch (Schulnote)</label>
                        <select id="germanLevel" name="germanLevel" value={formData.germanLevel} onChange={handleChange}>
                            <option value="">Nicht beurteilt</option>
                            <option value="1">1 (Sehr gut)</option>
                            <option value="2">2 (Gut)</option>
                            <option value="3">3 (Befriedigend)</option>
                            <option value="4">4 (Ausreichend)</option>
                            <option value="5">5 (Mangelhaft)</option>
                            <option value="6">6 (Ungenügend)</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="notes">Anmerkungen</label>
                        <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange}></textarea>
                    </div>

                    {validationError && <p className="validation-error">{validationError}</p>}
                    
                    <div className="modal-actions">
                        {studentToEdit && (
                            <button 
                                type="button" 
                                className="btn btn-danger" 
                                onClick={() => studentToEdit && onDeleteStudent(studentToEdit)}
                                style={{ marginRight: 'auto' }}
                            >
                                🗑️ Löschen
                            </button>
                        )}
                        <button type="button" className="btn btn-secondary" onClick={onClose}>❌ Abbrechen</button>
                        <button type="button" className="btn btn-primary" onClick={handleSubmit}>✔️ Speichern</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentModal;

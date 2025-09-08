/** @jsxImportSource react */
import React, { useState } from 'react';
import type { Student } from './types';
import { capitalizeWords } from './utils';

interface StudentModalProps {
    onClose: () => void;
    onAddStudent: (student: Omit<Student, 'id'>) => void;
}

const StudentModal = ({ onClose, onAddStudent }: StudentModalProps) => {
    const [formData, setFormData] = useState({ 
        name: '', 
        schoolYear: '', 
        school: '', 
        className: '',
        gender: '',
        nationality: '',
        germanLevel: ''
    });
    const [validationError, setValidationError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError('');

        // Validate School Year Format
        const schoolYearRegex = /^\d{4}\/\d{4}$/;
        if (!schoolYearRegex.test(formData.schoolYear.trim())) {
            setValidationError('Schuljahr muss im Format JJJJ/JJJJ sein (z.B. 2023/2024).');
            return;
        }

        // Check required fields
        if (formData.name.trim() && formData.schoolYear.trim() && formData.school.trim() && formData.className.trim()) {
            
            const formattedData = {
                ...formData,
                name: capitalizeWords(formData.name.trim()),
                school: capitalizeWords(formData.school.trim()),
                className: capitalizeWords(formData.className.trim()),
                nationality: capitalizeWords(formData.nationality.trim()),
                schoolYear: formData.schoolYear.trim(),
            };
            
            onAddStudent(formattedData);
            onClose();
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h2>Neues Kind anlegen</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group"><label htmlFor="name">Name des Kindes</label><input id="name" name="name" type="text" value={formData.name} onChange={handleChange} required autoFocus /></div>
                    <div className="form-group">
                        <label htmlFor="schoolYear">Schuljahr</label>
                        <input id="schoolYear" name="schoolYear" type="text" value={formData.schoolYear} onChange={handleChange} placeholder="z.B. 2023/2024" required />
                        {validationError && <p className="validation-error">{validationError}</p>}
                    </div>
                    <div className="form-group"><label htmlFor="school">Schule</label><input id="school" name="school" type="text" value={formData.school} onChange={handleChange} required /></div>
                    <div className="form-group"><label htmlFor="className">Klasse</label><input id="className" name="className" type="text" value={formData.className} onChange={handleChange} required /></div>
                    <div className="form-group"><label htmlFor="gender">Geschlecht</label>
                        <select id="gender" name="gender" value={formData.gender} onChange={handleChange}>
                            <option value="">Keine Angabe</option>
                            <option value="männlich">Männlich</option>
                            <option value="weiblich">Weiblich</option>
                            <option value="divers">Divers</option>
                        </select>
                    </div>
                     <div className="form-group"><label htmlFor="nationality">Nationalität</label><input id="nationality" name="nationality" type="text" value={formData.nationality} onChange={handleChange} /></div>
                    <div className="form-group"><label htmlFor="germanLevel">Spricht Deutsch (Schulnote)</label>
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
                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>❌ Abbrechen</button>
                        <button type="submit" className="btn btn-primary">✔️ Speichern</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StudentModal;
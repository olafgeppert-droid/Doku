/** @jsxImportSource react */
import React, { useState } from 'react';
import type { Student, Entry } from './types';

interface EntryModalProps {
    student: Student;
    onClose: () => void;
    onSaveEntry: (entryData: Omit<Entry, 'id' | 'studentId'>) => void;
    entryToEdit: Entry | null;
}

const EntryModal = ({ student, onClose, onSaveEntry, entryToEdit }: EntryModalProps) => {
    // FIX: Explicitly type the state to prevent TypeScript from widening `erfolgRating` to `string`.
    // This ensures `formData` matches the type expected by `onSaveEntry`.
    const [formData, setFormData] = useState<Omit<Entry, 'id' | 'studentId'>>({
        date: entryToEdit?.date || new Date().toISOString().split('T')[0],
        subject: entryToEdit?.subject || '',
        observations: entryToEdit?.observations || '',
        measures: entryToEdit?.measures || '',
        erfolg: entryToEdit?.erfolg || '',
        erfolgRating: entryToEdit?.erfolgRating || ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        // FIX: The previous general cast was incorrect and caused type inference issues.
        // By handling `erfolgRating` specifically, we ensure its strict type is preserved.
        if (name === 'erfolgRating') {
            setFormData(prev => ({ ...prev, erfolgRating: value as 'positiv' | 'negativ' | '' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSaveEntry(formData);
        onClose();
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content" style={{maxWidth: '700px'}}>
                <h2>{entryToEdit ? 'Eintrag bearbeiten' : `Neuer Eintrag für ${student.name}`}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group"><label htmlFor="date">Datum</label><input id="date" name="date" type="date" value={formData.date} onChange={handleChange} required /></div>
                    <div className="form-group"><label htmlFor="subject">Fach / Thema</label><input id="subject" name="subject" type="text" value={formData.subject} onChange={handleChange} required /></div>
                    <div className="form-group"><label htmlFor="observations">Beobachtung</label><textarea id="observations" name="observations" value={formData.observations} onChange={handleChange}></textarea></div>
                    <div className="form-group"><label htmlFor="measures">Maßnahme</label><textarea id="measures" name="measures" value={formData.measures} onChange={handleChange}></textarea></div>
                    <div className="form-group">
                        <label htmlFor="erfolg">Erfolg</label>
                        <textarea id="erfolg" name="erfolg" value={formData.erfolg} onChange={handleChange}></textarea>
                    </div>
                     <div className="form-group rating-group">
                        <label>Bewertung des Erfolgs</label>
                        <div className="radio-options">
                            <label><input type="radio" name="erfolgRating" value="positiv" checked={formData.erfolgRating === 'positiv'} onChange={handleChange} /> Positiv</label>
                            <label><input type="radio" name="erfolgRating" value="negativ" checked={formData.erfolgRating === 'negativ'} onChange={handleChange} /> Negativ</label>
                             <label><input type="radio" name="erfolgRating" value="" checked={formData.erfolgRating === ''} onChange={handleChange} /> Keine</label>
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>❌ Abbrechen</button>
                        <button type="submit" className="btn btn-primary">✔️ Eintrag speichern</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EntryModal;
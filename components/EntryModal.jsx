/** @jsxImportSource react */
import React, { useState, useEffect } from 'react';
import { capitalizeWords } from './utils.js';

/**
 * @typedef {Object} Entry
 * @property {number} [id]
 * @property {number} studentId
 * @property {string} date
 * @property {string} subject
 * @property {string} observations
 * @property {string} measures
 * @property {string} erfolg
 * @property {'positiv'|'negativ'|''} erfolgRating
 */

/**
 * @typedef {Object} Student
 * @property {number} [id]
 * @property {string} name
 */

/**
 * EntryModal component
 * @param {Object} props
 * @param {() => void} props.onClose
 * @param {(entry: Entry) => void} props.onSaveEntry
 * @param {(entry: Entry) => void} props.onDeleteEntry
 * @param {Entry|null} [props.entryToEdit]
 * @param {Student} props.student
 */
const EntryModal = ({ onClose, onSaveEntry, onDeleteEntry, entryToEdit, student }) => {
    const [formData, setFormData] = useState({
        date: '',
        subject: '',
        observations: '',
        measures: '',
        erfolg: '',
        erfolgRating: ''
    });
    const [validationError, setValidationError] = useState('');

    useEffect(() => {
        if (entryToEdit) {
            setFormData({
                date: entryToEdit.date || '',
                subject: entryToEdit.subject || '',
                observations: entryToEdit.observations || '',
                measures: entryToEdit.measures || '',
                erfolg: entryToEdit.erfolg || '',
                erfolgRating: entryToEdit.erfolgRating || ''
            });
        } else {
            setFormData(prev => ({ ...prev, date: new Date().toISOString().split('T')[0] }));
        }
    }, [entryToEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        const errors = [];
        if (!formData.date) errors.push('Datum');
        if (!formData.subject.trim()) errors.push('Fach');
        if (!formData.observations.trim()) errors.push('Beobachtungen');

        if (errors.length > 0) {
            setValidationError(`Bitte füllen Sie die Pflichtfelder aus: ${errors.join(', ')}.`);
            return;
        }

        setValidationError('');
        const formattedData = {
            ...formData,
            studentId: student.id,
            subject: capitalizeWords(formData.subject.trim())
        };

        if (entryToEdit) {
            onSaveEntry({ ...formattedData, id: entryToEdit.id });
        } else {
            onSaveEntry(formattedData);
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h2>{entryToEdit ? 'Eintrag bearbeiten' : `Neuen Eintrag für ${student.name} erstellen`}</h2>

                <div className="form-group">
                    <label htmlFor="date">Datum *</label>
                    <input id="date" name="date" type="date" value={formData.date} onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label htmlFor="subject">Fach/Betreff *</label>
                    <input id="subject" name="subject" type="text" value={formData.subject} onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label htmlFor="observations">Beobachtungen *</label>
                    <textarea id="observations" name="observations" value={formData.observations} onChange={handleChange}></textarea>
                </div>

                <div className="form-group">
                    <label htmlFor="measures">Maßnahmen</label>
                    <textarea id="measures" name="measures" value={formData.measures} onChange={handleChange}></textarea>
                </div>

                <div className="form-group">
                    <label htmlFor="erfolg">Erfolg</label>
                    <textarea id="erfolg" name="erfolg" value={formData.erfolg} onChange={handleChange}></textarea>
                </div>

                <div className="form-group">
                    <label htmlFor="erfolgRating">Erfolgsbewertung</label>
                    <select id="erfolgRating" name="erfolgRating" value={formData.erfolgRating} onChange={handleChange}>
                        <option value="">Keine Angabe</option>
                        <option value="positiv">Positiv</option>
                        <option value="negativ">Negativ</option>
                    </select>
                </div>

                {validationError && <p className="validation-error">{validationError}</p>}

                <div className="modal-actions">
                    {entryToEdit && (
                        <button type="button" className="btn btn-danger" onClick={() => onDeleteEntry(entryToEdit)} style={{ marginRight: 'auto' }}>
                            🗑️ Löschen
                        </button>
                    )}
                    <button type="button" className="btn btn-secondary" onClick={onClose}>❌ Abbrechen</button>
                    <button type="button" className="btn btn-primary" onClick={handleSubmit}>✔️ Speichern</button>
                </div>
            </div>
        </div>
    );
};

export default EntryModal;

/** @jsxImportSource react */
import React from 'react';
import type { Student, Entry } from './types';

interface StudentDetailsProps {
    student: Student;
    entries: Entry[];
    selectedEntry: Entry | null;
    onSelectEntry: (entry: Entry) => void;
    dateFilter: string;
    onDateFilterChange: (date: string) => void;
    onNewEntry: () => void;
}

const StudentDetails = ({ student, entries, selectedEntry, onSelectEntry, dateFilter, onDateFilterChange, onNewEntry }: StudentDetailsProps) => {
    
    const getErfolgRatingText = (rating: Entry['erfolgRating']) => {
        if (rating === 'positiv') return ' (Positiv)';
        if (rating === 'negativ') return ' (Negativ)';
        return '';
    }

    return (
        <div>
            <div className="student-details-header">
                <div className="student-details-title-group">
                    <h2>Protokolle für {student.name}</h2>
                    <button className="btn btn-primary" onClick={onNewEntry}>✨ Neuer Eintrag</button>
                </div>
                 <div className="student-info">
                    {student.gender && <span><strong>Geschlecht:</strong> {student.gender}</span>}
                    {student.nationality && <span><strong>Nationalität:</strong> {student.nationality}</span>}
                    {student.germanLevel && <span><strong>Deutsch-Niveau (Note):</strong> {student.germanLevel}</span>}
                </div>
                <div className="date-filter">
                    <label htmlFor="dateFilter">Einträge filtern nach Tag:</label>
                    <input id="dateFilter" type="date" value={dateFilter} onChange={e => onDateFilterChange(e.target.value)} />
                </div>
            </div>
            {entries.length === 0 ? (
                <div className="no-entries">
                    <h3>Keine Einträge für dieses Datum</h3>
                    <p>Fügen Sie einen neuen Eintrag hinzu oder ändern Sie den Datumsfilter.</p>
                </div>
            ) : (
                entries.map(entry => (
                    <div key={entry.id} className={`entry-card ${selectedEntry?.id === entry.id ? 'selected' : ''}`} onClick={() => onSelectEntry(entry)}>
                        <div className="entry-card-header">
                            <span className="subject">{entry.subject}</span>
                            <span>{new Date(entry.date).toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <div className="entry-content">
                            {entry.observations && <p><strong>Beobachtung:</strong> {entry.observations}</p>}
                            {entry.measures && <p><strong>Maßnahme:</strong> {entry.measures}</p>}
                            {entry.erfolg && <p><strong>Erfolg{getErfolgRatingText(entry.erfolgRating)}:</strong> {entry.erfolg}</p>}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default StudentDetails;
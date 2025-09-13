/** @jsxImportSource react */
import React from 'react';
import type { Student, Entry } from './types';

interface DayDetailsProps {
    date: string;
    entries: Entry[];
    selectedEntry: Entry | null;
    onSelectEntry: (entry: Entry) => void;
    studentNameMap: Map<number, string>;
}

const DayDetails = ({ date, entries, selectedEntry, onSelectEntry, studentNameMap }: DayDetailsProps) => {
    const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const getErfolgRatingText = (rating: Entry['erfolgRating']) => {
        if (rating === 'positiv') return ' (Positiv)';
        if (rating === 'negativ') return ' (Negativ)';
        return '';
    };

    return (
        <div>
            <div className="student-details-header">
                <h2>Einträge für den {formattedDate}</h2>
            </div>

            {entries.length === 0 ? (
                <div className="no-entries">
                    <h3>Keine Einträge für diesen Tag</h3>
                    <p>Wählen Sie einen anderen Tag im Filter aus.</p>
                </div>
            ) : (
                entries.map(entry => (
                    <div
                        key={entry.id}
                        className={`entry-card ${selectedEntry?.id === entry.id ? 'selected' : ''}`}
                        onClick={() => onSelectEntry(entry)}
                    >
                        <div className="entry-card-header">
                            <span className="subject">
                                {studentNameMap.get(entry.studentId) || 'Unbekannt'} - {entry.subject}
                            </span>
                        </div>
                        <div className="entry-content">
                            {entry.observations && <p><strong>Beobachtung:</strong> {entry.observations}</p>}
                            {entry.measures && <p><strong>Maßnahme:</strong> {entry.measures}</p>}
                            {entry.erfolg && (
                                <p>
                                    <strong>Erfolg{getErfolgRatingText(entry.erfolgRating)}:</strong> {entry.erfolg}
                                </p>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default DayDetails;

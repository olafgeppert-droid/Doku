/** @jsxImportSource react */
import React from 'react';

/**
 * StudentDetails component
 * @param {Object} props
 * @param {Object} props.student
 * @param {Array<Object>} props.entries
 * @param {Object|null} props.selectedEntry
 * @param {(entry: Object) => void} props.onSelectEntry
 * @param {string} props.dateFilter
 * @param {(date: string) => void} props.onDateFilterChange
 */
const StudentDetails = ({ student, entries, selectedEntry, onSelectEntry, dateFilter, onDateFilterChange }) => {

    const getErfolgRatingText = (rating) => {
        if (rating === 'positiv') return ' (Positiv)';
        if (rating === 'negativ') return ' (Negativ)';
        return '';
    };

    const today = new Date().toISOString().split('T')[0];

    const filteredEntries = dateFilter
        ? entries.filter(entry => entry.date === dateFilter)
        : entries;

    return (
        <div>
            <div className="student-details-header">
                <div className="student-details-title-group">
                    <h2>Protokolle für {student.name}</h2>
                </div>
                <div className="student-info">
                    {student.gender && <span><strong>Geschlecht:</strong> {student.gender}</span>}
                    {student.nationality && <span><strong>Nationalität:</strong> {student.nationality}</span>}
                    {student.germanLevel && <span><strong>Deutsch-Niveau (Note):</strong> {student.germanLevel}</span>}
                </div>
                {student.notes && (
                    <div className="entry-card" style={{ marginBottom: '1rem', cursor: 'default' }}>
                        <p><strong>Anmerkungen:</strong> {student.notes.split('\n').map((line, i) => <React.Fragment key={i}>{line}<br/></React.Fragment>)}</p>
                    </div>
                )}
                <div className="date-filter">
                    <label htmlFor="dateFilter">Einträge filtern nach Tag:</label>
                    <div className="date-filter-wrapper">
                        <input
                            id="dateFilter"
                            type="date"
                            value={dateFilter}
                            onChange={e => onDateFilterChange(e.target.value)}
                        />
                        <button
                            onClick={() => onDateFilterChange(today)}
                            className="btn-clear"
                            title="Auf heute setzen"
                            disabled={dateFilter === today}
                        >
                            Zurücksetzen
                        </button>
                        <button
                            onClick={() => onDateFilterChange('')}
                            className="btn-clear"
                            title="Datum löschen"
                            disabled={!dateFilter}
                        >
                            Löschen
                        </button>
                    </div>
                </div>
            </div>

            {filteredEntries.length === 0 ? (
                <div className="no-entries">
                    <h3>Keine Einträge für dieses Datum</h3>
                    <p>Fügen Sie einen neuen Eintrag hinzu oder ändern Sie den Datumsfilter.</p>
                </div>
            ) : (
                filteredEntries.map(entry => (
                    <div
                        key={entry.id ?? Math.random()} // fallback key, falls id fehlt
                        className={`entry-card ${selectedEntry?.id === entry.id ? 'selected' : ''}`}
                        onClick={() => onSelectEntry(entry)}
                    >
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

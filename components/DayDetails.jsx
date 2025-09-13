import React from 'react';

const DayDetails = ({ entries, selectedEntry, onSelectEntry }) => {
  if (!entries || entries.length === 0) {
    return (
      <div className="no-entries">
        <h3>Keine Einträge für diesen Tag</h3>
        <p>Fügen Sie einen neuen Eintrag hinzu.</p>
      </div>
    );
  }

  const getErfolgRatingText = (rating) => {
    if (rating === 'positiv') return ' (Positiv)';
    if (rating === 'negativ') return ' (Negativ)';
    return '';
  };

  return (
    <div className="day-details">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className={`entry-card ${
            selectedEntry?.id === entry.id ? 'selected' : ''
          }`}
          onClick={() => onSelectEntry(entry)}
        >
          <div className="entry-card-header">
            <span className="subject">{entry.subject}</span>
            <span>
              {new Date(entry.date).toLocaleDateString('de-DE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
          <div className="entry-content">
            {entry.observations && (
              <p>
                <strong>Beobachtung:</strong> {entry.observations}
              </p>
            )}
            {entry.measures && (
              <p>
                <strong>Maßnahme:</strong> {entry.measures}
              </p>
            )}
            {entry.erfolg && (
              <p>
                <strong>
                  Erfolg{getErfolgRatingText(entry.erfolgRating)}:
                </strong>{' '}
                {entry.erfolg}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DayDetails;

/** @jsxImportSource react */
import React, { useMemo } from 'react';

const StatisticsModal = ({ onClose, students, allEntries }) => {

    const stats = useMemo(() => {
        if (!students.length && !allEntries.length) {
            return null;
        }

        const totalStudents = students.length;
        const totalEntries = allEntries.length;

        const ratingCounts = allEntries.reduce((acc, entry) => {
            const rating = entry.erfolgRating || 'Keine';
            acc[rating] = (acc[rating] || 0) + 1;
            return acc;
        }, {});

        const entriesPerStudent = allEntries.reduce((acc, entry) => {
            acc[entry.studentId] = (acc[entry.studentId] || 0) + 1;
            return acc;
        }, {});

        const studentNameMap = new Map(students.map(s => [s.id, s.name]));

        let mostActiveStudent = 'N/A';
        let maxEntries = 0;
        for (const studentId in entriesPerStudent) {
            if (entriesPerStudent[studentId] > maxEntries) {
                maxEntries = entriesPerStudent[studentId];
                mostActiveStudent = studentNameMap.get(Number(studentId)) || 'Unbekannt';
            }
        }

        const entriesPerSchool = allEntries.reduce((acc, entry) => {
            const student = students.find(s => s.id === entry.studentId);
            if (student) {
                acc[student.school] = (acc[student.school] || 0) + 1;
            }
            return acc;
        }, {});

        return {
            totalStudents,
            totalEntries,
            ratingCounts: {
                positiv: ratingCounts['positiv'] || 0,
                negativ: ratingCounts['negativ'] || 0,
                Keine: ratingCounts['Keine'] || 0,
            },
            mostActiveStudent: totalEntries > 0 ? `${mostActiveStudent} (${maxEntries} Einträge)` : 'N/A',
            entriesPerSchool,
            averageEntriesPerStudent: totalStudents > 0 ? (totalEntries / totalStudents).toFixed(2) : 0,
        };
    }, [students, allEntries]);

    return (
        <div className="modal-backdrop">
            <div className="modal-content" style={{ maxWidth: '600px', textAlign: 'left' }}>
                <h2>Statistiken</h2>
                <div className="stats-content" style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '1rem' }}>
                    {!stats ? (
                        <p>Es sind noch nicht genügend Daten für eine Statistik vorhanden.</p>
                    ) : (
                        <>
                            <h3>Allgemein</h3>
                            <ul>
                                <li><strong>Anzahl Kinder:</strong> {stats.totalStudents}</li>
                                <li><strong>Anzahl Protokolleinträge:</strong> {stats.totalEntries}</li>
                                <li><strong>Einträge pro Kind (Durchschnitt):</strong> {stats.averageEntriesPerStudent}</li>
                                <li><strong>Aktivstes Kind:</strong> {stats.mostActiveStudent}</li>
                            </ul>

                            <h3>Auswertung der Einträge</h3>
                            <h4>Bewertung des Erfolgs</h4>
                            <ul>
                                <li><strong>Positiv:</strong> {stats.ratingCounts.positiv} ({stats.totalEntries > 0 ? ((stats.ratingCounts.positiv / stats.totalEntries) * 100).toFixed(1) : 0}%)</li>
                                <li><strong>Negativ:</strong> {stats.ratingCounts.negativ} ({stats.totalEntries > 0 ? ((stats.ratingCounts.negativ / stats.totalEntries) * 100).toFixed(1) : 0}%)</li>
                                <li><strong>Keine Bewertung:</strong> {stats.ratingCounts.Keine} ({stats.totalEntries > 0 ? ((stats.ratingCounts.Keine / stats.totalEntries) * 100).toFixed(1) : 0}%)</li>
                            </ul>

                            <h4>Einträge pro Schule</h4>
                            {Object.keys(stats.entriesPerSchool).length > 0 ? (
                                <ul>
                                    {Object.entries(stats.entriesPerSchool).map(([school, count]) => (
                                        <li key={school}><strong>{school}:</strong> {count} Einträge</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>Keine Einträge Schulen zugeordnet.</p>
                            )}
                        </>
                    )}
                </div>
                <div className="modal-actions">
                    <button type="button" className="btn btn-primary" onClick={onClose}>✔️ Schließen</button>
                </div>
            </div>
        </div>
    );
};

export default StatisticsModal;

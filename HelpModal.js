/** @jsxImportSource react */
import React from 'react';

const HelpModal = ({ onClose, onLoadSampleData, onClearAllData, onDownloadSampleData }) => {
    return (
        <div className="modal-backdrop">
            <div className="modal-content" style={{ maxWidth: '800px', textAlign: 'left' }}>
                <h2>Hilfe zur Anwendung</h2>
                <div className="help-content" style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '1rem' }}>
                    <p>Willkommen bei der Hilfe für Ihre Anwendung zur pädagogischen Dokumentation. Hier finden Sie eine Erklärung aller wichtigen Funktionen.</p>

                    <h3>1. Aufbau der Anwendung</h3>
                    <ul>
                        <li><strong>Kopfzeile:</strong> Ganz oben finden Sie den Titel der Anwendung.</li>
                        <li><strong>Werkzeugleiste:</strong> Unter der Kopfzeile befindet sich die Leiste mit den Hauptaktionen (z.B. Kind anlegen, Suchen, Exportieren).</li>
                        <li><strong>Navigation (links):</strong> Hier können Sie die Anzeige filtern und zwischen Kindern und Tagen wechseln.</li>
                        <li><strong>Hauptbereich (rechts):</strong> Hier werden die Protokolleinträge für das ausgewählte Kind oder den ausgewählten Tag angezeigt.</li>
                    </ul>

                    <h3>2. Kinder verwalten</h3>
                    <p><strong>Kind anlegen:</strong> Klicken Sie in der Werkzeugleiste auf <code>➕ Kind anlegen</code> und füllen Sie das Formular aus.</p>
                    <p><strong>Kind suchen:</strong> Nutzen Sie das Suchfeld in der Werkzeugleiste. Die Liste in der Navigation filtert sich automatisch.</p>

                    <h3>3. Einträge verwalten</h3>
                    <p><strong>Neuen Eintrag erstellen:</strong> Wählen Sie ein Kind aus und klicken Sie auf <code>✨ Neuer Eintrag</code>.</p>
                    <p><strong>Eintrag ändern oder löschen:</strong> Klicken Sie auf einen Eintrag, um ihn auszuwählen. Die Buttons <code>✏️ Eintrag ändern</code> und <code>🗑️ Eintrag löschen</code> werden dann aktiv.</p>

                    <h3>4. Filtern und Ansichten</h3>
                    <ul>
                        <li><strong>Schuljahr, Schule, Klasse, Kind:</strong> Filtern die Kinderliste, Filter kombinierbar.</li>
                        <li><strong>Tag:</strong> Wählen Sie ein Datum, um alle Einträge für diesen Tag zu sehen.</li>
                    </ul>

                    <h3>5. Datenmanagement (Import & Export)</h3>
                    <ul>
                        <li><strong>📤 Export:</strong> Speichert alle Daten in einer <code>.json</code>-Datei auf Ihrem Computer.</li>
                        <li><strong>📥 Import:</strong> Lädt eine exportierte <code>.json</code>-Datei. Aktuelle Daten werden überschrieben!</li>
                    </ul>

                    <h3>6. Einstellungen</h3>
                    <ul>
                        <li><strong>Farbschema:</strong> Standard (Hell), Dunkel, Hoher Kontrast, Farbig (Benutzerdefiniert).</li>
                        <li><strong>Schriftgröße:</strong> Anpassbar mit dem Schieberegler.</li>
                    </ul>

                    <h3 style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>Daten zurücksetzen & Testen</h3>
                    <p><strong>Achtung:</strong> Diese Aktionen können nicht rückgängig gemacht werden.</p>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                        <button type="button" className="btn btn-primary" onClick={onLoadSampleData}>
                            📊 Beispieldatensatz laden
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={onDownloadSampleData}>
                            💾 Beispieldaten herunterladen
                        </button>
                        <button type="button" className="btn btn-danger" onClick={onClearAllData}>
                            🗑️ Alle Daten löschen
                        </button>
                    </div>
                </div>

                <div className="modal-actions">
                    <button type="button" className="btn btn-primary" onClick={onClose}>✔️ Schließen</button>
                </div>
            </div>
        </div>
    );
};

export default HelpModal;

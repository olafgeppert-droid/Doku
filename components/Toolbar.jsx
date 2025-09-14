/** @jsxImportSource react */
import React from 'react';

const Toolbar = ({
    onNewStudent,
    onManageStudent,
    onNewEntry,
    onManageEntry,
    canManageStudent,
    canAddEntry,
    canManageEntry,
    onPrint,
    onExport,
    onImport,
    onUndo,
    onRedo,
    canUndo,
    canRedo,
}) => (
    <div className="toolbar">
        <div className="toolbar-row">
            <button className="btn btn-primary" onClick={onNewStudent}>➕ Kind anlegen</button>
            <button className="btn btn-secondary" onClick={onManageStudent} disabled={!canManageStudent}>
                ✏️ Kind bearbeiten/löschen
            </button>
            <button className="btn btn-primary" onClick={onNewEntry} disabled={!canAddEntry}>
                ✨ Protokoll anlegen
            </button>
            <button className="btn btn-secondary" onClick={onManageEntry} disabled={!canManageEntry}>
                ✏️ Protokoll bearbeiten/löschen
            </button>
        </div>
        <div className="toolbar-row">
            <button className="btn btn-secondary" onClick={onPrint}>🖨️ Drucken</button>
            <button className="btn btn-secondary" onClick={onExport}>📤 Datenexport</button>
            <button className="btn btn-secondary" onClick={onImport}>📥 Datenimport</button>
            <button className="btn btn-secondary" onClick={onUndo} disabled={!canUndo}>↩️ Rückgängig</button>
            <button className="btn btn-secondary" onClick={onRedo} disabled={!canRedo}>↪️ Wiederholen</button>
        </div>
    </div>
);

export default Toolbar;

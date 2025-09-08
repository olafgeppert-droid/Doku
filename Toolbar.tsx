/** @jsxImportSource react */
import React from 'react';

interface ToolbarProps {
    onNewStudent: () => void;
    onEdit: () => void;
    onDelete: () => void;
    canEditOrDelete: boolean;
    searchQuery: string;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onPrint: () => void;
    onExport: () => void;
    onImport: () => void;
}

const Toolbar = ({ onNewStudent, onEdit, onDelete, canEditOrDelete, searchQuery, onSearchChange, onPrint, onExport, onImport }: ToolbarProps) => (
    <div className="toolbar">
        <div className="search-bar">
            <input type="search" placeholder="Kind suchen" value={searchQuery} onChange={onSearchChange} />
        </div>
        <button className="btn btn-primary" onClick={onNewStudent}>➕ Kind anlegen</button>
        <button className="btn btn-secondary" onClick={onEdit} disabled={!canEditOrDelete}>✏️ Eintrag ändern</button>
        <button className="btn btn-danger" onClick={onDelete} disabled={!canEditOrDelete}>🗑️ Eintrag löschen</button>
        <button className="btn btn-secondary" onClick={onPrint}>🖨️ Drucken</button>
        <button className="btn btn-secondary" onClick={onExport}>📤 Export</button>
        <button className="btn btn-secondary" onClick={onImport}>📥 Import</button>
    </div>
);

export default Toolbar;

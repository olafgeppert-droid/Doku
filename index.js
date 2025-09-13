/** @jsxImportSource react */
import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';

// Import components
import Header from './Header.js';
import Navigation from './Navigation.js';
import Toolbar from './Toolbar.js';
import StudentDetails from './StudentDetails.js';
import DayDetails from './DayDetails.js';
import StudentModal from './StudentModal.js';
import EntryModal from './EntryModal.js';
import SettingsModal from './SettingsModal.js';
import HelpModal from './HelpModal.js';
import StatisticsModal from './StatisticsModal.js';
import MasterDataModal from './MasterDataModal.js';

// Import DB functions
import {
    initDB,
    DB_VERSION,
    addStudentToDB,
    getStudentsFromDB,
    addEntryToDB,
    updateEntryInDB,
    deleteEntryFromDB,
    getAllEntriesFromDB,
    updateStudentInDB,
    deleteStudentFromDB,
    importData,
    clearAllData as clearAllDataFromDB,
} from './database.js';

import { sampleStudents, sampleEntries, sampleMasterData } from './sample-data.js';

// --- DEFAULT SETTINGS ---
const DEFAULT_SETTINGS = {
    theme: 'default',
    fontSize: 16,
    inputFontSize: 16,
    customColors: {
        sidebar: '#e9ecef',
        header: '#343a40',
        toolbar: '#f8f9fa',
        entryBackground: '#ffffff',
    },
    masterData: {
        schoolYears: ['2024/2025', '2025/2026', '2026/2027'],
        schools: {
            'Heinz-Sielmann-Schule, Grundschule Neustadt an der Weinstraße': [],
            'Ostschule, Grundschule Neustadt an der Weinstraße': [],
        }
    }
};

const App = () => {
    // Data state
    const [students, setStudents] = useState([]);
    const [allEntries, setAllEntries] = useState([]);
    const [version, setVersion] = useState('');
    const [dbError, setDbError] = useState(null);

    // History state
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // Selection state
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedEntry, setSelectedEntry] = useState(null);

    // UI state
    const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
    const [studentToEdit, setStudentToEdit] = useState(null);
    const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
    const [entryToEdit, setEntryToEdit] = useState(null);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
    const [isStatisticsModalOpen, setIsStatisticsModalOpen] = useState(false);
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [isNavVisible, setIsNavVisible] = useState(false);

    // Filter & Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [studentDateFilter, setStudentDateFilter] = useState(new Date().toISOString().split('T')[0]);
    const [globalDateFilter, setGlobalDateFilter] = useState('');
    const [filters, setFilters] = useState({ schoolYear: 'all', school: 'all', className: 'all', studentId: 'all' });

    // --- DATABASE & DATA LOADING ---
    useEffect(() => {
        initDB().then(async () => {
            loadSettings();
            await forceDataRefresh(true);
        }).catch(err => {
            console.error("DB init failed:", err);
            setDbError("Die Datenbank konnte nicht initialisiert werden. Bitte prüfen Sie Ihre Browser-Einstellungen.");
        });

        fetch('./metadata.json')
            .then(res => res.json())
            .then(data => setVersion(data.version || ''))
            .catch(err => console.error("Failed to load version:", err));
    }, []);

    // --- hier bleibt der rest deines Codes unverändert ---
    // Filter, forceDataRefresh, Handlers, Modals etc.
    // Typen wurden entfernt, alles läuft in reinem JS.

    return (
        <div>
            {/* Hier wird dein existierender App-Code mit Header, Toolbar, Navigation etc. */}
            {/* Modals werden hier je nach Zustand geöffnet */}
        </div>
    );
};

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
} else {
    const rootDiv = document.createElement('div');
    rootDiv.id = 'root';
    document.body.appendChild(rootDiv);
    const root = createRoot(rootDiv);
    root.render(<App />);
}

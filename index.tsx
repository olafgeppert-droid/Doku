/** @jsxImportSource react */
import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';

// Import components
import Header from './Header';
import Navigation from './Navigation';
import Toolbar from './Toolbar';
import StudentDetails from './StudentDetails';
import DayDetails from './DayDetails';
import StudentModal from './StudentModal';
import EntryModal from './EntryModal';
import SettingsModal from './SettingsModal';
import HelpModal from './HelpModal';

// Import types and DB functions
import type { Student, Entry, Settings } from './types';
import {
    initDB,
    addStudentToDB,
    getStudentsFromDB,
    addEntryToDB,
    updateEntryInDB,
    deleteEntryFromDB,
    getAllEntriesFromDB,
    updateStudentInDB,
    deleteStudentFromDB,
} from './database';

// --- DEFAULT SETTINGS ---
const DEFAULT_SETTINGS: Settings = {
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
        schoolYears: ['2023/2024', '2024/2025', '2025/2026'],
        schools: {
            'Grundschule am Park': ['1a', '1b', '2a', '2b', '3a', '3b', '4a', '4b'],
            'Goethe-Gesamtschule': ['5c', '6a', '7b', '8d', '9a', '10c'],
        }
    }
};

type HistoryState = {
    students: Student[];
    allEntries: Entry[];
};

const App = () => {
    // Data state
    const [students, setStudents] = useState<Student[]>([]);
    const [allEntries, setAllEntries] = useState<Entry[]>([]);
    const [version, setVersion] = useState('');

    // History state
    const [history, setHistory] = useState<HistoryState[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // Selection state
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);

    // UI state
    const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
    const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
    const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
    const [entryToEdit, setEntryToEdit] = useState<Entry | null>(null);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
    const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
    const [isNavVisible, setIsNavVisible] = useState(false); // State for mobile navigation

    // Filter & Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [studentDateFilter, setStudentDateFilter] = useState(new Date().toISOString().split('T')[0]);
    const [globalDateFilter, setGlobalDateFilter] = useState('');
    const [filters, setFilters] = useState({ schoolYear: 'all', school: 'all', className: 'all', studentId: 'all' });
    
    // --- DATABASE & DATA LOADING ---
    useEffect(() => {
        initDB().then(async () => {
            loadSettings();
            const initialStudents = await getStudentsFromDB();
            const initialEntries = await getAllEntriesFromDB();
            
            // Set initial history state, which will trigger the useEffect to set component state
            setHistory([{ students: initialStudents, allEntries: initialEntries }]);
            setHistoryIndex(0);

        }).catch(err => console.error("DB initialization failed:", err));
        
        fetch('./metadata.json')
            .then(res => res.json())
            .then(data => setVersion(data.version || ''))
            .catch(err => console.error("Failed to load version:", err));

    }, []);
    
    // --- EFFECTS ---
    // Apply settings
    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--font-size', `${settings.fontSize}px`);
        root.style.setProperty('--input-font-size', `${settings.inputFontSize ?? 16}px`);
        
        const applyThemeColors = (themeSettings: Partial<Settings['customColors']>) => {
            root.style.setProperty('--sidebar-bg', themeSettings.sidebar || null);
            root.style.setProperty('--header-bg', themeSettings.header || null);
            root.style.setProperty('--toolbar-bg', themeSettings.toolbar || null);
            root.style.setProperty('--card-bg', themeSettings.entryBackground || null);
            root.style.setProperty('--border-color', settings.theme === 'dark' || settings.theme === 'high-contrast' ? '#6c757d' : null);
        };
        
        const resetButtonColors = () => {
            root.style.removeProperty('--primary-color');
            root.style.removeProperty('--secondary-color');
            root.style.removeProperty('--danger-color');
            root.style.removeProperty('--btn-primary-text');
            root.style.removeProperty('--btn-secondary-text');
            root.style.removeProperty('--btn-danger-text');
        };

        document.body.dataset.theme = settings.theme;
        
        if (settings.theme === 'dark') {
            applyThemeColors({ sidebar: '#495057', header: '#212529', toolbar: '#343a40', entryBackground: '#343a40' });
            root.style.setProperty('--background-color', '#212529');
            root.style.setProperty('--text-color', '#f8f9fa');
            root.style.setProperty('--input-bg', '#343a40');
            resetButtonColors();
        } else if (settings.theme === 'high-contrast') {
             applyThemeColors({ sidebar: '#000', header: '#000', toolbar: '#000', entryBackground: '#222' });
             root.style.setProperty('--background-color', '#111');
             root.style.setProperty('--text-color', '#fff');
             root.style.setProperty('--input-bg', '#222');
             
             // High-contrast button colors for readability
             root.style.setProperty('--primary-color', '#ffff00');
             root.style.setProperty('--btn-primary-text', '#000');
             root.style.setProperty('--secondary-color', '#f8f9fa');
             root.style.setProperty('--btn-secondary-text', '#212529');
             root.style.setProperty('--danger-color', '#f5c6cb');
             root.style.setProperty('--btn-danger-text', '#721c24');

        } else if (settings.theme === 'custom') {
            applyThemeColors(settings.customColors);
             root.style.setProperty('--background-color', '#f8f9fa');
             root.style.setProperty('--text-color', '#212529');
             root.style.setProperty('--input-bg', '#e9ecef');
             resetButtonColors();
        } else { // default
            applyThemeColors(DEFAULT_SETTINGS.customColors);
            root.style.removeProperty('--background-color');
            root.style.removeProperty('--text-color');
            root.style.removeProperty('--input-bg');
            resetButtonColors();
        }

    }, [settings]);
    
    // Auto-select student from filter
     useEffect(() => {
        if (filters.studentId !== 'all') {
            const studentToSelect = students.find(s => String(s.id) === filters.studentId);
            if (studentToSelect && selectedStudent?.id !== studentToSelect.id) {
                handleSelectStudent(studentToSelect);
            }
        }
    }, [filters.studentId, students]);

    // Sync component state with current history state
    useEffect(() => {
        const currentState = history[historyIndex];
        if (currentState) {
            setStudents(currentState.students.sort((a,b) => a.name.localeCompare(b.name)));
            setAllEntries(currentState.allEntries);
        }
    }, [history, historyIndex]);

    // --- FILTERING LOGIC ---
    const studentEntries = useMemo(() => {
        if (!selectedStudent?.id) return [];
        const entriesForStudent = allEntries.filter(e => e.studentId === selectedStudent.id);
        const filtered = studentDateFilter ? entriesForStudent.filter(e => e.date === studentDateFilter) : entriesForStudent;
        return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [allEntries, selectedStudent, studentDateFilter]);

    const dayEntries = useMemo(() => {
        if (!globalDateFilter) return [];
        return allEntries.filter(e => e.date === globalDateFilter);
    }, [allEntries, globalDateFilter]);
    
    const filteredStudents = useMemo(() => {
        return students
            .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .filter(s => filters.schoolYear === 'all' || s.schoolYear === filters.schoolYear)
            .filter(s => filters.school === 'all' || s.school === filters.school)
            .filter(s => filters.className === 'all' || s.className === filters.className)
            .filter(s => filters.studentId === 'all' || String(s.id) === filters.studentId);
    }, [students, searchQuery, filters]);

    const filterOptions = useMemo(() => {
        return {
            schoolYears: [...new Set(students.map(s => s.schoolYear))].sort(),
            schools: [...new Set(students.map(s => s.school))].sort(),
            classNames: [...new Set(students.map(s => s.className))].sort(),
        };
    }, [students]);

    // --- HISTORY & STATE MANAGEMENT ---
    const pushNewStateToHistory = async () => {
        const newStudents = await getStudentsFromDB();
        const newAllEntries = await getAllEntriesFromDB();
        const newState = { students: newStudents, allEntries: newAllEntries };

        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newState);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    const handleUndo = () => {
        if (canUndo) setHistoryIndex(historyIndex - 1);
    };

    const handleRedo = () => {
        if (canRedo) setHistoryIndex(historyIndex + 1);
    };

    const canUndo = historyIndex > 0;
    const canRedo = historyIndex < history.length - 1;

    // --- HANDLERS ---
    const handleSelectStudent = (student: Student) => {
        setSelectedStudent(student);
        setSelectedEntry(null);
        setGlobalDateFilter(''); // Clear day view when a student is selected
    };

    const handleGlobalDateChange = (date: string) => {
        setGlobalDateFilter(date);
        if (date) {
            setSelectedStudent(null); // Clear student view when a day is selected
            setSelectedEntry(null);
        } else if (filters.studentId !== 'all') {
             const studentToSelect = students.find(s => String(s.id) === filters.studentId);
             if(studentToSelect) setSelectedStudent(studentToSelect);
        }
    };
    
    const handleSaveStudent = async (studentData: Student | Omit<Student, 'id'>) => {
        try {
            if ('id' in studentData && studentData.id) {
                await updateStudentInDB(studentData as Student);
            } else {
                await addStudentToDB(studentData as Omit<Student, 'id'>);
            }
            setIsStudentModalOpen(false);
            setStudentToEdit(null);
            await pushNewStateToHistory();
        } catch (error) {
            console.error("Failed to save student:", error);
        }
    };
    
    const handleManageStudent = () => {
        if (selectedStudent) {
            setStudentToEdit(selectedStudent);
            setIsStudentModalOpen(true);
        }
    };

    const handleDeleteStudent = async () => {
        const studentToDelete = studentToEdit;
        if (studentToDelete?.id && window.confirm(`"${studentToDelete.name}" und alle zugehörigen Einträge wirklich löschen?`)) {
            await deleteStudentFromDB(studentToDelete.id);
            const studentIdToDelete = studentToDelete.id;

            setIsStudentModalOpen(false);
            setStudentToEdit(null);

            setSelectedStudent(null);
            if (String(studentIdToDelete) === filters.studentId) {
                setFilters(prev => ({...prev, studentId: 'all' }));
            }
            await pushNewStateToHistory();
        }
    };

    const handleNewEntry = () => {
        if (selectedStudent) {
            setEntryToEdit(null);
            setIsEntryModalOpen(true);
        }
    };

    const handleSaveEntry = async (entryData: Omit<Entry, 'id' | 'studentId'>) => {
        try {
            if (entryToEdit) { // Editing existing entry
                const updatedEntry = { ...entryToEdit, ...entryData };
                await updateEntryInDB(updatedEntry);
            } else if (selectedStudent?.id) { // Creating new entry
                const newEntry: Entry = {
                    ...entryData,
                    studentId: selectedStudent.id,
                };
                await addEntryToDB(newEntry);
            }
            setEntryToEdit(null);
            setIsEntryModalOpen(false);
            await pushNewStateToHistory();
        } catch (error) {
            console.error("Failed to save entry:", error);
        }
    };

    const handleManageEntry = () => {
        if (selectedEntry) {
            setEntryToEdit(selectedEntry);
            setIsEntryModalOpen(true);
        }
    };

    const handleDeleteEntry = async () => {
        const entryToDelete = entryToEdit;
        if (entryToDelete?.id && window.confirm("Diesen Eintrag wirklich löschen?")) {
            await deleteEntryFromDB(entryToDelete.id);
            
            setIsEntryModalOpen(false);
            setEntryToEdit(null);

            setSelectedEntry(null);
            await pushNewStateToHistory();
        }
    };

    const handlePrint = () => window.print();

    const handleExport = async () => {
        try {
            const allStudents = await getStudentsFromDB();
            const allEntries = await getAllEntriesFromDB();
            const data = { students: allStudents, entries: allEntries, settings };
            const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
            const link = document.createElement("a");
            link.href = jsonString;
            link.download = `PedaProtokoll_Export_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
        } catch (error) {
            console.error("Export failed:", error);
            alert("Export fehlgeschlagen!");
        }
    };

    const handleImport = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                if (!window.confirm("Achtung: Der Import überschreibt alle vorhandenen Daten. Fortfahren?")) return;
                
                const reader = new FileReader();
                reader.onload = async (event) => {
                    try {
                        const data = JSON.parse(event.target?.result as string);
                        if (!data.students || !data.entries) throw new Error("Invalid import file format.");
                        
                        alert("Import-Funktion ist konzeptionell, da ein sicheres Überschreiben der Datenbank komplex ist. In einer echten Anwendung würde hier eine Transaktion zum Leeren und Neubefüllen der Datenbank stattfinden.");
                        if(data.settings) handleSaveSettings(data.settings);
                        
                    } catch (err) {
                        console.error("Import failed:", err);
                        alert(`Import fehlgeschlagen: ${(err as Error).message}`);
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    };

    const loadSettings = () => {
        const savedSettings = localStorage.getItem('peda-protokoll-settings');
        if (savedSettings) {
            try {
                const parsedSettings = JSON.parse(savedSettings);
                 // Migration for renamed setting key
                if (parsedSettings.dropdownFontSize && !parsedSettings.inputFontSize) {
                    parsedSettings.inputFontSize = parsedSettings.dropdownFontSize;
                    delete parsedSettings.dropdownFontSize;
                }
                 // Migration for masterData
                if (!parsedSettings.masterData) {
                    parsedSettings.masterData = DEFAULT_SETTINGS.masterData;
                }
                setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
            } catch {
                setSettings(DEFAULT_SETTINGS);
            }
        }
    };

    const handleSaveSettings = (newSettings: Settings) => {
        setSettings(newSettings);
        localStorage.setItem('peda-protokoll-settings', JSON.stringify(newSettings));
        setIsSettingsModalOpen(false);
    };

    const studentNameMap = useMemo(() => {
        return new Map(students.map(s => [s.id!, s.name]));
    }, [students]);

    const studentForModal = entryToEdit ? students.find(s => s.id === entryToEdit.studentId) : selectedStudent;

    return (
        <div className="app">
            <Header onToggleNav={() => setIsNavVisible(!isNavVisible)} />
            {isNavVisible && <div className="backdrop" onClick={() => setIsNavVisible(false)}></div>}
            <Toolbar
                onNewStudent={() => { setStudentToEdit(null); setIsStudentModalOpen(true); }}
                onManageStudent={handleManageStudent}
                onNewEntry={handleNewEntry}
                onManageEntry={handleManageEntry}
                canManageStudent={!!selectedStudent}
                canAddEntry={!!selectedStudent}
                canManageEntry={!!selectedEntry}
                onPrint={handlePrint}
                onExport={handleExport}
                onImport={handleImport}
                onUndo={handleUndo}
                onRedo={handleRedo}
                canUndo={canUndo}
                canRedo={canRedo}
            />
            <Navigation
                students={filteredStudents}
                onSelectStudent={handleSelectStudent}
                selectedStudent={selectedStudent}
                filters={filters}
                setFilters={setFilters}
                filterOptions={filterOptions}
                globalDateFilter={globalDateFilter}
                onGlobalDateChange={handleGlobalDateChange}
                studentOptions={students}
                onOpenSettings={() => setIsSettingsModalOpen(true)}
                onOpenHelp={() => setIsHelpModalOpen(true)}
                isNavVisible={isNavVisible}
                onClose={() => setIsNavVisible(false)}
                searchQuery={searchQuery}
                onSearchChange={e => setSearchQuery(e.target.value)}
            />
            <main className="main-content">
                {globalDateFilter ? (
                    <DayDetails
                        date={globalDateFilter}
                        entries={dayEntries}
                        selectedEntry={selectedEntry}
                        onSelectEntry={setSelectedEntry}
                        studentNameMap={studentNameMap}
                    />
                ) : selectedStudent ? (
                    <StudentDetails
                        student={selectedStudent}
                        entries={studentEntries}
                        selectedEntry={selectedEntry}
                        onSelectEntry={setSelectedEntry}
                        dateFilter={studentDateFilter}
                        onDateFilterChange={setStudentDateFilter}
                    />
                ) : (
                    <div className="no-entries">
                        <h2>Willkommen!</h2>
                        <p>Wählen Sie links ein Kind aus der Liste, um die Protokolle anzuzeigen, oder wählen Sie einen Tag, um alle Einträge für diesen Tag zu sehen.</p>
                    </div>
                )}
            </main>

            {isStudentModalOpen && (
                <StudentModal
                    onClose={() => { setIsStudentModalOpen(false); setStudentToEdit(null); }}
                    onSaveStudent={handleSaveStudent}
                    onDeleteStudent={handleDeleteStudent}
                    studentToEdit={studentToEdit}
                    masterData={settings.masterData}
                />
            )}
            {isEntryModalOpen && studentForModal && (
                 <EntryModal
                    student={studentForModal}
                    onClose={() => { setIsEntryModalOpen(false); setEntryToEdit(null); }}
                    onSaveEntry={handleSaveEntry}
                    onDeleteEntry={handleDeleteEntry}
                    entryToEdit={entryToEdit}
                />
            )}
            {isSettingsModalOpen && (
                <SettingsModal
                    onClose={() => setIsSettingsModalOpen(false)}
                    onSave={handleSaveSettings}
                    currentSettings={settings}
                    version={version}
                />
            )}
            {isHelpModalOpen && (
                <HelpModal onClose={() => setIsHelpModalOpen(false)} />
            )}
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
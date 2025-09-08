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
    getEntriesForStudentFromDB,
    getEntriesForDateFromDB,
    getAllEntriesFromDB,
} from './database';

// --- DEFAULT SETTINGS ---
const DEFAULT_SETTINGS: Settings = {
    theme: 'default',
    fontSize: 16,
    customColors: {
        sidebar: '#e9ecef',
        header: '#343a40',
        toolbar: '#f8f9fa',
        entryBackground: '#ffffff',
    }
};

const App = () => {
    // Data state
    const [students, setStudents] = useState<Student[]>([]);
    const [studentEntries, setStudentEntries] = useState<Entry[]>([]);
    const [dayEntries, setDayEntries] = useState<Entry[]>([]);
    const [version, setVersion] = useState('');

    // Selection state
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);

    // UI state
    const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
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
        initDB().then(() => {
            loadStudents();
            loadSettings();
        }).catch(err => console.error("DB initialization failed:", err));
        
        fetch('./metadata.json')
            .then(res => res.json())
            .then(data => setVersion(data.version || ''))
            .catch(err => console.error("Failed to load version:", err));

    }, []);

    const loadStudents = async () => {
        try {
            const allStudents = await getStudentsFromDB();
            setStudents(allStudents.sort((a,b) => a.name.localeCompare(b.name)));
        } catch (error) {
            console.error("Failed to load students:", error);
        }
    };
    
    // --- EFFECTS ---
    // Apply settings
    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--font-size', `${settings.fontSize}px`);
        
        const applyThemeColors = (themeSettings: Partial<Settings['customColors']>) => {
            root.style.setProperty('--sidebar-bg', themeSettings.sidebar || '');
            root.style.setProperty('--header-bg', themeSettings.header || '');
            root.style.setProperty('--toolbar-bg', themeSettings.toolbar || '');
            root.style.setProperty('--card-bg', themeSettings.entryBackground || '');
            root.style.setProperty('--border-color', settings.theme === 'dark' || settings.theme === 'high-contrast' ? '#6c757d' : '#dee2e6');
        };
        
        document.body.dataset.theme = settings.theme;
        
        if (settings.theme === 'dark') {
            applyThemeColors({ sidebar: '#495057', header: '#212529', toolbar: '#343a40', entryBackground: '#343a40' });
            root.style.setProperty('--background-color', '#212529');
            root.style.setProperty('--text-color', '#f8f9fa');
        } else if (settings.theme === 'high-contrast') {
             applyThemeColors({ sidebar: '#000', header: '#000', toolbar: '#000', entryBackground: '#222' });
             root.style.setProperty('--background-color', '#111');
             root.style.setProperty('--text-color', '#fff');
             root.style.setProperty('--primary-color', '#ffff00');
        } else if (settings.theme === 'custom') {
            applyThemeColors(settings.customColors);
             root.style.setProperty('--background-color', '#f8f9fa');
             root.style.setProperty('--text-color', '#212529');
        } else { // default
            applyThemeColors(DEFAULT_SETTINGS.customColors);
            root.style.setProperty('--background-color', '#f8f9fa');
            root.style.setProperty('--text-color', '#212529');
        }

    }, [settings]);

    // Fetch entries for selected student
    useEffect(() => {
        if (selectedStudent?.id) {
            getEntriesForStudentFromDB(selectedStudent.id)
                .then(entries => {
                    const filtered = studentDateFilter ? entries.filter(e => e.date === studentDateFilter) : entries;
                    setStudentEntries(filtered);
                })
                .catch(err => console.error("Failed to fetch student entries:", err));
        } else {
            setStudentEntries([]);
        }
    }, [selectedStudent, studentDateFilter]);
    
    // Fetch entries for global date filter
    useEffect(() => {
        if (globalDateFilter) {
            getEntriesForDateFromDB(globalDateFilter)
                .then(setDayEntries)
                .catch(err => console.error("Failed to fetch day entries:", err));
        } else {
            setDayEntries([]);
        }
    }, [globalDateFilter]);
    
    // Auto-select student from filter
     useEffect(() => {
        if (filters.studentId !== 'all') {
            const studentToSelect = students.find(s => String(s.id) === filters.studentId);
            if (studentToSelect && selectedStudent?.id !== studentToSelect.id) {
                handleSelectStudent(studentToSelect);
            }
        }
    }, [filters.studentId, students]);

    // --- FILTERING LOGIC ---
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

    const handleAddStudent = async (studentData: Omit<Student, 'id'>) => {
        try {
            await addStudentToDB(studentData);
            loadStudents();
            setIsStudentModalOpen(false);
        } catch (error) {
            console.error("Failed to add student:", error);
        }
    };
    
    const handleSaveEntry = async (entryData: Omit<Entry, 'id' | 'studentId'>) => {
        let studentIdForRefresh: number | undefined;
        if (entryToEdit) { // Editing existing entry
            const updatedEntry = { ...entryToEdit, ...entryData };
            await updateEntryInDB(updatedEntry);
            studentIdForRefresh = updatedEntry.studentId;
        } else if (selectedStudent?.id) { // Creating new entry
            const newEntry: Entry = {
                ...entryData,
                studentId: selectedStudent.id,
            };
            await addEntryToDB(newEntry);
            studentIdForRefresh = newEntry.studentId;
        }
        setEntryToEdit(null);
        setIsEntryModalOpen(false);
        // Refresh entries
        if (studentIdForRefresh) {
            const entries = await getEntriesForStudentFromDB(studentIdForRefresh);
            setStudentEntries(studentDateFilter ? entries.filter(e => e.date === studentDateFilter) : entries);
        }
        if (globalDateFilter) {
            const entries = await getEntriesForDateFromDB(globalDateFilter);
            setDayEntries(entries);
        }
    };

    const handleEdit = () => {
        if (selectedEntry) {
            setEntryToEdit(selectedEntry);
            setIsEntryModalOpen(true);
        }
    };

    const handleDelete = async () => {
        if (selectedEntry?.id && window.confirm("Diesen Eintrag wirklich löschen?")) {
            const studentIdForRefresh = selectedEntry.studentId;
            await deleteEntryFromDB(selectedEntry.id);
            setSelectedEntry(null);
            // Refresh entries
            if (studentIdForRefresh) {
                const entries = await getEntriesForStudentFromDB(studentIdForRefresh);
                 setStudentEntries(studentDateFilter ? entries.filter(e => e.date === studentDateFilter) : entries);
            }
             if (globalDateFilter) {
                const entries = await getEntriesForDateFromDB(globalDateFilter);
                setDayEntries(entries);
            }
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
                setSettings(JSON.parse(savedSettings));
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
                onNewStudent={() => setIsStudentModalOpen(true)}
                onEdit={handleEdit}
                onDelete={handleDelete}
                canEditOrDelete={!!selectedEntry}
                searchQuery={searchQuery}
                onSearchChange={e => setSearchQuery(e.target.value)}
                onPrint={handlePrint}
                onExport={handleExport}
                onImport={handleImport}
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
                        onNewEntry={() => { setEntryToEdit(null); setIsEntryModalOpen(true); }}
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
                    onClose={() => setIsStudentModalOpen(false)}
                    onAddStudent={handleAddStudent}
                />
            )}
            {isEntryModalOpen && studentForModal && (
                 <EntryModal
                    student={studentForModal}
                    onClose={() => { setIsEntryModalOpen(false); setEntryToEdit(null); }}
                    onSaveEntry={handleSaveEntry}
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
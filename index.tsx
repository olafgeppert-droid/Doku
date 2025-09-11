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
import StatisticsModal from './StatisticsModal';

// Import types and DB functions
import type { Student, Entry, Settings } from './types';
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
} from './database';
import { sampleStudents, sampleEntries, sampleMasterData } from './sample-data';

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
        schoolYears: ['2024/2025', '2025/2026', '2026/2027'],
        schools: {
            'Heinz-Sielmann-Schule, Grundschule Neustadt an der Weinstraße': [],
            'Ostschule, Grundschule Neustadt an der Weinstraße': [],
        }
    }
};

type HistoryState = {
    students: Student[];
    allEntries: Entry[];
};

const App = () => {
    // Debugging
    console.log("App component mounting");
    console.log("DB Version:", DB_VERSION);
    
    // Data state
    const [students, setStudents] = useState<Student[]>([]);
    const [allEntries, setAllEntries] = useState<Entry[]>([]);
    const [version, setVersion] = useState('');
    const [dbError, setDbError] = useState<string | null>(null);

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
    const [isStatisticsModalOpen, setIsStatisticsModalOpen] = useState(false);
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
            console.log("DB Initialized successfully.");
            loadSettings();
            await forceDataRefresh(true); // Initial data load
        }).catch(err => {
            console.error("Fatal DB initialization failed:", err);
            setDbError("Die Datenbank konnte nicht initialisiert werden. Dies kann passieren, wenn Sie im privaten Modus surfen, Cookies/Website-Daten blockiert sind oder der Speicherplatz voll ist. Bitte überprüfen Sie Ihre Browsereinstellungen und laden Sie die Seite neu.");
        });
        
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

    // --- FILTERING LOGIC ---
    const filterOptions = useMemo(() => {
        const studentSchoolYears = students.map(s => s.schoolYear);
        const studentSchools = students.map(s => s.school);

        const masterSchoolYears = settings.masterData?.schoolYears || [];
        const masterSchools = Object.keys(settings.masterData?.schools || {});

        let classNames: string[] = [];
        const selectedSchool = filters.school;

        if (selectedSchool === 'all') {
            // Get all unique class names from master data and students
            const masterClasses = Object.values(settings.masterData?.schools || {}).flat();
            const studentClasses = students.map(s => s.className).filter(Boolean);
            classNames = [...new Set([...masterClasses, ...studentClasses])];
        } else {
            // Get classes for the selected school from master data
            const masterClassesForSchool = settings.masterData?.schools?.[selectedSchool] || [];
            
            // Get classes for the selected school from students (in case of data inconsistency)
            const studentClassesForSchool = students
                .filter(s => s.school === selectedSchool && s.className)
                .map(s => s.className);
            
            classNames = [...new Set([...masterClassesForSchool, ...studentClassesForSchool])];
        }

        return {
            schoolYears: [...new Set([...masterSchoolYears, ...studentSchoolYears])].sort(),
            schools: [...new Set([...masterSchools, ...studentSchools])].sort(),
            classNames: classNames.sort(),
        };
    }, [students, settings.masterData, filters.school]);

    // Auto-reset class filter when school changes and selected class is no longer valid
    useEffect(() => {
        if (filters.school !== 'all' && filters.className !== 'all') {
            const validClasses = filterOptions.classNames;
            if (!validClasses.includes(filters.className)) {
                setFilters(prev => ({ ...prev, className: 'all' }));
            }
        }
    }, [filters.school, filters.className, filterOptions.classNames]);
    
    // Auto-select student from filter
    useEffect(() => {
        if (filters.studentId !== 'all') {
            const studentToSelect = students.find(s => s.id === Number(filters.studentId)); // ✅ Number()
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
            .filter(s => filters.studentId === 'all' || s.id === Number(filters.studentId)); // ✅ Number()
    }, [students, searchQuery, filters]);

    // --- HISTORY & STATE MANAGEMENT ---
    const forceDataRefresh = async (isInitialLoad = false) => {
        console.log("[App] Forcing data refresh from DB...");
        try {
            const freshStudents = await getStudentsFromDB();
            const freshEntries = await getAllEntriesFromDB();
            const newState = { students: freshStudents, allEntries: freshEntries };
    
            setStudents(freshStudents.sort((a, b) => a.name.localeCompare(b.name)));
            setAllEntries(freshEntries);
    
            if (isInitialLoad) {
                setHistory([newState]);
                setHistoryIndex(0);
            } else {
                setHistory(prev => {
                    const trimmed = prev.slice(0, historyIndex + 1);
                    trimmed.push(newState);
                    setHistoryIndex(trimmed.length - 1);
                    return trimmed;
                });
            }
            console.log("[App] Data refresh complete.");
        } catch (error) {
            console.error("Failed to refresh data from DB:", error);
            alert("Ein Fehler ist beim Laden der Daten aufgetreten. Bitte laden Sie die Seite neu.");
        }
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
            await forceDataRefresh();
        } catch (error) {
            console.error("Failed to save student:", error);
            alert("Fehler beim Speichern des Kindes.");
        }
    };
    
    const handleManageStudent = () => {
        if (selectedStudent) {
            setStudentToEdit(selectedStudent);
            setIsStudentModalOpen(true);
        }
    };

    const handleDeleteStudent = async (studentToDelete: Student) => {
        console.log("DELETE STUDENT CALLED:", studentToDelete);
        
        if (!studentToDelete?.id) {
            console.error("[App] Kein gültiger Student zum Löschen:", studentToDelete);
            alert("Kein gültiges Kind zum Löschen ausgewählt. Aktion abgebrochen.");
            return;
        }
        
        if (!window.confirm(`"${studentToDelete.name}" und alle zugehörigen Einträge wirklich löschen?`)) return;
    
        try {
            console.log("[App] Lösche Student aus DB:", studentToDelete.id, studentToDelete.name);
            await deleteStudentFromDB(studentToDelete.id);
            console.log("[App] DB-Löschen erfolgreich, lade Daten neu...");
            
            await forceDataRefresh();
            console.log("[App] Datenrefresh abgeschlossen");
    
            setIsStudentModalOpen(false);
            setStudentToEdit(null);
            
            if (selectedStudent?.id === studentToDelete.id) {
                setSelectedStudent(null);
                console.log("[App] SelectedStudent zurückgesetzt");
            }
            
            if (String(studentToDelete.id) === filters.studentId) {
                setFilters(prev => ({ ...prev, studentId: 'all' }));
                console.log("[App] Filter zurückgesetzt");
            }
            
            console.log("[App] Löschen komplett abgeschlossen");
        } catch (error) {
            console.error("Fehler beim Löschen des Kindes:", error);
            alert("Fehler beim Löschen des Kindes. Bitte Browser-Konsole prüfen.");
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
            await forceDataRefresh();
        } catch (error) {
            console.error("Failed to save entry:", error);
            alert("Fehler beim Speichern des Eintrags.");
        }
    };

    const handleManageEntry = () => {
        if (selectedEntry) {
            setEntryToEdit(selectedEntry);
            setIsEntryModalOpen(true);
        }
    };

    const handleDeleteEntry = async (entryToDelete: Entry) => {
        if (!entryToDelete?.id) {
            console.error("[App] Kein gültiger Eintrag zum Löschen übergeben:", entryToDelete);
            alert("Kein gültiger Eintrag zum Löschen ausgewählt.");
            return;
        }
        if (window.confirm("Diesen Eintrag wirklich löschen?")) {
            try {
                await deleteEntryFromDB(entryToDelete.id);
                await forceDataRefresh();
    
                setIsEntryModalOpen(false);
                setEntryToEdit(null);
                if (selectedEntry?.id === entryToDelete.id) {
                    setSelectedEntry(null);
                }
            } catch (error) {
                 console.error("Fehler beim Löschen des Eintrags:", error);
                 alert("Fehler beim Löschen des Eintrags.");
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
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                if (!window.confirm("Achtung: Der Import überschreibt alle vorhandenen Daten. Fortfahren?")) return;
                
                try {
                    const text = await file.text();
                    const data = JSON.parse(text);
                    
                    // ✅ Datenvalidierung
                    if (!data.students || !Array.isArray(data.students) || 
                        !data.entries || !Array.isArray(data.entries)) {
                        throw new Error("Ungültiges Dateiformat: students oder entries fehlen");
                    }
    
                    // ✅ IDs sicherstellen (könnten strings sein aus Export)
                    const studentsWithNumericIds = data.students.map((s: any) => ({
                        ...s,
                        id: s.id ? Number(s.id) : undefined
                    }));
    
                    const entriesWithNumericIds = data.entries.map((e: any) => ({
                        ...e,
                        id: e.id ? Number(e.id) : undefined,
                        studentId: Number(e.studentId) // ✅ Wichtig: studentId muss number sein
                    }));
    
                    await importData(studentsWithNumericIds, entriesWithNumericIds);
                    
                    // ✅ Settings nur importieren wenn vorhanden und gültig
                    if (data.settings && typeof data.settings === 'object') {
                        handleSaveSettings({ ...settings, ...data.settings }, true);
                    }
                    
                    await forceDataRefresh();
                    
                    // Reset
                    setSelectedStudent(null);
                    setSelectedEntry(null);
                    setFilters({ schoolYear: 'all', school: 'all', className: 'all', studentId: 'all' });
                    setSearchQuery('');
                    setGlobalDateFilter('');
                    setStudentDateFilter(new Date().toISOString().split('T')[0]);
    
                    alert(`Daten erfolgreich importiert! (${studentsWithNumericIds.length} Kinder, ${entriesWithNumericIds.length} Einträge)`);
                } catch (err) {
                    console.error("Import failed:", err);
                    alert(`Import fehlgeschlagen: ${(err as Error).message}`);
                }
            }
        };
        input.click();
    };
    
    const handleLoadSampleData = async () => {
        if (!window.confirm("Achtung: Dadurch werden alle vorhandenen Daten gelöscht und durch Beispieldaten ersetzt. Fortfahren?")) return;
        try {
            await importData(sampleStudents, sampleEntries);
            const newSettings = { ...settings, masterData: sampleMasterData };
            handleSaveSettings(newSettings, true);
            
            await forceDataRefresh();
            
            // Reset selections and filters to show the new data
            setSelectedStudent(null);
            setSelectedEntry(null);
            setFilters({ schoolYear: 'all', school: 'all', className: 'all', studentId: 'all' });
            setSearchQuery('');
            setGlobalDateFilter('');
            setStudentDateFilter(new Date().toISOString().split('T')[0]);
            
            alert("Beispieldaten erfolgreich geladen.");
            setIsHelpModalOpen(false);
        } catch (error) {
            console.error("Failed to load sample data:", error);
            alert("Laden der Beispieldaten fehlgeschlagen.");
        }
    };
    
    const handleDownloadSampleData = async () => {
        try {
            const data = {
                students: sampleStudents,
                entries: sampleEntries,
                settings: { ...DEFAULT_SETTINGS, masterData: sampleMasterData }
            };
            const fileName = 'Beispieldaten.json';
            const jsonString = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            
            const file = new File([blob], fileName, { type: 'application/json' });

            // Use Web Share API if available (for mobile/iOS share sheet)
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Beispieldaten',
                    text: 'Pädagogische Dokumentation Beispieldaten.',
                });
            } else {
                // Fallback for desktop browsers to trigger "Save As..."
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = fileName;
                document.body.appendChild(link); // Required for Firefox
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }
        } catch (error) {
            // Don't show an alert if the user cancels the share dialog
            if ((error as Error).name !== 'AbortError') {
                 console.error("Sample data download failed:", error);
                 alert("Herunterladen der Beispieldaten fehlgeschlagen!");
            }
        }
    };

    const handleClearAllData = async () => {
        if (!window.confirm("WARNUNG: Diese Aktion löscht ALLE Schüler und Protokolleinträge endgültig. Sind Sie absolut sicher?")) return;
        if (!window.confirm("Letzte Warnung: Alle Daten werden gelöscht. Diese Aktion kann nicht rückgängig gemacht werden. Fortfahren?")) return;

        try {
            await clearAllDataFromDB();
            
            await forceDataRefresh();

            // Reset selections and filters
            setSelectedStudent(null);
            setSelectedEntry(null);
            setFilters({ schoolYear: 'all', school: 'all', className: 'all', studentId: 'all' });
            setSearchQuery('');
            setGlobalDateFilter('');
            setStudentDateFilter(new Date().toISOString().split('T')[0]);
            
            alert("Alle Daten wurden erfolgreich gelöscht.");
            setIsHelpModalOpen(false);
        } catch (error) {
            console.error("Failed to clear all data:", error);
            alert("Löschen der Daten fehlgeschlagen.");
        }
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
        } else {
             setSettings(DEFAULT_SETTINGS);
        }
    };

    const handleSaveSettings = (newSettings: Settings, silent = false) => {
        setSettings(newSettings);
        localStorage.setItem('peda-protokoll-settings', JSON.stringify(newSettings));
        if (!silent) {
            setIsSettingsModalOpen(false);
        }
    };

    const studentNameMap = useMemo(() => {
        return new Map(students.map(s => [s.id!, s.name]));
    }, [students]);

    const studentForModal = entryToEdit ? students.find(s => s.id === entryToEdit.studentId) : selectedStudent;

    if (dbError) {
        return (
            <div className="app-error-overlay">
                <div className="modal-content">
                    <h2>Anwendungsfehler</h2>
                    <p>{dbError}</p>
                    <button className="btn btn-primary" onClick={() => window.location.reload()}>
                        Seite neu laden
                    </button>
                </div>
            </div>
        );
    }

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
                onOpenStatistics={() => setIsStatisticsModalOpen(true)}
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
                        <p>Falls Sie die App zum ersten Mal verwenden, können Sie unter "Hilfe" Beispieldaten laden.</p>
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
                <HelpModal 
                    onClose={() => setIsHelpModalOpen(false)} 
                    onLoadSampleData={handleLoadSampleData}
                    onClearAllData={handleClearAllData}
                    onDownloadSampleData={handleDownloadSampleData}
                />
            )}
            {isStatisticsModalOpen && (
                <StatisticsModal 
                    onClose={() => setIsStatisticsModalOpen(false)} 
                    students={students}
                    allEntries={allEntries}
                />
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
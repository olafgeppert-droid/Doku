/** @jsxImportSource react */
import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';

// --- Components ---
import Header from './Header.jsx';
import Navigation from './Navigation.jsx';
import Toolbar from './components/Toolbar.tsx';
import StudentDetails from './components/StudentDetails.jsx';
import DayDetails from './components/DayDetails.jsx';
import StudentModal from './components/StudentModal.jsx';
import EntryModal from './components/EntryModal.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import HelpModal from './components/HelpModal.jsx';
import StatisticsModal from './components/StatisticsModal.jsx';
import MasterDataModal from './components/MasterDataModal.jsx';

// --- Database ---
import {
    initDB,
    addStudentToDB,
    updateStudentInDB,
    deleteStudentFromDB,
    getStudentsFromDB,
    addEntryToDB,
    updateEntryInDB,
    deleteEntryFromDB,
    getAllEntriesFromDB,
    importData,
    clearAllData as clearAllDataFromDB
} from './database.js';

import { sampleStudents, sampleEntries, sampleMasterData } from './sample-data.js';

// --- Default Settings ---
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
    masterData: sampleMasterData
};

const App = () => {
    // --- States ---
    const [students, setStudents] = useState([]);
    const [allEntries, setAllEntries] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedEntry, setSelectedEntry] = useState(null);

    const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
    const [studentToEdit, setStudentToEdit] = useState(null);

    const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
    const [entryToEdit, setEntryToEdit] = useState(null);

    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
    const [isStatisticsModalOpen, setIsStatisticsModalOpen] = useState(false);
    const [isMasterDataModalOpen, setIsMasterDataModalOpen] = useState(false);

    const [filters, setFilters] = useState({ schoolYear: 'all', school: 'all', className: 'all', studentId: 'all' });
    const [searchQuery, setSearchQuery] = useState('');
    const [globalDateFilter, setGlobalDateFilter] = useState('');

    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [isNavVisible, setIsNavVisible] = useState(false);

    const [dbError, setDbError] = useState(null);

    // --- Initialize DB ---
    useEffect(() => {
        initDB()
            .then(async () => {
                await loadData();
            })
            .catch(err => {
                console.error('DB init failed', err);
                setDbError('Die Datenbank konnte nicht initialisiert werden.');
            });
    }, []);

    // --- Load Data ---
    const loadData = async () => {
        let studentsFromDB = await getStudentsFromDB();
        let entriesFromDB = await getAllEntriesFromDB();

        if (studentsFromDB.length === 0) {
            // Load sample data if DB empty
            studentsFromDB = sampleStudents;
            entriesFromDB = sampleEntries;
            await importData(studentsFromDB, entriesFromDB);
        }

        setStudents(studentsFromDB);
        setAllEntries(entriesFromDB);
    };

    // --- Filtered Students ---
    const filteredStudents = useMemo(() => {
        let result = [...students];

        // Filter by schoolYear, school, className
        if (filters.schoolYear !== 'all') result = result.filter(s => s.schoolYear === filters.schoolYear);
        if (filters.school !== 'all') result = result.filter(s => s.school === filters.school);
        if (filters.className !== 'all') result = result.filter(s => s.className === filters.className);

        // Filter by studentId
        if (filters.studentId !== 'all') result = result.filter(s => s.id === filters.studentId);

        // Filter by search
        if (searchQuery.trim() !== '') {
            const q = searchQuery.toLowerCase();
            result = result.filter(s => s.name.toLowerCase().includes(q));
        }

        return result;
    }, [students, filters, searchQuery]);

    // --- Handlers ---
    const handleAddStudent = () => {
        setStudentToEdit(null);
        setIsStudentModalOpen(true);
    };

    const handleEditStudent = (student) => {
        setStudentToEdit(student);
        setIsStudentModalOpen(true);
    };

    const handleSaveStudent = async (student) => {
        if (student.id) {
            await updateStudentInDB(student);
        } else {
            const id = await addStudentToDB(student);
            student.id = id;
        }
        await loadData();
        setIsStudentModalOpen(false);
    };

    const handleDeleteStudent = async (student) => {
        if (!student?.id) return;
        if (!confirm(`Kind "${student.name}" wirklich löschen? Alle Einträge gehen verloren.`)) return;
        await deleteStudentFromDB(student.id);
        await loadData();
        setSelectedStudent(null);
        setIsStudentModalOpen(false);
    };

    const handleAddEntry = () => {
        if (!selectedStudent) return alert('Bitte zuerst ein Kind auswählen.');
        setEntryToEdit(null);
        setIsEntryModalOpen(true);
    };

    const handleEditEntry = (entry) => {
        setEntryToEdit(entry);
        setIsEntryModalOpen(true);
    };

    const handleSaveEntry = async (entry) => {
        if (entry.id) {
            await updateEntryInDB(entry);
        } else {
            await addEntryToDB(entry);
        }
        await loadData();
        setIsEntryModalOpen(false);
    };

    const handleDeleteEntry = async (entry) => {
        if (!entry?.id) return;
        if (!confirm('Eintrag wirklich löschen?')) return;
        await deleteEntryFromDB(entry.id);
        await loadData();
        setSelectedEntry(null);
        setIsEntryModalOpen(false);
    };

    // --- Render ---
    return (
        <div className="app">
            {dbError && (
                <div className="app-error-overlay">
                    <div className="modal-content">
                        <p>{dbError}</p>
                    </div>
                </div>
            )}

            <Header onToggleNav={() => setIsNavVisible(v => !v)} />
            <Toolbar
                onNewStudent={handleAddStudent}
                onManageStudent={() => selectedStudent && handleEditStudent(selectedStudent)}
                onNewEntry={handleAddEntry}
                onManageEntry={() => selectedEntry && handleEditEntry(selectedEntry)}
                canManageStudent={!!selectedStudent}
                canAddEntry={!!selectedStudent}
                canManageEntry={!!selectedEntry}
                onPrint={() => window.print()}
                onExport={async () => {
                    const data = { students, entries: allEntries };
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'peda-protokoll.json';
                    a.click();
                    URL.revokeObjectURL(url);
                }}
                onImport={async () => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.json';
                    input.onchange = async () => {
                        const file = input.files[0];
                        const text = await file.text();
                        const data = JSON.parse(text);
                        await importData(data.students, data.entries);
                        await loadData();
                    };
                    input.click();
                }}
                onUndo={() => {}}
                onRedo={() => {}}
                canUndo={false}
                canRedo={false}
            />

            <Navigation
                students={filteredStudents}
                selectedStudent={selectedStudent}
                onSelectStudent={setSelectedStudent}
                filters={filters}
                setFilters={setFilters}
                filterOptions={{
                    schoolYears: [...new Set(students.map(s => s.schoolYear))],
                    schools: [...new Set(students.map(s => s.school))],
                    classNames: [...new Set(students.map(s => s.className))]
                }}
                studentOptions={students}
                globalDateFilter={globalDateFilter}
                onGlobalDateChange={setGlobalDateFilter}
                onOpenSettings={() => setIsSettingsModalOpen(true)}
                onOpenStatistics={() => setIsStatisticsModalOpen(true)}
                onOpenHelp={() => setIsHelpModalOpen(true)}
                isNavVisible={isNavVisible}
                onClose={() => setIsNavVisible(false)}
                searchQuery={searchQuery}
                onSearchChange={e => setSearchQuery(e.target.value)}
            />

            <main className="main-content">
                {selectedStudent ? (
                    <StudentDetails
                        student={selectedStudent}
                        entries={allEntries.filter(e => e.studentId === selectedStudent.id)}
                        onEditEntry={handleEditEntry}
                        onDeleteEntry={handleDeleteEntry}
                        onAddEntry={handleAddEntry}
                        selectedEntry={selectedEntry}
                        setSelectedEntry={setSelectedEntry}
                    />
                ) : (
                    <DayDetails
                        date={globalDateFilter || new Date().toISOString().split('T')[0]}
                        entries={allEntries}
                        students={students}
                        onEditEntry={handleEditEntry}
                        onDeleteEntry={handleDeleteEntry}
                        selectedEntry={selectedEntry}
                        setSelectedEntry={setSelectedEntry}
                    />
                )}
            </main>

            {isStudentModalOpen && (
                <StudentModal
                    studentToEdit={studentToEdit}
                    onSaveStudent={handleSaveStudent}
                    onDeleteStudent={handleDeleteStudent}
                    masterData={settings.masterData}
                    onClose={() => setIsStudentModalOpen(false)}
                />
            )}

            {isEntryModalOpen && (
                <EntryModal
                    entryToEdit={entryToEdit}
                    student={selectedStudent}
                    onSaveEntry={handleSaveEntry}
                    onDeleteEntry={handleDeleteEntry}
                    onClose={() => setIsEntryModalOpen(false)}
                />
            )}

            {isSettingsModalOpen && (
                <SettingsModal
                    settings={settings}
                    setSettings={setSettings}
                    onClose={() => setIsSettingsModalOpen(false)}
                />
            )}

            {isHelpModalOpen && <HelpModal onClose={() => setIsHelpModalOpen(false)} />}
            {isStatisticsModalOpen && <StatisticsModal onClose={() => setIsStatisticsModalOpen(false)} />}
            {isMasterDataModalOpen && <MasterDataModal onClose={() => setIsMasterDataModalOpen(false)} />}
        </div>
    );
};

// --- Render App ---
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

export default App;

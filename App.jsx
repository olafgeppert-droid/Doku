/** @jsxImportSource react */
import React, { useState, useEffect } from 'react';
import HelpModal from './components/HelpModal.jsx';
import StatisticsModal from './components/StatisticsModal.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import StudentModal from './components/StudentModal.jsx';
import StudentDetails from './components/StudentDetails.jsx';
import Toolbar from './components/Toolbar.jsx';
import { INITIAL_MASTER_DATA, INITIAL_SETTINGS } from './utils.js';

const App = () => {
    const [students, setStudents] = useState([]);
    const [entries, setEntries] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [showHelp, setShowHelp] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showStatistics, setShowStatistics] = useState(false);
    const [showStudentModal, setShowStudentModal] = useState(false);
    const [studentToEdit, setStudentToEdit] = useState(null);
    const [masterData, setMasterData] = useState(INITIAL_MASTER_DATA);
    const [settings, setSettings] = useState(INITIAL_SETTINGS);
    const [dateFilter, setDateFilter] = useState('');

    const handleAddStudent = () => {
        setStudentToEdit(null);
        setShowStudentModal(true);
    };

    const handleManageStudent = () => {
        if (selectedStudent) {
            setStudentToEdit(selectedStudent);
            setShowStudentModal(true);
        }
    };

    const handleSaveStudent = (student) => {
        setStudents(prev => {
            if (student.id != null) {
                return prev.map(s => (s.id === student.id ? student : s));
            } else {
                return [...prev, { ...student, id: Date.now() }];
            }
        });
        setShowStudentModal(false);
    };

    const handleDeleteStudent = (student) => {
        setStudents(prev => prev.filter(s => s.id !== student.id));
        setEntries(prev => prev.filter(e => e.studentId !== student.id));
        setShowStudentModal(false);
        setSelectedStudent(null);
        setSelectedEntry(null);
    };

    const filteredEntries = entries.filter(e => !dateFilter || e.date === dateFilter);

    return (
        <div className={`app theme-${settings.theme}`} style={{ fontSize: `${settings.fontSize}px` }}>
            <Toolbar
                onNewStudent={handleAddStudent}
                onManageStudent={handleManageStudent}
                onNewEntry={() => {}}
                onManageEntry={() => {}}
                canManageStudent={!!selectedStudent}
                canAddEntry={!!selectedStudent}
                canManageEntry={!!selectedEntry}
                onPrint={() => window.print()}
                onExport={() => {}}
                onImport={() => {}}
                onUndo={() => {}}
                onRedo={() => {}}
                canUndo={false}
                canRedo={false}
            />

            {selectedStudent && (
                <StudentDetails
                    student={selectedStudent}
                    entries={filteredEntries}
                    selectedEntry={selectedEntry}
                    onSelectEntry={setSelectedEntry}
                    dateFilter={dateFilter}
                    onDateFilterChange={setDateFilter}
                />
            )}

            {showHelp && <HelpModal onClose={() => setShowHelp(false)} version="1.0.0" />}
            {showSettings && (
                <SettingsModal
                    onClose={() => setShowSettings(false)}
                    onSave={setSettings}
                    currentSettings={settings}
                    version="1.0.0"
                />
            )}
            {showStatistics && (
                <StatisticsModal
                    onClose={() => setShowStatistics(false)}
                    students={students}
                    allEntries={entries}
                />
            )}
            {showStudentModal && (
                <StudentModal
                    onClose={() => setShowStudentModal(false)}
                    onSaveStudent={handleSaveStudent}
                    onDeleteStudent={handleDeleteStudent}
                    studentToEdit={studentToEdit}
                    masterData={masterData}
                />
            )}
        </div>
    );
};

export default App;

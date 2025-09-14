/** @jsxImportSource react */
import React, { useState } from 'react';
import Toolbar from './components/Toolbar.jsx';
import StudentModal from './components/StudentModal.jsx';
import StudentDetails from './components/StudentDetails.jsx';
import HelpModal from './components/HelpModal.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import StatisticsModal from './components/StatisticsModal.jsx';

const App = () => {
    const [students, setStudents] = useState([]);
    const [entries, setEntries] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [studentModalOpen, setStudentModalOpen] = useState(false);
    const [helpModalOpen, setHelpModalOpen] = useState(false);
    const [settingsModalOpen, setSettingsModalOpen] = useState(false);
    const [statisticsModalOpen, setStatisticsModalOpen] = useState(false);

    return (
        <div>
            <Toolbar
                onNewStudent={() => setStudentModalOpen(true)}
                onManageStudent={() => selectedStudent && setStudentModalOpen(true)}
                onNewEntry={() => {}}
                onManageEntry={() => {}}
                canManageStudent={!!selectedStudent}
                canAddEntry={!!selectedStudent}
                canManageEntry={!!selectedEntry}
                onPrint={() => {}}
                onExport={() => {}}
                onImport={() => {}}
                onUndo={() => {}}
                onRedo={() => {}}
                canUndo={false}
                canRedo={false}
            />

            <StudentDetails
                student={selectedStudent}
                entries={entries.filter(e => e.studentId === selectedStudent?.id)}
                selectedEntry={selectedEntry}
                onSelectEntry={setSelectedEntry}
                dateFilter=""
                onDateFilterChange={() => {}}
            />

            {studentModalOpen && (
                <StudentModal
                    onClose={() => setStudentModalOpen(false)}
                    onSaveStudent={(student) => setStudents(prev => [...prev, student])}
                    onDeleteStudent={(student) => setStudents(prev => prev.filter(s => s.id !== student.id))}
                    masterData={{ schoolYears: [], schools: {} }}
                />
            )}

            {helpModalOpen && <HelpModal onClose={() => setHelpModalOpen(false)} version="1.0" />}
            {settingsModalOpen && (
                <SettingsModal
                    onClose={() => setSettingsModalOpen(false)}
                    onSave={() => {}}
                    currentSettings={{ theme: 'default', fontSize: 16, inputFontSize: 16, customColors: { sidebar: '#fff', header: '#fff', toolbar: '#fff', entryBackground: '#fff' }, masterData: { schoolYears: [], schools: {} } }}
                    version="1.0"
                />
            )}
            {statisticsModalOpen && (
                <StatisticsModal
                    onClose={() => setStatisticsModalOpen(false)}
                    students={students}
                    allEntries={entries}
                />
            )}
        </div>
    );
};

export default App;

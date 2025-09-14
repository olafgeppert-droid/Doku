/** @jsxImportSource react */
import React, { useState } from 'react';
import Toolbar from './components/Toolbar.jsx';
import StudentModal from './components/StudentModal.jsx';
import StudentDetails from './components/StudentDetails.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import HelpModal from './components/HelpModal.jsx';
import StatisticsModal from './components/StatisticsModal.jsx';
import { INITIAL_MASTER_DATA } from './utils.js';

const App = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [masterData, setMasterData] = useState(INITIAL_MASTER_DATA);
  const [dateFilter, setDateFilter] = useState('');

  const handleAddStudent = () => {
    setStudentToEdit(null);
    setIsStudentModalOpen(true);
  };

  const handleEditStudent = () => {
    if (!selectedStudent) return;
    setStudentToEdit(selectedStudent);
    setIsStudentModalOpen(true);
  };

  const handleSaveStudent = (student) => {
    if (student.id != null) {
      setStudents(prev => prev.map(s => s.id === student.id ? student : s));
    } else {
      student.id = Date.now();
      setStudents(prev => [...prev, student]);
    }
    setIsStudentModalOpen(false);
  };

  const handleDeleteStudent = (student) => {
    setStudents(prev => prev.filter(s => s.id !== student.id));
    setIsStudentModalOpen(false);
    setSelectedStudent(null);
  };

  return (
    <div>
      <Toolbar
        onNewStudent={handleAddStudent}
        onManageStudent={handleEditStudent}
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
        entries={selectedStudent?.entries || []}
        selectedEntry={selectedEntry}
        onSelectEntry={setSelectedEntry}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
      />

      {isStudentModalOpen && (
        <StudentModal
          studentToEdit={studentToEdit}
          onSaveStudent={handleSaveStudent}
          onDeleteStudent={handleDeleteStudent}
          masterData={masterData}
          onClose={() => setIsStudentModalOpen(false)}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal
          currentSettings={{ theme: 'default', fontSize: 16, inputFontSize: 16, customColors: { sidebar:'#fff', header:'#fff', toolbar:'#fff', entryBackground:'#fff' }, masterData }}
          onSave={setMasterData}
          onClose={() => setIsSettingsOpen(false)}
          version="1.0.0"
        />
      )}

      {isHelpOpen && <HelpModal onClose={() => setIsHelpOpen(false)} version="1.0.0" />}
      {isStatsOpen && <StatisticsModal onClose={() => setIsStatsOpen(false)} students={students} allEntries={students.flatMap(s => s.entries || [])} />}
    </div>
  );
};

export default App;

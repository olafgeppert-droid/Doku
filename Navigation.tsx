/** @jsxImportSource react */
import React from 'react';
import type { Student } from './types';

interface NavigationProps {
    students: Student[];
    onSelectStudent: (student: Student) => void;
    selectedStudent: Student | null;
    filters: { schoolYear: string; school: string; className: string; studentId: string; };
    setFilters: React.Dispatch<React.SetStateAction<{ schoolYear: string; school: string; className: string; studentId: string; }>>;
    filterOptions: { schoolYears: string[]; schools: string[]; classNames: string[]; };
    globalDateFilter: string;
    onGlobalDateChange: (date: string) => void;
    studentOptions: Student[];
    onOpenSettings: () => void;
    onOpenStatistics: () => void;
    onOpenHelp: () => void;
    isNavVisible: boolean;
    onClose: () => void;
    searchQuery: string;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Navigation = ({ 
    students, 
    onSelectStudent, 
    selectedStudent, 
    filters, 
    setFilters, 
    filterOptions, 
    globalDateFilter, 
    onGlobalDateChange, 
    studentOptions, 
    onOpenSettings,
    onOpenStatistics, 
    onOpenHelp,
    isNavVisible,
    onClose,
    searchQuery,
    onSearchChange,
}: NavigationProps) => {
    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleStudentClick = (student: Student) => {
        onSelectStudent(student);
        onClose(); // Close mobile nav on selection
    };
    
    return (
        <aside className={`navigation ${isNavVisible ? 'visible' : ''}`}>
            <h2>Navigation</h2>
            <div className="search-bar-nav">
                <input type="search" placeholder="🔍 Kind suchen..." value={searchQuery} onChange={onSearchChange} />
            </div>
            <div className="filter-group">
                <label htmlFor="schoolYear">Schuljahr</label>
                <select id="schoolYear" name="schoolYear" value={filters.schoolYear} onChange={handleFilterChange}>
                    <option value="all">Alle Schuljahre</option>
                    {filterOptions.schoolYears.map(year => <option key={year} value={year}>{year}</option>)}
                </select>
            </div>
            <div className="filter-group">
                <label htmlFor="school">Schule</label>
                <select id="school" name="school" value={filters.school} onChange={handleFilterChange}>
                    <option value="all">Alle Schulen</option>
                    {filterOptions.schools.map(school => <option key={school} value={school}>{school}</option>)}
                </select>
            </div>
            <div className="filter-group">
                <label htmlFor="className">Klasse</label>
                <select id="className" name="className" value={filters.className} onChange={handleFilterChange}>
                    <option value="all">Alle Klassen</option>
                    {filterOptions.classNames.map(name => <option key={name} value={name}>{name}</option>)}
                </select>
            </div>
            <div className="filter-group">
                <label htmlFor="studentId">Kind</label>
                <select id="studentId" name="studentId" value={filters.studentId} onChange={handleFilterChange}>
                    <option value="all">Alle Kinder</option>
                    {studentOptions.map(student => <option key={student.id} value={student.id}>{student.name}</option>)}
                </select>
            </div>
            <div className="filter-group">
                <label htmlFor="globalDateFilter">Tag</label>
                <div className="date-filter-wrapper">
                    <input id="globalDateFilter" name="globalDateFilter" type="date" value={globalDateFilter} onChange={e => onGlobalDateChange(e.target.value)} />
                    <button
                        onClick={() => onGlobalDateChange('')}
                        className="btn-clear"
                        title="Datum löschen"
                        disabled={!globalDateFilter}
                    >
                        Löschen
                    </button>
                </div>
            </div>
            <ul className="student-list">
                {students.map(student => (
                    <li key={student.id} className={`student-list-item ${selectedStudent?.id === student.id ? 'selected' : ''}`} onClick={() => handleStudentClick(student)}>
                        {student.name}
                    </li>
                ))}
            </ul>
            <div className="navigation-footer">
                <hr className="navigation-divider" />
                <div className="navigation-actions">
                    <button className="btn btn-secondary" onClick={onOpenStatistics}>📊 Statistiken</button>
                    <button className="btn btn-secondary" onClick={onOpenSettings}>⚙️ Einstellungen</button>
                    <button className="btn btn-secondary" onClick={onOpenHelp}>❓ Hilfe</button>
                </div>
            </div>
        </aside>
    );
};

export default Navigation;
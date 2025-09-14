/** @jsxImportSource react */
import React, { useState } from 'react';

const MasterDataModal = ({ masterData, onSave, onClose }) => {
    const [localMasterData, setLocalMasterData] = useState(masterData);
    const [newSchoolYear, setNewSchoolYear] = useState('');
    const [newSchool, setNewSchool] = useState('');
    const [selectedSchool, setSelectedSchool] = useState('');
    const [newClass, setNewClass] = useState('');

    const handleAddSchoolYear = () => {
        if (newSchoolYear && !localMasterData.schoolYears.includes(newSchoolYear)) {
            setLocalMasterData(prev => ({
                ...prev,
                schoolYears: [...prev.schoolYears, newSchoolYear].sort()
            }));
            setNewSchoolYear('');
        }
    };

    const handleDeleteSchoolYear = (year) => {
        setLocalMasterData(prev => ({
            ...prev,
            schoolYears: prev.schoolYears.filter(y => y !== year)
        }));
    };

    const handleAddSchool = () => {
        if (newSchool && !localMasterData.schools[newSchool]) {
            setLocalMasterData(prev => ({
                ...prev,
                schools: { ...prev.schools, [newSchool]: [] }
            }));
            set

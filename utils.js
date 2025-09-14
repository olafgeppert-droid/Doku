export const INITIAL_MASTER_DATA = {
    schoolYears: ['2024/2025', '2025/2026'],
    schools: {
        'Muster Schule': ['1A', '1B', '2A'],
    },
};

export const INITIAL_SETTINGS = {
    theme: 'default',
    fontSize: 16,
    inputFontSize: 16,
    customColors: {
        sidebar: '#f0f0f0',
        header: '#ffffff',
        toolbar: '#e0e0e0',
        entryBackground: '#ffffff',
    },
    masterData: INITIAL_MASTER_DATA,
};

export const capitalizeWords = (str) => str.replace(/\b\w/g, l => l.toUpperCase());

/** @jsxImportSource react */
// --- DATA TYPES ---
export interface Student {
  id?: number;
  name: string;
  schoolYear: string;
  school: string;
  className: string;
  gender?: string;
  nationality?: string;
  germanLevel?: string;
  notes?: string;
}

export interface Entry {
  id?: number;
  studentId: number;
  date: string;
  subject: string; // Fach / Thema
  observations: string; // Beobachtung
  measures: string; // Maßnahme
  erfolg: string; // Erfolg
  erfolgRating: 'positiv' | 'negativ' | ''; // Bewertung des Erfolgs
}

export interface MasterData {
    schoolYears: string[];
    schools: {
        [schoolName: string]: string[]; // e.g., { 'Grundschule A': ['1a', '1b'] }
    };
}

export interface Settings {
    theme: 'default' | 'dark' | 'high-contrast' | 'custom';
    fontSize: number;
    inputFontSize: number;
    customColors: {
        sidebar: string;
        header: string;
        toolbar: string;
        entryBackground: string;
    };
    masterData: MasterData;
}
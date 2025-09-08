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

export interface Settings {
    theme: 'default' | 'dark' | 'high-contrast' | 'custom';
    fontSize: number;
    customColors: {
        sidebar: string;
        header: string;
        toolbar: string;
        entryBackground: string;
    };
}
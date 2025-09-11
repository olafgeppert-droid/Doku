/** @jsxImportSource react */
import type { Student, Entry, MasterData } from './types';

export const sampleMasterData: MasterData = {
    schoolYears: ['2024/2025', '2025/2026'],
    schools: {
        'Heinz-Sielmann-Schule, Grundschule Neustadt an der Weinstraße': ['1a', '1b', '2a', '3b', '4c'],
        'Ostschule, Grundschule Neustadt an der Weinstraße': ['1', '2', '3', '4a', '4b'],
    }
};

const firstNamesMale = ["Leon", "Maximilian", "Paul", "Felix", "Noah", "Elias", "Jonas", "Luis", "Ben", "Lukas", "Finn", "Anton", "Jakob", "Emil", "Oskar"];
const firstNamesFemale = ["Mia", "Emma", "Sophia", "Hannah", "Emilia", "Anna", "Lina", "Mila", "Lea", "Clara", "Lena", "Marie", "Lara", "Laura", "Charlotte"];
const lastNames = ["Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker", "Schulz", "Hoffmann", "Schäfer", "Koch", "Bauer", "Richter", "Klein"];
const nationalities = ["Deutschland", "Türkei", "Ukraine", "Syrien", "Polen", "Italien", "Rumänien", "Griechenland", "Kroatien", "Afghanistan", "Irak", "Russland"];

const schools = Object.keys(sampleMasterData.schools);
const schoolYears = sampleMasterData.schoolYears;

const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomDate = (start: Date, end: Date): string => {
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString().split('T')[0];
};

// --- GENERATE STUDENTS ---
// We now generate full Student objects with IDs to ensure relational integrity on import.
export const sampleStudents: Student[] = [];

for (let i = 1; i <= 20; i++) { // Generate 20 students
    const gender = Math.random() > 0.5 ? 'männlich' : 'weiblich';
    const firstName = gender === 'männlich' ? getRandom(firstNamesMale) : getRandom(firstNamesFemale);
    const lastName = getRandom(lastNames);
    const school = getRandom(schools);
    const classesForSchool = sampleMasterData.schools[school];
    
    sampleStudents.push({
        id: i, // Assign a stable ID
        name: `${firstName} ${lastName}`,
        schoolYear: getRandom(schoolYears),
        school: school,
        className: classesForSchool.length > 0 ? getRandom(classesForSchool) : 'N/A',
        gender: gender,
        nationality: getRandom(nationalities),
        germanLevel: String(Math.floor(Math.random() * 6) + 1),
        notes: Math.random() > 0.7 ? "Dies ist eine Beispielanmerkung.\nSie kann auch mehrere Zeilen umfassen." : "",
    });
}

// --- GENERATE ENTRIES ---
// Entries are generated with a studentId that correctly references the students above.
export const sampleEntries: Entry[] = [];

const subjects = ["Mathematik", "Deutsch", "Sachunterricht", "Sport", "Kunst", "Musik", "Soziales Lernen", "Freispiel", "Hausaufgabenbetreuung", "Projektarbeit"];
const observations = [
    "zeigt große Motivation und beteiligt sich aktiv am Unterricht.",
    "hat Schwierigkeiten, sich zu konzentrieren und lässt sich leicht ablenken.",
    "arbeitet gut mit anderen Kindern zusammen und ist sehr hilfsbereit.",
    "benötigt zusätzliche Unterstützung bei den Aufgaben.",
    "ist oft unruhig und stört den Unterrichtsablauf.",
    "hat seine/ihre Materialien vollständig und arbeitet selbstständig.",
    "zeigt kreative Lösungsansätze und denkt kritisch.",
    "ist im sozialen Umgang noch unsicher und sucht wenig Kontakt.",
    "hat die Hausaufgaben vollständig und ordentlich erledigt.",
    "zeigt deutliche Fortschritte im Vergleich zur Vorwoche.",
];
const measures = [
    "Positive Verstärkung durch Lob und Anerkennung.",
    "Strukturierte Aufgaben und klare Arbeitsanweisungen geben.",
    "In Partner- oder Gruppenarbeit einbinden.",
    "Individuelle Hilfestellung und Differenzierungsmaterial anbieten.",
    "Gespräch über Regeln und Konsequenzen führen.",
    "Eigenverantwortung durch kleine Aufgaben (z.B. Klassendienst) stärken.",
    "Raum für eigene Ideen und Projekte schaffen.",
    "Gezielte Einbindung in Gruppenspiele und -aktivitäten.",
    "Kontrolle der Hausaufgaben und Rückmeldung an die Eltern.",
    "Festlegung neuer Lernziele für die kommende Woche.",
];
const erfolge = [
    "Die Konzentration hat sich deutlich verbessert.",
    "Die Zusammenarbeit in der Gruppe war erfolgreich.",
    "Die Aufgabe wurde selbstständig und korrekt gelöst.",
    "Das Regelverständnis wurde gezeigt und umgesetzt.",
    "Das Kind hat sich aktiv und konstruktiv eingebracht.",
    "Es konnte ein Konflikt friedlich gelöst werden.",
    "Die Lernziele der Woche wurden erreicht.",
    "Es ist noch keine wesentliche Verbesserung erkennbar.",
    "Die Maßnahme zeigte nicht den gewünschten Erfolg, eine Anpassung ist nötig.",
    "Das Verhalten hat sich trotz der Maßnahme nicht geändert.",
];

let entryIdCounter = 1;
for (const student of sampleStudents) {
    const numEntries = Math.floor(Math.random() * 8) + 1; // 1 to 8 entries per student
    for (let j = 0; j < numEntries; j++) {
        const ratingRand = Math.random();
        const erfolgRating: 'positiv' | 'negativ' | '' = ratingRand < 0.6 ? 'positiv' : (ratingRand < 0.85 ? 'negativ' : '');

        sampleEntries.push({
            id: entryIdCounter++, // Assign a stable and unique ID
            studentId: student.id!, // Use the student's actual ID
            date: getRandomDate(new Date(2024, 7, 1), new Date()), // From August 2024 until now
            subject: getRandom(subjects),
            observations: `Kind ${getRandom(observations)}`,
            measures: getRandom(measures),
            erfolg: getRandom(erfolge),
            erfolgRating,
        });
    }
}
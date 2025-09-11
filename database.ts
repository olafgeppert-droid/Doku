/** @jsxImportSource react */
import { openDB, IDBPDatabase } from 'idb';
import type { Student, Entry } from './types';

const DB_NAME = "peda-protokoll";
const DB_VERSION = 3; 
const STUDENT_STORE = 'students';
const ENTRY_STORE = 'entries';


// --- DB Initialization & Connection ---
let dbPromise: Promise<IDBPDatabase> | null = null;

const getDB = (): Promise<IDBPDatabase> => {
    if (!dbPromise) {
        dbPromise = openDB(DB_NAME, DB_VERSION, {
            upgrade(db, oldVersion, newVersion, tx) {
                console.log(`Upgrading DB from version ${oldVersion} to ${newVersion}`);
                // Student store setup
                if (!db.objectStoreNames.contains(STUDENT_STORE)) {
                    db.createObjectStore(STUDENT_STORE, { keyPath: "id", autoIncrement: true });
                }

                // Entry store setup
                if (!db.objectStoreNames.contains(ENTRY_STORE)) {
                    const store = db.createObjectStore(ENTRY_STORE, { keyPath: "id", autoIncrement: true });
                    store.createIndex("studentId", "studentId", { unique: false });
                    store.createIndex("date", "date", { unique: false });
                } else {
                    const entryStore = tx.objectStore(ENTRY_STORE);
                    if (!entryStore.indexNames.contains('studentId')) {
                         entryStore.createIndex("studentId", "studentId", { unique: false });
                    }
                     if (!entryStore.indexNames.contains('date')) {
                         entryStore.createIndex("date", "date", { unique: false });
                    }
                }
            },
        });
    }
    return dbPromise;
};

// --- Public initDB function to be called on app start ---
export const initDB = async (): Promise<IDBPDatabase> => {
    const db = await getDB();
    // Clean up potential orphan entries on startup to maintain data integrity.
    await cleanOrphanEntries(db);
    return db;
};


// --- Data Cleanup ---
const cleanOrphanEntries = async (db: IDBPDatabase) => {
    // This function is critical for data integrity. The previous implementation could
    // block the DB if it failed silently. This version is more robust.
    try {
        const studentKeys = await db.getAllKeys("students");
        const validStudentIds = new Set(studentKeys);
        
        const allEntries = await db.getAll("entries");

        const entryIdsToDelete: number[] = [];
        for (const entry of allEntries) {
            if (!validStudentIds.has(entry.studentId)) {
                if (entry.id) {
                    entryIdsToDelete.push(entry.id);
                }
            }
        }

        if (entryIdsToDelete.length > 0) {
            console.warn(`[DB Cleanup] Found ${entryIdsToDelete.length} orphan entries. Deleting.`);
            const tx = db.transaction("entries", "readwrite");
            for (const id of entryIdsToDelete) {
                tx.store.delete(id);
            }
            await tx.done;
            console.log(`[DB Cleanup] Orphan entries deleted successfully.`);
        }
    } catch (error) {
        console.error("[DB Cleanup] Error during orphan entry cleanup:", error);
    }
};


// --- Student Operations ---
export const addStudentToDB = async (student: Omit<Student, "id">): Promise<IDBValidKey> => {
    const db = await getDB();
    return db.add("students", student);
};

export const updateStudentInDB = async (student: Student): Promise<IDBValidKey> => {
    const db = await getDB();
    return db.put("students", student);
};

export const getStudentsFromDB = async (): Promise<Student[]> => {
    const db = await getDB();
    return db.getAll("students");
};

export const deleteStudentFromDB = async (studentId: number): Promise<void> => {
    const db = await getDB();
    const entryKeysToDelete = await db.getAllKeysFromIndex("entries", "studentId", studentId);
    const tx = db.transaction(["students", "entries"], "readwrite");
    entryKeysToDelete.forEach(key => tx.objectStore("entries").delete(key));
    tx.objectStore("students").delete(studentId);
    await tx.done;
};

// --- Entry Operations ---
export const addEntryToDB = async (entry: Omit<Entry, 'id'>): Promise<IDBValidKey> => {
    const db = await getDB();
    return db.add("entries", entry);
};

export const updateEntryInDB = async (entry: Entry): Promise<IDBValidKey> => {
    const db = await getDB();
    return db.put("entries", entry);
};

export const getAllEntriesFromDB = async (): Promise<Entry[]> => {
    const db = await getDB();
    return db.getAll("entries");
};

export const deleteEntryFromDB = async (entryId: number): Promise<void> => {
    const db = await getDB();
    await db.delete("entries", entryId);
};

// --- Bulk Data Operations ---
export const importData = async (students: Student[], entries: Entry[]): Promise<void> => {
    const db = await getDB();
    const tx = db.transaction(["students", "entries"], "readwrite");
    tx.objectStore("students").clear();
    tx.objectStore("entries").clear();
    students.forEach(s => tx.objectStore("students").put(s));
    entries.forEach(e => tx.objectStore("entries").put(e));
    await tx.done;
};

export const clearAllData = async (): Promise<void> => {
    const db = await getDB();
    const tx = db.transaction(["students", "entries"], "readwrite");
    tx.objectStore("students").clear();
    tx.objectStore("entries").clear();
    await tx.done;
};
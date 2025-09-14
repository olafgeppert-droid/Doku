/** @jsxImportSource react */
// Browser-kompatible DB mit idb
import { openDB } from 'https://cdn.jsdelivr.net/npm/idb@7/+esm';

const DB_NAME = "peda-protokoll";
const DB_VERSION = 4;
const STUDENT_STORE = 'students';
const ENTRY_STORE = 'entries';

let dbPromise = null;

function getDB() {
    if (!dbPromise) {
        dbPromise = openDB(DB_NAME, DB_VERSION, {
            upgrade(db, oldVersion, newVersion, tx) {
                console.log(`Upgrading DB from version ${oldVersion} to ${newVersion}`);
                
                if (oldVersion < 1 && !db.objectStoreNames.contains(STUDENT_STORE)) {
                    db.createObjectStore(STUDENT_STORE, { keyPath: "id", autoIncrement: true });
                }

                if (oldVersion < 2 && !db.objectStoreNames.contains(ENTRY_STORE)) {
                    const store = db.createObjectStore(ENTRY_STORE, { keyPath: "id", autoIncrement: true });
                    store.createIndex("studentId", "studentId", { unique: false });
                    store.createIndex("date", "date", { unique: false });
                }

                if (oldVersion < 3 && db.objectStoreNames.contains(ENTRY_STORE)) {
                    const entryStore = tx.objectStore(ENTRY_STORE);
                    if (!entryStore.indexNames.contains('studentId')) {
                        entryStore.createIndex("studentId", "studentId", { unique: false });
                    }
                    if (!entryStore.indexNames.contains('date')) {
                        entryStore.createIndex("date", "date", { unique: false });
                    }
                }

                if (oldVersion < 4) {
                    console.log("Performing data cleanup for version 4");
                    // Datenmigrationen möglich
                }
            }
        });
    }
    return dbPromise;
}

export async function initDB() {
    const db = await getDB();
    await cleanOrphanEntries(db);
    return db;
}

async function cleanOrphanEntries(db) {
    try {
        const studentKeys = await db.getAllKeys(STUDENT_STORE);
        const validStudentIds = new Set(studentKeys.filter(Boolean));

        const allEntries = await db.getAll(ENTRY_STORE);
        const entryIdsToDelete = allEntries
            .filter(e => !validStudentIds.has(e.studentId))
            .map(e => e.id)
            .filter(Boolean);

        if (entryIdsToDelete.length > 0) {
            console.warn(`[DB Cleanup] Found ${entryIdsToDelete.length} orphan entries. Deleting.`);
            const tx = db.transaction(ENTRY_STORE, "readwrite");
            for (const id of entryIdsToDelete) {
                tx.store.delete(id);
            }
            await tx.done;
            console.log(`[DB Cleanup] Orphan entries deleted successfully.`);
        }
    } catch (err) {
        console.error("[DB Cleanup] Error:", err);
    }
}

// --- Student Operations ---
export async function addStudentToDB(student) {
    const db = await getDB();
    if (!student || !student.name || !student.schoolYear || !student.school) {
        throw new Error("Ungültige Studentendaten für addStudentToDB");
    }
    return db.add(STUDENT_STORE, student);
}

export async function updateStudentInDB(student) {
    const db = await getDB();
    if (!student || !student.id) {
        throw new Error("Student ID fehlt für updateStudentInDB");
    }
    return db.put(STUDENT_STORE, student);
}

export async function getStudentsFromDB() {
    const db = await getDB();
    return db.getAll(STUDENT_STORE);
}

export async function deleteStudentFromDB(studentId) {
    const db = await getDB();
    if (!studentId) throw new Error("Student ID fehlt für deleteStudentFromDB");

    try {
        const tx = db.transaction([STUDENT_STORE, ENTRY_STORE], 'readwrite');
        const studentStore = tx.objectStore(STUDENT_STORE);
        const entryStore = tx.objectStore(ENTRY_STORE);

        // Alle Einträge des Schülers löschen über Index
        if (entryStore.indexNames.contains('studentId')) {
            const entriesToDelete = await entryStore.index('studentId').getAllKeys(IDBKeyRange.only(studentId));
            for (const entryId of entriesToDelete) {
                entryStore.delete(entryId);
            }
        }

        studentStore.delete(studentId);
        await tx.done;
        console.log(`Deleted student ${studentId} and related entries`);
    } catch (err) {
        console.error("Error in deleteStudentFromDB:", err);
        throw err;
    }
}

// --- Entry Operations ---
export async function addEntryToDB(entry) {
    const db = await getDB();
    if (!entry || !entry.studentId || !entry.date) {
        throw new Error("Ungültige Entry-Daten für addEntryToDB");
    }
    return db.add(ENTRY_STORE, entry);
}

export async function updateEntryInDB(entry) {
    const db = await getDB();
    if (!entry || !entry.id) {
        throw new Error("Entry ID fehlt für updateEntryInDB");
    }
    return db.put(ENTRY_STORE, entry);
}

export async function getAllEntriesFromDB() {
    const db = await getDB();
    return db.getAll(ENTRY_STORE);
}

export async function deleteEntryFromDB(entryId) {
    const db = await getDB();
    if (!entryId) throw new Error("Entry ID fehlt für deleteEntryFromDB");
    return db.delete(ENTRY_STORE, entryId);
}

// --- Bulk Operations ---
export async function importData(students, entries) {
    const db = await getDB();
    const tx = db.transaction([STUDENT_STORE, ENTRY_STORE], "readwrite");
    tx.objectStore(STUDENT_STORE).clear();
    tx.objectStore(ENTRY_STORE).clear();
    students.forEach(s => tx.objectStore(STUDENT_STORE).put(s));
    entries.forEach(e => tx.objectStore(ENTRY_STORE).put(e));
    await tx.done;
}

export async function clearAllData() {
    const db = await getDB();
    const tx = db.transaction([STUDENT_STORE, ENTRY_STORE], "readwrite");
    tx.objectStore(STUDENT_STORE).clear();
    tx.objectStore(ENTRY_STORE).clear();
    await tx.done;
}

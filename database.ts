
/** @jsxImportSource react */
import type { Student, Entry } from './types';

// --- DATABASE SETUP ---
const DB_NAME = 'PedaProtokollDB';
const DB_VERSION = 3;
const STUDENT_STORE = 'students';
const ENTRY_STORE = 'entries';

export let db: IDBDatabase;

export const initDB = () => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject("Error opening DB");
    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = (event.target as IDBOpenDBRequest).transaction;
      
      let studentStore;
      if (!db.objectStoreNames.contains(STUDENT_STORE)) {
        studentStore = db.createObjectStore(STUDENT_STORE, { keyPath: 'id', autoIncrement: true });
      } else {
        studentStore = transaction!.objectStore(STUDENT_STORE);
      }
      
      if (!studentStore.indexNames.contains('schoolYear')) studentStore.createIndex('schoolYear', 'schoolYear', { unique: false });
      if (!studentStore.indexNames.contains('school')) studentStore.createIndex('school', 'school', { unique: false });
      if (!studentStore.indexNames.contains('className')) studentStore.createIndex('className', 'className', { unique: false });

      let entryStore;
      if (!db.objectStoreNames.contains(ENTRY_STORE)) {
        entryStore = db.createObjectStore(ENTRY_STORE, { keyPath: 'id', autoIncrement: true });
      } else {
        entryStore = transaction!.objectStore(ENTRY_STORE);
      }

      if (!entryStore.indexNames.contains('studentId')) entryStore.createIndex('studentId', 'studentId', { unique: false });
      if (!entryStore.indexNames.contains('date')) entryStore.createIndex('date', 'date', { unique: false });
    };
  });
};

// --- DB HELPER FUNCTIONS ---
export const addStudentToDB = (student: Student): Promise<number> => new Promise((resolve, reject) => {
    if (!db) return reject("DB not initialized");
    const tx = db.transaction([STUDENT_STORE], 'readwrite').objectStore(STUDENT_STORE).add(student);
    tx.onsuccess = () => resolve(tx.result as number);
    tx.onerror = () => reject(tx.error);
});

export const updateStudentInDB = (student: Student): Promise<number> => new Promise((resolve, reject) => {
    if (!db) return reject("DB not initialized");
    const tx = db.transaction([STUDENT_STORE], 'readwrite').objectStore(STUDENT_STORE).put(student);
    tx.onsuccess = () => resolve(tx.result as number);
    tx.onerror = () => reject(tx.error);
});

export const deleteStudentFromDB = (studentId: number): Promise<void> => new Promise((resolve, reject) => {
    if (!db) return reject("DB not initialized");
    const tx = db.transaction([STUDENT_STORE, ENTRY_STORE], 'readwrite');
    const studentStore = tx.objectStore(STUDENT_STORE);
    const entryStore = tx.objectStore(ENTRY_STORE);
    const entryIndex = entryStore.index('studentId');

    // 1. Delete student
    const deleteStudentRequest = studentStore.delete(studentId);
    deleteStudentRequest.onerror = () => reject(deleteStudentRequest.error);

    // 2. Find and delete all entries for that student
    const getEntriesRequest = entryIndex.openCursor(IDBKeyRange.only(studentId));
    getEntriesRequest.onerror = () => reject(getEntriesRequest.error);
    getEntriesRequest.onsuccess = () => {
        const cursor = getEntriesRequest.result;
        if (cursor) {
            cursor.delete();
            cursor.continue();
        }
    };

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
});


export const getStudentsFromDB = (): Promise<Student[]> => new Promise((resolve, reject) => {
    if (!db) return reject("DB not initialized");
    const tx = db.transaction([STUDENT_STORE], 'readonly').objectStore(STUDENT_STORE).getAll();
    tx.onsuccess = () => resolve(tx.result);
    tx.onerror = () => reject(tx.error);
});

export const getAllEntriesFromDB = (): Promise<Entry[]> => new Promise((resolve, reject) => {
    if (!db) return reject("DB not initialized");
    const tx = db.transaction([ENTRY_STORE], 'readonly').objectStore(ENTRY_STORE).getAll();
    tx.onsuccess = () => resolve(tx.result);
    tx.onerror = () => reject(tx.error);
});


export const addEntryToDB = (entry: Entry): Promise<number> => new Promise((resolve, reject) => {
    if (!db) return reject("DB not initialized");
    const tx = db.transaction([ENTRY_STORE], 'readwrite').objectStore(ENTRY_STORE).add(entry);
    tx.onsuccess = () => resolve(tx.result as number);
    tx.onerror = () => reject(tx.error);
});

export const updateEntryInDB = (entry: Entry): Promise<number> => new Promise((resolve, reject) => {
    if (!db) return reject("DB not initialized");
    const tx = db.transaction([ENTRY_STORE], 'readwrite').objectStore(ENTRY_STORE).put(entry);
    tx.onsuccess = () => resolve(tx.result as number);
    tx.onerror = () => reject(tx.error);
});

export const deleteEntryFromDB = (id: number): Promise<void> => new Promise((resolve, reject) => {
    if (!db) return reject("DB not initialized");
    const tx = db.transaction([ENTRY_STORE], 'readwrite').objectStore(ENTRY_STORE).delete(id);
    tx.onsuccess = () => resolve();
    tx.onerror = () => reject(tx.error);
});

export const getEntriesForDateFromDB = (date: string): Promise<Entry[]> => new Promise((resolve, reject) => {
    if (!db) return reject("DB not initialized");
    const index = db.transaction([ENTRY_STORE], 'readonly').objectStore(ENTRY_STORE).index('date');
    const request = index.getAll(IDBKeyRange.only(date));
    request.onsuccess = () => {
        // No need to sort by date here, as we're only fetching one date
        resolve(request.result);
    };
    request.onerror = () => reject(request.error);
});
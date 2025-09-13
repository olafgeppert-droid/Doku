/** @jsxImportSource react */
// --- DATA TYPES (nur als Referenz, keine TS-Interfaces) ---

/**
 * Student object
 * @typedef {Object} Student
 * @property {number} [id]
 * @property {string} name
 * @property {string} schoolYear
 * @property {string} school
 * @property {string} className
 * @property {string} [gender]
 * @property {string} [nationality]
 * @property {string} [germanLevel]
 * @property {string} [notes]
 */

/**
 * Entry object
 * @typedef {Object} Entry
 * @property {number} [id]
 * @property {number} studentId
 * @property {string} date
 * @property {string} subject
 * @property {string} observations
 * @property {string} measures
 * @property {string} erfolg
 * @property {'positiv' | 'negativ' | ''} erfolgRating
 */

/**
 * MasterData object
 * @typedef {Object} MasterData
 * @property {string[]} schoolYears
 * @property {Object.<string, string[]>} schools
 */

/**
 * Settings object
 * @typedef {Object} Settings
 * @property {'default' | 'dark' | 'high-contrast' | 'custom'} theme
 * @property {number} fontSize
 * @property {number} inputFontSize
 * @property {Object} customColors
 * @property {string} customColors.sidebar
 * @property {string} customColors.header
 * @property {string} customColors.toolbar
 * @property {string} customColors.entryBackground
 * @property {MasterData} masterData
 */

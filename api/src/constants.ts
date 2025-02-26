import path from "path";
import os from "os";

const projectRootPath = process.cwd();

export const SERVER_PORT = 5000;
export const TEMP_FILE_DIRECTORY = path.join(projectRootPath, "./tmp");
export const PUBLIC_DIR = path.join(os.homedir(), ".qsmxt");
export const DICOMS_FOLDER = path.join(PUBLIC_DIR, "dicoms");
export const BIDS_FOLDER = path.join(PUBLIC_DIR, "bids");
export const QSM_FOLDER = path.join(PUBLIC_DIR, "qsm");
export const LOGS_FOLDER = path.join(PUBLIC_DIR, "logs");
export const DATABASE_FOLDER = path.join(PUBLIC_DIR, "database");
export const QSMXT_VERSION = "2.1.0";
export const QSMXT_DATE = "20230509";
export const DATABASE_USER = "qsmxt";
export const DATABASE_PASSWORD = "password";
export const DATABASE_NAME = "qsmxt";
export const DATABASE_HOST = "localhost";
export const SUBJECT_TABLE_NAME = "subjects";
export const JOBS_TABLE_NAME = "jobs";
export const COHORT_TABLE_NAME = "cohorts";
export const COHORT_SUBJECTS_TABLE_NAME = "cohortSubjects";

export type SubjectEchoes = {
  [echoNumber: string]: {
    magnitude: any;
    phase: any;
  };
};

export type SubjectRun = {
  echoes: string[];
};

export type SubjectRuns = {
  [runNumber: string]: SubjectRun;
};

export type SubjectSession = {
  runs: SubjectRuns;
  sessionImages: string[];
};

export type SubjectSessions = {
  [sessionNumber: string]: SubjectSession;
};

export type SubjectsTree = {
  sessions: SubjectSessions;
};

export type Subject = {
  subject: string;
  uploadFormat: SubjectUploadFormat;
  parameters: DicomConvertParameters;
  dataTree: SubjectsTree;
};

export enum JobStatus {
  NOT_STARTED = "NotStarted",
  IN_PROGRESS = "InProgress",
  COMPLETE = "Complete",
  FAILED = "Failed",
}

export enum JobType {
  DICOM_SORT = "Dicom Sort",
  DICOM_CONVERT = "Dicom Convert",
  QSM = "QSM Pipeline",
  SEGMENTATION = "Segmentation and Analysis",
  BIDS_COPY = "BIDS Copy",
}

export type DicomSortParameters = {
  copyPath: string;
  usePatientNames: boolean;
  useSessionDates: boolean;
  checkAllFiles: boolean;
};

export type DicomConvertParameters = {
  t2starwProtocolPatterns: string[];
  t1wProtocolPatterns: string[];
  linkedSortJob: string;
  usePatientNames: boolean;
  useSessionDates: boolean;
  checkAllFiles: boolean;
};

export type QsmParameters = {
  subjects: string[];
  sessions: string[];
  runs: string[];
  pipelineConfig: string;
};

export type SegementationParameters = {
  subjects: string[];
  linkedQsmJob: string;
  sessions: string[];
};

export type BIDsCopyParameters = {
  copyPath: string;
};

export type JobParameters =
  | DicomSortParameters
  | DicomConvertParameters
  | QsmParameters
  | SegementationParameters
  | BIDsCopyParameters;

export type Job = {
  id: string;
  type: JobType;
  status: JobStatus;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  parameters: JobParameters;
  error?: string;
  linkedQsmJob?: string;
  description?: string | null;
};

export type Cohort = {
  description: string;
  subjects: string[];
};

export type Cohorts = {
  [cohortName: string]: Cohort;
};

export enum SubjectUploadFormat {
  DICOM = "DICOM",
  BIDS = "BIDS",
}

export type QsmResult = {
  id: string;
  description: string;
  startedAt: string;
  qsmFinishedAt?: string;
  segmentationFinishedAt: string;
  segmentationCreatedAt: string;
  parameters: QsmParameters;
  analysisResults: any;
  qsmImages: string[];
};

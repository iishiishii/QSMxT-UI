import { v4 as uuidv4 } from "uuid";
import {
  BIDsCopyParameters,
  DicomConvertParameters,
  DicomSortParameters,
  Job,
  JobParameters,
  JobStatus,
  JobType,
  QsmParameters,
  SegementationParameters,
} from "../types";
import {
  BIDS_FOLDER,
  DICOMS_FOLDER,
  LOGS_FOLDER,
  QSM_FOLDER,
} from "../constants";
import http from "http";
import qsmxt from "../qsmxtInstanceHandler";
import path from "path";
import fs from "fs";
import sockets from "./sockets";
import logger from "../util/logger";
import database from "../databaseClient";

let jobQueue: Job[] | null;

const getJobQueue = async () => {
  if (!jobQueue) {
    jobQueue = await database.jobs.get.incomplete();
  }
  return jobQueue;
};

export const getJobLogFile = (
  jobType: JobType,
  id: string,
  linkedQsmJob: string | undefined,
) => {
  let logFile = null;
  if (jobType === JobType.DICOM_SORT) {
    logFile = "sortDicoms.log";
    return path.join(DICOMS_FOLDER, logFile);
  }
  if (jobType === JobType.DICOM_CONVERT) {
    logFile = "convertDicoms.log";
    return path.join(DICOMS_FOLDER, logFile);
  }
  if (jobType === JobType.QSM) {
    logFile = "ALL.log";
    return path.join(QSM_FOLDER, id, logFile);
  }
  if (jobType === JobType.BIDS_COPY) {
    logFile = "copyBids.log";
    return path.join(BIDS_FOLDER, logFile);
  }
  if (jobType === JobType.SEGMENTATION) {
    logFile = "qsmSegmentation.log";
    return path.join(QSM_FOLDER, linkedQsmJob as string, logFile);
  }
  return "";
};

const getJobById = async (jobId: string): Promise<Job> => {
  return (await getJobQueue()).find((job) => job.id === jobId) as Job;
};

const updateJob = async (job: Job) => {
  await database.jobs.update(job);
  jobQueue = await database.jobs.get.incomplete();
};

const saveNewJob = async (job: Job) => {
  await database.jobs.save(job);
  jobQueue = await database.jobs.get.incomplete();
};

const getStatus = async (jobId: string): Promise<JobStatus> => {
  return (await database.jobs.get.status(jobId)) as JobStatus;
};

const setJobToComplete = async (
  jobId: string,
  status: JobStatus,
  error: string | null = null,
) => {
  const job: Job = {
    ...(await getJobById(jobId)),
    status,
    finishedAt: new Date().toISOString(),
  };
  if (error) {
    job.error = new Date().toISOString() + ": " + error;
  }
  await updateJob(job);
  sockets.sendJobAsNotification(job);
  if ((jobQueue as Job[]).length) {
    Promise.race([
      waitForDuration(1000 * 100 * 60 * 60),
      runJob((jobQueue as Job[])[0].id),
    ]);
  }
};

const setJobToInProgress = async (jobId: string) => {
  const job: Job = {
    ...(await getJobById(jobId)),
    status: JobStatus.IN_PROGRESS,
    startedAt: new Date().toISOString(),
  };
  await updateJob(job);
};

const handleSuccessLogger = async (
  id: string,
  type: JobType,
  linkedQsmJob: string | undefined,
  logFilePath: string,
) => {
  logger.green(`Job ${id} complete`);
  await setJobToComplete(id, JobStatus.COMPLETE);
  let path = getJobLogFile(type, id, linkedQsmJob);
  const logContents = fs.readFileSync(path, { encoding: "utf-8" });
  fs.appendFileSync(logFilePath, logContents, { encoding: "utf-8" });

  Promise.resolve();
};

const handleFailureLogger = async (
  id: string,
  type: JobType,
  linkedQsmJob: string | undefined,
  logFilePath: string,
  err: string,
) => {
  logger.red(`Job ${id} failed`);
  logger.red(err);
  await setJobToComplete(id, JobStatus.FAILED, err);
  let path = getJobLogFile(type, id, linkedQsmJob);

  const logContents = fs.readFileSync(path, { encoding: "utf-8" });
  fs.appendFileSync(logFilePath, logContents, { encoding: "utf-8" });

  fs.appendFileSync(logFilePath, `${err}\n`, { encoding: "utf-8" });
  Promise.resolve();
};

async function waitForDuration(duration: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, duration);
  });
}

const runJob = async (jobId: string) => {
  const { id, type, parameters, linkedQsmJob } = await getJobById(jobId);
  let logFilePath: string = path.join(LOGS_FOLDER, `${id}.log`);
  let dateTime = new Date().toISOString();
  fs.writeFileSync(logFilePath, `Started job at ${dateTime}\n`, {
    encoding: "utf-8",
  });
  logger.yellow(
    `Running job ${id} of type ${type} with linked job ${linkedQsmJob}`,
  );
  sockets.createInProgressSocket(type, id, linkedQsmJob as string);
  setJobToInProgress(jobId);
  let jobPromise;
  if (type === JobType.DICOM_SORT) {
    jobPromise = qsmxt
      .sortDicoms(parameters as DicomSortParameters)
      .then(async () => {
        handleSuccessLogger(id, type, linkedQsmJob, logFilePath);
      })
      .catch(async (err) => {
        handleFailureLogger(id, type, linkedQsmJob, logFilePath, err);
      });
  } else if (type === JobType.DICOM_CONVERT) {
    await getStatus(linkedQsmJob as string)
      .then((status) => {
        logger.yellow(`Linked job ${jobId} has status ${status}`);
        if (status === JobStatus.FAILED) {
          logger.red(`............ Linked job ${linkedQsmJob} failed`);
          handleFailureLogger(
            id,
            type,
            linkedQsmJob,
            logFilePath,
            "Sort dicom job failed, cannot convert dicoms",
          );
          return;
        } else if (status === JobStatus.COMPLETE) {
          jobPromise = qsmxt
            .convertDicoms(parameters as DicomConvertParameters)
            .then(async () => {
              handleSuccessLogger(id, type, linkedQsmJob, logFilePath);
            })
            .catch(async (err) => {
              handleFailureLogger(id, type, linkedQsmJob, logFilePath, err);
            });
        }
      })
      .catch((err) => {
        logger.red(
          `Linked job ${linkedQsmJob} does not exist or query return ${err}`,
        );
      });
  } else if (type === JobType.QSM) {
    const { subjects, sessions, runs, pipelineConfig } =
      parameters as QsmParameters;

    fs.mkdirSync(path.join(QSM_FOLDER, id));
    jobPromise = qsmxt
      .runQsmPipeline(id, subjects, sessions, runs, pipelineConfig)
      .then(async () => {
        handleSuccessLogger(id, type, linkedQsmJob, logFilePath);
      })
      .catch(async (err) => {
        handleFailureLogger(id, type, linkedQsmJob, logFilePath, err);
      });
  } else if (type === JobType.SEGMENTATION) {
    const { subjects, linkedQsmJob, sessions } =
      parameters as SegementationParameters;
    jobPromise = qsmxt
      .runSegmentation(subjects, linkedQsmJob, sessions)
      .then(async () => {
        handleSuccessLogger(id, type, linkedQsmJob, logFilePath);
      })
      .catch(async (err) => {
        handleFailureLogger(id, type, linkedQsmJob, logFilePath, err);
      });
  } else if (type === JobType.BIDS_COPY) {
    const { copyPath } = parameters as BIDsCopyParameters;
    jobPromise = qsmxt
      .copyBids(copyPath)
      .then(async () => {
        handleSuccessLogger(id, type, linkedQsmJob, logFilePath);
      })
      .catch(async (err) => {
        handleFailureLogger(id, type, linkedQsmJob, logFilePath, err);
      });
  }
};

const addJobToQueue = async (
  type: JobType,
  parameters: JobParameters,
  linkedQsmJob: string | null = null,
  description: string | null = null,
): Promise<string> => {
  const id = uuidv4();
  const createdAt = new Date().toISOString();
  const job: Job = {
    id,
    type,
    status: JobStatus.NOT_STARTED,
    createdAt,
    startedAt: null,
    finishedAt: null,
    parameters,
  };
  if (linkedQsmJob) {
    job.linkedQsmJob = linkedQsmJob;
  }
  if (description) {
    job.description = description;
  }
  await saveNewJob(job);
  sockets.sendJobAsNotification(job);
  if ((jobQueue as Job[]).length === 1) {
    Promise.race([
      runJob((jobQueue as Job[])[0].id),
      waitForDuration(1000 * 100 * 60 * 60),
    ]);
  }
  return id;
};

const setup = async (server: http.Server) => {
  await sockets.setup(server);
};

const jobHandler = {
  addJobToQueue,
  setup,
};

export default jobHandler;

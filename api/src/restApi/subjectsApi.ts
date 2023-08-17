import { Request, Response } from "express";
import {
  BIDsCopyParameters,
  DicomConvertParameters,
  DicomSortParameters,
  JobType,
} from "../types";
import jobHandler from "../jobHandler";
import logger from "../util/logger";
import database from "../databaseClient";

const uploadSubjectDicomData = async (request: Request, response: Response) => {
  logger.green(
    "Received request to copy DICOMS at " + new Date().toISOString(),
  );
  const body = request.body;
  const {
    copyPath,
    usePatientNames,
    useSessionDates,
    checkAllFiles,
    t2starwProtocolPatterns,
    t1wProtocolPatterns,
  } = body;

  const fixedCopyPath = copyPath.includes(":\\")
    ? `/neurodesktop-storage${copyPath
        .split("neurodesktop-storage")[1]
        .replace(/\\/g, "/")}`
    : copyPath;

  const dicomSortParameters: DicomSortParameters = {
    copyPath: fixedCopyPath,
    usePatientNames: usePatientNames === "true",
    useSessionDates: useSessionDates === "true",
    checkAllFiles: checkAllFiles === "true",
  };
  const linkedSortJob = await jobHandler.addJobToQueue(
    JobType.DICOM_SORT,
    dicomSortParameters,
  );

  const dicomConvertParameters: DicomConvertParameters = {
    t2starwProtocolPatterns: JSON.parse(t2starwProtocolPatterns),
    t1wProtocolPatterns: JSON.parse(t1wProtocolPatterns),
    linkedSortJob,
    usePatientNames: usePatientNames === "true",
    useSessionDates: useSessionDates === "true",
    checkAllFiles: checkAllFiles === "true",
  };
  await jobHandler.addJobToQueue(
    JobType.DICOM_CONVERT,
    dicomConvertParameters,
    linkedSortJob,
  );

  response.statusMessage =
    "Successfully copied DICOMs. Starting sort and conversion jobs.";
  response.status(200).send();
};

const uploadSubjectBidsData = async (request: Request, response: Response) => {
  const { copyPath } = request.body;
  logger.green(
    "Received request to copy BIDS from " +
      copyPath +
      " at " +
      new Date().toISOString(),
  );

  // check already exists
  const parameters = {
    copyPath: copyPath as string,
  } as BIDsCopyParameters;

  await jobHandler.addJobToQueue(JobType.BIDS_COPY, parameters);

  response.statusMessage = "Starting copying BIDs data.";
  response.status(200).send();
};

const getSubjects = async (request: Request, response: Response) => {
  const subjects = await database.subjects.get.all();
  return response.status(200).send(subjects);
};

const deletSubject = async (request: Request, response: Response) => {
  const subjectName = decodeURIComponent(request.params.subjectName);
  const subjectExists = await database.subjects.get.byName(subjectName);
  if (!subjectExists) {
    response.statusMessage = "Subject does not exist.";
    response.status(404).send();
  }
  await database.subjects.delete(subjectName);
  return response.status(200).send();
};

export default {
  upload: {
    dicom: uploadSubjectDicomData,
    bids: uploadSubjectBidsData,
  },
  get: getSubjects,
  delete: deletSubject,
};

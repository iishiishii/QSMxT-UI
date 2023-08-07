
import { DicomSortParameters } from "../types";
import { DICOMS_FOLDER } from "../constants";
import logger from "../util/logger";
import path from "path";
import { runQsmxtCommand } from ".";

const logFilePath = path.join(DICOMS_FOLDER, 'sortDicoms.log');

const sortDicoms = async (params: DicomSortParameters): Promise<void> => {
  const { copyPath, usePatientNames, useSessionDates, checkAllFiles } = params
  logger.green("Starting dicom sort");
  let sortDicomCommand = `run_0_dicomSort.py` 
  if (usePatientNames) {
    sortDicomCommand += ` --use_patient_names`;
  }
  if (useSessionDates) {
    sortDicomCommand += ` --use_session_dates`;
  }
  if (checkAllFiles) {
    sortDicomCommand += ` --check_all_files`;
  }
  sortDicomCommand += ` ${copyPath} ${DICOMS_FOLDER}`;
  const completionString = 'INFO: Finished';

  await runQsmxtCommand(sortDicomCommand, completionString, logFilePath).then(
    (result) => { 
      console.log("qsm pipeline result ", result);
    }
  ).catch((err) => {
    console.log("qsm pipeline err ", err)
    throw err;
  });
}

export default sortDicoms;
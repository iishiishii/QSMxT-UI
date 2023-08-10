import { DicomSortParameters } from "../types";
import { DICOMS_FOLDER } from "../constants";
import logger from "../util/logger";
import path from "path";
import fs from "fs";
import { runQsmxtCommand } from ".";

const logFilePath = path.join(DICOMS_FOLDER, "sortDicoms.log");

const sortDicoms = async (params: DicomSortParameters): Promise<void> => {
  const { copyPath, usePatientNames, useSessionDates, checkAllFiles } = params;
  logger.green("Starting dicom sort");
  let sortDicomCommand = `run_0_dicomSort.py`;
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
  const completionString = "INFO: Finished";
  fs.writeFileSync(
    logFilePath,
    `Starting Dicom sorting.\n` + `Command: ${sortDicomCommand}\n`,
    { encoding: "utf-8" },
  );

  await runQsmxtCommand(sortDicomCommand, completionString, logFilePath)
    .then((result) => {
      console.log("qsm pipeline result ", result);
    })
    .catch((err) => {
      console.log("qsm pipeline err ", err);
      fs.appendFileSync(logFilePath, `${err}\n`, { encoding: "utf-8" });
      throw err;
    });
};

export default sortDicoms;

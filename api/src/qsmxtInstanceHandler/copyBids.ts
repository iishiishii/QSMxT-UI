import path from "path";
import database from "../databaseClient";
import fs from "fs";
import { BIDS_FOLDER } from "../constants";
import { SubjectUploadFormat } from "../types";
import { getSessionsForSubject } from "./subjectData";
import { Worker } from 'worker_threads';
import { spawn } from "child_process";
import { setupListeners } from ".";
import logger from "../util/logger";

const logFilePath = path.join(BIDS_FOLDER, 'bidsCopy.log');

const copyAllFilesAndFolders = async (soucePath: string, destinationPath: string) => {
  const copyInstance: any = spawn('cp', ['-r', soucePath, destinationPath]);
  await new Promise((resolve, reject) => {
    setupListeners(copyInstance, reject);
    copyInstance.on('exit', (code: number) => {
      if (code === 0) {
        resolve(null);
      } else {
        resolve(`Copy failed with code ${code}`);
      }
    })
  })
  copyInstance.kill();
}

const copyBids = async (sourcePath: string) => {
  fs.writeFileSync(logFilePath, `Starting BIDs copy.\n`, { encoding: 'utf-8' });

  const subjects: string[] = [];

  fs.appendFileSync(logFilePath, 'Copying subject directories.\n');

  const directories = fs.readdirSync(sourcePath).filter((dir) => {
    const dirPath = path.join(sourcePath, dir);
    return fs.lstatSync(dirPath).isDirectory();
  });

  subjects.push(...directories);

  await Promise.all(directories.map(async (folder) => {
    await copyAllFilesAndFolders(path.join(sourcePath, folder), BIDS_FOLDER);
  }));
    
  fs.appendFileSync(logFilePath, 'Saving subjects to database.\n');
  await Promise.all(subjects.map(async (subject) => {
    return database.subjects.save(subject, SubjectUploadFormat.BIDS, {}, { sessions: getSessionsForSubject(subject) });
  }));
  fs.appendFileSync(logFilePath, 'Finished.\n');
  logger.green(`Finished copying BIDS from ${sourcePath} to ${BIDS_FOLDER}`);
}



export default copyBids;
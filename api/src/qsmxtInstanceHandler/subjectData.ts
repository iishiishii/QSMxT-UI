import path from "path";
import fs from "fs";
import { BIDS_FOLDER, DICOMS_FOLDER } from "../constants";
import { SubjectRuns, SubjectSessions } from "../types";

const getRunNumbersForSession = (sessionFiles: string[]): string[] => {
  const runNumbers: Set<string> = new Set();
  sessionFiles.forEach((fileName: string) => {
    const runNumber = (/(?<=run-)\d*(?=_echo)/g.exec(fileName) || [])[0];
    if (runNumber) {
      runNumbers.add(runNumber as string);
    }
  })
  return Array.from(runNumbers);
}

const getEchoNumbersForRun = (sessionFiles: string[], runNumber: string): string[] => {
  const echoNumbers: Set<string> = new Set();
  const echoNumberRegex = `(?<=run-${runNumber}_echo-)\\d*(?=_part)`;
  sessionFiles
    .filter(file => file.includes(`run-${runNumber}_echo-`))
    .forEach((fileName: string) => {
      const echoNumber = (new RegExp(echoNumberRegex, "g").exec(fileName) || [])[0]
      echoNumbers.add(echoNumber as string);
    });
  return Array.from(echoNumbers);
}

const getRunsForSession = (subjectPath: string, sessionNumber: string): SubjectRuns => {
  const runs: SubjectRuns = {};
  const runsPath = path.join(subjectPath, `./${sessionNumber}/anat`);
  if (fs.existsSync(runsPath)) {
    const sessionFiles = fs.readdirSync(runsPath);
    const runNumbers = getRunNumbersForSession(sessionFiles);
    runNumbers.forEach((runNumber: string) => {
      const echoes = getEchoNumbersForRun(sessionFiles, runNumber);
      if (Object.keys(echoes).length) {
        runs[runNumber] = {
          echoes
        }
      }
    })
  }
  return runs;
}

export const getSessionsForSubject = (subject: string): SubjectSessions => {
  const sessionsTree: SubjectSessions = {};
  const subjectPath = path.join(BIDS_FOLDER, `./${subject}`);
  const sessionNumbers = fs.readdirSync(subjectPath);
  sessionNumbers.forEach((sessionNumber: string) => {
      sessionsTree[sessionNumber] = {
        runs: getRunsForSession(subjectPath, sessionNumber)
      }
    });
  return sessionsTree;
}
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import logger from "../util/logger";
import { QSMXT_DATE, QSMXT_VERSION } from "../constants";
import convertDicoms from "./convertDicoms";
import sortDicoms from "./sortDicoms";
import runQsmPipeline from "./runQsmPipeline";
import runSegmentation from "./runSegmentation";
import fs from "fs";
import copyBids from "./copyBids";

let qsmxtInstance: ChildProcessWithoutNullStreams | null;

function _cleanupListeners(process: ChildProcessWithoutNullStreams): void {
  process.stdout.removeAllListeners();
  process.stderr.removeAllListeners();
  process.removeAllListeners();
}

export const setupListeners = (
  process: ChildProcessWithoutNullStreams,
  completionString: string,
  resolve: any,
  reject: (reason?: any) => void,
  logFilePath: string | null = null,
) => {
  logger.yellow(
    logFilePath ? `Logging to ${logFilePath}` : "No log file path provided",
  );

  process.stderr.on("data", (err: Buffer) => {
    logger.red("stderr " + err.toString());
    if (logFilePath) {
      fs.appendFileSync(logFilePath, `stderr " + ${err.toString()}\n`, {
        encoding: "utf-8",
      });
    }
    _cleanupListeners(process);
    reject(new Error(err.toString()));
  });

  process.on("error", (error) => {
    logger.red(`error: ${error.message}`);
    if (logFilePath) {
      fs.appendFileSync(logFilePath, `error: ${error.message}\n`, {
        encoding: "utf-8",
      });
    }
    _cleanupListeners(process);
    reject(new Error(error.message));
  });

  process.on("exit", (code, signal) => {
    const _code: number | null = code;
    console.log(
      "child process exited with " + `code ${code} and signal ${signal}`,
    );
    if (_code === 0 || _code === null) {
      _cleanupListeners(process);
      resolve(null);
    } else {
      if (logFilePath) {
        fs.appendFileSync(
          logFilePath,
          "child process exited with " + `code ${code} and signal ${signal}`,
          { encoding: "utf-8" },
        );
      }
      _cleanupListeners(process);
      reject(
        new Error(
          "child process exited with " + `code ${code} and signal ${signal}`,
        ),
      );
    }
  });

  process.stdout.on("data", (data) => {
    const stringData = data.toString();
    stringData.split("\n").forEach((line: string) => {
      if (logFilePath) {
        fs.appendFileSync(logFilePath, line + "\n", { encoding: "utf-8" });
      }
      if (line.includes("ERROR:")) {
        logger.red(line);
        reject(new Error(line));
      }
      if (line.includes(completionString)) {
        resolve(null);
      }
    });
  });
};

export const runQsmxtCommand = async (
  command: string,
  completionString: string,
  logFilePath: string | null = null,
): Promise<void> => {
  // Spawn a new shell process
  const process: ChildProcessWithoutNullStreams = spawn(command, [], {
    shell: true,
  });

  let runQsm: Promise<void> = new Promise((resolve, reject) => {
    setupListeners(process, completionString, resolve, reject, logFilePath);
    logger.yellow(new Date().toISOString() + `Running: "${command}"`);
  });
  // Kill the process after the command is executed.
  // process.kill();
  return runQsm;
};

const killChildProcess = () => {
  if (qsmxtInstance) {
    logger.green("Killing child");
    qsmxtInstance.kill();
  }
};

export default {
  convertDicoms,
  sortDicoms,
  runQsmPipeline,
  runSegmentation,
  copyBids,
  killChildProcess,
};

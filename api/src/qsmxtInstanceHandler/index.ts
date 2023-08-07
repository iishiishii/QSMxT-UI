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

export const setupListeners = (child: ChildProcessWithoutNullStreams, reject: (reason?: any) => void) => { 
  child.stdout.removeAllListeners();
  child.stderr.removeAllListeners();
  child.removeAllListeners();
  child.stderr.on('data', (data) => {
    logger.red(`stderr: ${data}`);
    reject(data)
  });
  child.on('error', (error) => {
    logger.red(`error: ${error.message}`);
    reject(error.message)
  });
}

export const runQsmxtCommand = async (
  command: string,
  completionString: string,
  logFilePath: string | null = null,
  errorString: string = 'ERROR:'
): Promise<void>  => {
  // Spawn a new shell process
  const process: ChildProcessWithoutNullStreams = spawn(command, [], { shell: true });

  let runQsm: Promise<void>  = new Promise((resolve, reject) => {

      process.stdout.on('data', (data) => {
          const stringData = data.toString();
          stringData.split('\n').forEach((line: string) => {
            if (line.includes('ERROR:')) {
              logger.red(line);
              reject(new Error(line));
            }
            if (logFilePath) {
              fs.writeFileSync(logFilePath, line + '\n', { encoding: 'utf-8' })
            }
            if (line.includes(errorString)) {
              logger.red(line);
              reject(new Error(line));
            }
          });
      });

      process.stderr.on('data', (err: Buffer) => {
        logger.red("stderr " + err.toString())
        process.stdout.removeAllListeners();
        process.stderr.removeAllListeners();
        process.removeAllListeners();
        reject(new Error(err.toString()))  
      });

      process.on('error', (error) => {
        logger.red(`error: ${error.message}`);
        process.stdout.removeAllListeners();
        process.stderr.removeAllListeners();
        process.removeAllListeners();
        reject(new Error(error.message))
      });


      process.on('exit', (code, signal) => {
        const _code: number | null = code;
        console.log(
          'child process exited with ' + `code ${code} and signal ${signal}`
        );
        if (_code === 0) {
            process.stdout.removeAllListeners();
            process.stderr.removeAllListeners();
            process.removeAllListeners();
            resolve();
        } else {
          process.stdout.removeAllListeners();
          process.stderr.removeAllListeners();
          process.removeAllListeners();
          reject(new Error('child process exited with ' + `code ${code} and signal ${signal}`))
        }
      });

      logger.yellow(`Running: "${command}"`);
    });      
    // Kill the process after the command is executed.
    process.kill();
    return runQsm
};

const killChildProcess = () => {
  if (qsmxtInstance) {
    logger.green('Killing child');
    qsmxtInstance.kill();
  }
}

export default {
  convertDicoms,
  sortDicoms,
  runQsmPipeline,
  runSegmentation,
  copyBids,
  killChildProcess
}
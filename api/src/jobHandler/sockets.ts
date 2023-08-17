import { Server, Socket } from "socket.io";
import http, { get } from "http";
import logger from "../util/logger";
import fs from "fs";
import { Job, JobType } from "../types";
import { getJobLogFile } from ".";

let io: Server | null = null;
let notificationSocket: Socket | null = null;
let backedUpNotifications: Job[] = [];

export const getNotificationSocket = (): Socket => {
  return notificationSocket as Socket;
};

let inProgressNamespace: any = null;
let notificationNameSpace: any = null;

let currentLogFile: any = null;

// https://stackoverflow.com/questions/54668122/read-file-in-node-js-while-it-is-opened-for-writing-by-another-software
const createInProgressSocket = (
  type: JobType,
  id: string,
  linkedQsmJob: string,
) => {
  currentLogFile = getJobLogFile(type, id, linkedQsmJob);
  logger.magenta("Creating In Progress Socket " + currentLogFile);
  inProgressNamespace.on("connection", (socket: any) => {
    logger.magenta('Connection recieved to "In Progress" Socket');
    let streamed = 0;
    function readFd() {
      const fd = fs.openSync(currentLogFile, "r");
      const stream = fs.createReadStream(currentLogFile, {
        fd,
        encoding: "utf8",
        start: streamed,
      });
      stream.on("data", function (chunk) {
        streamed += chunk.length;
        console.log(
          "emit data ",
          new Date().toISOString(),
          "  ",
          chunk.toString(),
        );
        socket.emit("receiveFile", chunk);
      });
    }

    let interval = setInterval(readFd, 4000);
    socket.on("disconnect", () => {
      logger.magenta('Disconnected from "In Progress" Socket');
      clearInterval(interval);
    });
  });
};

const createNotificationSocket = () => {
  notificationNameSpace.on("connection", (socket: any) => {
    logger.magenta('Connection recieved to "Notification" Socket');
    notificationSocket = socket;
    if (backedUpNotifications.length) {
      backedUpNotifications.forEach((backedUpJob: Job) => {
        socket.emit("data", JSON.stringify({ job: backedUpJob }));
      });
      backedUpNotifications = [];
    }
    socket.on("disconnect", () => {
      logger.magenta('Disconnected from "In Notification" Socket');
    });
  });
};

const sendJobAsNotification = async (job: Job) => {
  const notificationSocket = getNotificationSocket();
  if (notificationSocket) {
    notificationSocket.emit("data", JSON.stringify({ job }));
  } else {
    backedUpNotifications.push(job);
  }
};

const setup = async (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });
  inProgressNamespace = (io as Server).of("/inProgress");
  notificationNameSpace = (io as Server).of("/notifications");
  createNotificationSocket();
};

export default {
  setup,
  createInProgressSocket,
  sendJobAsNotification,
};

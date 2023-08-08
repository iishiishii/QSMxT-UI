// rewrite the bash command above into javascript
const fs = require("fs");
const path = require("path");

const setupDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};
setupDir(path.join(process.env.HOME, ".qsmxt/dicoms"));
setupDir(path.join(process.env.HOME, ".qsmxt/bids"));
setupDir(path.join(process.env.HOME, ".qsmxt/qsm"));
setupDir(path.join(process.env.HOME, ".qsmxt/logs"));
setupDir(path.join(process.env.HOME, ".qsmxt/database"));

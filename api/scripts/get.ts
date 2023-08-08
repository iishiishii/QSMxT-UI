import path from "path";
import {
  DATABASE_HOST,
  DATABASE_NAME,
  DATABASE_PASSWORD,
  DATABASE_USER,
  DATABASE_FOLDER,
} from "../src/constants";

const sqlite3 = require("sqlite3").verbose();

// Open a database connection
const x = path.join(DATABASE_FOLDER, "database.sqlite");
const db = new sqlite3.Database(x);

// Execute SELECT query
db.all("SELECT * FROM subjects;", (err: any, rows: any) => {
  if (err) {
    console.error(err);
  } else {
    console.log(rows);
  }
});

// db.all('SELECT * FROM projectDiagrams;', (err: any, rows: any) => {
//   if (err) {
//     console.error(err);
//   } else {
//     console.log(rows);
//   }
// });

// Close the database connection
db.close();

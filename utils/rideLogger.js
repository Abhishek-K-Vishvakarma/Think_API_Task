// import { createLogger, format, transports } from "winston";
// import path from "path";
// import fs from "fs";
// //ENV
// const isProduction = process.env.NODE_ENV == "production";
// //LOG DIR (LOCAL ONLY)
// const logDir = path.join(process.cwd(), "logs", "orders");
// if (!isProduction) {
//   if (!fs.existsSync(logDir)) {
//     fs.mkdirSync(logDir, { recursive: true });
//   };
// }
// //IGNORE LOGGER FILES
// const LOGGER_FILE_NAMES = [
//   "rideLogger.js",
//   "orderLogger.js",
//   "entityLogger.js",
//   "logger.js"
// ];
// //CALLER INFO
// export const getCallerInfo = () => {
//   const stack = new Error().stack.split("\n");

//   for (let i = 0; i < stack.length; i++) {
//     const line = stack[i];

//     if (line.includes("node_modules") || line.includes("internal") || line.includes("winston") || line.includes("logform")) {
//       continue;
//     }
//     if (LOGGER_FILE_NAMES.some(name => line.includes(name))) {
//       continue;
//     }
//     const match = line.match(/\((.*):(\d+):(\d+)\)/) || line.match(/at (.*):(\d+):(\d+)/);
//     if (match) {
//       return {
//         file: path.basename(match[1]),
//         line: match[2],
//       };
//     }
//   }
//   return { file: "unknown", line: "?" };
// };
// //TRANSPORTS 
// const buildTransports = (orderId) => {
//   // for production level logging
//   const transportsList = [];
//   transportsList.push(
//     new transports.Console({
//       format: format.combine(format.colorize()),
//     })
//   );
//   // for local level logging
//   if (!isProduction && orderId) {
//     transports.File({
//       filename: path.join(logDir, `order-${ orderId }.log`),
//     });
//   }
//   return transports;
// }
// // LOGGER FACTORY
// export const getLogger = (orderId = "SYSTEM") => {
//   const baseLogger = createLogger({
//     level: "debug",
//     format: format.combine(
//       format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
//       format.printf(({ timestamp, level, message, meta }) => {
//         return `${ timestamp } [${ level }] [ORDER:${ orderId }] [${ meta.file }:${ meta.line }] ${ message }`;
//       })
//     ),
//     transports: buildTransports(orderId),
//   });
//   return {
//     info: (msg) => baseLogger.info(msg, { meta: getCallerInfo() }),
//     warn: (msg) => baseLogger.warn(msg, { meta: getCallerInfo() }),
//     error: (msg) => baseLogger.error(msg, { meta: getCallerInfo() }),
//     debug: (msg) => baseLogger.debug(msg, { meta: getCallerInfo() }),
//   };
// };

import { createLogger, format, transports } from "winston";
import path from "path";
import fs from "fs";

// ENV
const isProduction = process.env.NODE_ENV === "production";

// LOG DIR (LOCAL ONLY)
const logDir = path.join(process.cwd(), "logs", "orders");

if (!isProduction) {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
}

// IGNORE LOGGER FILES
const LOGGER_FILE_NAMES = [
  "logger.js",
  "orderLogger.js",
  "rideLogger.js",
  "entityLogger.js",
];

// CALLER INFO
export const getCallerInfo = () => {
  const stack = new Error().stack?.split("\n") || [];

  for (const line of stack) {
    if (
      line.includes("node_modules") ||
      line.includes("internal") ||
      line.includes("winston") ||
      line.includes("logform")
    ) {
      continue;
    }

    if (LOGGER_FILE_NAMES.some((name) => line.includes(name))) {
      continue;
    }

    const match =
      line.match(/\((.*):(\d+):(\d+)\)/) ||
      line.match(/at (.*):(\d+):(\d+)/);

    if (match) {
      return {
        file: path.basename(match[1]),
        line: match[2],
      };
    }
  }

  return { file: "unknown", line: "?" };
};

// TRANSPORTS
const buildTransports = (orderId) => {
  const transportList = [];

  // Production → Console ONLY
  transportList.push(
    new transports.Console({
      format: format.combine(format.colorize()),
    })
  );

  //  Local Dev → File logging
  if (!isProduction && orderId) {
    transportList.push(
      new transports.File({
        filename: path.join(logDir, `order-${ orderId }.log`),
      })
    );
  }

  return transportList;
};

// LOGGER FACTORY
export const getLogger = (orderId = "SYSTEM") => {
  const logger = createLogger({
    level: "debug",
    format: format.combine(
      format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      format.printf(({ timestamp, level, message, meta }) => {
        return `${ timestamp } [${ level.toUpperCase() }] [ORDER:${ orderId }] [${ meta?.file }:${ meta?.line }] ${ message }`;
      })
    ),
    transports: buildTransports(orderId),
  });

  return {
    info: (msg) => logger.info(msg, { meta: getCallerInfo() }),
    warn: (msg) => logger.warn(msg, { meta: getCallerInfo() }),
    error: (msg) => logger.error(msg, { meta: getCallerInfo() }),
    debug: (msg) => logger.debug(msg, { meta: getCallerInfo() }),
  };
};

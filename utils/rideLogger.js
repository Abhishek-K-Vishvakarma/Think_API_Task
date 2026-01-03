import { createLogger, format, transports } from "winston";
import path from "path";
import fs from "fs";

const logDir = path.join("logs", "product");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
};
const LOGGER_FILE_NAMES = [
  "rideLogger.js",
  "orderLogger.js",
  "entityLogger.js",
  "logger.js"
];
export const getCallerInfo = () => {
  const stack = new Error().stack.split("\n");

  for (let i = 0; i < stack.length; i++) {
    const line = stack[i];

    if (line.includes("node_modules") || line.includes("internal") || line.includes("winston") || line.includes("logform")
    ) {
      continue;
    }
    if (LOGGER_FILE_NAMES.some(name => line.includes(name))) {
      continue;
    }
    const match = line.match(/\((.*):(\d+):(\d+)\)/) || line.match(/at (.*):(\d+):(\d+)/);
    if (match) {
      return {
        file: path.basename(match[1]),
        line: match[2],
      };
    }
  }
  return { file: "unknown", line: "?" };
};
export const getLogger = (orderId) => {
  const baseLogger = createLogger({
    level: "debug",
    format: format.combine(
      format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      format.printf(({ timestamp, level, message, meta }) => {
        return `${ timestamp } [${ level }] [ORDER:${ orderId }] [${ meta.file }:${ meta.line }] ${ message }`;
      })
    ),
    transports: [
      new transports.File({
        filename: path.join(logDir, `order-${ orderId }.log`),
      }),
    ],
  });
  return {
    info: (msg) => baseLogger.info(msg, { meta: getCallerInfo() }),
    warn: (msg) => baseLogger.warn(msg, { meta: getCallerInfo() }),
    error: (msg) => baseLogger.error(msg, { meta: getCallerInfo() }),
    debug: (msg) => baseLogger.debug(msg, { meta: getCallerInfo() }),
  };
};

/**
 * Timestamped console step logger for formatted QA output.
 */
class Logger {
  static _formatTime() {
    return new Date().toISOString();
  }

  static info(message) {
    console.log(`[${this._formatTime()}] [INFO]  - ${message}`);
  }

  static step(stepNumber, message) {
    console.log(`[${this._formatTime()}] [STEP ${stepNumber}] - ${message}`);
  }

  static pass(message) {
    console.log(`[${this._formatTime()}] [PASS]  - ${message}`);
  }

  static warn(message) {
    console.warn(`[${this._formatTime()}] [WARN]  - ${message}`);
  }

  static error(message) {
    console.error(`[${this._formatTime()}] [ERROR] - ${message}`);
  }
}

module.exports = Logger;

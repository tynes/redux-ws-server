const assert = require('assert');

class Logger {
  constructor(level = 'info') {
    const LEVEL_MAP = {
      TRACE: 0,
      DEBUG: 1,
      INFO: 2,
      WARN: 3,
      ERROR: 4,
      FATAL: 5,
    }
    this.levels = [
      'TRACE',
      'DEBUG',
      'INFO',
      'WARN',
      'ERROR',
      'FATAL',
    ]

    level = level.toUpperCase();
    this.level = LEVEL_MAP[level];
    assert(this.level !== undefined);
  }

  printer(message, level) {
    const print = `(${this.levels[level]}): ${message}`;
    console.log(print);
  }

  log(message, level) {
    if (typeof message === 'function')
      return this.printer(message(), level);
    this.printer(message, level);
  }

  info(message) {
    if (this.level <= 2)
      this.log(message, 2)
  }

  debug(message) {
    if (this.level <= 1)
      this.log(message, 1)
  }

  error(message) {
    if (this.level <= 4)
      this.log(message, 4)
  }
}

module.exports = Logger;

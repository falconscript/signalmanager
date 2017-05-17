"use strict";

var process = require('process');

/**
 * SignalManager
 *
 * Prevent closing until your code approves it
 *
 * Add shutdown handlers for SIGINT and SIGTERM.
 * This is in case multiple "threads" or classes need to
 * do individual checks before closing. (Obviously no program can withstand SIGKILL though)
 *
 * Add a request handler first. It will be responsible for passing into the
 * callback true or false for if it approves the shutdown.
 * If all processes approve, all shutdown handlers are run then exited.
 * If any function/class passes false for REJECTION, the shutdown is canceled;
 * and no shutdown handlers are run.
 *
 */

class SignalManager {

  constructor (args) {
    this.shutdownHandlers = [];
    this.shutdownApprovalHandlers = [];
    this.runningHandlers = false;

    process.on('SIGTERM', this.onSignal.bind(this));
    process.on('SIGINT', this.onSignal.bind(this));
  }

  addShutdownHandler (handler) {
    this.shutdownHandlers.push(handler);
  }

  removeShutdownHandler (handler) {
    var index = -1; //this.shutdownHandlers.indexOf(handler);
    this.shutdownHandlers.forEach((aHandler, handlerIndex) => {
      if (aHandler.toString() == handler.toString()) {
        index = handlerIndex;
      }
    }); // */

    if (index == -1) {
      return console.log("[!] SignalManager.removeShutdownHandler - WARNING:",
        "Handler was not found");
    } else {
      return this.shutdownHandlers.splice(index, 1); // remove it
    }
  }

  addShutdownApprovalHandler (handler) {
    this.shutdownApprovalHandlers.push(handler);
  }

  removeShutdownApprovalHandler (handler) {
    var index = -1;// = this.shutdownApprovalHandlers.indexOf(handler); /* another method
    this.shutdownApprovalHandlers.forEach((aHandler, handlerIndex) => {
      if (aHandler.toString() == handler.toString()) {
        index = handlerIndex;
      }
    }); // */

    if (index == -1) {
      return console.log("[!] SignalManager.removeShutdownApprovalHandler - WARNING:",
        "Handler was not found");
    } else {
      return this.shutdownApprovalHandlers.splice(index, 1); // remove it
    }
  }

  /**
   * Request all functions if shutting down is acceptable
   */
  onSignal () {
    if (this.runningHandlers) {
      return console.log("[D] SignalManager - shutdown handlers in progress");
    }

    this.runningHandlers = true;

    // Run handlers requesting all of them to approve a shutdown
    this.runHandlers(this.shutdownApprovalHandlers, (boolApproved) => {
      if (!boolApproved) {
        this.runningHandlers = false;
        return console.log("[D] SignalManager - Shutdown rejected. One or more shutdown approval handlers denied it.");
      }

      // Shutdown was approved. Run all the handlers to quit now
      this.runHandlers(this.shutdownHandlers, (boolApproved) => {
        if (!boolApproved) {
          this.runningHandlers = false;
          return console.log("[!] SignalManager - Shutdown cancelled by a shutdown handler after all approval handlers approved!");
        }

        // All shutdown handlers approved and completed. Process will exit now
        process.exit(0);
      });
    });
  }

  /**
   * Run all handlers for a given array of handlers. Quits on receiving a rejection
   */
  runHandlers (handlers, callback) {

    this.curIndex = -1;

    var onHandlerCompletion = function (boolApproved) {
      if (!boolApproved) {
        return callback(false);
      }

      if (++this.curIndex == handlers.length) {
        return callback(true);
      } else {
        handlers[this.curIndex](onHandlerCompletion);
      }
    }.bind(this);

    return onHandlerCompletion(true);
  }
};

// Instantiate one instance only, on the global space. Very useful
if (!global.______signalManager) {
  global.______signalManager = new SignalManager();
}

module.exports = global.______signalManager;

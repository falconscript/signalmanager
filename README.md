# signalmanager

> ES6 JS classes for socket client and server message passing

## Installation

```sh
npm install signalmanager --save
```

## Usage

Prevent closing until your code approves it

Add shutdown handlers for SIGINT and SIGTERM.  
This is in case multiple "threads" or classes need to  
do individual checks before closing. (Obviously no program can withstand SIGKILL though)  

Add a request handler first. It will be responsible for passing into the  
callback true or false for if it approves the shutdown.  
If all processes approve, all shutdown handlers are run then exited.  
If any function/class passes false for REJECTION, the shutdown is canceled;  
and no shutdown handlers are run.  

```js

// SignalManager singleton. Should be same variable required anywhere
var SignalManager = require('signalmanager');

// APPROVAL HANDLER
// Generally the idea is that each service should have a shutdown approval handler to
// ask each service before shutting down if it can safely
SignalManager.addShutdownApprovalHandler(() => {
  if (somethingImportantHasNotFinishedYet) {
    return false; // do not approve shutdown. will cancel node program shutdown
  } else {
    return true; // will allow next handlers to run and if all approve, move on to the ShutdownHandlers
  }
});

// SHUTDOWN HANDLER
// If all the approvalHandlers returned true, shutdown will begin. All shutdownHandlers
// will be called in order of adding. Generally
SignalManager.addShutdownHandler(() => {
  if (isAnEmergencySomethingImportantIsStillRunning) {
    // false here as opposed to in the approval handler probably signifies something important
    // because by this point, other of the shutdown handlers may have run
    return false; // do not approve shutdown. will cancel program shutdown
  } else {
    // these are examples of what you would do
    someSocket.close();
    someFile.close();
    someEmail.send();

    return true; // will allow next handlers to run. Upon all returning true, it will allow exit
  }
});


```

## Credits
http://c-cfalcon.rhcloud.com

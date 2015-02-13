

// standard imports
var util = require("util");

/**
 * InvalidParametersError
 *
 * thrown when invalid parameters are passed to a function
 * @param msg {string} the message to be
 * @constructor
 */
function InvalidParametersError(msg) {
  this.name = "InvalidParametersError";
  this.message = msg || "Invalid Parameters.";
}
util.inherits(InvalidParametersError, Error);

/**
 * NotImplementedError
 *
 * thrown when function called is not implemented
 * @param msg {string} the message to be displayed
 * @constructor
 */
function NotImplementedError(msg) {
  this.name = "NotImplementedError";
  this.message = msg || "Not Implemented.";
}
util.inherits(NotImplementedError, Error);

// export module
module.exports = {
  InvalidParametersError: InvalidParametersError,
  NotImplementedError: NotImplementedError
};
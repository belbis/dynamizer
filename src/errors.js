

// standard import
var util = require("util");

/**
 * InvalidParametersError
 *
 * thrown when an invalid Object is passed
 * @constructor
 */
function InvalidParametersError() {
  this.message = "Invalid Parameters.";
}
util.inherits(InvalidParametersError, Error);

function NotImplementedError() {
  this.message = "Not Implemented.";
}
util.inherits(NotImplementedError, Error);

module.exports = {
  InvalidParametersError: InvalidParametersError,
  NotImplementedError: NotImplementedError
};
/**
 * unit tests for errors
 */

var errors = require(__dirname + "/../src/errors"),
  NotImplementedError = errors.NotImplementedError,
  InvalidParametersError = errors.InvalidParametersError;

var invalidParametersErrorTest = function(test) {
  test.throws(function() {
    throw new InvalidParametersError()
  }, InvalidParametersError);
  test.done();
};

var notImplementedErrorTest = function(test) {
  test.throws(function() {
    throw new NotImplementedError
  }, NotImplementedError);
  test.done();
};

module.exports = {
  invalidParametersErrorTest: invalidParametersErrorTest,
  notImplementedErrorTest: notImplementedErrorTest
};
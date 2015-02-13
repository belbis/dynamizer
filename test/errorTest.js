/**
 * unit tests for errors
 */

var errors = require(__dirname + "/../src/errors"),
  NotImplementedError = errors.NotImplementedError,
  InvalidParametersError = errors.InvalidParametersError;

var invalidParametersErrorTest = function(test) {
  test.expect(5);

  test.throws(function() {
    throw new InvalidParametersError()
  }, InvalidParametersError);
  var display = "display message";
  test.equal((new InvalidParametersError(display)).message, display);
  test.equal((new InvalidParametersError()).message, "Invalid Parameters.");
  test.ok((new InvalidParametersError()).name, "InvalidParametersError");
  test.ok((new InvalidParametersError()) instanceof Error);

  test.done();
};

var notImplementedErrorTest = function(test) {
  test.expect(5);

  test.throws(function() {
    throw new NotImplementedError
  }, NotImplementedError);
  var display = "display message";
  test.equal((new NotImplementedError(display)).message, display);
  test.equal((new NotImplementedError()).message, "Not Implemented.");
  test.ok((new NotImplementedError()).name, "NotImplementedError");
  test.ok((new NotImplementedError()) instanceof Error);

  test.done();
};

module.exports = {
  invalidParametersErrorTest: invalidParametersErrorTest,
  notImplementedErrorTest: notImplementedErrorTest
};
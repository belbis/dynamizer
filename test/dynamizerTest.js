/**
 * unit tests for Dynamizer object
 */

// local import
var Dynamizer = require(__dirname + "/../");
var errors = require(__dirname + "/../");
var sets = require("item-set"),
  Set = sets.Set,
  NumberSet = sets.NumberSet,
  StringSet = sets.StringSet,
  BinarySet = sets.BinarySet;


var testConstructor = function(test) {
  test.expect(9);

  var dynamizer = new Dynamizer();
  test.ok(dynamizer instanceof Dynamizer, "ensure type");
  test.ok(!(dynamizer.disableLossyFloat));
  test.ok(!(dynamizer.disableBoolean));

  var dynamizer2 = Dynamizer();
  test.ok(dynamizer2 instanceof Dynamizer);

  var dynamizer3 = new Dynamizer({});
  test.equal(dynamizer3.disableLossyFloat, false);
  test.equal(dynamizer3.disableBoolean, false);

  var dynamizer4 = new Dynamizer({
    disableBoolean: true,
    enableSets: true,
    disableLossyFloat: true
  });
  test.ok(dynamizer4.disableBoolean);
  test.ok(dynamizer4.enableSets);
  test.ok(dynamizer4.disableLossyFloat);

  test.done();
};

var testEncode = function(test) {
  test.expect(19);

  dynamizer = new Dynamizer();
  test.deepEqual(dynamizer.encode("foo"), {"S": "foo"}, "string encode");
  test.deepEqual(dynamizer.encode(54), {"N": "54"}, "integer encode");
  test.deepEqual(dynamizer.encode(1.1), {"N": "1.1"}, "float encode");
  test.deepEqual(dynamizer.encode(new Buffer("\x01")) ,{"B":"AQ=="}, "binary value encode");

  test.deepEqual(dynamizer.encode(["foo", 54, [1]]),
    {"L": [
      {"S": "foo"},
      {"N": "54"},
      {"L": [
        {"N": "1"}
      ]}
    ]}, "nested list of int and string encode");
  test.deepEqual(dynamizer.encode({"foo": "bar", "hoge": {"sub": 1}}),
    {"M": {"foo": {"S": "bar"}, "hoge": {"M": {"sub": {"N": "1"}}}}}, "nested map object encode");
  test.deepEqual(dynamizer.encode(null), {"NULL": true}, "null encode");
  test.deepEqual(dynamizer.encode(false), {"BOOL": false}, "false encode");
  test.deepEqual(dynamizer.encode(true), {"BOOL": true}, "true encode");

  // if sets aren"t enabled,
  test.deepEqual(dynamizer.encode(NumberSet([1, 2, 3])),{"L": [{N: "1"}, {N: "2"}, {N: "3"}]});
  test.deepEqual(dynamizer.encode(StringSet(["foo", "bar"])), {"L": [{S: "foo"}, {S: "bar"}]});
  test.deepEqual(dynamizer.encode(BinarySet([new Buffer("\x01")])),{"L":[{B: "AQ=="}]});

  // if sets are enabled
  dynamizer.enableSets = true;
  test.deepEqual(dynamizer.encode(NumberSet([1, 2, 3])),{"NS": ["1", "2", "3"]});
  test.deepEqual(dynamizer.encode(StringSet(["foo", "bar"])), {"SS": ["foo", "bar"]});
  test.deepEqual(dynamizer.encode(BinarySet([new Buffer("\x01")])),{"BS":["AQ=="]});

  // don't support untyped sets
  test.throws(function(){dynamizer.encode(Set([1,2,3]))}, errors.InvalidParametersError);

  // bad encode
  test.throws(function(){dynamizer.encode(new Error("is error"))}, errors.InvalidParametersError);

  // not implemented feature
  dynamizer.disableLossyFloat = true;
  test.throws(function(){dynamizer.encode(1.0)}, errors.NotImplementedError);

  // encode boolean as num
  dynamizer.disableBoolean = true;
  test.deepEqual(dynamizer.encode(false), {"N": "0"});

  test.done();
};

var testDecode = function(test) {
  test.expect(17);

  dynamizer = new Dynamizer();
  test.deepEqual(dynamizer.decode({"S": "foo"}), "foo", "string decode");
  test.deepEqual(dynamizer.decode({"N": "54"}), 54, "integer decode");

  // don"t worry about lossy float..
  test.deepEqual(dynamizer.decode({"N": "1.1"}), 1.1, "float decode");
  test.deepEqual(dynamizer.decode({"B": "AQ=="}), new Buffer("\x01"), "binary string decoding");
  test.deepEqual(dynamizer.decode({"L": [
      {"S": "foo"},
      {"N": "54"},
      {"L": [
        {"N": "1"}
      ]}
    ]}),
    ["foo", 54, [1]], "nested list of int and string decode");
  test.deepEqual(dynamizer.decode({"M": {"foo": {"S": "bar"}, "hoge": {"M": {"sub": {"N": "1"}}}}}),
    {"foo": "bar", "hoge": {"sub": 1}}, "nested map object decode");
  test.deepEqual(dynamizer.decode({"NULL": true}), null, "null decode");
  test.deepEqual(dynamizer.decode({"BOOL": false}), false, "false decode");
  test.deepEqual(dynamizer.decode({"BOOL": true}), true, "true decode");

  // sets disabled
  test.deepEqual(dynamizer.decode({"BS": ["AQ=="]}),[new Buffer("\x01")]);
  test.deepEqual(dynamizer.decode({"NS": ["1", "2", "3"]}),[1, 2, 3]);
  test.deepEqual(dynamizer.decode({"SS": ["foo", "bar"]}),["foo", "bar"]);

  // sets enabled
  dynamizer.enableSets = true;
  var bs = dynamizer.decode({"BS": ["AQ=="]});
  test.equal(bs.length, 1);
  test.deepEqual(bs.getArray(), [new Buffer("\x01")]);

  test.deepEqual(dynamizer.decode({"NS": ["1", "2", "3"]}).getArray(),[1, 2, 3]);
  test.deepEqual(dynamizer.decode({"SS": ["foo", "bar"]}).getArray(),["foo", "bar"]);

  // invalid return types
  test.throws(function() {dynamizer.decode({"FOO": "12"})}, errors.InvalidParametersError);

  test.done();
};

// export module
module.exports = {
  testConstructor: testConstructor,
  testEncode: testEncode,
  testDecode: testDecode
};

// npm imports
var sets = require('item-set'),
  Set = sets.Set,
  NumberSet = sets.NumberSet,
  StringSet = sets.StringSet,
  BinarySet = sets.BinarySet;

// local imports
var errors = require(__dirname + "/errors"),
  InvalidParametersError = errors.InvalidParametersError,
  NotImplementedError = errors.NotImplementedError;

/**
 * mirror of the boto Dynamizer class for node.js
**/
function Dynamizer(options) {
  // don"t enforce new
  if (!(this instanceof Dynamizer)) return new Dynamizer(options);

  if (options) {
    this.disableBoolean = options.disableBoolean || false; // maps boolean values to numeric
    this.enableSets = options.enableSets || false;
    // unsure about this option as yet
    this.disableLossyFloat = options.disableLossyFloat || false;
  }
}

/**
 * encode
 *
 * helper to encode objects
 * @param o
 * @returns {*}
 */
Dynamizer.prototype.encode = function(o) {
  var ret;
  if (o === null) { // null
    ret = this._null_encode(o);
  } else if (o.constructor === Boolean) { // bool
    ret = this._bool_encode(o);
  } else if (o.constructor === String) { // string values
    ret = this._str_encode(o);
  } else if (o.constructor === Number) { // numeric values
    ret = this._num_encode(o)
  } else if (o.constructor === Buffer) { // binary values (Buffer)
    ret = this._bin_encode(o);
  } else if (o.constructor === Array) { // list
    ret = this._arr_encode(o);
  } else if (o.constructor === Object) { // map object
    ret = this._map_encode(o);
  } else if (o instanceof Set) { // set
    ret = this._set_encode(o);
  } else {
    throw new InvalidParametersError();
  }

  return ret
};

/**
 * _bool_encode
 *
 * helper to encode boolean values
 * @private
 */
Dynamizer.prototype._bool_encode = function(o) {
  if (this.disableBoolean) {
    return {"N": 1 && o || 0};
  } else {
    return {"BOOL": o};
  }
};

/**
 * _num_encode
 *
 * helper to encode numeric values
 * @private
 */
Dynamizer.prototype._num_encode = function(n) {
 if (this.disableLossyFloat) {
   throw new NotImplementedError();
 }
  return {"N": ""+n};
};

/**
 * _str_encode
 *
 * helper to encode strings
 * @param s
 * @returns {{S: *}}
 * @private
 */
Dynamizer.prototype._str_encode = function(s) {
  return {"S": s};
};

/**
 * _null_encode
 *
 * helper to encode null
 * @param nu
 * @returns {{NULL: boolean}}
 * @private
 */
Dynamizer.prototype._null_encode = function(nu) {
  return {"NULL": true};
};

/**
 * _bin_encode
 *
 * helper to encode binary value
 * @param b
 * @returns {{B: *}}
 * @private
 */
Dynamizer.prototype._bin_encode = function(b) {
  return {"B": b.toString("base64")};
};

/**
 * _arr_encode
 *
 * helper to encode arrays
 * @param arr
 * @returns {{L: Array}}
 * @private
 */
Dynamizer.prototype._arr_encode = function(arr) {
  var r =  {L: []};
      for (var i=0;i< arr.length;++i) {
        r.L[i] = this.encode(arr[i]);
      }
  return r;
};

/**
 * _map_encode
 *
 * helper to encode map objects
 * @param o
 * @returns {{M: {}}}
 * @private
 */
Dynamizer.prototype._map_encode = function(o) {
  var r = {M: {}};
  for (var j in o) {
    if (o.hasOwnProperty(j)) {
      r.M[j] = this.encode(o[j])
    }
  }
  return r;
};

/**
 * _set_encode
 *
 * helper to encode set objects
 * @param o
 * @private
 */
Dynamizer.prototype._set_encode = function(o) {
  var r = {},
    encoder,
    self = this,
    key,
    retKey;
  if (o.constructor === NumberSet) {
    key = "N";
    encoder = this._num_encode;
  } else if (o.constructor === StringSet) {
    key = "S";
    encoder = this._str_encode;
  } else if (o.constructor === BinarySet) {
    key = "B";
    encoder = this._bin_encode;
  } else {
    throw new InvalidParametersError();
  }
  retKey = this.enableSets ? key + "S" : "L";
  r[retKey] = o.getArray().map(function(v) {
    var encoded = encoder(v);
    return self.enableSets ? encoded[key]: encoded;
  });
  return r;
};

/**
 * decode
 *
 * implementation of decode
 * @param o
 * @returns {*}
 */
Dynamizer.prototype.decode = function(o) {
  var ret;

  if (o.hasOwnProperty("NULL")) { // null values
    ret = this._null_decode(o);
  } else if (o.hasOwnProperty("BOOL")) { // boolean values
    ret = this._bool_decode(o);
  } else if (o.hasOwnProperty("S")) { // string values
    ret = this._str_decode(o);
  } else if (o.hasOwnProperty("N")) { // number values
    ret = this._num_decode(o);
  } else if (o.hasOwnProperty("B")) {
    ret = this._bin_decode(o);
  } else if (o.hasOwnProperty("NS") || o.hasOwnProperty("SS") || o.hasOwnProperty("BS")) {
    ret = this._set_decode(o);
  } else if (o.hasOwnProperty("L") || o.constructor === Array) { // array, or array obj
    o = o.L || o;
    ret = this._arr_decode(o);
  } else if (o.hasOwnProperty("M") || o.constructor === Object) { // map, or map obj
    o = o.M || o;
    ret = this._map_decode(o);
  }  else {
    throw new InvalidParametersError();
  }

  return ret;
};

/**
 * _null_decode
 *
 * helper for null decode
 * @param o object to be decoded
 * @private
 */
Dynamizer.prototype._null_decode = function(o) {
  return null; // todo: how to represent {NULL: false}?
};


/**
 * _bool_decode
 *
 * helper for boolean decode
 * @param o
 * @returns {*|BOOL}
 * @private
 */
Dynamizer.prototype._bool_decode = function(o) {
  return o.BOOL;
};

/**
 * _num_decode
 *
 * helper for numeric decode
 * @param o
 * @returns number
 * @private
 */
Dynamizer.prototype._num_decode = function(o) {
  return parseFloat(o.N);
};

/**
 * _str_decode
 *
 * helper for string decode
 * @param o
 * @returns string
 * @private
 */
Dynamizer.prototype._str_decode = function(o) {
  return o.S;
};

/**
 * _bin_decode
 *
 * helper for binary decode
 * @param o
 * @returns {B|*}
 * @private
 */
Dynamizer.prototype._bin_decode = function(o) {
  return new Buffer(o.B, encoding='base64');
};

/**
 * _arr_decode
 *
 * helper for array decode
 * @param o
 * @private
 */
Dynamizer.prototype._arr_decode = function(o) {
  var r = [];
  for (var i=0;i< o.length;++i) {
    r.push(this.decode(o[i]));
  }
  return r;
};

/**
 * _map_decode
 *
 * helper for map decode
 * @param o
 * @private
 */
Dynamizer.prototype._map_decode = function(o) {
  var r = {};
  for (var j in o) {
    if (o.hasOwnProperty(j)) {
      r[j] = this.decode(o[j]);
    }
  }
  return r;
};

/**
 * _set_decode
 *
 * decodes a set
 * @param o
 * @private
 */
Dynamizer.prototype._set_decode = function(o) {
  var r,
    arr;
  if (o.NS) {
    arr = o.NS.map(function(v) {return Number(v)});
    r = new NumberSet(arr);
  } else if (o.SS) {
    r =  new StringSet(o.SS);
  } else if (o.BS) {
    var self = this;
    arr = o.BS.map(function(v) {
      return self._bin_decode({B: v}); // todo: change decode to values instead of types?
    });
    r = new BinarySet(arr);
  }
  // return appropriate type
  return this.enableSets ? r : r.getArray();
};

// export module
module.exports = Dynamizer;
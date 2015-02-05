/**
 * mirror of the boto Dynamizer class for node.js
**/

function Dynamizer(options) {
  // don"t enforce new
  if (!(this instanceof Dynamizer)) return new Dynamizer(options);

  if (options) {
    this.nonBoolean = options.nonBoolean || false; // maps boolean values to numeric

    // unsure about this option as yet
    //this.lossyFloat = options.nonLossyFloat || false; // allows for lossy float values
  }
}

/**
 * encode
 *
 * takes an object and mutates it to an Item representation
 * @param o - object to encode
 */
Dynamizer.prototype.encode = function(o) {
  return this._encode(o);
};

/**
 * _encode
 *
 * helper to encode objects
 * @param o
 * @returns {*}
 * @private
 */
Dynamizer.prototype._encode = function(o) {
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
  } else {
    throw Error("Invalid object.");
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
  if (this.nonBoolean) {
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
 if (this.nonLossyFloat) {
   throw Error("not implemented yet");
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
 * decode
 *
 * takes in an Item (as described in dynamodb)
 *
 * @param o
 * @returns {*}
 */
Dynamizer.prototype.decode = function(o) {
  var ret, iterO;
  if (o.BOOL || ("BOOL" in o && o.hasOwnProperty("BOOL"))) { // bool bould be falsey
    ret = o.BOOL;
  } else if (o.NULL) {
    ret = null;
  } else if (o.N) {
    ret = parseFloat(o.N);
  } else if (o.S) {
    ret = o.S
  } else if (iterO = o.L || (o.constructor === Array && o)) {
    ret = [];
    for (var i=0;i< iterO.length;++i) {
      ret.push(this.decode(o.L[i]));
    }
  } else if (iterO = o.M || (o.constructor === Object && o)) {
    ret = {};
    for (var j in iterO) {
      if (iterO.hasOwnProperty(j)) {
        ret[j] = this.decode(iterO[j]);
      }
    }
  }

  return ret;
};

/**
 * decode
 *
 * implementation of decode
 * @param o
 * @returns {*}
 * @private
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
  } else if (o.hasOwnProperty("L") || o.constructor === Array) { // array, or array obj
    o = o.L || o;
    ret = this._arr_decode(o);
  } else if (o.hasOwnProperty("M") || o.constructor === Object) { // map, or map obj
    o = o.M || o;
    ret = this._map_decode(o);
  } else {
    throw Error("Invalid object.");
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
 * helper for bin decode
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

// export module
module.exports = Dynamizer;
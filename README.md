# dynamizer
A mirror of boto's Dynamizer class for node.js for use with the aws-sdk


[![NPM Version](https://nodei.co/npm/dynamizer.png?downloads=true)](https://npmjs.org/package/dynamizer)
[![Build Status](https://secure.travis-ci.org/belbis/dynamizer.png?branch=master)](http://travis-ci.org/belbis/dynamizer)
[![Coverage Status](https://coveralls.io/repos/belbis/dynamizer/badge.svg)](https://coveralls.io/r/belbis/dynamizer)

## Usage

Install:
    npm install dynamizer


```javascript
var Dynamizer = require('dynamizer');
var example = {
  key: 'value',
  key2: {key3: 'value2'},
  key4: ['value3', {key5: 'value4'}, ['value5']],
  key6 : new Buffer('bufMe', encoding='binary')
};
var dynamized = Dynamizer().encode(example);
/*
dynamized is:
{
  "M": {
    "key": {
      "S": "value"
    },
    "key2": {
      "M": {
        "key3": {
          "S": "value2"
        }
      }
    },
    "key4": {
      "L": [
        {
          "S": "value3"
        },
        {
          "M": {
            "key5": {
              "S": "value4"
            }
          }
        },
        {
          "L": [
            {
              "S": "value5"
            }
          ]
        }
      ]
    },
    "key6": {
      "B": "YnVmTWU="
    }
  }
}
*/
```

## Options


* nonBoolean -- Dynamizer -> NonBooleanDynamizer
* nonLossyFloat -- Dynamizer -> Dynamizer

## supported data types


* integer -> N
* float -> N
* string -> S
* boolean -> BOOL
* binary -> B
* array -> L
* object -> M
* null -> NULL


## unsupported data types

* set 
* binary set
* string set
* number set
* {NULL: false} - unsure how to represent


## tests

run with:
<code>
    npm test
</code>


## more info

Boto project:  https://github.com/boto
AWS SDK and Item details: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html

## future

add option for encode/decode sets as arrays (or use custom object)
update binary encodings to reflect 'binary' encoding deprecation
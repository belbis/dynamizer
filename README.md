# dynamizer
A mirror of boto's Dynamizer class for node.js to encode/decode Items to normal javascript objects

Installation
------------

npm install dynamizer


Options
-------

* nonBoolean -- Dynamizer -> NonBooleanDynamizer
* nonLossyFloat -- Dynamizer -> Dynamizer

supported data types
--------------------

* integer -> N
* float -> N
* string -> S
* boolean -> BOOL
* binary -> B
* array -> L
* object -> M
* null -> NULL


unsupported data types
----------------------

* set 
* binary set
* string set
* number set
* {NULL: false} - unsure how to represent


tests
-----
run with:
<code>
    npm test
</code>


more info
---------

boto project:  https://github.com/boto
aws sdk and Item details: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html
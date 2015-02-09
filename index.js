/**
 * for use with npm
 */
module.exports = process.env.DYNAMIZER_COV
  ? require('./src-cov/dynamizer')
  : require('./src/dynamizer');
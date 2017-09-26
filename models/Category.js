/**
 * Created by cc on 2017/6/18.
 */
var mongoose = require('mongoose');
var categorySchema = require('../schemas/categories');

module.exports = mongoose.model('Category',categorySchema);
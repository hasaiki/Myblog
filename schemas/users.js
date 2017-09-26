/**
 * Created by cc on 2017/6/18.
 */
var mongoose = require('mongoose');

// 定义用户表结构
module.exports = new mongoose.Schema({
    //用户名
    username:String,
    //密码
    password:String,
    // 是否是管理员
    isAdmin:{
        type: Boolean,
        default: false
    }
});
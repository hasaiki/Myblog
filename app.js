/**
 * Created by cc on 2017/6/18.
 * 启动入口文件
 */
// 加载express模块
var express = require('express');
//加载薄板处理模块
var swig = require('swig');
//创建app应用--》nodejs http.createServer()
var app = express();
//引入user的model
var User = require('./models/User');

//设置静态文件托管
app.use('/public',express.static(__dirname + '/public'));

//配置应用模板
//定义模板引擎(引擎名称文件后最，处理模板方法)
app.engine('html',swig.renderFile);
//设置文件存放目录，第一个必须是views，第二个参数是存放目录
app.set('views','./views');
//注册所使用的模板引擎
app.set('view engine','html');
// 在开发过程中，取消模板缓存
swig.setDefaults({cache:false});

//加载数据库模块
var mongoose = require('mongoose');

//bodyParser处理post请求提交的数据
var bodyParser = require("body-parser");
//bodyPaser配置
app.use(bodyParser.urlencoded({extended:true}));

// 加载cookies模块
var Cookies = require('cookies');
//设置cookies
app.use(function (req,res,next) {
    req.cookies = new Cookies(req,res);

    //解析登录用户的信息
    req.userInfo = {};
    if(req.cookies.get('userInfo')){
        try{
            req.userInfo = JSON.parse(req.cookies.get('userInfo'));
            // 查询数据库，判断是否是管理员账号
            User.findById(req.userInfo._id).then(function (userInfo) {
                req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
                next();
            })

        }catch(e){
            next();
        }
    }else{

        next();
    }

});

//根据不同的功能划分模块
app.use('/admin',require('./routers/admin'));
app.use('/api',require('./routers/api'));
app.use('/',require('./routers/main'));

// // 首页
// app.get('/',function (req,res,next) {
//     //res.send('<h1>欢迎光临我的博客</h1>');
//     //读取views目录下的指定文件(文件，数据)
//     res.render('index');
// });

//链接数据库
mongoose.connect('mongodb://localhost:27017/blog',function (err) {
    if(err){
        console.log('连接数据库失败！');
    }else{
        console.log('连接数据库成功！');
        //监听http请求
        app.listen(8081);
    }
});

/**
 * Created by cc on 2017/6/18.
 */
var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Category = require('../models/Category');
var Content = require('../models/Content');

//判断是否为管理员
router.use(function (req, res, next) {
    if (!req.userInfo.isAdmin) {
        res.send('对不起，只有管理员才能进入管理员页面！');
        return;
    }
    next();
});
//首页
router.get('/', function (req, res, next) {
    res.render('admin/index', {
        userInfo: req.userInfo
    })
});
// 用户管理
router.get('/user', function (req, res) {
    //从数据库中读取所有的用户信息
    //对用户进行分页显示
    //skip():忽略的条数
    //count():总的条数

    //当前页数
    var page = Number(req.query.page || 1);
    //每页条数
    var limit = 3;
    //总共的页数
    var pages = 0;

    User.count().then(function (count) {
        //计算总页数
        pages = Math.ceil(count / limit);
        //取值不能超过pages
        page = Math.min(page, pages);
        //取值不能小于1
        page = Math.max(page, 1);

        //忽略的条数
        var skip = (page - 1) * limit;
        // 查询每页的数据
        User.find().limit(limit).skip(skip).then(function (users) {
            res.render('admin/user_index', {
                userInfo: req.userInfo,
                users: users,
                pages: pages,
                page: page,
                limit: limit,
                count: count

            })
        });
    });

});
// 分类列表
router.get('/category', function (req, res) {
    //从数据库中读取所有的用户信息
    //对用户进行分页显示
    //skip():忽略的条数
    //count():总的条数

    //当前页数
    var page = Number(req.query.page || 1);
    //每页条数
    var limit = 3;
    //总共的页数
    var pages = 0;

    Category.count().then(function (count) {
        //计算总页数
        pages = Math.ceil(count / limit);
        //取值不能超过pages
        page = Math.min(page, pages);
        //取值不能小于1
        page = Math.max(page, 1);

        //忽略的条数
        var skip = (page - 1) * limit;
        // 查询每页的数据
        Category.find().limit(limit).skip(skip).then(function (categories) {
            res.render('admin/category_index', {
                userInfo: req.userInfo,
                categories: categories,
                pages: pages,
                page: page,
                limit: limit,
                count: count

            })
        });
    });
});

//添加分类
router.get('/category/add', function (req, res) {
    res.render('admin/category_add', {
        userInfo: req.userInfo
    })
});
//保存添加的分类
router.post('/category/add', function(req, res) {

    var name = req.body.name || '';

    if (name == '') {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '名称不能为空'
        });
        return;
    }

    //数据库中是否已经存在同名分类名称
    Category.findOne({
        name: name
    }).then(function(rs) {
        if (rs) {
            //数据库中已经存在该分类了
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '分类已经存在了'
            })
            return Promise.reject();
        } else {
            //数据库中不存在该分类，可以保存
            return new Category({
                name: name
            }).save();
        }
    }).then(function(newCategory) {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '分类保存成功',
            url: '/admin/category'
        });
    })

});
//修改分类信息
router.get('/category/edit',function (req,res) {
    //获取要修改的分类信息的id，并查询数据库，返回数据
    var id = req.query.id || '';
    //获取信息
    Category.findOne({
        _id:id
    }).then(function (category) {
        if(!category){
            res.render('admin/error',{
                userInfo:req.userInfor,
                message: "分类信息不存在"
            })
        }else{
            res.render('admin/category_edit',{
                userInfo: req.userInfor,
                category:category
            })
        }
    })

});
//保存修改后的分类信息
router.post('/category/edit',function (req,res) {
    //获取修改分类信息的id
    var id = req.query.id || '';
    // 获取post提交过来的name
    var name = req.body.name || '';
    //查询数据库
    Category.findOne({
        _id:id
    }).then(function (category) {
        if(!category){
            res.render('admin/error',{
                userInfo:req.userInfo,
                message: '分类信息不存在！'
            });
            return Promise.reject();
        }else{
            //当用户没有修改就提交的时候
            if(name == category.name){
                res.render('admin/success',{
                    userInfo:req.userInfo,
                    message: '修改成功！',
                    url: '/admin/category'
                });
                return Promise.reject();
            }else{
                //修改后的名称在数据库中是否存在
                return Category.findOne({
                    _id:{$ne: id},
                    name: name
                });
            }
        }
    }).then(function (sameCategory) {
        if(sameCategory){
            res.render('admin/error',{
                userInfo:req.userInfo,
                message: '数据库中已经存在同名的分类信息！'

            });
            return Promise.reject();

          }else{
            //跟新修改后的信息
            return Category.update({
                _id:id
            },{
                name:name
            });

        }
    }).then(function () {
        res.render('admin/success',{
            userInfo:req.userInfo,
            message: '修改成功！',
            url: '/admin/category'
        });
    })



});

//删除分类信息
router.get('/category/delete',function (req,res) {
    //获取id
    var id = req.query.id || '';

    //删除信息
    Category.remove({
        _id:id
    }).then(function () {
        res.render('admin/success',{
            userInfo:req.userInfo,
            message: '删除成功！',
            url: '/admin/category'
        });
    });
});
/*
 * 内容首页
 * */
router.get('/content', function(req, res) {

    var page = Number(req.query.page || 1);
    var limit = 3;
    var pages = 0;

    Content.count().then(function(count) {

        //计算总页数
        pages = Math.ceil(count / limit);
        //取值不能超过pages
        page = Math.min( page, pages );
        //取值不能小于1
        page = Math.max( page, 1 );

        var skip = (page - 1) * limit;

        Content.find().limit(limit).skip(skip).populate(['category', 'user']).sort({
            addTime: -1
        }).then(function(contents) {
            res.render('admin/content_index', {
                userInfo: req.userInfo,
                contents: contents,

                count: count,
                pages: pages,
                limit: limit,
                page: page
            });
        });

    });

});

/*
 * 内容添加页面
 * */
router.get('/content/add', function(req, res) {

    Category.find().sort({_id: -1}).then(function(categories) {
        res.render('admin/content_add', {
            userInfo: req.userInfo,
            categories: categories
        })
    });

});

/*
 * 内容保存
 * */
router.post('/content/add', function(req, res) {

    //console.log(req.body)

    if ( req.body.category == '' ) {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '内容分类不能为空'
        })
        return;
    }

    if ( req.body.title == '' ) {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '内容标题不能为空'
        })
        return;
    }

    //保存数据到数据库
    new Content({
        category: req.body.category,
        title: req.body.title,
        user: req.userInfo._id.toString(),
        description: req.body.description,
        content: req.body.content
    }).save().then(function(rs) {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '内容保存成功',
            url: '/admin/content'
        })
    });

});

/*
 * 修改内容
 * */
router.get('/content/edit', function(req, res) {

    var id = req.query.id || '';

    var categories = [];

    Category.find().sort({_id: 1}).then(function(rs) {

        categories = rs;

        return Content.findOne({
            _id: id
        }).populate('category');
    }).then(function(content) {

        if (!content) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '指定内容不存在'
            });
            return Promise.reject();
        } else {
            res.render('admin/content_edit', {
                userInfo: req.userInfo,
                categories: categories,
                content: content
            })
        }
    });

});

/*
 * 保存修改内容
 * */
router.post('/content/edit', function(req, res) {
    var id = req.query.id || '';

    if ( req.body.category == '' ) {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '内容分类不能为空'
        })
        return;
    }

    if ( req.body.title == '' ) {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '内容标题不能为空'
        })
        return;
    }

    Content.update({
        _id: id
    }, {
        category: req.body.category,
        title: req.body.title,
        description: req.body.description,
        content: req.body.content
    }).then(function() {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '内容保存成功',
            url: '/admin/content/edit?id=' + id
        })
    });

});

/*
 * 内容删除
 * */
router.get('/content/delete', function(req, res) {
    var id = req.query.id || '';

    Content.remove({
        _id: id
    }).then(function() {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '删除成功',
            url: '/admin/content'
        });
    });
});

//暴露router
module.exports = router;



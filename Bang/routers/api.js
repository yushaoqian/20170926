var express=require('express');
var router=express.Router();
// 返回给我们一个构造函数，可以像操作对象一样操作数据库
var User=require('../models/User');
var Content=require('../models/Content');
// 注册逻辑
// 1、用户名不能为空
// 2、密码不能为空
// 3、两次密码是否是一致的
// 4、用户是否已经被注册
// 		要用到数据库查询
var responseData;
router.use(function(req,res,next){
	responseData={
		code:0,
		message:''
	};
	next();
});
router.post('/user/register',function(req,res,next){
	var username=req.body.username;
	var password=req.body.password;
	var repassword=req.body.repassword;
// 验证用户注册名
	if(username==''){
		responseData.code=1;
		responseData.message='用户名不能为空';
		res.json(responseData);
		return;
	}

// 验证密码
	if(password==''||repassword==''){
		responseData.code=2;
		responseData.message='密码不能为空';
		res.json(responseData);
		return;
	}
// 两次密码是否相同
	if(password!=repassword){
		responseData.code=3;
		responseData.message='两次输入密码不一致';
		res.json(responseData);
		return;
	}
// 用户名是否已经被注册了，如果数据库中存在该条信息则说明已经被注册了
	User.findOne({
// user.findOne方法，使用点来调用的方法就是静态方法，直接调用
// 如果是#的方法，是对象使用的方法，要new以下才能使用
		username:username
	}).then(function(userInfo){
		// 表示数据库中有该条数据
		if(userInfo){
			responseData.code=4;
			responseData.message='该用户名已被注册了';
			res.json(responseData);
			return;
		}
		// 如果没有这条数据，就保存数据
		var user=new User({
			// 
			username:username,
			password:password
		});
		return user.save();
	}).then(function(newUserInfo){
		console.log(newUserInfo);
		responseData.message='注册成功';
		res.json(responseData);
	});
});

// 登录
router.post('/user/login',function(req,res){
	var username=req.body.username;
	var password=req.body.password;
	if(username==''||password==''){
		responseData.code=1;
		responseData.message='用户名和密码不能为空';
		res.json(responseData);
		return;
	}
// 查询数据库中相同用户名和密码的数据是否存在
	User.findOne({
		username:username,
		password:password
	}).then(function(userInfo){
		if(!userInfo){
			responseData.code=2;
			responseData.message='用户名或密码错误';
			res.json(responseData);
			return;
		}
		responseData.message='登录成功';
		responseData.userInfo={
			_id:userInfo._id,
			username:userInfo.username
		}
		// 设置一个cookie叫做userInfo
		req.cookies.set('userInfo',JSON.stringify({
			_id:userInfo._id,
			username:userInfo.username		
		}));
		res.json(responseData);
		return;
	})
})
// 退出登录
router.get('/user/logout',function(req,res,next){
	req.cookies.set('userInfo',null);
	res.json(responseData);
});/*
* 获取指定文章的所有评论
* */
router.get('/comment', function(req, res) {
    var contentId = req.query.contentid || '';

    Content.findOne({
        _id: contentId
    }).then(function(content) {
        responseData.data = content.comments;
        res.json(responseData);
    })
});

/*
* 评论提交
* */
router.post('/comment/post', function(req, res) {
    //内容的id
    var contentId = req.body.contentid || '';
    var postData = {
        username: req.userInfo.username,
        postTime: new Date(),
        content: req.body.content
    };

    //查询当前这篇内容的信息
    Content.findOne({
        _id: contentId
    }).then(function(content) {
        content.comments.push(postData);
        return content.save();
    }).then(function(newContent) {
        responseData.message = '评论成功';
        responseData.data = newContent;
        res.json(responseData);
    });
});
module.exports=router;
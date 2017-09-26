var express=require('express');
// swig是js模板引擎
var swig=require('swig');
//创建app应用 => NodeJS Http.createServer();
var app=express();
var mongoose=require('mongoose');
// 用来加载客户端发送过来的请求
// （服务器通过body-parser中间件获取post请求中的数据req.body；
var bodyParser=require('body-parser');
// 加载cookies模块（保持登录状态）
var Cookies=require('cookies');
var User=require('./models/User');
// 这是静态文件托管
app.use('/public',express.static(__dirname+'/public'));
// 配置应用模板
// app.engine第一个参数是模板引擎的名称，同时也是模板文件的后缀。第二个参数是解析处理模板内容的方法
app.engine('html',swig.renderFile);
// 设置模板文件存放的目录，第一个参数必须是views，第二个是目录
app.set('views','./views');
// 注册所使用的模板引擎,第一个参数必须是view engine,第二个参数是app.engine里面的第一个参数是一致的
app.set('view engine','html');
// 在开发过程当中，需要重启服务器刷新，以下方法，因为模板缓存的原因，设置swig页面不缓存
swig.setDefaults({cache:false});
// bodyParser设置
app.use(bodyParser.urlencoded({extended:true}));
// 根据不同的功能，划分模块
// 只要用户访问，都会执行这个函数
app.use(function(req,res,next){
	req.cookies=new Cookies(req,res);
	req.userInfo={};
	if(req.cookies.get('userInfo')){
		// try(有可能出错的代码写在这里)catch(出错后的处理)
		// 如果try中代码没有出错，不会执行catch，如果出错，就跳到try去了
		try{
			// JSON.parse用于从一个字符串中解析出JSON对象
			// JSON.stringfy用于从一个对象中解析出字符串
			req.userInfo=JSON.parse(req.cookies.get('userInfo'));
			// 获取用户信息，判断是否是管理员(user.findById(根据id查询))
			User.findById(req.userInfo._id).then(function(userInfo){
				req.userInfo.isAdmin=Boolean(userInfo.isAdmin);
				next();
			})
		}catch(e){
			next();
		}
	}else{
		next();
	}
});
app.use('/',require('./routers/main'));
app.use('/admin',require('./routers/admin'));
app.use('/api',require('./routers/api'));
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/blog',{useMongoClient:true},function(err){
	if(err){
		console.log('数据库连接失败');
	}else{
		console.log('数据库连接成功');
		app.listen(8080);
	}
});

// 用户发送http请求-->url-->解析路由-->找到匹配规则-->执行指定的绑定函数-->返回对应内容给用户
//  /public-->静态-->直接读取指定目录下的文件-->返回给用户
//  动态-->处理业务逻辑-->加载模板-->解析模板-->返回数据给用户
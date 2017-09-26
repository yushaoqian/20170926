var mongoose=require('mongoose');
module.exports=new mongoose.Schema({
	// 这个数据库的collection想要引用其他的collection的方法
	// 关联字段:分类信息
	category:{
		// 类型
		type:mongoose.Schema.Types.ObjectId,
		// 引用名字为category的collection
		ref:'Category'
	},
	// 内容标题
	title:String,
	// 关联字段：用户id
	user:{
		// 类型
		type:mongoose.Schema.Types.ObjectId,
		// 引用
		ref:'User'
	},
	// 添加时间
	addTime:{
		type:Date,
		default:new Date()
	},
	// 阅读量
	views:{
		type:Number,
		default:0
	},

	// 简介
	description:{
		type:String,
		default:''
	},
	// 内容
	content:{
		type:String,
		default:''
	},
	comments:{
		type:Array,
		default:[]
	}
});
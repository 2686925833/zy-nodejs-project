var express = require('express');
var router = express.Router();
const usersModule=require('../module/usersModule');
/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.cookies.username){
    res.render('index',{
      username:req.cookies.username,
      nickname:req.cookies.nickname,
      is_admin:parseInt(req.cookies.is_admin)? '(管理员)':''
    });
  }else{
    res.redirect('/login.html');
  }
});

//注册
router.get('/register.html',function(req,res){
  res.render('register');
});

//登录
router.get('/login.html',function(req,res){
  res.render('login');//指的是views文件夹里面的login.ejs
});


//用户管理
router.get('/user-manager.html',function(req,res){
  //首先判断用户是否登录，是否是管理员
  if(req.cookies.username && parseInt(req.cookies.is_admin)){
    //需要查询数据库
    //需要从前端拿两个数据：页码，每页记录条数
    let page=req.query.page || 1;
    let pageSize=req.query.pageSize || 5;
    usersModule.getuserList({
      page:page,
      pageSize:pageSize
    },function(err,data){
      if(err){
        res.render('zyerror',err);
      }else{
        res.render('user-manager',{
          username:req.cookies.username,
          nickname:req.cookies.nickname,
          is_admin:parseInt(req.cookies.is_admin)?'(管理员)':'',
          page:data.page,
          userList:data.userList,
          totalpage:data.totalpage,
          pageSize:pageSize
        });
      }
    });
  }else{
    res.redirect('/login.html');
  }
});

module.exports = router;

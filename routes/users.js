var express = require('express');
var router = express.Router();
const usersModule=require('../module/usersModule');
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//注册处理
router.post('/register',function(req,res){
  console.log('接受post请求发送过来的数据');
  // console.log(req.body);
  var data=req.body;
  //用户验证
  if(!/^\w{5,10}$/.test(req.body.username)){
    res.render('zyerror',{code:-1,msg:'用户名必须是5-10位'});
  }else if(req.body.password!==req.body.repassword){
    res.render('zyerror',{code:-1,msg:'密码不一致'});
  }else if(!/^1[3578]{1}\d{9}$/.test(req.body.phone)){
    res.render('zyerror',{code:-1,msg:'手机号格式不对'});
  }else{
    //满足正则表达式，就进行注册操作
    usersModule.add(req.body,function(err){
      if(err){
        res.render('zyerror',err);
      }else{
        //跳转到登录页面
        res.redirect('/login.html');
      }
    });
  }
  
});


//登录处理
router.post('/login',function(req,res){
  usersModule.login(req.body,function(err,data){
    if(err){
      res.render('zyerror',err);
    }else{
      console.log('当前登录的用户信息是'+data);
      res.redirect('/');
    }
  });
});

module.exports = router;

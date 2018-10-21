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
      //写cookie
      res.cookie('username',data.username,{
        maxAge:1000*60*60*24
      });
      res.cookie('nickname',data.nickname,{
        maxAge:1000*60*60*24
      });
      res.cookie('is_admin',data.is_admin,{
        maxAge:1000*60*60*24
      });
      res.redirect('/');
    }
  });
});


//退出登录
router.get('/logout',function(req,res){
  //删除cookie
  res.clearCookie('username');
  res.clearCookie("nickname");
  res.clearCookie("is_admin");
  //跳转到登录页面
  // res.redirect('/login.html');
  res.send('<script>location.replace("/")</script>');
});


//根据昵称搜索
router.post('/search',function(req,res){
  let page=req.query.page || 1;
  let pageSize=req.query.pageSize || 5;
  console.log(req.body);
  var searchName=req.body.searchname;
  usersModule.searchUserInfo({
      page:page,
      pageSize:pageSize,
      searchname:searchName
    },function(err,data){
      if(err){
        res.render('zyerror',err);
      }else{
        console.log('按昵称搜索的结果为:'+data.userList);
        res.render('user-manager',{
          username:req.cookies.username,
          nickname:req.cookies.nickname,
          is_admin:parseInt(req.cookies.is_admin)?'(管理员)':'',
          page:data.page,
          userList:data.userList,
          pageSize:pageSize,
          totalpage:data.totalpage,
        });
      }
    });
});

module.exports = router;

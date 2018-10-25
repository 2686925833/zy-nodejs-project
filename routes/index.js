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
    var searchName=req.query.searchname;
    usersModule.getuserList({
      page:page,
      pageSize:pageSize
    },function(err,data){
      if(err){
        res.render('zyerror',err);
      }else{
        res.render('user-manager',{
          searchname:searchName,
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


//根据昵称搜索
router.get('/user-search',function(req,res){
  let page=req.query.page || 1;
  let pageSize=req.query.pageSize || 5;
  console.log(req.query);
  var searchName=req.query.searchname;
  if(searchName==''){
    res.redirect('/user-manager.html');
  }else{
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
            searchname:searchName,
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
  }
});


//删除用户信息
router.get('/user-delete',function(req,res){
  console.log('将要删除的用户id为'+req.query._id);
  usersModule.userDelete(req.query._id,function(err){
    if(err){
      res.render('zyerror',err);
    }else{
      res.send('<script>location.replace("/user-manager.html")</script>');
    }
  });
});



//修改用户信息
router.post('/user-updataAfter',function(req,res){
  console.log('====修改用户信息=====')
  console.log(req.body);
  console.log(req.body._id);
  //判断修改的用户是否是当前登录的用户
  //如果是修改当前登录的用户则要修改cookies中的nickname
  if(req.cookies._id==req.body._id){
    console.log('相同');
    res.clearCookie('username');
    res.clearCookie("nickname");
    res.clearCookie("is_admin");
    res.cookie('username',req.body.username,{
      maxAge:1000*60*60*24
    });
    res.cookie('is_admin',req.body.is_admin,{
      maxAge:1000*60*60*24
    });
    res.cookie('nickname',req.body.nickname,{
      maxAge:1000*60*60*24
    });
  }else{
    console.log('不同');
    console.log(req.cookies.username,req.body.username);
  }

  usersModule.userupdataAfter({
    _id:req.body._id,
    username:req.body.username,
    nickname:req.body.nickname,
    age:req.body.age,
    sex:req.body.sex,
    phone:req.body.phone,
    is_admin:req.body.is_admin
  },function(err){
    if(err){
      res.render('zyerror',err);
    }else{
      res.redirect('/user-manager.html');
    }
  });
});

module.exports = router;

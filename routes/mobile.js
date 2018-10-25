var express = require('express');
var router = express.Router();
var multer=require('multer');
const mobileModule=require('../module/mobileModule');
const upload=multer({
    dest:'E:/tmp/'
});
const fs=require('fs');
const path=require('path');
//展示手机
router.get('/mobile-manager.html',function(req,res){
    if(req.cookies.username){
        // mobileModule.mobilemanager();
        res.render('mobile-manager',{
            nickname:req.cookies.nickname,
            is_admin:parseInt(req.cookies.is_admin)? '(管理员)':'',
            username:req.cookies.username,

        });
    }else{
        res.redirect('/login.html');
    }
    
});
//添加手机
router.post('/addMobile',upload.single('mobile'),function(req,res){
    console.log(req.body);
    console.log(req.file);
    var filename='';
    fs.readFile(req.file.path,function(err,data){
        if(err){
            res.render('zyerror',{code:-100,msg:'读文件失败'});
        }else{
            filename=new Date().getTime()+'_'+req.file.originalname;
            let filepath=path.resolve(__dirname,'../public/mobile/',filename);
            console.log(filepath);
            fs.writeFile(filepath,data,function(err){
                if(err){
                    console.log('写文件失败');
                }else{
                    console.log('写入成功');
                    let mobileInfor={
                        mobilepath:'/mobile/'+filename,
                        mobilename:req.body.mobilename,
                        mobilebrand:req.body.brand,
                        oneprice:req.body.oneprice,
                        twoprice:req.body.twoprice,
                    }
                    console.log('mobileInfor'+mobileInfor);
                    mobileModule.mobileAdd(mobileInfor,function(err,data){
                        console.log('进来么？');
                        if(err){
                            console.log('添加失败');
                            res.send(err);
                        }else{
                            console.log('添加成功');
                            res.send();
                        }
                    });
                }
            });     
        }

    });
});

//分页操作
router.get('/search',function(req,res){
    var page=req.query.page || 1;
    var pageSize=req.query.pageSize || 2;
    console.log('=====================');
    mobileModule.search({
        page:page,
        pageSize:pageSize
    },function(err,data){
        if(err){
            console.log(err);
            //res.render('zyerror',err);
            res.send(err);
        }else{
             res.send({
                totalPage:data.totalPage,
                mobileList:data.mobileList,
                page:data.page
            });
        } 
     }); 

  });  
  //修改操作
router.post('/updata',upload.single('updatamobile'),function(req,res){
    console.log(req.body);
    console.log(req.file);
    var newfilename='';
    fs.readFile(req.file.path,function(err,data){
        if(err){
            console.log('修改操作，读文件失败');
        }else{
            newfilename=new Date().getTime()+'_'+req.file.originalname;
            let newfilepath=path.resolve(__dirname,'../public/mobile/',newfilename);
            fs.writeFile(newfilepath,data,function(err){
                if(err){
                    console.log('写入失败');
                }else{
                    console.log('写入成功');
                    let obj={
                        _id:req.body.updata_id,
                        mobilepath:'/mobile/'+newfilename,
                        mobilename:req.body.updatamobilename,
                        mobilebrand:req.body.updatabrand,
                        oneprice:req.body.updataoneprice,
                        twoprice:req.body.updatatwoprice,
                    }
                    console.log('++++++++'+req.body.updata_id);
                    mobileModule.updata(obj,function(err){
                        if(err){
                            console.log('有错误');
                            res.send(err);
                        }else{
                            res.send();
                        }
                    });
                }
            });
        }
    });   
  });
//删除操作
router.get('/delete',function(req,res){
    console.log('++++++++++'+req.query.id);
    var Id=parseInt(req.query.id);
    mobileModule.delete(Id,function(err){
        if(err){
            console.log('失败');
            res.send(err);
        }else{
            res.send();
        }
    });

});
//品牌
router.post('/brand',function(req,res){
    mobileModule.brand(function(err,data){
        if(err){
            res.send(err);
        }else{
            res.send(data);
        }
    });
});

module.exports = router;
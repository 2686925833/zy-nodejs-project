var express = require('express');
var router = express.Router();
var multer=require('multer');
const brandModule=require('../module/brandModule');
const upload=multer({
    dest:'E:/tmp/'
});
const fs=require('fs');
const path=require('path');

router.get('/brand-manager.html',function(req,res){
    if(req.cookies.username){
        res.render('brand-manager',{
            nickname:req.cookies.nickname,
            is_admin:parseInt(req.cookies.is_admin)? '(管理员)':'',
            username:req.cookies.username,
        });
    }else{
        res.redirect('/login.html');
    }
});

//增加品牌
router.post('/add',upload.single('brand'),function(req,res){
    console.log('#########');
    console.log(req.body);
    console.log(req.file);
    // res.send();
    fs.readFile(req.file.path,function(err,data){
        if(err){
            console.log('新增品牌，读文件失败');
        }else{
            console.log('新增品牌，读文件成功');
            var filename=new Date().getTime()+'_'+req.file.originalname;
            var filepath=path.resolve(__dirname,'../public/brand',filename);
            console.log(filename,filepath);
            fs.writeFile(filepath,data,function(err){
                if(err){
                    console.log('写入文件失败');
                }else{
                    let brandInfo={
                        brandname:req.body.brandname,
                        brandsrc:'/brand/'+filename,
                    };
                    brandModule.add(brandInfo,function(err){
                        if(err){
                            console.log('添加品牌失败');
                            res.send(err);
                        }else{
                            res.send({code:0,msg:'添加成功'});
                        }
                    });
                }
            });
        }
    });

});
//分页操作
router.get('/search',function(req,res){
    let page=req.query.page || 1;
    let pageSize=req.query.pageSize || 2;
    brandModule.List({
        page:page,
        pageSize:pageSize
    },function(err,data){
        if(err){
            console.log(err);
        }else{
            res.send({
                totalpage:data.totalpage,
                brandList:data.brandList,
                page:page,
            });
        }
    });
});
router.post('/updata',upload.single('updatabrand'),function(req,res){
    // console.log('111111');
    // console.log(req.body);
    // console.log(req.file);
    var newfile=new Date().getTime()+'_'+req.file.originalname;
    var newfilepath=path.resolve(__dirname,'../public/brand',newfile);
    fs.readFile(req.file.path,function(err,data){
        if(err){
            console.log('修改，读文件失败');
        }else{
            console.log('修改，读文件成功');
            fs.writeFile(newfilepath,data,function(err){
                if(err){
                    console.log('修改，写文件失败');
                }else{
                    console.log('修改，写文件成功');
                    var updataInfor={
                        _id:req.body._id,
                        brandname:req.body.updatabrandname,
                        brandsrc:'/brand/'+newfile,
                    };
                    brandModule.updata(updataInfor,function(err){
                        if(err){
                            console.log('添加失败');
                        }else{
                            res.send();
                        }
                    });
                }
            });
        }
    });
});
//删除
router.get('/delete',function(req,res){
    var _id=req.query._id;
    console.log('删除的id:'+_id);
    brandModule.delete(_id,function(err){
        if(err){
            console.log('删除失败');
            res.send(err);
        }else{
            res.send();
        }
    });
});
module.exports = router;
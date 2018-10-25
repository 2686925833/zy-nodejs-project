const MongoClient=require('mongodb').MongoClient;
var url='mongodb://127.0.0.1:27017';
const async=require('async');
const brandModule={
    add(data,cb){
        let brandInfo={
            brandname:data.brandname,
            brandsrc:data.brandsrc
        };
        brandInfo._id=0;
        MongoClient.connect(url,function(err,client){
            if(err){
                cb({code:-100,msg:'连接数据库失败'});
            }else{
                const db=client.db('zy');
                async.series([
                    function(callback){
                        //设置_id字段
                        db.collection('brand').find().toArray(function(err,data){
                            if(err){
                                console.log('==========')
                                callback({code:-100,msg:'查询失败'});
                            }else{
                                console.log('---------');
                                if(data.length<=0){
                                    brandInfo._id=1;
                                }else{
                                    brandInfo._id=parseInt(data[data.length-1]._id)+1;
                                    console.log('brandInfo._id'+brandInfo._id);
                                }
                                callback(null);
                            }
                        });
                    },
                    function(callback){
                        //添加操作
                        db.collection('brand').insertOne(brandInfo,function(err){
                            if(err){
                                console.log('添加失败',err);
                                callback({code:-101,msg:'添加失败'});
                            }else{
                                console.log('添加成功');
                                callback(null);
                            }
                        });
                    },
                ],function(err,result){
                    if(err){
                        cb(err);
                    }else{
                        cb(null);
                    }
                });
                
            }
        });
    },
    List(data,cb){
        let page=parseInt(data.page);
        let pageSize=parseInt(data.pageSize);
        let limNum=pageSize;
        let skipNum=page*pageSize-pageSize;
        var totalpage=0;
        console.log('limNum'+limNum);
        MongoClient.connect(url,function(err,client){
            if(err){
                console.log('连接数据库失败');
                cb({code:-100,msg:'连接数据库失败'});
            }else{
                const db=client.db('zy');
                async.parallel([
                    function(callback){
                        //查询记录条数
                        db.collection('brand').find().count(function(err,num){
                            if(err){
                                callback({code:-100,msg:'查询失败'});
                            }else{
                                console.log('查询条数成功');
                                callback(null,num);
                            }
                        });
                    },
                    function(callback){
                        //查询分页数据
                        db.collection('brand').find().limit(limNum).skip(skipNum).toArray(function(err,data){
                            if(err){
                                callback({code:-100,msg:'查询失败'});
                            }else{
                                callback(null,data);
                            }
                        });
                    },
                ],function(err,result){
                    if(err){
                        cb(err);
                    }else{
                        cb(null,{
                            totalpage:Math.ceil(result[0]/pageSize),
                            brandList:result[1],
                        });
                    }
                    client.close();
                });
            }
        });
    },
    //修改
    updata(data,cb){
        var _id=parseInt(data._id);
        var updataInfo={
            brandname:data.brandname,
            brandsrc:data.brandsrc,
        };
        MongoClient.connect(url,function(err,client){
            if(err){
                console.log('连接数据库失败');
                cb(err);
            }else{
                const db=client.db('zy');
                db.collection('brand').update({_id:_id},{$set:updataInfo},function(err){
                    if(err){
                        console.log("查询失败");
                        cb(err);
                    }else{
                        console.log('修改数据库成功');
                        cb(null);
                    }
                });
            }
        });
    },
    //删除
    delete(data,cb){
        let _Id=parseInt(data);
        MongoClient.connect(url,function(err,client){
            if(err){
                console.log('连接数据库失败');
                cb({code:-100,msg:'连接数据库失败'});
            }else{
                const db=client.db('zy');
                db.collection('brand').remove({_id:_Id},function(err){
                    if(err){
                        console.log('查询数据库失败');
                        cb({code:-100,msg:'查询数据库失败'});
                    }else{
                        cb(null);
                    }
                });
            }
        });
    },
}


module.exports=brandModule;
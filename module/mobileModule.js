const MongoClient=require('mongodb').MongoClient;
var url='mongodb://127.0.0.1:27017';
const async=require('async');
const mobileModule={
    //新增手机
    mobileAdd(data,cb){
        let mobileInfor={
            mobilepath:data.mobilepath,
            mobilename:data.mobilename,
            mobilebrand:data.mobilebrand,
            oneprice:data.oneprice,
            twoprice:data.twoprice,
        };
        mobileInfor._id=0;
        MongoClient.connect(url,function(err,client){
            if(err){
                console.log('新增手机时，连接数据库失败');
                cb({code:-100,msg:'连接数据库失败'});
            }else{
                const db=client.db('zy');
                async.series([
                    function(callback){
                        //设置_id字段
                        db.collection('mobile').find().toArray(function(err,data){
                            if(err){
                                console.log('新增手机时，查询数据库失败');
                                callback({code:-100,msg:'查询数据库失败'});
                            }else{
                                if(data.length==0){
                                    mobileInfor._id=1;
                                }else{
                                    mobileInfor._id=data[data.length-1]._id+1;
                                }
                                console.log('新增手机时，查询数据库成功'+mobileInfor._id);
                                callback(null);
                            }
                        });
                    },
                    function(callback){
                        //添加手机操作
                        db.collection('mobile').insertOne(mobileInfor,function(err){
                            if(err){
                                console.log('添加手机操作时,查询数据库失败');
                                callback({code:-100,msg:'查询数据库失败'});
                            }else{
                                console.log('添加成功');
                                callback(null);
                            }
                        });
                    },
                ],function(err,result){
                    if(err){
                        console.log('可能上面3步操作出了问题'+err);
                        cb(err);
                    }else{
                        cb(null);
                    }
                    client.close();
                });
            }
        
        });
    },

    //分页
    search(data,cb){
        let limitNum=parseInt(data.pageSize);
        let skipNum=parseInt(data.pageSize*(data.page-1));
        MongoClient.connect(url,function(err,client){
            if(err){
                console.log('分页时，连接数据库失败');
                cb({code:-100,msg:'连接数据库失败'});
            }else{
                const db=client.db('zy');
                async.parallel([
                    function(callback){
                        //查询记录总条数
                        db.collection('mobile').find().count(function(err,num){
                            if(err){
                                console.log('查询失败');
                                callback({code:-101,msg:'查询失败'});
                            }else{
                                callback(null,num);
                            }
                        });
                    },
                    function(callback){
                        //分页操作
                        db.collection('mobile').find().limit(limitNum).skip(skipNum).toArray(function(err,data){
                            if (err) {
                                console.log('查询分页数据失败');
                                callback({code: -101,msg: '查询分页数据失败'});
                            }else {
                                console.log('查询成功');
                                callback(null,data);
                            }
                        })
                    },
                ],function(err,result){
                    if(err){
                        console.log('以上两个步骤出现问题',err);
                        cb(err);
                    }else{
                        console.log('--------');
                        console.log(result);
                        cb(null,{
                            totalPage: Math.ceil(result[0] / data.pageSize),
                            mobileList: result[1],
                            page: data.page
                        });
                    }
                });
            }
        });
    },
    //修改
    updata(data,cb){
        let _id=parseInt(data._id);
        let mobileInfo={
            mobilename:data.mobilename,
            mobilepath:data.mobilepath,
            brand:data.brand,
            oneprice:data.oneprice,
            twoprice:data.twoprice
        }
        MongoClient.connect(url,function(err,client){
            if(err){
                console.log('修改，连接数据库失败');
            }else{
                const db=client.db('zy');
                db.collection('mobile').update({_id:_id},{$set:mobileInfo},function(err){
                    if(err){
                        console.log('修改失败');
                        cb({code:-100,msg:'修改失败'});
                    }else{
                        console.log('修改成功');
                        cb(null);
                    }
                });
            }
        });

    },
    //删除
    delete(data,cb){
        MongoClient.connect(url,function(err,client){
            if(err){
                console.log('删除，连接数据库失败');
            }else{
                const db=client.db('zy');
                db.collection('mobile').remove({_id:data},function(err){
                    if(err){
                        console.log('删除失败');
                        cb({code:-102,msg:'删除失败'});
                    }else{
                        console.log('删除成功');
                        cb(null);
                    }
                });
            }
        });
    },
    //品牌
    brand(cb){
        MongoClient.connect(url,function(err,client){
            if(err){
                cb({code:-100,msg:'连接数据库失败'});
            }else{
                const db=client.db('zy');
                db.collection('brand').find({},{brandname:1,_id:0,brandsrc:0}).toArray(function(err,data){
                    if(err){
                        console.log('查询数据库失败');
                        cb({code:-100,msg:'查询数据库失败'});
                    }else{
                        console.log('查询数据库成功');
                        cb(null,data);
                    }
                });
            }
        });
    },

}
module.exports=mobileModule;
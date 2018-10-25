//模块是用来操作users.ejs相关后台的处理
//插入
//删除
//修改
//查询
const MongoClient=require('mongodb').MongoClient;
var url='mongodb://127.0.0.1:27017';
const async=require('async');

const usersModule={
    //添加操作
    add(data,cb){

        MongoClient.connect(url,function(err,client){
            if(err){
                console.log('连接数据库失败'+err);
                cb({code:-100,msg:'连接数据库失败'});
            }else{
                const db=client.db('zy');
                let savedata={
                    username:data.username,
                    password:data.password,
                    nickname:data.nickname,
                    phone:data.phone,
                    is_admin:data.is_admin,
                };
                console.log(savedata);
                //判断用户是否注册
                var Lastdata_id;
                async.series([
                    function(callback){
                        //判断用户是否注册
                         db.collection('user').find({username:savedata.username}).count(function(err,num){
                            if(err){
                                console.log('查询是否注册失败');
                                callback({code:-101,msg:'查询是否注册失败'});
                            }else if(num!==0){
                                console.log('用户已注册过了');
                                callback({code:-102,msg:'用户已注册过了'});
                            }else{
                                console.log('用户可以注册');
                                callback(null);
                            }
                         });
                    },

                    //设置_id字段
                    function(callback){
                        db.collection('user').find().toArray(function(err,data){
                            if(err){
                                console.log('设置_id字段过程中，查询数据库失败');
                                callback({code:-100,msg:'设置_id字段过程中，查询数据库失败'});
                            }else{
                                console.log(data);
                                Lastdata_id=data[data.length-1]._id+1;
                                savedata._id=Lastdata_id;
                                console.log(Lastdata_id);
                                callback(null);
                            }
                        });
                    },
                    
                    function(callback){
                        //做添加操作

                        db.collection('user').insertOne(savedata,function(err){
                            if(err){
                                console.log('savedata'+savedata);
                                console.log('写入数据库失败');
                                callback({code:-101,msg:'写入数据库失败'});
                            }else{
                                callback(null);
                            }
                        });
                    }
                ],function(err,results){
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

    //登录处理
    login(data,cb){
       MongoClient.connect(url,function(err,client){
           if(err){
               console.log('登录处理连接数据库失败');
               cb({code:-101,msg:'登录处理连接数据库失败'});
           }else{
               const db=client.db('zy');
               db.collection('user').find({
                   username:data.username,
                   password:data.password
                }).toArray(function(err,data){
                   if(err){
                       console.log('查询数据库失败');
                       cb({code:-101,msg:'查询数据库失败'});
                       client.close();
                   }else if(data.length===0){
                        console.log('用户名或密码错误');
                        cb({code:-102,msg:'用户名或密码错误'});
                   }else{
                        console.log('登录成功');
                        let userdata={
                            _id:data[0]._id,
                            username:data[0].username,
                            nickname:data[0].nickname,
                            is_admin:data[0].is_admin
                        };
                        console.log('登录的用户信息为：'+userdata);
                    
                        // 这里需要将 用户名，昵称、与是否是管理员这两个字段告诉给前端
                        cb(null,userdata);
                   }
                client.close();
               });
           }
       }); 
    },
    //分页处理
    getuserList(data,cb){
        MongoClient.connect(url,function(err,client){
            if(err){
                cb({code:-100,msg:'连接数据库失败'});
            }else{
                const db=client.db('zy');
                let limitNum=parseInt(data.pageSize);
                let skipNum=data.page*data.pageSize-data.pageSize;
                async.parallel([
                    function(callback){
                        //查询记录条数
                        db.collection('user').find().count(function(err,num){
                            if(err){
                                console.log('查询记录条数时，连接数据库失败');
                                callback({code:-100,msg:'连接数据库失败'});
                            }else{
                                callback(null,num);
                            }
                        });
                    },
                    function(callback){
                        //查询分页数据
                        db.collection('user').find().limit(limitNum).skip(skipNum).toArray(function(err,userList){
                            if(err){
                                console.log('查询分页数据时，连接数据库失败');
                                callback({code:-100,msg:'连接数据库失败'});
                            }else{
                                callback(null,userList);
                            }
                        });
                    }
                ],function(err,result){
                    if(err){
                        cb(err);
                    }else{
                        cb(null,{
                            totalpage:Math.ceil(result[0]/limitNum),
                            userList:result[1],
                            page:data.page
                        });
                    }
                    client.close();
                });
            }
        });
    },


    //根据昵称搜索用户
    searchUserInfo(data,cb){
        var searchdata=new RegExp(data.searchname);
        console.log(searchdata);
        MongoClient.connect(url,function(err,client){
            if(err){
                console.log('根据昵称搜索用户时，连接数据库失败');
                cb({code:-100,msg:'连接数据库失败'});
            }else{
                const db=client.db('zy');
                let limitNum=parseInt(data.pageSize);
                let skipNum=data.page*data.pageSize-data.pageSize;
                async.parallel([
                    function(callback){
                        //查询记录条数
                        db.collection('user').find({nickname:searchdata}).count(function(err,num){
                            if(err){
                                console.log('查询记录条数时，连接数据库失败');
                                callback({code:-100,msg:'连接数据库失败'});
                            }else{
                                callback(null,num);
                            }
                        });
                    },
                    function(callback){
                        //查询分页数据
                        db.collection('user').find({nickname:searchdata}).limit(limitNum).skip(skipNum).toArray(function(err,userList){
                            if(err){
                                console.log('查询分页数据时，连接数据库失败');
                                callback({code:-100,msg:'连接数据库失败'});
                            }else{
                                callback(null,userList);
                            }
                        });
                    }
                ],function(err,result){
                    if(err){
                        cb(err);
                    }else{
                        cb(null,{
                            totalpage:Math.ceil(result[0]/limitNum),
                            userList:result[1],
                            page:data.page
                        });
                    }
                    client.close();
                });
            }
        });
    },


    //删除用户
    userDelete(data,cb){
        MongoClient.connect(url,function(err,client){
            if(err){
                cb({code:-100,msg:'删除用户时，连接数据库失败'});
            }else{
                const db=client.db('zy');
                db.collection('user').remove({_id:parseInt(data)},function(err){
                    if(err){
                        console.log('删除用户失败');
                        cb({code:-101,msg:'删除用户失败'});
                    }else{
                        cb(null);
                    }
                });
            }
        });
    },

    //修改用户的信息
    userupdataAfter(data,cb){
        //
       
        //
        MongoClient.connect(url,function(err,client){
            if(err){
                console.log('修改用户的信息时,连接数据库失败');
                cb({code:-100,msg:'连接数据库失败'});
            }
            const db=client.db('zy')
            db.collection('user').update({_id:parseInt(data._id)},{$set:{
                nickname:data.nickname,
                age:data.age,
                sex:data.sex,
                phone:data.phone,
                is_admin:data.is_admin
            }},function(err){
                if(err){
                    cb({code:-101,msg:'修改用户信息失败'});
                }else{
                    cb(null);
                }
            });
        });
    },
    

};

module.exports=usersModule;
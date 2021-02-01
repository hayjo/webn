var db = require('./db');
var qs = require('querystring');
var fs = require('fs');
var url = require('url');
var sanitize = require('sanitize-html');
var path = require('path');
var template = require('./template');


var getData = function(request, callback){
    var body = '';
    request.on('data', function(data){ //
      body += data;
    });
    request.on('end', function(){
      var post = qs.parse(body);
      for(var prop in post){  // sanitize
        post[prop] = sanitize(post[prop]);
      }
      callback(post);
    });
}


module.exports = {
	'/': function(request, response){
		var option = {
			home: true,
  			authorPage: true,
		};
		var id = 0;   // 홈이라서 상세데이터 조회가 아님
		template.view.authorTable(id, function(table){
			template.menu.Topic(option, id, function(topic){
				template.menu.Edit(option, id, function(menu){
					var html = template.getHTML('Author', menu, topic, table);
					response.writeHead(200);
					response.write(html);
					response.end();
					});
				});
			});
	},
	'/create': function(request, response){
		var option = {
			home: true,
  			authorPage: true
		};
		var id = 0;  // 마찬가지로 create 이기 때문에 상세 데이터에 문제가 없음
		template.view.authorTable(id, function(table){
			template.menu.Topic(option, id, function(topic){
				template.menu.Edit(option, id, function(menu){
					template.form.authorCreate(function(createForm){
						var content = table + createForm;    //
						var html = template.getHTML('create', menu, topic, content);
						response.writeHead(200);
						response.write(html);
						response.end();
					});
				});
			});
		});
	},
	
	'/update': function(request, response){
		var id = parseInt(url.parse(request.url, true).query.id);
		if (Number(id) === 0 || Number.isNaN(id)){
			id = 0;
		};
		db.query('SELECT * FROM author WHERE id = ?', id, function(err, result){
			if (result.length === 0){
				response.writeHead(302, {
				'Location': '/author'
				});
				response.end();
				return 0;	
			} else {
				var option = {
				home: false,
				authorPage: true
				};
				template.view.authorTable(id, function(table){
					template.menu.Topic(option, 0, function(topic){
						template.menu.Edit(option, 0, function(menu){
							template.form.authorUpdate(option, id, result[0], function(updateForm){
								var content = table + updateForm;    //
								var html = template.getHTML('update', menu, topic, content);
								response.writeHead(200);
								response.write(html);
								response.end();
							});
						});
					});		
				});
			};
		});
	},
	'/process_create': function(request, response){
		getData(request, function(post){
			db.query(`SELECT EXISTS(SELECT * FROM author WHERE name = ?) AS dup;`, post.name.toLowerCase(), function(err, data){  // 중복확인
				if (err){
					throw err;
				}
				if (data[0].dup === 0){
					query = `INSERT INTO author (name, profile) VALUES (?, ?)`;
					dataList = [post.name, post.profile];
					db.query(query, dataList, function(err, inserted){
						if (err){
							throw err;
						}
						response.writeHead(302, {   // 생성된 페이지로 리다이렉트
						'Location': `/author`
						});
						response.end();
					});
				} else {   // 이름이 중복이면
					response.writeHead(404);
					response.end('Already existed ...');
				};
			});
		});
	},
	'/process_update': function(request, response){
		getData(request, function(post){
			db.query(`SELECT EXISTS(SELECT * FROM author WHERE name = ? AND NOT id = ?) AS dup;`, [post.name.toLowerCase(), post.id], function(err, data){  // 중복확인
				if (err){
					throw err;
				}
				if (data[0].dup === 0){
					query = `UPDATE author SET name=?, profile=? WHERE id=?`;
					dataList = [post.name, post.profile, post.id];
					db.query(query, dataList, function(err, inserted){
						if (err){
							throw err;
						}
						response.writeHead(302, {
						'Location': `/author`
						});
						response.end();
					});
				} else {   // 이름이 중복이면
					response.writeHead(404);
					response.end('Already existed ...');
				};
			});
		});
		
	},
	'/process_delete': function(request, response){
		getData(request, function(post){
			db.query('DELETE FROM author WHERE id = ?', post.id, function(err, result2){
				response.writeHead(302, {   // 생성된 페이지로 리다이렉트
						'Location': `/author`
						});
						response.end();
				return 0;
			});
		});
    }
}

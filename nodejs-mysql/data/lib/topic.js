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
			home: false,
  			authorPage: false,
			topicPerPage: 15
		};
		var id = parseInt(url.parse(request.url, true).query.id);
		if (Number.isNaN(id)){
			id = 0;
			option.home = true;
		};
		option.page = parseInt(url.parse(request.url, true).query.page);
		if (Number(option.page) === 0 || Number.isNaN(option.page)){
			option.page = 1;
		};
		var sortBy = url.parse(request.url, true).query.sortBy;
		if (['title-asc', 'title-desc', 'created-asc', 'created-desc'].includes(sortBy)){
		  	option.sortBy = sortBy;
		};
		option.topicOffset = option.topicPerPage*(option.page-1);
		db.query('SELECT topic.*, author.name as author_name, author.profile as author_profile FROM topic LEFT JOIN author ON topic.author_id=author.id WHERE topic.id = ?', id, function(err, data){
		  if (err) { throw err;};
		  if (data.length === 0){         // 값이 나오지 않으면, 없는 id이면
			  response.writeHead(302, {
			    'Location': `/`
			  });
			  response.end();
			  return 0;
		  } else {
			  template.view.topicView(id, data[0], response, function(view){
				template.menu.Topic(option, id, function(topic){
				  template.menu.Edit(option, id, function(menu){
					var title = data[0].title;
					var html = template.getHTML(title, menu, topic, view);
					response.writeHead(200);
					response.write(html);
					response.end();
				  });
				});
			  });
		  }
		});
	},
	'/create': function(request, response){
		var option = {
			home: false,
  			authorPage: false,
			create: true
		};
		var id = parseInt(url.parse(request.url, true).query.id);
		if (Number.isNaN(id)){
			id = 0;
		}
		option.page = parseInt(url.parse(request.url, true).query.page);
		if (Number(option.page) === 0 || Number.isNaN(option.page)){
			option.page = 1;
		};
		template.menu.Topic(option, id, function(topic){
			template.menu.Edit(option, id, function(menu){
				template.form.topicCreate(option, function(createForm){
					var html = template.getHTML('create', menu, topic, createForm);
					response.writeHead(200);
					response.write(html);
					response.end();
				});
			});
		});
	},
	'/update': function(request, response){
		var id = parseInt(url.parse(request.url, true).query.id);
		if (Number.isNaN(id)){
			id = 0;
		};
		option.page = parseInt(url.parse(request.url, true).query.page);
		if (Number(option.page) === 0 || Number.isNaN(option.page)){
			option.page = 1;
		};
		db.query('SELECT topic.*, author.name as author_name, author.profile as author_profile FROM topic LEFT JOIN author ON topic.author_id=author.id WHERE topic.id = ?', [id], function(err, result){
		  if (err) {
			  throw err;
		  };
		  if (result.length === 0 || result[0].id === 0){           // 값이 나오지 않으면, 없는 id이면
			response.writeHead(302, {         // 홈으로로 리다이렉트
			'Location': `/`
			});
			response.end();
			return 0;
		  } else {
				var option = {
				home: false,
				authorPage: false,
				update: true
				};
		
				template.menu.Topic(option, id, function(topic){
					template.menu.Edit(option, id, function(menu){
						template.form.topicUpdate(option, id, result[0], function(updateForm){
						var html = template.getHTML('update', menu, topic, updateForm);
						response.writeHead(200);
						response.write(html);
						response.end();
						});
					});
				});
		  };
		});
	},
	'/process_create': function(request, response){
		getData(request, function(post){
			db.query(`SELECT EXISTS(SELECT * FROM topic WHERE title = ?) AS dup;`, post.title.toLowerCase(), function(err, data){  // 중복확인
				if (err){
					throw err;
				}
				if (data[0].dup === 0){
					query = `INSERT INTO topic (title, logo, industry, founded, founders, revenue, description, author_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
					dataList = [post.title, post.logo, post.industry, post.founded, post.founders, post.revenue, post.description, post.author_id];
					db.query(query, dataList, function(err, inserted){
						if (err){
							throw err;
						}
						response.writeHead(302, {   // 생성된 페이지로 리다이렉트
						'Location': `/?id=${inserted.insertId}`
						});
						response.end();
					});
				} else {   // 이름이 중복이면
					response.writeHead(404);
					response.end('Already used title ...');
				};
			});
		});
	},
	'/process_update': function(request, response){
		getData(request, function(post){
			db.query(`SELECT EXISTS(SELECT * FROM topic WHERE title = ? AND NOT id = ?) AS dup;`, [post.title.toLowerCase(), post.id], function(err, data){  // 중복확인
				if (err){
					throw err;
				}
				if (data[0].dup === 0){
					query = `UPDATE topic SET title=?, logo=?, industry=?, founded=?, founders=?, revenue=?, description=?, author_id=? WHERE id = ?`;
					dataList = [post.title, post.logo, post.industry, post.founded, post.founders, post.revenue, post.description, post.author_id, post.id];
					db.query(query, dataList, function(err, inserted){
						if (err){
							throw err;
						}
						response.writeHead(302, {
						'Location': `/?id=${post.id}`
						});
						response.end();
					});
				} else {   // 이름이 중복이면
					response.writeHead(404);
					response.end('Already used title ...');
				};
			});
		});
		
	},
	'/process_delete': function(request, response){
		getData(request, function(post){
			db.query('DELETE FROM topic WHERE id = ' + post.id, function(err, result2){
				response.writeHead(302, {   // 홈으로 리다이렉트
						'Location': `/`
						});
						response.end();
				return 0;
			});
		});
    },
	
	'/search': function(request, response){
		var option = {
			home: false,
  			authorPage: false,
			searchQuery: query
		};
		option.page = parseInt(url.parse(request.url, true).query.page);
		if (Number(option.page) === 0 || Number.isNaN(option.page)){
			option.page = 1;
		};
		var query = sanitize(url.parse(request.url, true).query.query);
		db.query(`SELECT id, title, SUBSTRING(description, 1, 100) as description FROM topic WHERE title LIKE ?`, '%' + query + '%', function(err, result){
			if (err) {throw err};
		    template.menu.Topic(option, 0, function(topic){
			    template.menu.Edit(option, 0, function(menu){
				    template.view.searchResult(result, function(searchResult){
						var html = template.getHTML('create', menu, topic, searchResult);
						response.writeHead(200);
						response.write(html);
						response.end();
					});
				});
			});
		});
	}
	
};

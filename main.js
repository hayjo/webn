var http = require('http');
var url = require('url');
var path = require('path');
var fs = require('fs');
var db = require('./db');


//////
var pagePerBlock = 10;
var topicPerPage = 15;
/////



var app = http.createServer(function(request, response){
    var _url = request.url;
	var pathname = url.parse(_url, true).pathname;
	var hash = pathname.hash;
	url_parsed = pathname.split('/');

	if (url_parsed[1] === 'public' && fs.existsSync(__dirname + '/public/' + url_parsed[2])) {
	    var ext = path.parse(pathname).ext.replace(".", "");
		if (ext === 'css') {
			var mime = `text/css`
		} else if (ext === 'js') {
			var mime = `application/js`;
		}
		response.writeHead(200, {'Content-Type': mime});
		response.end(fs.readFileSync(__dirname + '/public/' + url_parsed[2], 'utf8'));
  } else if (url_parsed[1] === 'topic'){
			var page = Number(url_parsed[3]);
		if (['title-asc', 'title-desc', 'created-asc', 'created-desc'].includes(url_parsed[2])){
			if (Number.isInteger(page)){
			var list = `
				<div class="list">
				  <ol>\n`;
			  db.query(`SELECT id, title FROM topic LIMIT ? OFFSET ?`, [15, page*15], function(err, data){
				for(var i=1; i<data.length; i++){
				  list += `			      <li><a href="/?id=${data[i].id}">${data[i].title}</a></li>\n`;
				};
				list += `\n			  </ol>
					</div>`;
			  response.writeHead(200);
		      response.write(list);
			  response.end();
			  return 0;
			  });
			}
		}
	} else if (url_parsed[1] === 'topic-temp'){
		var sortBy = url_parsed[2];
		var start = Number(url_parsed[3]);
		if (['title-asc', 'title-desc', 'created-asc', 'created-desc'].includes(sortBy)){
			var sortBy = 'ORDER BY ' + sortBy.replace("-", " ");
			var query = `SELECT JSON_ARRAYAGG(JSON_OBJECT('id', id, 'title', title)) as topic FROM (SELECT id, title FROM test ${sortBy} LIMIT ? OFFSET ?)sub`;
			if (Number.isInteger(start) && start >= 0){
			  db.query(query, [15, start], function(err, data){
				  if (err) {throw err};
				  response.setHeader('Content-Type', 'application/json');
				  response.end(data[0]['topic']);
			  });
			}
		} else {
			response.writeHead(404);
			response.end('Data Not Found');
		}
		
	} else if (url_parsed[1] === 'page'){
		var sortBy = url_parsed[2];
		var pageNum = Number(url_parsed[3]);
		var offSet = pageNum - 1;  // MySQL은 인덱스가 0부터 시작이라서
		if (!Number.isInteger(offSet) || offSet < 0) {   // 페이지 번호가 자연수가 아니면
			response.writeHead(404);
			response.end('Data Not Found');
		} else {
			if (['title-asc', 'title-desc', 'created-asc', 'created-desc'].includes(sortBy)){
				var sortBy = ' ORDER BY ' + sortBy.replace("-", " ");
				getTopicList(sortBy, offSet, function(topicList){
					getPageInfo(pageNum, function(pageInfo){
						var result = {
							'topicList': topicList,
							'pageInfo': pageInfo
					    }
						response.setHeader('Content-Type', 'application/json');
						response.end(JSON.stringify(result));
					});
				  });
			} else {
				response.writeHead(404);
				response.end('Data Not Found');
			}
		}

	} else if (url_parsed[1] === 'author' && url_parsed[2] === 'view'){
		var start = Number(url_parsed[3]);
		var more = Number(url_parsed[4]);
		if (!Number.isInteger(start) || !Number.isInteger(more)) {
			response.writeHead(404);
			response.end('Data Not Found');
		} else {
			var query = `SELECT JSON_ARRAYAGG(JSON_OBJECT('id', id, 'name', name, 'profile', profile)) as 'result' FROM (SELECT id, name, profile FROM authorTest LIMIT ? OFFSET ?)sub`;
			db.query(query, [more, start], function(err, data){
				response.writeHead(200, { 'Content-Type': 'application/json' });
				var result = data[0]['result'];
				if (result === null){
					result = JSON.stringify([]);
				}
				response.end(result);
			})
		}

	} else if (url_parsed[1] === 'author' && url_parsed[2] === 'create'){
		var body = '';
		request.on('data', function(data){
	        body += data;
			try {
				var dataJSON = JSON.parse(data);
			} catch(err) {
				console.error(err);
			}
			if (dataJSON['Author'] === '') {
				var msg = { result: false,
						    status: 'empty'
						  }
				response.writeHead(200, {'Content-Type': 'application/json'});
				response.end(JSON.stringify(msg));
			} else {
				db.query('SELECT EXISTS(SELECT * FROM authorTest WHERE name = ?) AS dup;', dataJSON['Author'], function(err1, result1){
					if (err1) {throw err1};
					if (result1[0].dup === 0){  // 같은 이름이 없으면
						var query = `INSERT INTO authorTest (name, profile) VALUES (?, ?)`;
						db.query(query, [dataJSON['Author'], dataJSON['Profile']], function(err2, result2){
							if (err2) {throw err2};
							var msg = { result: true,
										authorID: result2.insertId,
									    status: 'created'
									  }
							response.writeHead(200, {'Content-Type': 'application/json'});
							response.end(JSON.stringify(msg));
						})
					} else {   // 있으면
						var msg = { result: false,
									status: 'duplicated'
								  }
						response.writeHead(200, {'Content-Type': 'application/json'});
						response.end(JSON.stringify(msg));
					}
				});
			}
		});

	} else if (url_parsed[1] === 'author' && url_parsed[2] === 'update'){
		var body = '';
		request.on('data', function(data){  // 데이터 받아오기
	        body += data;
			try {
				var dataJSON = JSON.parse(data);
			} catch(err) {
				console.error(err);
			}
			if (dataJSON['Author'] === '') {  // 이름이 없으면
				var msg = { result: false,
						    status: 'empty'
						  }
				response.writeHead(200, {'Content-Type': 'application/json'});
				response.end(JSON.stringify(msg));
			} else {
				db.query('SELECT EXISTS(SELECT * FROM authorTest WHERE name = ? AND id != ?) AS dup;', [dataJSON['Author'], dataJSON['id']], function(err1, result1){
					if (err1) {throw err1};
					if (result1[0].dup === 0){  // 같은 이름이 없으면
						var query = `UPDATE authorTest SET name=?, profile=? WHERE id=?`;
						db.query(query, [dataJSON['Author'], dataJSON['Profile'], dataJSON['id']], function(err2, result2){
							if (err2) {throw err2};
							var msg = { result: true,
										authorID: result2.insertId,
									    status: 'updated'
									  }
							response.writeHead(200, {'Content-Type': 'application/json'});
							response.end(JSON.stringify(msg));
						})
					} else {
						var msg = { result: false,
									status: 'duplicated'
								  }
						response.writeHead(200, {'Content-Type': 'application/json'});
						response.end(JSON.stringify(msg));
					}
				});
			}
		});

	} else if (url_parsed[1] === 'author' && url_parsed[2] === 'delete'){
		var body = '';
		request.on('data', function(data){  // 데이터 받아오기
	        body += data;
			try {
				var dataJSON = JSON.parse(data);
			} catch(err) {
				console.error(err);
			}
			db.query('DELETE FROM authorTest WHERE id=?', dataJSON.id, function(err, result){
				if (err) {throw err};
				var msg = { result: true,
							status: 'deleted'
						  }
				response.writeHead(200, {'Content-Type': 'application/json'})
				response.end(JSON.stringify(msg));
			});
		});
	} else if (url_parsed[1] === 'rank') {
		var sortBy = url_parsed[2];
		var id = Number(url_parsed[3]);
		var sortByBool = ['title-asc', 'title-desc', 'created-asc', 'created-desc'].includes(sortBy);
		if ((Number.isInteger(id)) && sortByBool) {
			var sortBy = ' ORDER BY ' + sortBy.replace("-", " ");
			var query1 = `SET @rank=0`;
			var query2 = `SELECT rank, id FROM (SELECT @rank:=@rank+1 AS rank, id, title FROM test ${sortBy})sub WHERE id = ?;`
			db.query(query1, function(err1, result1){
				if (err1) { throw err1 };
				db.query(query2, id, function(err2, result2){
					if (err2) { throw err2 };
		            if (result2.length === 0) {         // 값이 나오지 않으면, 없는 id이면
						response.writeHead(404);
						response.end();
				    } else {
						result = result2[0];
						result['curPage'] = Math.ceil(result['rank']/topicPerPage);
						response.writeHead(200, { 'Content-Type': 'application/json' });
						response.end(JSON.stringify(result));
					}
				});
			});
		} else {
			response.writeHead(404);
			response.end('Data Not Found');
		};
			   
	} else if (url_parsed[1] === 'content') {
		var id = Number(url_parsed[2]);
		if (Number.isInteger(id)) {
			var query = `SELECT JSON_ARRAYAGG(JSON_OBJECT('title', test.title, 'description', test.description, 'authorName', authorTest.name, 'authorProfile', authorTest.profile)) as '?' FROM test LEFT JOIN authorTest ON test.author_id=authorTest.id WHERE test.id=?`;
			db.query(query, [id, id] , function(err, data){
		      if (err) { throw err;};
		      if (data.length === 0){         // 값이 나오지 않으면, 없는 id이면
			    response.writeHead(404);
			    response.end();
		      } else {
				var result = data[0][id];
				response.setHeader('Content-Type', 'application/json');
				response.end(result);
			  }
			});
		} else {
			response.writeHead(404);
			response.end();
		}

	} else if (url_parsed[1] === 'get-id') {
		var hash = url_parsed[2];
			db.query(`SELECT JSON_ARRAYAGG(JSON_OBJECT('id', id, 'title', title)) as title FROM test WHERE title = ?`, [hash] , function(err, data){
		      if (err) { throw err;};
		      if (data.length === 0){         // 값이 나오지 않으면, 없는 id이면
			    response.writeHead(404);
			    response.end();
		      } else {
				result = data[0]['title'];
				response.setHeader('Content-Type', 'application/json');
				response.end(result);
			  }
			});

	} else {
		response.writeHead(200);
		response.end(fs.readFileSync(__dirname + '/index.html'));
	}

});
app.listen(8393);


function getTopicList(sortBy, offSet, callback){
	var query = `SELECT JSON_ARRAYAGG(JSON_OBJECT('id', id, 'title', title)) as topicList FROM (SELECT id, title FROM test ${sortBy} LIMIT ? OFFSET ?)sub`  // 토픽목록 구하는 쿼리
	db.query(query, [topicPerPage, offSet*topicPerPage], function(err, data){
		callback(JSON.parse(data[0]['topicList']));
	});
}

function getPageInfo(pageNum, callback){
  var query = 'SELECT COUNT(*) as CNT FROM test';
  db.query(query, function(err, data){
	if(err) {throw err};
    var count = data[0]['CNT'];
    var totalBlock = Math.ceil(Math.ceil(count/topicPerPage)/pagePerBlock);   // 전체 블럭
    var curBlock = Math.ceil(pageNum/pagePerBlock);                 // 현재 블럭
    if (curBlock > totalBlock){   // 현재 블록이 전체 블록수보다 많으면
      curBlock = totalBlock;
    } else if (curBlock < 1){
      curBlock = 1;
    };
    var lastPage = Math.ceil(count/topicPerPage);  // 전체 중 마지막 페이지
    var blockFirst = (curBlock-1)*pagePerBlock+1;  // 블록의 첫번째 페이지
    var blockLast = curBlock*pagePerBlock;         // 블록의 마지막 페이지
    if (blockLast > lastPage){    // 현재 블록 마지막 페이지가 전체 마지막 페이지보다 크면
      blockLast = lastPage;
    };
    var pageInfo = {
      'totalBlock': totalBlock,
      'curBlock': curBlock,
      'curPage': pageNum,
      'blockFirst': blockFirst,
      'blockLast': blockLast,
      'lastPage': lastPage
    };
	callback(pageInfo);
  });
}

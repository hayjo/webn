var http = require('http');
var url = require('url');
var path = require('path');
var fs = require('fs');
var db = require('./db');

var app = http.createServer(function(request, response){
    var _url = request.url;
    var pathname = url.parse(_url, true).pathname;
	var dir = path.parse(pathname).dir;
	var basePath = "/" + path.parse(pathname).base;
	
	response.writeHead(200);
	response.end(fs.readFileSync(__dirname + '/index.html'));

});
app.listen(3000);



var app = http.createServer(function(request, response){
    var _url = request.url;
	var pathname = url.parse(_url, true).pathname;
	var hash = pathname.hash;
	url_parsed = pathname.split('/');

	
	if (url_parsed[1] === 'topic'){
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
			  console.log(list);
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
		var pageNum = Number(url_parsed[2]);
		var offSet = pageNum - 1;  // MySQL은 인덱스가 0부터 시작이라서
		if (!Number.isInteger(offSet) || offSet < 0) {   // 페이지 번호가 자연수가 아니면
			response.writeHead(404);
			response.end('Data Not Found');
		} else {
			if (['title-asc', 'title-desc', 'created-asc', 'created-desc'].includes(url_parsed[3])){
				var sortBy = ' ORDER BY ' + url_parsed[3].replace("-", " ");
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
		
	} else if (url_parsed[1] === 'rank') {
		var id = Number(url_parsed[2]);
		var sortByBool = ['title-asc', 'title-desc', 'created-asc', 'created-desc'].includes(url_parsed[3]);
		if ((Number.isInteger(id)) && sortByBool) {
			var sortBy = ' ORDER BY ' + url_parsed[3].replace("-", " ");
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
			var result = '';
			db.query(`SELECT JSON_ARRAYAGG(JSON_OBJECT('title', title, 'description', description)) as '?' FROM test WHERE id = ?`, [id, id] , function(err, data){
		      if (err) { throw err;};
		      if (data.length === 0){         // 값이 나오지 않으면, 없는 id이면
			    response.writeHead(404);
			    response.end();
		      } else {
				result = data[0][id];
				response.setHeader('Content-Type', 'application/json');
				response.end(result);
			  }
			});
		};
		
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


var pagePerBlock = 10;
var topicPerPage = 15;

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

var http = require('http');
var fs = require('fs');
var url = require('url');
var templates = require('./template');
var qs = require('querystring');
var path = require('path');
var sanitize = require('sanitize-html');

var response_fmt = {
  sendContent: function(response, ext, pathname){
    response.writeHead(200, {'Content-Type': `text/${ext}`});
    response.write(fs.readFileSync(__dirname + pathname, 'utf8'));
    response.end();
  },
  notFound: function(response){
    response.writeHead(404);
    response.end('Page Not Founded');
  },
  denied: function(response){
    response.writeHead(404);
    response.end('Already used title ...');
  },
  redirect: function(response, location){
    response.writeHead(302, {location: location});
    response.end();
  }
};

var request_fmt = {
  getData: function(request, callback){
    var body = '';
    request.on('data', function(data){ //
      body += data;
    });
    request.on('end', function(){
      var post = qs.parse(body);
      if (post.title !== undefined){
        post.title = path.parse(post.title).base;
      }
      if (post.id === undefined){
        post.id = post.title;
      } post.id = path.parse(post.id).base;
      for(var prop in post){  // sanitize
        post[prop] = sanitize(post[prop]);
      }
      callback(post);
    });
  }
};

var app = http.createServer(function(request, response){
    var _url = request.url;
    var title = url.parse(_url, true).query.id;
    if (title !== undefined){
      title = path.parse(title).base;
    };
    var pathname = url.parse(_url, true).pathname;
    var ext = '';
    if(pathname.indexOf('.') > -1){
      ext = pathname.split('.').splice(-1)[0];
    };

    fs.readdir('./data', function(err, dataList){
      if(ext){    // 확장자가 있으면: html이 아니면
        if(0 <= ['css', 'js'].indexOf(ext)){
          response_fmt.sendContent(response, ext, pathname);
        } else {
          response_fmt.notFound(response);
        }
      } else {    // html이면
        if (pathname === "/"){  // 홈 요청이면
          if (title === undefined){                 // 요청 데이터 id 없으면
            var template = templates.get('home', `./home`, dataList);
          } else if (dataList.indexOf(title) >= 0){  // 요청 데이터 id 있으면
            var template = templates.get(title, `data/${title}`, dataList);
          } else {
            response_fmt.notFound(response);
            return 0;
          }
          response.writeHead(200);
          response.end(template);
        } else if (0 <= ["/create", "/update"].indexOf(pathname)) {  // 편집페이지면
            var template = templates.get(pathname.replace("/", ""), `data/${title}`, dataList);
            response.writeHead(200);
            response.end(template);
        } else if (0 <= ["/process_create", "/process_update", "/process_delete"].indexOf(pathname)) {  // 처리과정이면
           /* request_fmt.getData function -> data 받아서 파싱해서 post로 리턴함 */
           request_fmt.getData(request, function(post){
             if(pathname === "/process_delete"){ // 딜리트인경우 삭제하고 우선종료
               fs.unlink(`data/${post.id}`, function(err){
                 response_fmt.redirect(response, `/`);
               });
               return 0;
             }
             if (post.id !== post.title){ // 이름이 바뀐 경우
               if (dataList.indexOf(post.title) >= 0){ // 중복된 이름이면
                 response_fmt.denied(response); // 갱신거절
                 return 0;
               } else {
                 fs.rename(`data/${post.id}`, `data/${post.title}`, function(err){
                   post.id = post.title;
                 });
               }
             }
             var post_stringify = JSON.stringify(post);
             fs.writeFile(`data/${post.title}`, post_stringify, 'utf8', function(err){
               response_fmt.redirect(response, encodeURI(`/?id=${post.title}`));
               });
           });
        } else {
            response_fmt.notFound(response);
        }
      }
    })
});
app.listen(3000);

var http = require('http');
var fs = require('fs');
var url = require('url');
var templates = require('./template');
var qs = require('querystring');

var app = http.createServer(function(request, response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var title = queryData.id;
    var pathname = url.parse(_url, true).pathname;
    if(pathname !== '/' && pathname.indexOf('.') !== -1){
      var ext = pathname.split('.').splice(-1)[0];
    } else {
      var ext = '';
    }


    fs.readdir('./data', function(err, dataList){
      if(ext){
        if(ext === 'css'){
          response.writeHead(200, {'Content-Type': 'text/css'});
          response.write(fs.readFileSync(__dirname + pathname, 'utf-8'));
          response.end();
        } else if(ext === 'js'){
          response.writeHead(200, {'Content-Type': 'text/javascript'});
          response.write(fs.readFileSync(__dirname + pathname, 'utf-8'));
          response.end();
        } else {
          response.writeHead(404);
          response.end('Page Not Founded');
        }
      } else {
        if(pathname === "/" && title === undefined){
            var template = templates.get('home', `./home`, dataList);
            response.writeHead(200);
            response.end(template);
        } else if(pathname === "/" && dataList.indexOf(title) >= 0){
            var template = templates.get(title, `data/${title}`, dataList);
            response.writeHead(200);
            response.end(template);
        } else if (pathname === "/create") {
            var template = templates.get('create', '/create', dataList);
            response.writeHead(200);
            response.end(template);
        } else if (pathname === "/process_create") {
            var body = '';
            request.on('data', function(data){ //
              body += data;
            });
            request.on('end', function(){
              var post = qs.parse(body);
              var des = JSON.stringify(post);
              fs.writeFile(`data/${post.title}`, des, 'utf8', function(err){
                response.writeHead(302, {location: `/?id=${post.title}`});
                response.end();
              })
            });
        } else if (pathname === "/update") {
          if(title !== "update"){
            var template = templates.get('update', `data/${title.toLowerCase()}`, dataList);
            response.writeHead(200);
            response.end(template);
          } else {
            response.writeHead(302, {location: `/`});
            response.end(template);
          }
        } else if (pathname === "/process_update") {
            var body = '';
            request.on('data', function(data){ //
              body += data;
            });
            request.on('end', function(){
              var post = qs.parse(body);
              if(post.id === post.title){
                var des = JSON.stringify(post);
                fs.writeFile(`data/${post.title}`, des, 'utf8', function(err){
                  response.writeHead(302, {location: `/?id=${post.title}`});
                  response.end();
                });
              } else {
                fs.rename(`data/${post.id}`, `data/${post.title}`, function(err){
                  var des = JSON.stringify(post);
                  des.id = des.title;
                  fs.writeFile(`data/${post.title}`, des, 'utf8', function(err){
                    response.writeHead(302, {location: `/?id=${post.title}`});
                    response.end();
                  });
                });
              }
            });
        } else if (pathname === "/process_delete") {
          var body = '';
          request.on('data', function(data){ //
            body += data;
          });
          request.on('end', function(){
            var post = qs.parse(body);
            fs.unlink(`data/${post.id}`, function(err){
              response.writeHead(302, {location: `/`});
              response.end();
            });
          });
        } else {
            response.writeHead(404);
            response.end('Page Not Founded');
        }
      }
    })
});
app.listen(3000);

var http = require('http');
var fs = require('fs');
var url = require('url');
var templates = require('./template');

var app = http.createServer(function(request, response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var title = queryData.id;
    var pathname = url.parse(_url, true).pathname;
    if(pathname !== '/'){
      var ext = pathname.split('.').splice(-1)[0];
    } else {
      var ext = '';
    }
    console.log(title, pathname);


    fs.readdir('./data', function(err, dataList){
      console.log(ext);
      if(ext){
        if(ext === '.css'){
          response.writeHead(200, {'Content-Type': 'text/css'});
        } else if(ext === '.js'){
          response.writeHead(200, {'Content-Type': 'text/javascript'});
        }
        response.write(fs.readFileSync(__dirname + pathname, 'utf-8'));
        response.end();
      } else {
        if(pathname === "/" && title === undefined){
            console.log();
            var template = templates.get('home', `./home`, dataList);
            response.writeHead(200);
            response.end(template);
        } else if(dataList.indexOf(title) >= 0){
            var template = templates.get(title, `data/${title}`, dataList);
            response.writeHead(200);
            response.end(template);
        } else {
          response.writeHead(404);
          response.end('Page Not Founded');
        }
      }
    })
});
app.listen(3000);

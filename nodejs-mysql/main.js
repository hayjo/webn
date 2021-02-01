var http = require('http');
var url = require('url');
var path = require('path');
var fs = require('fs');

var base = {
	'/': require('./data/lib/topic'),
	'/author': require('./data/lib/author')
};

var app = http.createServer(function(request, response){
    var _url = request.url;
    var pathname = url.parse(_url, true).pathname;
	var dir = path.parse(pathname).dir;
	var basePath = "/" + path.parse(pathname).base;
	
	if (basePath === "/author"){            // /author 페이지 처리
		base['/author']['/'](request, response);
    } else if (base.hasOwnProperty(dir)) {  // /이나 /author/editPage 요청이면 
		if (base[dir].hasOwnProperty(basePath)){
			base[dir][basePath](request, response);
		} else {
			response.writeHead(404);
			response.end('Page Not Founded');
		}		
	} else if (dir === '/public' && fs.existsSync(__dirname + pathname)) {
		var ext = path.parse(pathname).ext.replace(".", "");
			response.writeHead(200, {'Content-Type': `text/${ext}`});
			response.write(fs.readFileSync(__dirname + pathname, 'utf8'));
			response.end();
	} else {
		response.writeHead(404);
		response.end('Page Not Founded');
	}

});
app.listen(3000);

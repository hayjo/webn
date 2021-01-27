var fs = require('fs');
var db = require('./db');
var menu = require('./template/menu');
var view = require('./template/view');
var form = require('./template/form');

var capitalize = function(str){
	return str.charAt(0).toUpperCase() + str.slice(1);
};

var getHTML = function(title, menu, listButton, content){
	var head = getHead(title);
	return `
<!doctype html>
<html>
  <head>
	${head}
  </head>
  <body>
	<div id="layout-main">
	  <div class="layout-left">
		<nav class="menu">
			${menu}
		</nav>
			${listButton}
	  </div>
	  <div class="layout-right">
		${content}
	  </div>
	</div>
  </body>
</html>`;
}

var getHead = function(title) {
	return `
		<link rel='icon' href='data:,'>
		<meta charset="utf-8">
		<link rel="stylesheet" type="text/css" href="../../public/style.css">
		<title>Big Tech - ${capitalize(title)}</title>
		<h1>Big Tech Companies</h1>
		<script src="../../public/dayNightButton.js"></script>
`;
}


module.exports = {
   menu, view, form, getHTML
}
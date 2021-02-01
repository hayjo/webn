var db = require('../db');

var capitalize = function(str){
	return str.charAt(0).toUpperCase() + str.slice(1);
};

module.exports = {
	topicView: function(id, data, response, callback){
		var capTitle = capitalize(data.title);
		var logo = data.logo.replace(/\/\//g, '/');  // 로고 백슬래시 이스케이프
		// 상세정보 부분
		var content = '<ul>';
		for (var key of ['Industry', 'Founders', 'Founded', 'Revenue']){
			content += `<li><strong>${key}:</strong> ${data[key.toLowerCase()]}</li>\n`
		};
		content = content + '</ul>';
		view = `<div class="img-logo">
			<img class="logo" src="${logo}">
			</div>
			<h2>${capTitle}</h2>
			<h4>Company Info</h4>
			${content}
			<p>
			<span style="color:red;">${capTitle}</span>, ${data.description}
			</p>
			<p class="author">Edited By ${data.author_name} (${data.author_profile})</p>`;
		callback(view);
	},

	authorTable: function(id, callback){
		var table = '';
		db.query('SELECT id, name, profile FROM author', function(err, authors){
		var trs = ''
		for(var i=0; i<authors.length; i++){
			trs += `   <tr>
						  <td class="table-idx">${i+1}</td><td>${authors[i].name}</td>
						  <td>${authors[i].profile}</td>
						  <td><button class="button-edit" onclick="location.href='/author/update?id=${authors[i].id}'">Update</button></td>
						  <td><form action="/author/process_delete" method="post" onsubmit="return confirm('do you want to delete this file?')">
			<input type="hidden" name="id" value="${authors[i].id}">
				<input type="submit" value="Delete" class="button-edit"></form></td>
					  </tr>\n`;
		};
		table += `
			<table class="author-table" border=2>
				<th class="table-idx">#</th>
				<th>Author</th>
				<th>Profile</th>
				<th>Update</th>
				<th>Delete</th>
				${trs}
			</table>
	        <button class="button-edit" id="author-create" onclick="location.href='/author/create'">Create</button>
	`;
		callback(table);
		});
	},
	
	searchResult: function(result, callback){
		var view = ``
		for(var i in result){
			if (result[i].description.length === 100){
				var description = result[i].description + ' ...';
			} else {
				var description = result[i].description;
			};
			view += `
			<div class="search-result" onclick="location.href='/?id=${result[i].id}';">
				<h3 class="search-title"><a href="/?id=${result[i].id}">${result[i].title}</a></h3>
				<p class="search-desc"></p>${description}</p>
			</div>`;
		}
		callback(view);
	}
};
	
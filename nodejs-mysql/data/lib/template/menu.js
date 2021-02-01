var db = require('../db');
var page = require('./page');

/* var option = {
  home: true,
  authorPage: true,
  viewEdit: true
} */

var capitalize = function(str){
	return str.charAt(0).toUpperCase() + str.slice(1);
};

module.exports = {
	Edit: function(option, id, callback){   // 홈은 아이디 0
	  var menu = '';
	  var active = ` id="active"`;
	  var home = ``;
	  var edit = ``;
	  var author = ``
	  var create = '';
	  var update = '';

	  if (option.authorPage) {
		author = active;
	  } else if ( id === 0 && !option.create ){
		home = active;
	  } else if ( option.create ) {
		create = active;
	  } else {
			if (option.update){
				update = active;
			}
			edit += `
					  <li><a href="/update?id=${id}" class="menu-edit" ${update}>Update</a></li>
						<li><form action="process_delete" method="post" onsubmit="return confirm('do you want to delete this file?')">
						  <input type="hidden" name="id" value="${id}">
								<input type="submit" value="Delete" class="menu-edit">
							</form></li>`;
	  };
	  menu += `
				<ul>
				  <li><a href="/" ${home}class="menu-edit">Home</a></li>
				  <li><a href="/create" class="menu-edit" ${create}>Create</a></li>
				  ${edit}
<li><a href="/author" ${author}class="menu-edit">AuthorPage</a></li>
				</ul>`;
	    callback(menu);
	},

	TopicOld: function(option, id, callback){
	if(option.authorPage){
		var active = '';
	} else {
		var active = ` id="active"`;
	}
	if(option.searchQuery === undefined){
		var searchQuery = '';
	} else {
		var searchQuery = option.searchQuery;
	}
    var searchBar = `<div class="search">
<form action="search" method="get" class="search-form">
	<input type="text" class="search-bar" name="query" placeholder="검색어를 입력하세요." value=${searchQuery}>
	<input type="submit" class="search-button" value="Search" >
</form>
</div>`;
	var buttons = `
	<div id="button-view">
	  <div>
		<input class="handler" type="button" value="night" onclick="dayNightHandler(this)">
	  </div>
	  <div class="button-move">`;
	  var list = `
			<div class="list">
			  <ol>\n`;
	  db.query(`SELECT id, title FROM topic`, function(err, data){
		for(var i=1; i<data.length; i++){   // 0번은 홈이기 때문에
		  list += `			      <li><a href="/?id=${data[i].id}"`;
		  if (data[i].id === id){
			list += active;
			if(i > 1 && !option.authorPage){   // 버튼: 첫 번째 페이지가 아니면 - 이전 버튼 필요
				buttons += `
                            <div class="button-prev">
						      <button onclick="location.href='/?id=${data[i-1].id}'">Previous</button>
						    </div>`;
			} else {
				buttons += `<div class="button-prev"></div>`;
			}
			if (i < data.length-1 && !option.authorPage){    // 버튼: 마지막 페이지가 아니면 - 다음 버튼 필요
				buttons += `
	                       <div class="button-next">
							 <button onclick="location.href='/?id=${data[i+1].id}'">Next</button>
						   </div>`;
			}
		  }
		  list += `>${capitalize(data[i].title)}</a></li>\n`;
		}
		list += `\n			  </ol>
			</div>`;
		buttons += `</div>\n</div>\n`;
		callback(`${searchBar}${list}${buttons}`);
      })
    },
	
	TopicP: function(option, id, callback){
		if(option.authorPage){
			var active = '';
		} else {
			var active = ` id="active"`;
		}
		if(option.searchQuery === undefined){
			var searchQuery = '';
		} else {
			var searchQuery = option.searchQuery;
		}
		var searchBar = `<div class="search">
	<form action="search" method="get" class="search-form">
		<input type="text" class="search-bar" name="query" placeholder="검색어를 입력하세요." value=${searchQuery}>
		<input type="submit" class="search-button" value="Search" >
	</form>
	</div>`;
		var buttons = `
		<div id="button-view">
		  <div>
			<input class="handler" type="button" value="night" onclick="dayNightHandler(this)">
		  </div>
		  <div class="button-move">`;
		  var list = `
				<div class="list">
				  <ol>\n`;
		  db.query(`SELECT id, title FROM topic LIMIT ? OFFSET ?`, [topicPerPage, pageStart*10], function(err, data){
			for(var i=1; i<data.length; i++){   // 0번은 홈이기 때문에
			  list += `			      <li><a href="/?id=${data[i].id}"`;
			  if (data[i].id === id){
				list += active;
				if(i > 1 && !option.authorPage){   // 버튼: 첫 번째 페이지가 아니면 - 이전 버튼 필요
					buttons += `
								<div class="button-prev">
								  <button onclick="location.href='/?id=${data[i-1].id}'">Previous</button>
								</div>`;
				} else {
					buttons += `<div class="button-prev"></div>`;
				}
				if (i < data.length-1 && !option.authorPage){    // 버튼: 마지막 페이지가 아니면 - 다음 버튼 필요
					buttons += `
							   <div class="button-next">
								 <button onclick="location.href='/?id=${data[i+1].id}'">Next</button>
							   </div>`;
				}
			  }
			  list += `>${capitalize(data[i].title)}</a></li>\n`;
			}
			list += `\n			  </ol>
				</div>`;
			buttons += `</div>\n</div>\n`;
			callback(`${searchBar}${list}${buttons}`);
	});
	},
	
	Topic: function(option, id, callback){
	if(option.authorPage){
		var active = '';
	} else {
		var active = ` id="active"`;
	}
	if(option.searchQuery === undefined){
		var searchQuery = '';
	} else {
		var searchQuery = option.searchQuery;
	}
	if(!Number.isInteger(Number(option.topicPerPage))){
		option.topicPerPage = 15;
	}
	if(!Number.isInteger(Number(option.topicOffset))){
		option.topicOffset = 0;
	}
	if(['title-asc', 'title-desc', 'created-asc', 'created-desc'].includes(option.sortBy)){
		var sortBy = ' ORDER BY ' + option.sortBy.replace("-", " ");
	} else {
		var sortBy = ''; 
	}
	if(option.page !== 1){
		var pageNum = `&page=${option.page}`;
	} else {
		var pageNum = '';
	}
    var searchBar = `<div class="search">
<form action="search" method="get" class="search-form">
	<input type="text" class="search-bar" name="query" placeholder="검색어를 입력하세요." value=${searchQuery}>
	<input type="submit" class="search-button" value="Search" >
</form>
</div>`;
	var buttons = `
	<div id="button-view">
	  <div>
		<input class="handler" type="button" value="night" onclick="dayNightHandler(this)">
	  </div>
	  <div class="button-move">`;
	  var list = `
			<div class="list">
			  <ol start="${option.topicOffset+1}">\n`;
	  var query = `SELECT id, title FROM topic` + sortBy + ` LIMIT ? OFFSET ?`;
	  db.query(query, [option.topicPerPage, option.topicOffset+1],function(err, data){
		if (err) {
			throw err;
		}
		for(var i=0; i<data.length; i++){   // 0번은 홈이기 때문에
		  list += `			      <li><a href="/?id=${data[i].id}${pageNum}"`;
		  if (data[i].id === id){
			list += active;
		  };
		  list += `>${capitalize(data[i].title)}</a></li>\n`;
		}
		list += `\n			  </ol>
			</div>`;
		buttons += `</div>\n</div>\n`;
		var sortBar = module.exports.sortBar(option);
		page.topicPaging(option, function(paging){
			callback(`${searchBar}${sortBar}${buttons}${list}${paging}`);
		});
      })
	},
	
	sortBar: function(option){
		valid = ['title-asc', 'title-desc', 'created-asc', 'created-desc'];
		validValues = ['Title 오름차순', 'Title 내림차순', '작성일 오름차순', '작성일 내림차순'];
		var sortForm = `
					<form action="" method="get" class="sort-by">
						 <select name="sortBy">`;
		for(var i in valid){
		  if (valid[i] === option.sortBy){
			  sortForm += `
							   <option value="${valid[i]}" selected>${validValues[i]}</option>`
		  } else {
			  sortForm += `
							   <option value="${valid[i]}">${validValues[i]}</option>`
		  };
		};
        sortForm += `						 <select>
						 <input type="submit" value="확인" class="sort-button">
                     </form>`;
	    return sortForm;
	}
};

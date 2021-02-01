var db = require('../db');

var topicForm = function(arr, callback){
	var action = arr[0], id = arr[1], title = arr[2], logo = arr[3], industry = arr[4], founded = arr[5], founders = arr[6], revenue = arr[7], description = arr[8], select = arr[9];
	var topic = `<form action="${action}" method="post" class="form-post">
		  <p>
			<input type="hidden" name="id" value="${id}">
			<h5>Title</h5>
			<input type="text" name="title" placeholder="title" value="${title}">
		  </p>
		  <p>
			<h5>Logo URL</h5>
			<textarea name="logo" placeholder="logo" rows="1" cols="80">${logo}</textarea>
		  </p>
		  <p>
			<h5>Info</h5>
		  <ul>
			<li><h5>Industry</h5></li>
			  <textarea name="industry" placeholder="Industry" rows="2" cols="80">${industry}</textarea>
			<li><h5>founded</h5></li>
			  <textarea name="founded" placeholder="Founded" rows="2" cols="80">${founded}</textarea>
			<li><h5>founders</h5></li>
			  <textarea name="founders" placeholder="Founders" rows="2" cols="80">${founders}</textarea>
			<li><h5>Revenue</h5></li>
			  <textarea name="revenue" placeholder="Revenue" rows="2" cols="80">${revenue}</textarea>
		  </ul>
		  </p>
		  <p>
			<h5>Description</h5>
			<textarea name="description" rows="5" cols="80" placeholder="Description">${description}</textarea>
		  </p>
		  <p>
			<h5>Author</h5>
			  ${select}
		  </p>
		  <p>
			<input type="submit">
		  </p>
		</form>`;
		callback(topic);	
}

var authorForm = function(button, action, data, callback){
	var author = `
		<form action="${action}" method="post" class="form-post">
		  <p>
			<input type="hidden" name="id" value="${data.id}">
			<h5>Name</h5>
			<input type="text" name="name" placeholder="name" value="${data.name}">
		  </p>
		  <p>
			<h5>Profile</h5>
			<textarea name="profile" rows="5" cols="80" placeholder="profile">${data.profile}</textarea>
		  </p>
		  <p>
			<input type="submit", value="${button}">
		  </p>
		</form>`;
	callback(author);
}

var	byAuthor = function(data, callback){
    	var select = '<select name="author_id">\n';
		db.query('SELECT id, name FROM author', function(err, result){
			for(var i=0; i<result.length; i++){
			    if(data.author_id === result[i].id){
					select += ' selected';
				}
				select += `<option value=${result[i].id}>${result[i].name}</option>\n`;
				selected = '';
			}
		select += '</select>';
		callback(select);
		});
};

module.exports = {
	topicCreate: function(option, callback){
		var action = 'process_create';
		var input = [action].concat(Array(8).fill(''));
		byAuthor(action, function(select){
			input.push(select);
			topicForm(input, function(topic){
				callback(topic);
			});
		});
	},
		
	topicUpdate: function(option, id, result, callback){
		var action = "process_update";
		byAuthor(action, function(select){
			var input = [action, result.id, result.title, result.logo, result.industry, result.founded, result.founders, result.revenue, result.description, select];
			topicForm(input, function(topic){
				callback(topic);
			});
		});
	},

    authorCreate: function(callback){
		var button = 'Create';
		var action = 'process_create';
		var data = {id: '',
					name: '',
					profile: ''
				   };
		authorForm(button, action, data, function(author){
			callback(author);
		});	
	},
	
    authorUpdate: function(option, id, data, callback){
		var button = 'Update';
		var action = 'process_update';
		authorForm(button, action, data, function(author){
			callback(author);
		});
	}
}
var capitalize = function(str){
	return str.charAt(0).toUpperCase() + str.slice(1);
}

var Table = {
	new: function(){
		Table.thead();
		Table.tbody(0, 15);

	    function repeat(){
			setTimeout(function() {
				if (document.getElementById('author-loaded') === null && window.innerHeight === document.body.scrollHeight){
					repeat();
				} else {
					window.addEventListener("scroll", Table.add, {once: true});
					return 0;
				}
				Table.add();
			}, 500);
		};
		repeat();
	},
	add: function(){
		setTimeout(function(){
			if ((window.innerHeight + window.scrollY) - document.body.scrollHeight < 50) {
				var lastAuthor = document.getElementById('last-author');
				lastAuthor.removeAttribute('id');
				Table.tbody(lastAuthor.innerHTML, 10);
			}
			if (document.getElementById('author-loaded') === null){
				window.addEventListener("scroll", Table.add, {once: true});
			};
		}, 200);
	},
	thead: function(){
		var table = document.createElement('table');
		table.setAttribute('id', 'author-table');
		var idx = document.createElement('th');
		idx.setAttribute('class', 'table-idx');
		idx.innerHTML = '#';
		table.appendChild(idx);
		var thlist = ['Author', 'Profile', 'Update', 'Delete']
		for (var i in thlist){
			var cell = document.createElement('th');
			cell.innerHTML = thlist[i];
			table.appendChild(cell);
		}
		const div = document.createElement("div");
		div.setAttribute('class', 'author-edit-area');
		const create = document.createElement("button");
		create.innerHTML = "Create";
		create.setAttribute('class', 'button-edit');
		create.setAttribute('onclick', `EditForm.get({process: 'create'});`);
		div.appendChild(create);
		document.querySelector('.right').innerHTML = ``;
		document.querySelector('.right').appendChild(div);
		document.querySelector('.right').appendChild(table);
	},
	tbody: function(start, more){
		var table = document.getElementById('author-table');
		fetch(`author/view/${start}/${more}`).then(function(response){
			response.json().then(function(data){
				Table.loadedMSG(data.length < more);
				for (var i in data){
					if (data[i] === data[data.length-1]){
						var rowsFragment = Table.tr(start++, data[i], true);
					} else {
						var rowsFragment = Table.tr(start++, data[i], false);
					}
					table.appendChild(rowsFragment);
				};
			});
		});
	},
	tr: function(index, data, bool){
		const rowsFragment = document.createDocumentFragment();
		const row = document.createElement("tr");
		const cell1 = document.createElement("td");
		cell1.setAttribute('class', 'table-idx');
		if (bool) {
		cell1.setAttribute('id', 'last-author')
		};
		cell1.innerHTML = index+1;   // 보여지는 인덱스는 1부터 시작해야함
		const cell2 = document.createElement("td");
		cell2.innerHTML = data['name'];
		const cell3 = document.createElement("td");
		cell3.innerHTML = data['profile'];
		const cell4 = document.createElement("td");
		const button1 = document.createElement("button");
		button1.setAttribute('class', 'button-edit');
		button1.setAttribute('onclick', `Edit.update(${index})`);
		button1.innerHTML = 'Update';
		cell4.appendChild(button1);
		const cell5 = document.createElement("td");
		var deleteForm = EditForm.deleteForm(data['id']);
		cell5.appendChild(deleteForm);
		for (var cell of [cell1, cell2, cell3, cell4, cell5]){
		row.appendChild(cell);
		};
		rowsFragment.appendChild(row);
		return rowsFragment;
	},
	loadedMSG: function(bool){
		if(bool){
			if (!document.getElementById('author-loaded')){
				const loaded = document.createElement("p");
				loaded.innerHTML = '- All the data loaded -';
				loaded.setAttribute('id', 'author-loaded');
				document.querySelector('.right').appendChild(loaded);
			}
		}
	}
}

var FetchPost = {
/* REF https://dev.to/simonplend/how-to-use-fetch-to-post-form-data-as-json-to-your-api-2pih */
	handler: async function(event){
		event.preventDefault();  // 기본으로 실행되는 submit 액션 취소
		const form = event.currentTarget;  // 현재 다루고 있는 핸들대상, 이벤트 핸들러 안에서만 사용 가능하다, 내 경우에는 폼 객체!
		const url = form.action;   // 원래 폼이 보내는 URL
		try {
			const formData = new FormData(form);
			const responseData = await FetchPost.postFormDataAsJson({url, formData});
			FetchPost.completeMSG.get(responseData);
		} catch(err){
			console.error(err);
		}
	},
	postFormDataAsJson: async function({ url, formData }) {
		const plainFormData = Object.fromEntries(formData.entries());
		// .entries() Returns an iterator allowing to go through all key/value pairs contained in this object.
		const formDataJsonString = JSON.stringify(plainFormData);
		const fetchOptions = {
			method: "POST",  // 디폴트 메소드가 GET이라서 꼭 POST라고 명시가 필요함
			headers: {
				"Content-Type": "application/json",
				"Accept": "application/json"
			},
			body: formDataJsonString
		};

		const response = await fetch(url, fetchOptions);

		if (!response.ok) {
			const errorMessage = await response.text();
			throw new Error(errorMessage);
		}

		return response.json();
	},
	completeMSG: {
		get: function(responseData){
			const success = responseData.result;
			if (success) {
				Table.new();
			}
			var editErea = document.querySelector('.author-edit-area');
			if (document.querySelector('.insert-msg') === null){
				var msg = document.createElement("p");
				msg.setAttribute('class', 'insert-msg');
			} else {
				var msg = document.querySelector('.insert-msg');
			}
			const status = responseData.status;
			if (FetchPost.completeMSG.statusMSGs.hasOwnProperty(status)) {   // 메세지가 있는 프로퍼티면
				msg.innerHTML = FetchPost.completeMSG.statusMSGs[status];
			}
			FetchPost.completeMSG.colorTogle(msg, ['rgb(254, 231, 244)', 'rgb(240, 197, 211)']);
			editErea.appendChild(msg);
		},
		statusMSGs: {
			'created': 'Thank You. Your data has been processed successfully.',
			'updated': 'Thank You. Your data has been updated successfully.',
			'duplicated': 'Your Author name already exists ... ',
			'empty': 'Please type Author Name ... ',
			'deleted': 'Your data has been deleted successfully.'
		},
		colorTogle: function(msg, colors){
			if (msg.style.color === colors[0]){   // 색깔 토글
				msg.style.color = colors[1];
			} else {
				msg.style.color = colors[1];
			}
		}
	}
}

var Edit = {
	update: function(index){
		fetch(`author/view/${index}/1`).then(function(response){
			response.json().then(function(data){
				var option = Object.assign({process: 'update'}, data[0]);
				EditForm.get(option);
			});
		});
	},
	delete: async function(event){
		event.preventDefault();
		var answer = confirm('Do you want to delete this file?');
		if (answer){
			FetchPost.handler(event);
		}
	}
}

var EditForm = {
	get: function(option){
		document.querySelector('.author-edit-area').innerHTML = '';  // 편집영역 초기화
		const process = capitalize(option['process']) // capitalize
		var form = document.createElement("form");
		form.setAttribute("charset", "UTF-8");
		form.setAttribute("class", "author-form")
		form.setAttribute("method", "Post");
		form.setAttribute("action", '/author/' + option['process']);   // 전송할 url

		var list = document.createElement('ul');
		const li = document.createElement("li");   // hidden id값 입력
		const hidden = document.createElement("input");
		hidden.setAttribute("type", "hidden");
		hidden.setAttribute("name", "id");
		hidden.setAttribute("value", option['id']);
		li.appendChild(hidden);
		list.appendChild(li);
		if (process === 'Create') {    // Create면 빈 값
			list.appendChild(EditForm.input('Author', 'name', ''));
			list.appendChild(EditForm.input('Profile', 'profile', ''));
		} else {                       // Update면 해당 데이터
			list.appendChild(EditForm.input('Author', 'name', option['name']));
			list.appendChild(EditForm.input('Profile', 'profile', option['profile']));
		}
		const submit = document.createElement("input");
		submit.setAttribute("type", "submit");
		submit.setAttribute("value", process);
		submit.setAttribute("class", "button-edit");

		form.appendChild(list);
		form.appendChild(submit);
		var div = document.querySelector('.author-edit-area');
		form.addEventListener("submit", FetchPost.handler);
		div.appendChild(form);
	},
	input: function(text, name, value){
		const li = document.createElement("li");
		const label = document.createElement("label");
		label.innerHTML = text;
		const input = document.createElement("input");
		input.setAttribute("type", "text");
		input.setAttribute("name", name);
		input.setAttribute("value", value);
		li.appendChild(label);
		li.appendChild(input);
		return li;
	},
	deleteForm: function(id){
		var form = document.createElement("form");
		form.setAttribute("method", "Post");
		form.setAttribute("action", '/author/delete');
		const deleteID = document.createElement("input");
		deleteID.setAttribute("type", "hidden");
		deleteID.setAttribute("name", "id");
		deleteID.setAttribute("value", id);
		form.appendChild(deleteID);
		const submit = document.createElement("input");
		submit.setAttribute("value", 'Delete');
		submit.setAttribute('class', 'button-edit');
		submit.setAttribute("type", "submit");
		form.addEventListener("submit", Edit.delete);
		form.appendChild(submit);
		return form;
	}
}


async function reallyDelete(event){
	event.preventDefault();
	var answer = confirm('Do you want to delete this file?');
	if (answer){
		authorHandler(event);
	}
}

var loadAuthor = function (start){
	fetch(`author/view/${start}/1`).then(function(response){
		response.json().then(function(data){
			var option = {
				process: 'update',
				id: data[0]['id'],
				name: data[0]['name'],
				profile: data[0]['profile']
			}
			authorForm(option);
		});
	});
}

var completeMSG = function (responseData){
	const success = responseData.result;
	if (success) {
		authorPage();
	}
	var editErea = document.querySelector('.author-edit-area');
	if (document.querySelector('.insert-msg') === null){
		var msg = document.createElement("p");
		msg.setAttribute('class', 'insert-msg');
	} else {
		var msg = document.querySelector('.insert-msg');
	}
	const status = responseData.status;
	if (status === 'created') {
		const authorID = responseData.authorID;
		msg.innerHTML = 'Thank You. Your data has been processed successfully.';
	} else if (status === 'updated'){
		const authorID = responseData.authorID;
		msg.innerHTML = 'Thank You. Your data has been updated successfully.';
	} else if (status === 'duplicated'){
		msg.innerHTML = 'Your Author name already exists ... ';
	} else if (status === 'empty'){
		msg.innerHTML = 'Please type Author Name ... ';
	} else if (status === 'deleted'){
		msg.innerHTML = 'Your data has been deleted successfully.';
	}

	if (msg.style.color === 'rgb(254, 231, 244)'){
		msg.style.color = 'rgb(240, 197, 211)';
	} else {
		msg.style.color = 'rgb(254, 231, 244)';
	}

	editErea.appendChild(msg);
}

var home = function(){
	var content = `<p class="home">Hello world!</p>`;
	document.querySelector('.right').innerHTML = content;
	window.location.hash = '';
	onEdit('none');
	var current = document.getElementById("active");
	if (current !== null){
		current.removeAttribute('id');
	};
};

/* REF https://dev.to/simonplend/how-to-use-fetch-to-post-form-data-as-json-to-your-api-2pih */
async function authorHandler(event){
	event.preventDefault();  // 기본으로 실행되는 submit 액션 취소
	const form = event.currentTarget;  // 현재 다루고 있는 핸들대상, 이벤트 핸들러 안에서만 사용 가능하다, 내 경우에는 폼 객체!
	const url = form.action;   // 원래 폼이 보내는 URL
	try {
		const formData = new FormData(form);
		const responseData = await postFormDataAsJson({url, formData});
		completeMSG(responseData);
	} catch(err){
		console.error(err);
	}
}

/* REF https://dev.to/simonplend/how-to-use-fetch-to-post-form-data-as-json-to-your-api-2pih */

async function postFormDataAsJson({ url, formData }) {
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
}

var authorForm = function (option){
	document.querySelector('.author-edit-area').innerHTML = '';  // 편집영역 초기화
	const process = option['process'].charAt(0).toUpperCase() + option['process'].slice(1);  // capitalize
	if (option['process'] === 'create'){
		var texts = Array(2).fill('');
	} else if (option['process'] === 'update'){
		var texts = [option['name'], option['profile']];
	}
	var form = document.createElement("form");
	form.setAttribute("charset", "UTF-8");
	form.setAttribute("class", "author-form")
	form.setAttribute("method", "Post");
	form.setAttribute("action", '/author/' + option['process']);   // 전송할 url

	var list = document.createElement('ul');

	const li = document.createElement("li");   // hidden id값 입력
	const input = document.createElement("input");
	input.setAttribute("type", "hidden");
	input.setAttribute("name", "id");
	input.setAttribute("value", option['id']);
	li.appendChild(input);
	list.appendChild(li);

	var arr = ['Author', 'Profile']
	for (var item in arr){
		const li = document.createElement("li");
		const label = document.createElement("label");
		label.innerHTML = arr[item];
		const input = document.createElement("input");
		input.setAttribute("type", "text");
		input.setAttribute("name", arr[item]);
		input.setAttribute("value", texts[item]);   // 작업별 ipnut value 지정
		li.appendChild(label);
		li.appendChild(input);
		list.appendChild(li);
	};

	const submit = document.createElement("input");
	submit.setAttribute("type", "submit");
	submit.setAttribute("value", process);
	submit.setAttribute("class", "button-edit");
	form.appendChild(list);
	form.appendChild(submit);
	var div = document.querySelector('.author-edit-area');
	form.addEventListener("submit", authorHandler);
	div.appendChild(form);
}

var tableLayout = function (){
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
	create.setAttribute('onclick', `authorForm({process: 'create'});`);
	div.appendChild(create);
	document.querySelector('.right').innerHTML = ``;
	document.querySelector('.right').appendChild(div);
	document.querySelector('.right').appendChild(table);
	return table;
}

var authorPage = function(more){
	var loadDB = function (more, start) {
		if (start === 0){
			var table = tableLayout();
		} else {
			var table = document.getElementById('author-table');
		}
		fetch(`author/view/${start}/${more}`).then(function(response){
			response.json().then(function(data){
				for (var i in data){
					const rowsFragment = document.createDocumentFragment();
					const row = document.createElement("tr");
					const cell1 = document.createElement("td");
					cell1.setAttribute('class', 'table-idx');
					if (data[i] === data[data.length-1]){
						cell1.setAttribute('id', 'last-author')
					};
					cell1.innerHTML = ++start;
					const cell2 = document.createElement("td");
					cell2.innerHTML = data[i]['name'];
					const cell3 = document.createElement("td");
					cell3.innerHTML = data[i]['profile'];
					const cell4 = document.createElement("td");
					const button1 = document.createElement("button");
					button1.setAttribute('class', 'button-edit');
					button1.setAttribute('onclick', `loadAuthor(${start-1})`);
					button1.innerHTML = 'Update';
					cell4.appendChild(button1);

					const cell5 = document.createElement("td");
					var deleteForm = document.createElement("form");
					deleteForm.setAttribute("method", "Post");
					deleteForm.setAttribute("action", '/author/delete');
					const deleteID = document.createElement("input");
					deleteID.setAttribute("type", "hidden");
					deleteID.setAttribute("name", "id");
					deleteID.setAttribute("value", data[i]['id']);
					deleteForm.appendChild(deleteID);
					const deleteSubmit = document.createElement("input");
					deleteSubmit.setAttribute("value", 'Delete');
					deleteSubmit.setAttribute('class', 'button-edit');
					deleteSubmit.setAttribute("type", "submit");
					deleteForm.addEventListener("submit", reallyDelete);
					deleteForm.appendChild(deleteSubmit);
					cell5.appendChild(deleteForm);

					row.appendChild(cell1);
					row.appendChild(cell2);
					row.appendChild(cell3);
					row.appendChild(cell4);
					row.appendChild(cell5);
					rowsFragment.appendChild(row);
					table.appendChild(rowsFragment);
				};

				table.replaceWith(table);

				if (data.length < more){
					const loaded = document.createElement("p");
					loaded.innerHTML = '- All the data loaded -';
					loaded.setAttribute('class', 'loaded');
					document.querySelector('.right').appendChild(loaded);
				};
			});
		});
	}
	if (more === undefined){
		more = 15;
		var start = 0;
		return loadDB(more, start);
	} else {
		var lastAuthor = document.getElementById("last-author")
		if (lastAuthor === null){
			return false;
		} else {
			var start = lastAuthor.innerHTML;
			lastAuthor.removeAttribute("id");
			return loadDB(more, start);
		}
	};
}
window.onscroll = function() {
	if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
		if (document.querySelector('.loaded') === null){
			authorPage(10);
		}
	}
};
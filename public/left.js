
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

var activeRed = function(){
	var topics = document.querySelectorAll('.topic-item');
	for (var i = 0; i < topics.length; i++) {
	  topics[i].addEventListener("click", function() {
		var current = document.querySelector('#active');
		if (current !== null) {
			current.removeAttribute('id');
		}
		this.id = "active";
	  });
	} 
};

var findDataInNewSort = function(){
	var current = document.getElementById("active");
	if (current === null){
		current = 0;
	} else {
		current = current.innerHTML;
	}
	try {
		var sortBy = document.getElementById("sort").value;
	} catch {
		var sortBy = 'title-asc';
	};
	fetch('/get-id/' + current).then(function(response1){
		response1.json().then(function(data1){
			var id = data1[0]['id'];
			fetch('/rank/' + sortBy + '/' + String(id)).then(function(response2){
				response2.json().then(function(data2){
					var curPage = data2['curPage'];
					viewTopicNBar(curPage, id);
				});
			});
		});
	})
}

var viewTopicNBar = function(pageNum, id){
	if (id === undefined){
		id = 0;
	}
	if (pageNum === undefined){
		pageNum = 1;
	};
	try {
		var sortBy = document.getElementById("sort").value;
	} catch {
		var sortBy = 'title-asc';
	};
	fetch('/page/' + sortBy + '/' + String(pageNum)).then(function(response){
		response.json().then(function(data){
			var startTopic = (data['pageInfo']['curPage']-1)*15+1;
			var topicList = viewTopic(data['topicList'], startTopic, id);
			var pageInfo = viewPageBar(data['pageInfo']);
			document.querySelector('.topic-list').innerHTML = topicList;
			document.querySelector('.page-bar').innerHTML = pageInfo;
			activeRed();
		});
	});
}

var viewPageBar = function(pageData){
	var pageBar = '<div class="page-bar">';
	var pageCount = pageData['blockFirst'];
	if (pageData['curBlock'] > 1){  // 첫 페이지가 아니면
		pageBar += `<button class="button-page" onclick="viewTopicNBar(${pageCount-1})"><</button>`;
	}
	while (pageCount < pageData['blockLast']+1){
		if (pageCount === pageData['curPage']){  // 현재 페이지인 경우
			pageBar += `<button class="button-page" onclick="viewTopicNBar(${pageCount})" id="current-page">${pageCount}</button>`;
		} else {
			pageBar += `<button class="button-page" onclick="viewTopicNBar(${pageCount})">${pageCount}</button>`;
		}
		pageCount++;
	}
	if (pageData['curBlock'] < pageData['totalBlock']){  // 마지막 페이지가 아니면
		pageBar += `<button class="button-page" onclick="viewTopicNBar(${pageCount+1})">></button>`;
	}
	pageBar += '</div>'
	return pageBar;
};

var viewTopic = function(topicData, startTopic, id){
	var content = `<ol start=${startTopic}>`;
	for (var j in topicData){
		var topic = topicData[j];
		if ((id === 0 && Number(j) === 0) || (topic['id'] === id)){
			content += `<li><a id="active" class="topic-item" href="#!${topic['title']}" onclick="viewContent(${topic['id']});">${topic['title']}</a></li>`;
			if (id === 0){
				viewContent(topic.id);
				window.location.hash = "!" + topic.title;
			}
		} else {
			content += `<li><a class="topic-item" href="#!${topic['title']}" onclick="viewContent(${topic['id']});">${topic['title']}</a></li>`;
		}
	}
	content += `</ol>`;
	return content;
};

window.addEventListener("load", viewTopicNBar());
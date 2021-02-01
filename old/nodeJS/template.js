var fs = require('fs');
module.exports = {          // import를 위 객체에 할당
  capitalize: function(string){
    return string.charAt(0).toUpperCase() + string.slice(1);
  },
  getMenu: function(title, companies){    // 오른쪽 상단 메뉴리스트 바 출력
    menu =`<div>
            <nav class="menu">
              <ul>
                <li><a href="/"`
    if(title === 'home'){
      menu = menu + ` id=active`       // active는 메뉴상에서 red 처리
    };
    menu = menu + `>Home</a></li>
                <li><a href="/create" class="edits"`;
    if(title === 'create'){
      menu = menu + ` id=active`
    };
    menu = menu + `>Create</a></li>`
    if(['create', 'home', 'update', 'delete'].indexOf(title) < 0){
      menu = menu + `<li><a href="/update?id=${title}" class="edits">Update</a></li>
      <li><form action="process_delete" method="post" onsubmit="">
        <input type="hidden" name="id" value="${title}">
        <input type="submit" value="Delete" class="edits">
      </form></li>`;
    }
    menu = menu + `</ul>
            </nav>
          </div>
                 <div class="list">
                  <ol>`;
    for (var com of companies){
      menu = menu + `
      <li><a href="/?id=${com}"
      `
      if(title === com){
        menu = menu + ` id="active"` // active는 메뉴상에서 red처리
      }
      menu = menu + ``

      menu = menu + `><strong>${com.charAt(0).toUpperCase()}</strong></strong>${com.slice(1)}</a></li>`
      };
    menu = menu + `
                  </ol>
                </div>`
    return menu;
  },
  getContent: function(title, data){
    var capTitle = this.capitalize(title);
    function getInfo(infoList){
      var result = '<ul>';
      for (var key in infoList){
        result = result + `<li><strong>${key}:</strong> ${infoList[key]}</li>`
      };
      result = result + '</ul>';
      return result
    };

    var logo = data.logo;
    if (data.logosize !== undefined){
      var logosize = data.logosize;
    } else {
      var logosize = '';
    }
    var description = data.description;

    if(title === 'home'){
      return `      <div class="right">
          <div class="comlogo">
            <img src="${logo} ${logosize}">
          </div>
          <p>
            ${description}
          </p>
        </div>`
    } else {
      if (typeof(data.info) === typeof({})){
        var infoList = data.info;
        var info = getInfo(infoList);
      } else if (typeof(JSON.parse(data.info)) === typeof({})){
        var infoList = JSON.parse(data.info);
        var info = getInfo(infoList);
      } else {
        var info = data.info;
      }
      return `      <div class="right">
          <div class="comlogo">
            <img class="logo" src="${logo}">
          </div>
          <h2>${capTitle}</h2>
          <h4>Company Info</h4>
            ${info}
          <p>
            <span style="color:red;">${capTitle}</span>, ${description}
          </p>
        </div>`
    };
  },
  getButton: function(title, dataList){
    var i = dataList.indexOf(title);
    var result = `
    <div id="buttons">
    <div>
      <input class="handler" type="button" value="night" onclick="
      dayNightHandler(this)
      ">
    </div>
    <div class="buttons">
    `
    if(i > 0){
      var b1 = `<div class="button1"><button onclick="location.href='/?id=${dataList[i-1]}'">Previous</button></div>
      `;
    } else {
      var b1 = '<div class="button1"></div>';
    };
    if(0 <= i && i < dataList.length-1){
      var b2 = `<div class="button2"><button onclick="location.href='/?id=${dataList[i+1]}'">Next</button></div>
      `;
    } else {
      var b2 = '<div class="button2"></div>'
    };
    return result + b1 + b2 + `</div>
       </div>`;
  },
  getBody: function(pageTitle, pageHeading, menu, button, content){
    return `
    <!doctype html>
    <html>
      <head>
        <link rel='icon' href='data:,'>
        <meta charset="utf-8">
        <link rel="stylesheet" type="text/css" href="./public/style.css">
          ${pageTitle}
        <script src="./public/dayNightButton.js"></script>
      </head>
      <body>
        ${pageHeading}
        <div id="maindiv">
          <div class="left">
            <div id="left-top">
              ${menu}
            </div>
             ${button}
          </div>
        ${content}
    </html>
    `
  },
  getForm: function(data){
    var data_title = '';
    var data_logo = '';
    var data_info = '';
    var data_desc = '';
    var hidden = '';
    var action = '/process_create';

    if (data !== ''){
      data_title = ` value="${data.title}"`;
      data_logo = `${data.logo}`;
      data_info = `${JSON.stringify(data.info)}`;
      data_desc = `${data.description}`;
      hidden = `<input type="hidden" name="id" value="${data.title}">`
      action = `/process_update`;
    }
    return `
    <form action="` + action +`" method="post" id="postform">
      <p>` + hidden + `
        <h5>Title</h5>
        <input type="text" name="title" placeholder="title"` + data_title + `></p>
      <p>
        <h5>Logo URL</h6>
        <textarea name="logo" placeholder="logo" rows="1" cols="80">` + data_logo + `</textarea>
      </p>
      <p>
        <h5>Info</h6>
        <textarea name="info" placeholder="info" rows="3" cols="80">` + data_info + `</textarea>
      </p>
      <p>
        <h5>Description</h6>
        <textarea name="description" rows="5" cols="80" placeholder="description">` + data_desc + `</textarea>
      </p>
      <p>
        <input type="submit">
      </p>
    </form>
    `;
  },
  get: function(title, filePath, dataList){
    var capTitle = this.capitalize(title);
    var button = this.getButton(title, dataList);
    if (title === 'create'){ // create 페이지
      var content = this.getForm('');
    } else { // 본문 있는 페이지
      var dataBuffer = fs.readFileSync(filePath);
      var dataJSON = dataBuffer.toString();
      var data = JSON.parse(dataJSON);
      var content = this.getContent(title, data);
      if (title === 'update'){
        content = this.getForm(data);
      };
    }
    var pageTitle = `<title>Big ${dataList.length} Tech - ${capTitle}</title>`;
    var pageHeading = `<h1>Big ${dataList.length} Tech Companies</h1>`;
    var menu = this.getMenu(title, dataList);

    var body = this.getBody(pageTitle, pageHeading, menu, button, content);
    return body;
  }
};

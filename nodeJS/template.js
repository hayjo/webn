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
                <li>Contact</li>
              </ul>
            </nav>
          </div>
                 <div class="list">
                  <ol>`;
    for (var com of companies){
      menu = menu + `
      <li><a href="?id=${com}"
      `
      console.log(com, title);
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
  getContent: function(capTitle, data){
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

    if(capTitle === 'Home'){
      return `      <div class="right">
          <div class="comlogo">
            <img src="${logo} ${logosize}">
          </div>
          <p>
            ${description}
          </p>
        </div>`
    } else {
      var infoList = data.info;
      var info = getInfo(infoList);
      return `      <div class="right">
          <div class="comlogo">
            <img src="${logo}">
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
      var b1 = `<div class="button1"><button onclick="location.href='?id=${dataList[i-1]}'">Previous</button></div>
      `;
    } else {
      var b1 = '<div class="button1"></div>';
    };
    if(i < dataList.length-1){
      var b2 = `<div class="button2"><button onclick="location.href='?id=${dataList[i+1]}'">Next</button></div>
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
  get: function(title, filePath, dataList){
    var dataBuffer = fs.readFileSync(filePath);
    var dataJSON = dataBuffer.toString();
    var data = JSON.parse(dataJSON)
    var capTitle = this.capitalize(title);

    var pageTitle = `<title>Big ${dataList.length} Tech - ${capTitle}</title>`;
    var pageHeading = `<h1>Big ${dataList.length} Tech Companies</h1>`;
    var menu = this.getMenu(title, dataList);
    var button = this.getButton(title, dataList);
    var content = this.getContent(capTitle, data);

    var body = this.getBody(pageTitle, pageHeading, menu, button, content);
    return body;
  }
};

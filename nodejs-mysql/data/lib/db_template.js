var mysql      = require('mysql');
// 비밀번호는 별도의 파일로 분리해서 버전관리에 포함시키지 않아야 합니다. 
var db = mysql.createConnection({
  host     : '',
  user     : '',
  password : '',
  database : ''
});
  
db.connect();
module.exports = db;


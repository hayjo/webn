var db = require('../db');

module.exports = {
	getButton: function(option, pageNum, curBlock, totalBlock, pagePerBlock, lastPage){
		var buttons = `<div class="page">
`;
		var blockFirst = (curBlock-1)*pagePerBlock+1;
		var blockLast = curBlock*pagePerBlock;
		if (option.sortBy){
			var sortBy = `&sortBy=${option.sortBy}`;
		} else {
			var sortBy = '';
		}
		if (blockLast > lastPage){
			blockLast = lastPage;
		}
		if (curBlock > 1){
			buttons += `        <button class="button-page" onclick="location.href='/?page=${blockFirst-1}${sortBy}'"><</button>`;
		}
		for (var i = blockFirst; i < blockLast+1;i++){
			if ( i === pageNum){   // active 설정용
				buttons += `
        <button class="button-page" id="page-active">${i}</button>`;
            } else {
				buttons += `
        <button class="button-page" onclick="location.href='/?page=${i}${sortBy}'">${i}</button>`;
			};
		};
		if (curBlock < totalBlock){
			buttons += `
        <button class="button-page" onclick="location.href='/?page=${blockLast+1}${sortBy}'">></button>`;
		}
		buttons += `\n</div>`
		return buttons;
	},
	
	topicPaging: function(option, callback){
		var pageNum = option.page;
		if (!Boolean(pageNum)){
			pageNum = 1;
		}
		var pagePerBlock = option.pagePerBlock;
		if (!Boolean(pagePerBlock)){
			pagePerBlock = 10;
		};
		var topicPerPage = option.topicPerPage;
		if (!Boolean(topicPerPage)){
			topicPerPage = 15;
		};
		db.query(`SELECT COUNT(*) as count FROM topic`, function(err, result){
			var count = result[0].count;
			var lastPage = Math.ceil(count/topicPerPage);
			var totalBlock = Math.ceil(lastPage/pagePerBlock);
			var curBlock = Math.ceil(pageNum/pagePerBlock);
			if (curBlock > totalBlock){
				curBlock = totalBlock;
			} else if (curBlock < 1){
				curBlock = 1;
			}
			var button = module.exports.getButton(option, pageNum, curBlock, totalBlock, pagePerBlock, lastPage);
			callback(button);
		});

	}
};
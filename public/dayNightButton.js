var Body = {
  setColor:function(color){
    document.querySelector('body').style.color = color;
  },
  setBackGroundColor:function(color){
    document.querySelector('body').style.backgroundColor = color;
  }
};
var links = {
  setColor:function(color){
    var i = 0;
    linklist = document.querySelectorAll('a');
    while(i<linklist.length){
    linklist[i].style.color = color
    i = i + 1;
    }
  }
};
var Active = {
  setColor:function(color){
    document.querySelector('#active').style.color = color;
  }
};
var Handler = {
  setColor:function(color){
    document.querySelector('.handler').style.color = color;
  },
  setBackGroundColor:function(color){
    document.querySelector('.handler').style.backgroundColor = color;
  }
};
function dayNightHandler(self){
  if(self.value === 'night') {
    Body.setColor('white');   // 기존에 document.querySelector로 지정하던 부분을
    Body.setBackGroundColor('black');  // Body 객체와 메소드로 치환
    self.value = 'day';
    /// 야간모드일때는 link 태그의 배경색을 바꿔보자
    links.setColor('powderblue');  // link 태그에 대해서도 마찬가지로 교체
    Active.setColor('pink');
    Handler.setColor('black');
    Handler.setBackGroundColor('white');
  } else {
    Body.setColor('black');
    Body.setBackGroundColor('white');
    self.value = 'night';
    links.setColor('blue');
    Active.setColor('red');
    Handler.setColor('white');
    Handler.setBackGroundColor('black');
  }
};

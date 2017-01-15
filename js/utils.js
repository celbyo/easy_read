/*
	工具函数1 trim(str): 去除字符串两端的空格 
*/
function trim(str){
	return str.replace(/(^\s*)|(\s*$)/g,"");
}
/*
	工具函数2 getJSON(url,cb): ajax get方法封装 
*/
function getJSON(url,cb){
	var xhr = new XMLHttpRequest();
	xhr.open("GET",url);
	xhr.onreadystatechange = function(){
		if(xhr.readyState === 4 && xhr.status === 200){
			var json = JSON.parse(xhr.response);
			cb(json);
		}
	}
	xhr.send(null);
}
/*
	工具函数3 getInner():  获取视口大小
*/
function getInner(){                  
	if(typeof window.innerWidth!='undefined'){
		return  {
					width:window.innerWidth,
					height:window.innerHeight
				};
	}else{
		return  {
					width:document.documentElement.clientWidth,
					height:document.documentElement.clientHeight
				};
	}
}
/*
	工具函数4 getOuterHeight():  获取元素高度+margin
*/
function getOuterHeight(ele){
	var style = {};
	if(typeof window.getComputedStyle!='undefined'){            //W3C
		style = window.getComputedStyle(ele,null);
	}else if(typeof ele.currentStyle!='undefined'){             //IE
		style = ele.currentStyle;
	}
	return parseFloat(style["marginTop"])+parseFloat(style["marginBottom"])+ele.offsetHeight;
}
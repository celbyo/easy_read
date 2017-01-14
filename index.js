(function plugin (){

var baseUrl = "https://api.shanbay.com/bdc/search/?word=",
	hornUrl = "img/audio.png";

var Dom = {
	body: document.body,
	article: document.getElementsByTagName("article")[0]
};

/*js创建元素id*/
var articleContainerId = "plugin_articleContainer",
	articleViewId = "plugin_articleView",
	vocCardId = "plugin_vocCard";

var ads = {
	rmEle:["ad-slot-container","js-secondary-column","js-sport-tabs","element-rich-link","ad-slot","after-article","submeta","js-content-meta","content__labels","ad_unit","selection-sharing","kxhead","overlay"],
	rmClass:["js-article__body","js-content-main-column","js-secondary-column"]
}; 

var pagesTotal = 0,      //分页总数
	curPage = 0;         //当前页码 [0,pagesTotal)
var viewH = 0;           //文档可视区域高度

/*
	removeAllChild(node): 删除某个节点下所有子节点
*/
function removeAllChild(node){
	while(node.hasChildNodes()){
		node.removeChild(node.firstChild);
	}
}

/*
	removeClassName(ele,className): 删除节点ele的某个className
*/
function removeClassName(ele,className){
	var reg = new RegExp("(^|\\s)"+className+"(\\s|$)","g");
	ele.className = ele.className.replace(reg,'');
}

/*
	removeSpecialChild(className,parentNode): 删除指定className的节点
*/
function removeSpecialChild(className,parentNode){
	parentNode = parentNode ? parentNode : document;
	var eles = parentNode.getElementsByClassName(className);
	for(var i=0; i<eles.length; i++){
		eles[i].parentNode.removeChild(eles[i]);
	}
}

/*
	addPageBtn(): 添加翻页按钮,此处为select元素,点击不同option,进入不同的分页
*/
function addPageBtn(){
	var pageBtn = document.createElement("select");
	pageBtn.id = "plugin_pageBtn";
	var contentH = Dom.article.offsetHeight;
	viewH = document.getElementById(articleViewId).clientHeight;

	pagesTotal = Math.ceil(contentH/viewH);
	for(var i=0;i<pagesTotal;i++){
		pageBtn.options.add(new Option("Page "+(i+1),i));
	}
	var articleContainer = document.getElementById(articleContainerId);
	articleContainer.appendChild(pageBtn);
	pageBtn.addEventListener('click',goPage,false);
}

/*
	goPage(): 页面跳转
*/
function goPage(e){
	if(curPage !== e.target.selectedIndex){
		curPage = e.target.selectedIndex;
		Dom.article.style.marginTop =  -curPage*viewH + "px";
	}
}

/*
	transSelected(e): 获取选中单词，并且请求查词
*/
function transSelected(e){
	var oSelection = document.getSelection();
	var quertWord = trim(oSelection.toString());
	if(quertWord===""||oSelection.isCollapsed){
		return null;
	}
	var url = baseUrl+encodeURIComponent(quertWord);
	getJSON(url,function (json){
		fillVocCard(json);
		layoutVocCard(e);
	});
}

/*
	fillVocCard(json): 根据返回的json数据填充单词卡 
*/
function fillVocCard(json){
	var vocCard = document.getElementById(vocCardId);
	if(!vocCard){
		vocCard = createVocCard();
	}
	var queryWord = document.getElementById("plugin_word"),
	    pron = document.getElementById("plugin_pron"),
		img = document.getElementById("plugin_horn"),
	    audio = document.getElementById("plugin_audio"),
	    cn_trans = document.getElementById("plugin_cn_trans");
	// status_code不为0,为异常状态
	if(json.status_code!==0){
		queryWord.innerHTML = "";
		pron.innerHTML = "";
		img.style.display = "none";
		cn_trans.innerHTML = json.msg;
		return null;
	}
	// status_code = 0, 查询成功
	var voc = {
		content: json.data.content,
		pron: json.data.pronunciations.us,
		audio: json.data.audio_addresses.us[0],
		cn_trans: json.data.cn_definition.defn,
		has_audio: json.data.has_audio
	};
	//单词
	queryWord.innerHTML=voc.content;
	//音标
	if(voc.pron.length > 0){          
		if(voc.content.length > 15)
			pron.innerHTML = '<br />[' + voc.pron + ']';
		else
		    pron.innerHTML = '[' + voc.pron + '] ';
	}else{
		pron.innerHTML = "";
	}
	//读音
	if (voc.has_audio&&voc.audio.length != 0) {
		img.style.display = "inline-block";
		audio.setAttribute('src', voc.audio);
	}else{
		img.style.display = "none";
	}
	//中文翻译,将\n替换成<br>换行标签
	cn_trans.innerHTML = voc.cn_trans.replace(/\n/g,"<br>");
}

/*
	createVocCard(): 单词卡区域初始化,并且返回单词卡片元素
*/
function createVocCard(){
	var vocCard = document.createElement("div");
	vocCard.id = vocCardId;
	Dom.body.appendChild(vocCard);
	vocCard.innerHTML = "<span id='plugin_word'></span>"+
						"<span id='plugin_pron'></span>"+
						"<span id='plugin_sound'></span>"+
						"<div id='plugin_cn_trans'></div>";
	var img = document.createElement("img");
    var img_url = chrome.extension.getURL(hornUrl);
    img.setAttribute("src", img_url);
    img.setAttribute("id", "plugin_horn");
	img.setAttribute("alt", "horn");
	var sound = document.getElementById("plugin_sound");
    sound.appendChild(img);
    var audio = document.createElement("audio");
    audio.setAttribute("id", "plugin_audio");
	//audio.setAttribute('autoplay', 'true');
	sound.appendChild(audio);
	img.addEventListener('click',function(){
		audio.play();
	},false);
	return vocCard;
}

/*
	layoutVocCard(): 计算单词卡片显示位置，并显示
*/
function layoutVocCard(e){
	var x = e.pageX,
		y = e.pageY;
	var halfLineH = 0.5*parseInt(window.getComputedStyle(e.target).getPropertyValue("line-height"));
	halfLineH = Math.ceil(halfLineH);
	var viewWidth = getInner().width,
		viewHeight = getInner().height;
	var vocCard = document.getElementById(vocCardId);
	var vocCardW = vocCard.offsetWidth,
		vocCardH = vocCard.offsetHeight;
	var offsetTop = y,offsetLeft = x;
	if(vocCardH + y + halfLineH > viewHeight){
		offsetTop = y - vocCardH - halfLineH;
	}else{
		offsetTop +=  halfLineH;
	}
	if(vocCardW + x > viewWidth){
		offsetLeft = x - vocCardW;
	}
	vocCard.style.left = offsetLeft + 'px';
	vocCard.style.top = offsetTop + 'px';	
	vocCard.style.display = "block";
}

/*
	hideVocCard(): 点击卡片以外的区域隐藏单词卡
*/
function hideVocCard(){
	document.addEventListener("click",function (e){
		var vocCard = document.getElementById(vocCardId);
		var index = -1;
		if(vocCard&&vocCard.style.display!=="none"){
			index = e.path.indexOf(vocCard);
			if(index===-1){
				vocCard.style.display = "none";
			}
		}
	},false);
}

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
	filterPage():页面过滤功能
*/
function filterPage(){
	// 清除body下所有子节点,只保留article区
	removeAllChild(Dom.body);
	// 在article外面包两层div. 第一层div为容器,包含article以及翻页区域;第二层为视图层,规定可视区大小
	var articleContainer = document.createElement("div");
	articleContainer.id = articleContainerId;
	Dom.body.appendChild(articleContainer);
	var articleView = document.createElement('div');
	articleView.id = articleViewId;
	articleContainer.appendChild(articleView);
	articleView.appendChild(Dom.article);
	// 广告过滤
	for(var i=0; i<ads.rmEle.length; i++){
		removeSpecialChild(ads.rmEle[i],Dom.body);
	}
	var eles = {};
	for(i=0; i<ads.rmClass.length; i++){
		eles = document.getElementsByClassName(ads.rmClass[i]);
		for(var j=0; j<eles.length; j++){
			removeClassName(eles[j],ads.rmClass[i]);
		}
	}
}

/*
	autoPage(): 页面分页功能
*/
function autoPage(){
	addPageBtn();
}

/*
	selectTrans(): 划词查询
*/
function selectTrans(){
	Dom.article.addEventListener("mouseup",transSelected,false);
}

/*
	主程序入口 main()
 */	
function main(){
	filterPage();
	autoPage();
	selectTrans();
	hideVocCard();
	window.addEventListener('load',function(){
		var fb = document.getElementsByClassName("selection-sharing");
		if(fb){
			fb[0].parentNode.removeChild(fb[0]);
		}
		var frames = document.getElementsByTagName("iframe");
		for(var i=0; i<frames.length; i++){
			frames[i].parentNode.removeChild(frames[i]);
		}
	});
	console.log("document_end");
	document.addEventListener("DOMContentLoaded",function(){
		console.log("DOMContentLoaded");
	},false);
}

/*
	代码执行
 */
main();

})();
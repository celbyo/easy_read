(function plugin (){

var baseUrl = "https://api.shanbay.com/bdc/search/?word=",
	hornUrl = "img/audio.png",
	Dom = {
		body: document.body,
		article: document.getElementsByTagName("article")[0]
	},
// js创建元素id
    articleContainerId = "plugin_articleContainer",
	articleViewId = "plugin_articleView",
	vocCardId = "plugin_vocCard",
	ads = {
		rmEle: ["content__labels","content__secondary-column","js-content-meta","element-rich-link","submeta","after-article","js-sport-tabs","js-ad-slot","ad_unit"],
		rmClass:["js-article__body","js-content-main-column","js-secondary-column"]
	},
	pagesTotal = 0,      //分页总数
	curPage = -1,        //当前页码 [0,pagesTotal)
    viewH = 0;           //文档可视区域高度

//var pageEle = [];

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
	var len = eles.length;
	for(var i=0; i<len; i++){
		eles[0].parentNode.removeChild(eles[0]);       //注意这里一定不能是eles[i],因为getElemensBy是动态的
	}
}

/*
	filterInnerAds(): 删除内嵌的div广告
*/
function filterInnerAds(){
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
	filteriframeAds(): 隐藏iframe广告
*/
function filteriframeAds(){
	var iframes = document.getElementsByTagName("iframe");
	for(var i=0; i<iframes.length; i++){
		iframes[i].style.width = 0;
	}
}


// /*
//     思路1: 根据article的子元素高度进行计算,分页
// 	splitPage: 根据文章结构去计算,每页放置哪些dom,并且存储到pageEle中,方便分页显示调用
// */
// function splitPage(){
// 	viewH = document.getElementById(articleViewId).clientHeight;
// 	var oHeader = document.getElementsByClassName("content__head")[0];
// 	var i = 0,
// 		tmpH = 0,
// 		nodeH = 0;
// 	pageEle[i] = [oHeader];
// 	nodeH = getOuterHeight(oHeader);
// 	tmpH += nodeH;
// 	var oContent = document.getElementsByClassName("media-primary")[0];
// 	nodeH = getOuterHeight(oContent);
// 	tmpH += nodeH;
// 	if(tmpH>viewH){
// 		pageEle[++i] = [oContent];
// 		tmpH = nodeH;
// 	}
// 	var node =  document.getElementsByClassName("content__article-body")[0].firstChild;
// 	while(node){
// 		if(node.nodeType!==1){
// 			node = node.nextSibling;
// 			continue;
// 		}
// 		nodeH = getOuterHeight(node);
// 		tmpH += nodeH;
// 		if(tmpH <= viewH){
// 			pageEle[i].push(node);
// 			node = node.nextSibling;
// 		}else{
// 			pageEle[++i] = [node];
// 			tmpH = nodeH;
// 			node = node.nextSibling;
// 		}
// 	}
// 	pagesTotal = i+1;
// }
// /*
// 	goPage(): 页面跳转
// */
// function goPage(index){
// 	var display = "";
// 	if(curPage !== index){
// 		curPage = index;
// 		for(var i=0;i<pageEle.length;i++){
// 			if(i===curPage){
// 				display = "block";
// 			}else{
// 				display = "none";
// 			}
// 			for(var j=0;j<pageEle[i].length;j++){
// 				pageEle[i][j].style.display = display;
// 			}
// 		}
// 	}
// }

/*
    思路2：给Article包裹一层视图容器,限定可视高度,通过改变marginTop实现翻页
	addPageBtn(): 添加翻页按钮,此处为select元素,点击不同option,进入不同的分页
*/
function calcPage(){
	var contentH = Dom.article.offsetHeight;
	viewH = document.getElementById(articleViewId).clientHeight;
	pagesTotal = Math.ceil(contentH/viewH);
}
/*
	goPage(): 页面跳转
*/
function goPage(index){
	if(curPage !== index){
		curPage = index;
		Dom.article.style.marginTop =  -curPage*viewH + "px";
	}
}

/*
	addPageBtn(): 添加翻页按钮,按钮为select元素,option为页码
*/
function addPageBtn(){
	var pageBtn = document.createElement("select");
	pageBtn.id = "plugin_pageBtn";
	for(var i=0;i<pagesTotal;i++){
		pageBtn.options.add(new Option("Page "+(i+1),i));
	}
	var articleContainer = document.getElementById(articleContainerId);
	articleContainer.appendChild(pageBtn);
	pageBtn.addEventListener('click',function(e){
		goPage(e.target.selectedIndex);
	},false);
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
	var vocCard = document.getElementById(vocCardId),
	    voc = {};
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
	voc = {
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
	//中文翻译,将\n替换成<br />换行标签
	cn_trans.innerHTML = voc.cn_trans.replace(/\n/g,"<br />");
}

/*
	createVocCard(): 单词卡区域初始化,并且返回单词卡片元素
*/
function createVocCard(){
	//卡片容器
	var vocCard = document.createElement("div");
	vocCard.id = vocCardId;
	Dom.body.appendChild(vocCard);
	vocCard.innerHTML = "<span id='plugin_word'></span>"+
						"<span id='plugin_pron'></span>"+
						"<span id='plugin_sound'></span>"+
						"<div id='plugin_cn_trans'></div>";
	//喇叭图标
	var img = document.createElement("img"),
        img_url = chrome.extension.getURL(hornUrl);
    img.setAttribute("src", img_url);
    img.setAttribute("id", "plugin_horn");
	img.setAttribute("alt", "horn");
	img.style.cursor = "pointer"; 
	var sound = document.getElementById("plugin_sound");
    sound.appendChild(img);
    //读音音频,audio元素
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
	layoutVocCard(): 计算单词卡片显示位置,并显示.以鼠标点为(0,0),右下方区域显示,如果显示不下,自动调节。
*/
function layoutVocCard(e){
	var vocCard = document.getElementById(vocCardId);
	vocCard.style.display = "block";
	var x = e.pageX,
		y = e.pageY,
	    halfLineH = 0.5*parseInt(window.getComputedStyle(e.target).getPropertyValue("line-height")),
	    viewWidth = getInner().width,
		viewHeight = getInner().height,
		vocCardW = vocCard.offsetWidth,
		vocCardH = vocCard.offsetHeight,
		offsetTop = y,
		offsetLeft = x;
	halfLineH = Math.ceil(halfLineH);
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
}

/*
	hideVocCard(): 点击卡片以外的区域隐藏单词卡
*/
function hideVocCard(){
	document.addEventListener("click",function (e){
		var vocCard = document.getElementById(vocCardId),
		    index = -1;
		if(vocCard&&vocCard.style.display!=="none"){
			index = e.path.indexOf(vocCard);
			if(index===-1){
				vocCard.style.display = "none";
			}
		}
	},false);
}

/*
	filterPage():页面过滤功能
*/
function filterPage(){
	// 清除body下所有子节点,只保留article区
	removeAllChild(Dom.body);
	// 在article外面包两层div. 第一层div为容器,包含article以及翻页区域;第二层为视图层,规定可视区大小
	var articleContainer = document.createElement("div"),
	    articleView = document.createElement('div');
	articleContainer.id = articleContainerId;
	Dom.body.appendChild(articleContainer);
	articleView.id = articleViewId;
	articleContainer.appendChild(articleView);
	articleView.appendChild(Dom.article);
	// 广告过滤
	filterInnerAds();
}

/*
	autoPage(): 页面分页功能
*/
function autoPage(){
	calcPage();
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
		filteriframeAds();
		// 去除fb分享
		var fb = document.getElementsByClassName("selection-sharing")[0];
		if(fb){
			fb.parentNode.removeChild(fb);
		}
	});
}

/*
	代码执行
 */
main();

})();
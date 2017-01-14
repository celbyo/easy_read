(function (){
	var Dom = {
		body: document.body,
		article: document.querySelector("article"),
		panel: document.createElement("div"),
		view: document.createElement("div"),
		pageBtn: document.createElement("select")
	};
	var pageCont = [];
	var pageCount = 0; 
	var ads = {
		clsName:["ad-slot-container","js-secondary-column","js-sport-tabs","content__article-body aside","ad-slot","after-article","submeta","js-content-meta","content__labels"],
		jsClass:["js-article__body","js-content-main-column","js-secondary-column","kxhead"]
	};
	
/**************** 页面清洁 - START ****************/

	//清除某个节点下的所有子节点
	function removeAllChild(ele){
		while(ele.hasChildNodes()){
			ele.removeChild(ele.firstChild);
		}
	}

	//清除某个元素中指定className
	function removeClass(ele,className){
		var match = new RegExp('(^|\\s)'+className+'($|\\s)');
		ele.className = ele.className.replace(match,"");
	}

	//把 article 添加到 body 中
	function filterArticle(){
		removeAllChild(Dom.body);
		Dom.panel.id = "articlePanel";
		Dom.view.id = "articleView";
		Dom.view.appendChild(Dom.article);
		Dom.panel.appendChild(Dom.view);
		Dom.body.appendChild(Dom.panel);
	}

	//清除广告
	function clearAds(){
		//按 className 清除
		for(var i=0;i<ads.clsName.length;i++){
			var adsEle = document.querySelectorAll('.'+ads.clsName[i]);
			for(var j=0;j<adsEle.length;j++){
				//adsEle[j].style.display = "none";
				adsEle[j].parentNode.removeChild(adsEle[j]);
			}
		}
	}

	//清除所有 js 类名,防止广告再生。比如：itemprop="articleBody"这个div，如果不去除className:js-article__body，会动态插入广告
	function clearJsClass(){
		for(var i=0;i<ads.jsClass.length;i++){
			var jsEle = document.querySelectorAll('.'+ads.jsClass[i]);
			for(var j=0;j<jsEle.length;j++){
				removeClass(jsEle[j],ads.jsClass[i]);
			}
		}
		var ad = document.querySelectorAll("script");
	}

	function filterPage(){
		filterArticle();
		clearAds();
		clearJsClass();
	}
/**************** 页面清洁 - END ****************/

/**************** 分页展示 - START ****************/

	function insertPageBtn(){
		Dom.pageBtn.id = "iPage";
		var contentHeight = document.querySelector("article").offsetHeight;
		var stdHeight = document.querySelector("#articleView").clientHeight;
		var totalPages = Math.ceil(contentHeight/stdHeight);
		for(var i=0;i<totalPages;i++){
			Dom.pageBtn.options.add(new Option("Page "+(i+1),i));
		}
		Dom.panel.appendChild(Dom.pageBtn);
		Dom.pageBtn.addEventListener('click',goPage,false);
	}

	function goPage(e){
		var pageNo = e.target.selectedIndex;
		var stdHeight = document.querySelector("#articleView").clientHeight;
		Dom.article.style.marginTop =  -pageNo*stdHeight + "px";
	}


/**************** 分页展示 - END ****************/

/**************** 点击查询 - START ****************/

	function clickQuery(){
		Dom.article.addEventListener("mouseup",function(e){
			getWord(e);
		},false);
	}

	function getWord(e){
		var rng = document.getSelection();
		var word = rng.toString().replace(/(^\s*)|(\s*$)/g,"");
		if(word===""||rng.isCollapsed){
			return null;
		}
		var baseUrl = "https://api.shanbay.com/bdc/search/?word=";
		var url = baseUrl+encodeURIComponent(word);
		getJSON(url,function (json){
			renderPop(json);
			calcPop(e);
		});
	}

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
	填充单词查询弹出框	
	1. 单词;
	2. 音标;
	3. 发音;
	4. 中文解释;
*/
	function renderPop(json){
		var popPanel = document.querySelector("#popPanel");
		if(!popPanel){
			popPanel = document.createElement("div");
			popPanel.id = "popPanel";
			Dom.body.appendChild(popPanel);
			popPanel.innerHTML = "<span id='queryWord'></span>"+
						"<span id='pron'></span>"+
						"<span id='sound'></span>"+
						"<div id='cn_trans'></div>";
			var img = document.createElement('img');
		    var img_url = chrome.extension.getURL('img/audio.png');
		    img.setAttribute('src', img_url);
		    img.setAttribute('id', 'horn');
			img.setAttribute('alt', 'default');
			var sound = document.getElementById('sound');
		    sound.appendChild(img);
		    var audio = document.createElement('audio');
		    audio.setAttribute('id', 'wordAudio');
			//audio.setAttribute('autoplay', 'true');
			sound.appendChild(audio);
			img.addEventListener('click',function(){
				audio.play();
			},false);
		}
		popPanel.style.display = "block";
		var queryWord = document.querySelector("#queryWord");
		var pron = document.querySelector("#pron");
		var img = document.getElementById('horn');
		var audio = document.getElementById('wordAudio');
		var cn_trans = document.getElementById('cn_trans');
		if(json.status_code!==0){
			queryWord.innerHTML = "";
			pron.innerHTML = "";
			img.style.display = "none";
			cn_trans.innerHTML = json.msg;
			return null;
		}
		var voc = {
			content: json.data.content,
			pron: json.data.pronunciations.us,
			audio: json.data.audio_addresses.us[0],
			cn_trans: json.data.cn_definition.defn,
			has_audio: json.data.has_audio
		};
		queryWord.innerHTML=voc.content;
		if(voc.pron.length > 0){          //如果pron存在，则显示
			
			if(voc.content.length > 15)
				pron.innerHTML = '<br />[' + voc.pron + ']';
			else
			    pron.innerHTML = '[' + voc.pron + '] ';
		}
		if (voc.has_audio&&voc.audio.length != 0) {
			img.style.display = "inline-block";
			var alt = voc.content;
		    img.setAttribute('alt', alt);
			audio.setAttribute('src', voc.audio);
		}else{
			img.style.display = "none";
		}
		cn_trans.innerHTML = voc.cn_trans.replace(/\n/g,"<br>");
	}

/*
	计算弹出框位置
*/
	function calcPop(e){
		var x = e.pageX,
			y = e.pageY;
		var targetHeight = 0.5*parseInt(window.getComputedStyle(e.target).getPropertyValue("line-height"));
		targetHeight = Math.ceil(targetHeight);
		var viewWidth = getInner().width,
			viewHeight = getInner().height;
		var popPanel = document.querySelector("#popPanel");
		var objWidth = popPanel.offsetWidth,
			objHeight = popPanel.offsetHeight;
		var offsetTop = y,offsetLeft = x;
		if(objHeight + y + targetHeight > viewHeight){
			offsetTop = y - objHeight - targetHeight;
		}else{
			offsetTop +=  targetHeight;
		}
		if(objWidth + x > viewWidth){
			offsetLeft = x - objWidth;
		}
		popPanel.style.left = offsetLeft + 'px';
		popPanel.style.top = offsetTop + 'px';
	}

/*
	计算弹出框位置
*/
	function clickHidden(){
		document.addEventListener("click",function (e){
			var popPanel = document.querySelector("#popPanel");
			var index = -1;
			if(popPanel&&popPanel.style.display!=="none"){
				index = e.path.indexOf(popPanel);
				if(index===-1){
					popPanel.style.display = "none";
				}
			}
		},false);
	}
/**************** 点击查询 - END ****************/

/*
	工具函数
*/
	function getInner(){                  //获取视口大小
		if(typeof window.innerWidth!='undefined'){
			return  {
						width:window.innerWidth,
						height:window.innerHeight
					}
		}else{
			return  {
						width:document.documentElement.clientWidth,
						height:document.documentElement.clientHeight
					}
		}
	}

/**************** 程序主入口 ****************/
	function main(){
		filterPage();
		insertPageBtn();
		clickQuery();
		clickHidden()
	}

	main(); 
})();
/**
 * 常用的公共方法
 */
var U = function() {
	this.getScrollTop = function() {
		var scrollTop = 0;
		if(document.documentElement && document.documentElement.scrollTop) {
			scrollTop = document.documentElement.scrollTop;
		} else if(document.body) {
			scrollTop = document.body.scrollTop;
		}
		return scrollTop;
	}
	this.ele = function(text) {
		if(text != null & text != "") {
			if(text.length > 1) {
				if(/^#[a-zA-Z0-9_]*$/.test(text)) {
					return document.getElementById(text.substring(1, text.length));
				} else if(/^.[a-zA-Z0-9_]*$/.test(text)) {
					return document.getElementsByClassName(text.substring(1, text.length));
				} else {
					return document.getElementsByTagName(text);
				}
			}
		}
		return null;
	}
	this.inputTextLength = function(element, textLength) {
		var inputText = element.value;
		var inputTextLength = inputText.length;
		if(inputTextLength >= textLength) {
			element.value = inputText.substring(0, textLength);
		}
	}
	this.InnerText = function(ele, text) {
		var inner = ele.innerText;
		if(inner != null) {
			ele.innerText = text;
		} else {
			ele.textContent = text;
		}
	}
	this.forEach = function(array, fun) {
		var dataType = typeof array;
		if(dataType == "object") {
			for(var i = 0; i < array.length; i++) {
				fun({
					index: i,
					data: array[i]
				});
			}
		} else if(dataType == "number") {
			for(var i = 0; i < array; i++) {
				fun({
					index: i,
					data: null
				});
			}
		}
	}
	this.css = function(el, cssStyles) {
		if(typeof el == "object") {
			var css = {};
			var oldCss = el.getAttribute("style");
			if(oldCss != null) {
				var oldCsss = oldCss.split(";");
				this.forEach(oldCsss, function(e) {
					var keyAndValue = e.data;
					if(keyAndValue != "") {
						var k = keyAndValue.substring(0, keyAndValue.indexOf(":"));
						var v = keyAndValue.substring(keyAndValue.indexOf(":") + 1, keyAndValue.length);
						css[k] = v.trim();
					}
				})
			}
			for(cssStyle in cssStyles) {
				css[cssStyle] = cssStyles[cssStyle];
			}
			if(JSON.stringify(css) != "{}") {
				oldCss = "";
				for(c in css) {
					oldCss += c + ":" + css[c] + ";";
				}
			}
			el.setAttribute("style", oldCss);
		}
	}
	this.createElement = function(eleName, attrs, write, parseEle) {
		if(typeof eleName == "string") {
			var ele = document.createElement(eleName);
			if(typeof attrs == "object") {
				for(attr in attrs) {
					ele.setAttribute(attr, attrs[attr]);
				}
			}
			if(typeof write == "object") {
				for(text in write) {
					if(text == "text") {
						this.InnerText(ele, write[text]);
					} else if(text == "html") {
						ele.innerHTML = write[text];
					} else if(text == "value") {
						ele.value = write[text];
					}
				}
			}
			if(typeof parseEle == "object") {
				parseEle.appendChild(ele);
			}
			return ele;
		}
	}
	this.splitArray = function(array, arrayLength) {
		var VarTempArray = [];
		var temp = [];
		forEach(array, function(e) {
			temp.push(e.data);
			if(e.index % arrayLength == (arrayLength - 1) || e.index == (array.length - 1)) {
				VarTempArray.push(temp);
				temp = [];
			}
		});
		return VarTempArray;
	}
	this.format = function(timeStamp, timeFormat) {
		var date = new Date(timeStamp);
		var y = date.getFullYear(); // 年
		var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1); // 月
		var d = date.getDate() < 10 ? '0' + date.getDate() + '' : date.getDate() + ''; // 日
		var h = date.getHours() < 10 ? '0' + date.getHours() : date.getHours(); // 时
		var m = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes(); // 分
		var s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds(); // 秒
		if(timeFormat.indexOf("yyyy") != -1 || timeFormat.indexOf("YYYY") != -1) {
			timeFormat = timeFormat.replace(new RegExp(/yyyy|YYYY/g), y);
		}
		if(timeFormat.indexOf("MM") != -1) {
			timeFormat = timeFormat.replace(new RegExp(/MM/g), M);
		}
		if(timeFormat.indexOf("dd") != -1 || timeFormat.indexOf("DD") != -1) {
			timeFormat = timeFormat.replace(new RegExp(/dd|DD/g), d);
		}
		if(timeFormat.indexOf("hh") != -1 || timeFormat.indexOf("HH") != -1) {
			timeFormat = timeFormat.replace(new RegExp(/hh|HH/g), h);
		}
		if(timeFormat.indexOf("mm") != -1) {
			timeFormat = timeFormat.replace(new RegExp(/mm/g), m);
		}
		if(timeFormat.indexOf("ss") != -1 || timeFormat.indexOf("SS") != -1) {
			timeFormat = timeFormat.replace(new RegExp(/ss|SS/g), s);
		}
		return timeFormat;
	}
}
/**
 * 音频/视频播放器
 * @param {Object} obj
 */
var V = function(obj) {
	var u = new U();
	var keyDown = null;
	var video = u.ele(obj.el);
	var videoList = u.ele(obj.videoList);
	if(video != null) {
		video.addEventListener("dragenter", drag, false);
		video.addEventListener("dragover", drag, false);
		video.addEventListener("dragleave", drag, false);
		video.addEventListener("drop", drag, false);
		video.addEventListener("mouseover", videoOver, false);
		video.addEventListener("mouseout", videoOut, false);
	}

	function videoOver() {
		keyDown = function(e) {
			if(e.keyCode == 32) {
				var videoSrc = video.getAttribute("src");
				if(videoSrc != "") {
					if(video.paused) {
						video.play();
					} else {
						video.pause();
					}
				}
			}
		}
		document.body.addEventListener("keydown", keyDown, false);
	}

	function videoOut() {
		if(keyDown != null) {
			document.body.removeEventListener("keydown", keyDown, false);
		}
	}

	function drag(e) {
		e.preventDefault();
		switch(e.type) {
			case "dragenter":
				console.log("文件移入");
				break;
			case "dragover":
				console.log("文件移动");
				break;
			case "dragleave":
				console.log("文件移出");
				break;
			case "drop":
				var mvFiles = e.dataTransfer.files;
				var mvData = [];
				if(videoList != null) {
					videoList.innerHTML = "";
				}
				for(var i = 0; i < mvFiles.length; i++) {
					var mvRead = new FileReader();
					mvRead.readAsDataURL(mvFiles[i]);
					mvRead.fileName = mvFiles[i].name;
					mvRead.index = i;
					mvRead.onload = function() {
						var result = this.result;
						var fileType = result.substring(result.indexOf(":") + 1, result.indexOf("/"));
						if(fileType == "video" || fileType == "audio") {
							if(videoList != null) {
								var indexs = this.index;
								mvData.push({
									value: indexs,
									name: result
								});
								var div = u.createElement("div", {
									num: indexs,
									type: fileType,
									title: this.fileName
								}, {
									text: this.fileName
								}, videoList);
								div.addEventListener("click", function() {
									video.removeAttribute("poster");
									var num = this.getAttribute("num");
									var type = this.getAttribute("type");
									var _this = this;
									u.forEach(mvData, function(e) {
										if(mvData[e.index]["value"] == num) {
											video.pause();
											if(type == "audio") {
												video.setAttribute("poster", "static/image/musicBackground01.gif");
											}
											video.setAttribute("src", mvData[e.index]["name"]);
											video.load();
											video.play();
											var child = _this.parentNode.children;
											u.forEach(child, function(ev) {
												u.css(ev.data, {
													color: "black"
												});
											});
											u.css(_this, {
												color: "orange"
											});
										}
									})
								})
							}
						}
					}
				}
				break;
		}
	}
}
/*
* ajax
* @param method(必选)    请求类型  get，post和formData
* @param url(必选)       请求的url地址   相同域名下的页面（此函数不支持跨域请求）
* @param data(必选)      请求协带的数据  以js对象的形式定义，如：{name:'张三'}
* @param callback(必选)  回调函数,可接收一个参数，这个参数就是服务器响应的数据
* @param type(可选)      指定服务器响应的数据类型（可选值：json,xml,text），如果是json模式，则使用json解析数据，默认为text普通字符串
*/
var ajax = function(method, url, data, callback, type){
	//创建兼容 XMLHttpRequest 对象
	var xhr;
	if (window.XMLHttpRequest) {//IE7+, Firefox, Chrome, Opera, Safari
	  xhr = new XMLHttpRequest();
	} else {// code for IE6, IE5
	  xhr = new ActiveXObject("Microsoft.XMLHTTP");
	}
	//给请求添加状态变化事件处理函数
	xhr.onreadystatechange = function (){
		//判断状态码
		if(xhr.status==200 && xhr.readyState==4){
			//根据type参数，判断返回的内容需要进行怎样的处理
			if(type=='json'){
				//获得 json 形式的响应数据，并使用parse方法解析
				var res = JSON.parse(xhr.responseText);
			}else if(type=='xml'){
				//获得 XML 形式的响应数据
				var res = responseXML;
			}else{
				//获得字符串形式的响应数据
				var res = xhr.responseText;
			}
			//调用回调函数,并将响应数据传入回调函数
			callback(res);
		}
	};
	//判断是否为表单提交
	if(method != "formData"){
		//判断data是否有数据
		var param = '';
		//这里使用stringify方法将js对象格式化为json字符串
		if(JSON.stringify(data) != '{}'){
			url += '?';
			for(var i in data){
				param += i+'='+data[i]+'&';   //将js对象重组，拼接成url参数存入param变量中
			}
			//使用slice函数提取一部分字符串，这里主要是为了去除拼接的最后一个&字符
			//slice函数：返回一个新的字符串。包括字符串从 start 开始（包括 start）到 end 结束（不包括 end）为止的所有字符。
			param = param.slice(0,param.length-1);  
		}
		//判断method是否为get
		if(method == "get"){
			//是则将数据拼接在url后面
			url = url+param;
		}
		xhr.open(method,url,true);
	}else{
		//初始化请求
		xhr.open("post",url,true);
	}
	//如果method == post
	if(method == "post"){
		xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		//发送请求
		xhr.send(param);
	}else if(method == "formData"){
		//发送请求
		xhr.send(data);
	}else{
		//发送请求
		xhr.send(null);
	}
}
/**
 * 实现截图/录像功能
 * @param {Object} obj
 */
var media = function(obj) {
	this.video; //视频标签对象
	this.uploadURI; //录制视频上传地址
	this.uploadParams; //上传视频附带参数
	this.recorderFile; //视频流数据
	this.mediaStream; //媒体流
	this.mediaRecorder; //录制对象
	this.recorderState;
	//媒体工具对象
	var MediaUtils = {
		/**
		 * 获取用户媒体设备(处理兼容的问题)
		 * @param videoEnable {boolean} - 是否启用摄像头
		 * @param audioEnable {boolean} - 是否启用麦克风
		 * @param callback {Function} - 处理回调
		 */
		getUserMedia: function(videoEnable, audioEnable, callback) {
			navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || window.getUserMedia;
			var constraints = {
				video: videoEnable,
				audio: audioEnable
			};
			if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
				navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
					callback(false, stream);
				})['catch'](function(err) {
					callback(err);
				});
			} else if(navigator.getUserMedia) {
				navigator.getUserMedia(constraints, function(stream) {
					callback(false, stream);
				}, function(err) {
					callback(err);
				});
			} else {
				callback(new Error('Not support userMedia'));
			}
		},
		/**
		 * 关闭媒体流
		 * @param stream {MediaStream} - 需要关闭的流
		 */
		closeStream: function(stream) {
			if(typeof stream.stop === 'function') {
				stream.stop();
			} else {
				var trackList = [stream.getAudioTracks(), stream.getVideoTracks()];
				for(var i = 0; i < trackList.length; i++) {
					var tracks = trackList[i];
					if(tracks && tracks.length > 0) {
						for(var j = 0; j < tracks.length; j++) {
							var track = tracks[j];
							if(typeof track.stop === 'function') {
								track.stop();
							}
						}
					}
				}
			}
		}
	};
	//初始化
	this.init = function() {
		var u = new U();
		this.uploadURI = obj["uploadURI"];
		this.uploadParams = obj["params"];
		this.video = u.ele(obj["video"]);
		if(this.video != null) {
			this.recorderState = false;
			MediaUtils.getUserMedia(true, true, (err, stream) => {
				if(err) {
					throw err;
				} else {
					this.mediaRecorder = new MediaRecorder(stream);// 通过 MediaRecorder 记录获取到的媒体流
					this.mediaStream = stream;
					var chunks = [];
					this.video.srcObject = stream;
					this.video.play();
					this.mediaRecorder.ondataavailable = function(e) {
						this.blobs.push(e.data);
						chunks.push(e.data);
					};
					var _this = this;
					this.mediaRecorder.blobs = [];
					this.mediaRecorder.onstop = function(e) {
						_this.recorderFile = new Blob(chunks, {
							'type': _this.mediaRecorder.mimeType
						});
						chunks = [];
						_this.uploadFile(_this.recorderFile);
					};
				}
			});
		}
	}
	//录制上传服务器
	this.uploadFile = function(recorderFile) {
		var file = new File([recorderFile], 'msr-' + (new Date).toISOString().replace(/:|\./g, '-') + '.mp4', {
			type: 'video/mp4'
		});
		var url = this.uploadURI;
		if(url != undefined & url != null & url != "") {
			if(confirm("录制成功,是否上传录制文件？")) {
				alert("正在上传录制文件！");
				var formData = new FormData();
				formData.append("file", file);
				var params = this.uploadParams;
				if(params != undefined & params != null & typeof params == "object") {
					for(param in params) {
						formData.append(param, params[params]);
					}
				}
				ajax("formData",url,formData,function(){
					alert("上传成功");
				},'text');
				this.mediaRecorder = null;
				this.mediaStream = null;
				this.recorderFile = null;
			}
		}
	}
	//截图,返回图片的虚拟地址
	this.screenshot=function(){
		var canvas=document.createElement("canvas");
		canvas.width=this.video.videoWidth;
		canvas.height=this.video.videoHeight;
		canvas.getContext('2d').drawImage(this.video, 0, 0, canvas.width, canvas.height);
		return canvas.toDataURL("image/png");
	}
	//录制开始
	this.startRecorder = function() {
		if(this.mediaRecorder != undefined & this.mediaRecorder != null) {
			this.recorderState = true;
			this.mediaRecorder.start();
		}
	}
	//录制结束
	this.stopRecorder = function() {
		if(this.mediaRecorder != undefined & this.mediaRecorder != null) {
			setTimeout(() => {
				this.recorderState = false;
				this.mediaRecorder.stop(); // 终止录制器
				MediaUtils.closeStream(this.mediaStream); // 关闭媒体流
			}, 2000);
		}
	}
	//关闭摄像头
	this.closeMedia = function() {
		if(this.mediaStream != undefined & this.mediaStream != null) {
			MediaUtils.closeStream(this.mediaStream); // 关闭媒体流
		}
	}

}
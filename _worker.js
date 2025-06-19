addEventListener('fetch', event => {
	const url = new URL(event.request.url);
	thisProxyServerUrlHttps = `${url.protocol}//${url.hostname}/`;
	thisProxyServerUrl_hostOnly = url.host;
	event.respondWith(handleRequest(event.request))
})
const str = "/";
const lastVisitProxyCookie = "__PROXY_VISITEDSITE__";
const passwordCookieName = "__PROXY_PWD__";
const proxyHintCookieName = "__PROXY_HINT__";
const password = "";
const showPasswordPage = true;
const replaceUrlObj = "__location____"
var thisProxyServerUrlHttps;
var thisProxyServerUrl_hostOnly;
// const CSSReplace = ["https://", "http://"];
const proxyHintInjection = `
//---***========================================***---Sci-Fi Proxy Hint---***========================================***---
setTimeout(() => {
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    const hint = \`Warning: You are currently using a web proxy, the original link is \${window.location.pathname}. Be careful to distinguish the authenticity of information on web pages. \n Click to close this hint.\`;
    document.body.insertAdjacentHTML(
      'afterbegin',
      \`<div style="position:fixed;left:0;top:0;width:100%;padding:10px;z-index:9999999999999999999;user-select:none;cursor:pointer;font-family:'Orbitron',sans-serif;" id="__PROXY_HINT_DIV__" onclick="document.getElementById('__PROXY_HINT_DIV__').remove();">
        <div style="max-width:400px;margin:0 auto;background:linear-gradient(135deg,rgba(255,255,255,0.95),rgba(200,220,255,0.85));border:2px solid #00aaff;border-radius:15px;padding:15px;box-shadow:0 0 20px rgba(0,170,255,0.5);animation:fadeIn 0.5s ease-in-out;">
          <span style="display:block;font-size:12px;color:#001f3f;text-align:center;letter-spacing:1px;text-shadow:0 0 5px rgba(0,170,255,0.7);">
            \${hint}
          </span>
        </div>
      </div>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap');
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        #__PROXY_HINT_DIV__:hover > div {
          box-shadow:0 0 30px rgba(0,170,255,0.7);
          transition:box-shadow 0.3s ease;
        }
      </style>\`
    );
  } else {
    alert(\`Warning: You are currently using a web proxy, the original link is \${window.location.pathname}. Please note that you are using a proxy, and do not log in to any website.\`);
  }
}, 3000);
`;
const httpRequestInjection = `
//---***========================================***---information---***========================================***---
var now = new URL(window.location.href);
var base = now.host;
var protocol = now.protocol;
var nowlink = protocol + "//" + base + "/";
var oriUrlStr = window.location.href.substring(nowlink.length);
var oriUrl = new URL(oriUrlStr);
var path = now.pathname.substring(1);
console.log("***************************----" + path);
if(!path.startsWith("http")) path = "https://" + path;
var original_host = path.substring(path.indexOf("://") + "://".length);
original_host = original_host.split('/')[0];
var mainOnly = path.substring(0, path.indexOf("://")) + "://" + original_host + "/";
//---***========================================***---通用func---***========================================***---
function changeURL(relativePath){
	if(relativePath == null) return null;
	try{
		if(relativePath.startsWith("data:") || relativePath.startsWith("mailto:") || relativePath.startsWith("javascript:") || relativePath.startsWith("chrome") || relativePath.startsWith("edge")) return relativePath;
	}catch{
		// duckduckgo mysterious BUG that will trigger sometimes, just ignore ...
	}
	try{
		if(relativePath && relativePath.startsWith(nowlink)) relativePath = relativePath.substring(nowlink.length);
		if(relativePath && relativePath.startsWith(base + "/")) relativePath = relativePath.substring(base.length + 1);
		if(relativePath && relativePath.startsWith(base)) relativePath = relativePath.substring(base.length);
	}catch{
		//ignore
	}
	try {
		var absolutePath = new URL(relativePath, path).href;
		absolutePath = absolutePath.replace(window.location.href, path);
		absolutePath = absolutePath.replace(encodeURI(window.location.href), path);
		absolutePath = absolutePath.replace(encodeURIComponent(window.location.href), path);
		absolutePath = absolutePath.replace(nowlink, mainOnly);
		absolutePath = absolutePath.replace(nowlink, encodeURI(mainOnly));
		absolutePath = absolutePath.replace(nowlink, encodeURIComponent(mainOnly));
			absolutePath = absolutePath.replace(nowlink, mainOnly.substring(0,mainOnly.length - 1));
			absolutePath = absolutePath.replace(nowlink, encodeURI(mainOnly.substring(0,mainOnly.length - 1)));
			absolutePath = absolutePath.replace(nowlink, encodeURIComponent(mainOnly.substring(0,mainOnly.length - 1)));
			absolutePath = absolutePath.replace(base, original_host);
		absolutePath = nowlink + absolutePath;
		return absolutePath;
	} catch (e) {
		console.log("Exception occured: " + e.message + path + "   " + relativePath);
		return "";
	}
}
//---***========================================***---注入网络---***========================================***---
function networkInject(){
	//inject network request
	var originalOpen = XMLHttpRequest.prototype.open;
	var originalFetch = window.fetch;
	XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
		url = changeURL(url);
		console.log("R:" + url);
		return originalOpen.apply(this, arguments);
	};
	window.fetch = function(input, init) {
		var url;
		if (typeof input === 'string') {
			url = input;
		} else if (input instanceof Request) {
			url = input.url;
		} else {
			url = input;
		}
		url = changeURL(url);
		console.log("R:" + url);
		if (typeof input === 'string') {
			return originalFetch(url, init);
		} else {
			const newRequest = new Request(url, input);
			return originalFetch(newRequest, init);
		}
	};
	console.log("NETWORK REQUEST METHOD INJECTED");
}
//---***========================================***---注入window.open---***========================================***---
function windowOpenInject(){
	const originalOpen = window.open;
	// Override window.open function
	window.open = function (url, name, specs) {
		let modifiedUrl = changeURL(url);
		return originalOpen.call(window, modifiedUrl, name, specs);
	};
	console.log("WINDOW OPEN INJECTED");
}
//---***========================================***---注入append元素---***========================================***---
function appendChildInject(){
	const originalAppendChild = Node.prototype.appendChild;
	Node.prototype.appendChild = function(child) {
		try{
			if(child.src){
				child.src = changeURL(child.src);
			}
			if(child.href){
				child.href = changeURL(child.href);
			}
		}catch{
			//ignore
		}
		return originalAppendChild.call(this, child);
	};
	console.log("APPEND CHILD INJECTED");
}
//---***========================================***---注入元素的src和href---***========================================***---
function elementPropertyInject(){
const originalSetAttribute = HTMLElement.prototype.setAttribute;
HTMLElement.prototype.setAttribute = function (name, value) {
	if (name == "src" || name == "href") {
		value = changeURL(value);
		//console.log("~~~~~~" + value);
	}
	originalSetAttribute.call(this, name, value);
};
	console.log("ELEMENT PROPERTY (new Proxy) INJECTED");
}
//---***========================================***---注入location---***========================================***---
class ProxyLocation {
	constructor(originalLocation) {
	    this.originalLocation = originalLocation;
	}
	// 方法：重新加载页面
	reload(forcedReload) {
	    this.originalLocation.reload(forcedReload);
	}
	// 方法：替换当前页面
	replace(url) {
	    this.originalLocation.replace(changeURL(url));
	}
	// 方法：分配一个新的 URL
	assign(url) {
	    this.originalLocation.assign(changeURL(url));
	}
	// 属性：获取和设置 href
	get href() {
	    return oriUrlStr;
	}
	set href(url) {
	    this.originalLocation.href = changeURL(url);
	}
	// 属性：获取和设置 protocol
	get protocol() {
	    return this.originalLocation.protocol;
	}
	set protocol(value) {
	    this.originalLocation.protocol = changeURL(value);
	}
	// 属性：获取和设置 host
	get host() {
		console.log("*host");
		return original_host;
	}
	set host(value) {
		console.log("*host");
		this.originalLocation.host = changeURL(value);
	}
	// 属性：获取和设置 hostname
	get hostname() {
		console.log("*hostname");
		return oriUrl.hostname;
	}
	set hostname(value) {
		console.log("s hostname");
		this.originalLocation.hostname = changeURL(value);
	}
	// 属性：获取和设置 port
	get port() {
		return oriUrl.port;
	}
	set port(value) {
		this.originalLocation.port = value;
	}
	// 属性：获取和设置 pathname
	get pathname() {
		console.log("*pathname");
		return oriUrl.pathname;
	}
	set pathname(value) {
		console.log("*pathname");
		this.originalLocation.pathname = value;
	}
	// 属性：获取和设置 search
	get search() {
		console.log("*search");
		console.log(oriUrl.search);
		return oriUrl.search;
	}
	set search(value) {
		console.log("*search");
		this.originalLocation.search = value;
	}
	// 属性：获取和设置 hash
	get hash() {
		return oriUrl.hash;
	}
	set hash(value) {
		this.originalLocation.hash = value;
	}
	// 属性：获取 origin
	get origin() {
		return oriUrl.origin;
	}
}
function documentLocationInject(){
	Object.defineProperty(document, 'URL', {
		get: function () {
			return oriUrlStr;
		},
		set: function (url) {
			document.URL = changeURL(url);
		}
	});
	Object.defineProperty(document, '${replaceUrlObj}', {
		get: function () {
			return new ProxyLocation(window.location);
		},
		set: function (url) {
			window.location.href = changeURL(url);
		}
	});
	console.log("LOCATION INJECTED");
}
function windowLocationInject() {
	Object.defineProperty(window, '${replaceUrlObj}', {
		get: function () {
			return new ProxyLocation(window.location);
		},
		set: function (url) {
			window.location.href = changeURL(url);
		}
	});
	console.log("WINDOW LOCATION INJECTED");
}
//---***========================================***---注入历史---***========================================***---
function historyInject(){
	const originalPushState = History.prototype.pushState;
	const originalReplaceState = History.prototype.replaceState;
	History.prototype.pushState = function (state, title, url) {
		var u = changeURL(url);
		return originalPushState.apply(this, [state, title, u]);
	};
	History.prototype.replaceState = function (state, title, url) {
		var u = changeURL(url);
		return originalReplaceState.apply(this, [state, title, u]);
	};
	History.prototype.back = function () {
		return originalBack.apply(this);
	};
	History.prototype.forward = function () {
		return originalForward.apply(this);
	};
	History.prototype.go = function (delta) {
		return originalGo.apply(this, [delta]);
	};
	console.log("HISTORY INJECTED");
}
//---***========================================***---Hook观察界面---***========================================***---
function obsPage() {
	var yProxyObserver = new MutationObserver(function(mutations) {
		mutations.forEach(function(mutation) {
			traverseAndConvert(mutation);
		});
	});
	var config = { attributes: true, childList: true, subtree: true };
	yProxyObserver.observe(document.body, config);
	console.log("OBSERVING THE WEBPAGE...");
}
function traverseAndConvert(node) {
	if (node instanceof HTMLElement) {
		removeIntegrityAttributesFromElement(node);
		covToAbs(node);
		node.querySelectorAll('*').forEach(function(child) {
			removeIntegrityAttributesFromElement(child);
			covToAbs(child);
		});
	}
}
function covToAbs(element) {
	var relativePath = "";
	var setAttr = "";
	if (element instanceof HTMLElement && element.hasAttribute("href")) {
		relativePath = element.getAttribute("href");
		setAttr = "href";
	}
	if (element instanceof HTMLElement && element.hasAttribute("src")) {
		relativePath = element.getAttribute("src");
		setAttr = "src";
	}
	// Check and update the attribute if necessary
	if (setAttr !== "" && relativePath.indexOf(nowlink) != 0) { 
		if (!relativePath.includes("*")) {
			try {
				var absolutePath = changeURL(relativePath);
				element.setAttribute(setAttr, absolutePath);
			} catch (e) {
				console.log("Exception occured: " + e.message + path + "   " + relativePath);
			}
		}
	}
}
function removeIntegrityAttributesFromElement(element){
	if (element.hasAttribute('integrity')) {
		element.removeAttribute('integrity');
	}
}
//---***========================================***---Hook观察界面里面要用到的func---***========================================***---
function loopAndConvertToAbs(){
	for(var ele of document.querySelectorAll('*')){
		removeIntegrityAttributesFromElement(ele);
		covToAbs(ele);
	}
	console.log("LOOPED EVERY ELEMENT");
}
function covScript(){ //由于observer经过测试不会hook添加的script标签，也可能是我测试有问题？
	var scripts = document.getElementsByTagName('script');
	for (var i = 0; i < scripts.length; i++) {
		covToAbs(scripts[i]);
	}
	setTimeout(covScript, 3000);
}
//---***========================================***---操作---***========================================***---
networkInject();
windowOpenInject();
elementPropertyInject();
//appendChildInject(); 经过测试如果放上去将导致maps.google.com无法使用
documentLocationInject();
windowLocationInject();
historyInject();
//---***========================================***---在window.load之后的操作---***========================================***---
window.addEventListener('load', () => {
	loopAndConvertToAbs();
	console.log("CONVERTING SCRIPT PATH");
	obsPage();
	covScript();
});
console.log("WINDOW ONLOAD EVENT ADDED");
//---***========================================***---在window.error的时候---***========================================***---
window.addEventListener('error', event => {
	var element = event.target || event.srcElement;
	if (element.tagName === 'SCRIPT') {
		console.log("Found problematic script:", element);
		if(element.alreadyChanged){
		  console.log("this script has already been injected, ignoring this problematic script...");
		  return;
		}
		// 调用 covToAbs 函数
		removeIntegrityAttributesFromElement(element);
		covToAbs(element);
		// 创建新的 script 元素
		var newScript = document.createElement("script");
		newScript.src = element.src;
		newScript.async = element.async; // 保留原有的 async 属性
		newScript.defer = element.defer; // 保留原有的 defer 属性
		newScript.alreadyChanged = true;
		// 添加新的 script 元素到 document
		document.head.appendChild(newScript);
		console.log("New script added:", newScript);
	}
}, true);
console.log("WINDOW CORS ERROR EVENT ADDED");
`;
const mainPage = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title data-i18n="title">OpenWeb Proxy - Free Web Proxy Service</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <link rel="shortcut icon" href="https://via.placeholder.com/32.png?text=OWP" type="image/png">
    <style>
        :root {
            --primary: #2563EB;
            --secondary: #3B82F6;
            --text: #1F2937;
            --text-secondary: #4B5563;
            --background: #FFFFFF;
            --card-bg: #F9FAFB;
            --border: #E5E7EB;
        }
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        body {
            background: var(--background);
            color: var(--text);
            line-height: 1.6;
            overflow-x: hidden;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 1.5rem;
        }
        header {
            text-align: center;
            padding: 4rem 0 2rem;
            background: linear-gradient(to bottom, #EFF6FF, var(--background));
            position: relative;
        }
        header h1 {
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--text);
            margin-bottom: 0.5rem;
        }
        header p {
            font-size: 1.1rem;
            color: var(--text-secondary);
            max-width: 600px;
            margin: 0 auto;
        }
        .language-toggle {
            position: absolute;
            top: 1rem;
            right: 1.5rem;
            display: flex;
            gap: 0.5rem;
        }
        .language-toggle button {
            background: none;
            border: none;
            color: var(--text-secondary);
            font-size: 0.9rem;
            cursor: pointer;
            padding: 0.25rem 0.5rem;
            transition: color 0.3s ease;
        }
        .language-toggle button.active {
            color: var(--primary);
            font-weight: 600;
        }
        .language-toggle button:hover {
            color: var(--secondary);
        }
        .proxy-form {
            max-width: 700px;
            margin: 2rem auto;
            position: relative;
        }
        .input-group {
            display: flex;
            background: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 0.5rem;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            transition: box-shadow 0.3s ease;
        }
        .input-group:focus-within {
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        input#targetUrl {
            flex: 1;
            padding: 1rem;
            font-size: 1rem;
            border: none;
            background: transparent;
            color: var(--text);
            outline: none;
        }
        button#goBtn {
            background: var(--primary);
            color: white;
            border: none;
            padding: 0 1.5rem;
            font-size: 1rem;
            cursor: pointer;
            transition: background 0.3s ease;
        }
        button#goBtn:hover {
            background: var(--secondary);
        }
        .popular-sites {
            padding: 3rem 0;
            background: #F3F4F6;
        }
        .popular-sites h2 {
            font-size: 1.8rem;
            text-align: center;
            margin-bottom: 2rem;
            color: var(--text);
        }
        .card-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
        }
        .card {
            background: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 0.5rem;
            padding: 1.5rem;
            text-align: center;
            cursor: pointer;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .card img {
            width: 32px;
            height: 32px;
            margin-bottom: 0.75rem;
        }
        .card h4 {
            font-size: 1rem;
            font-weight: 600;
            color: var(--text);
        }
        .usage-tips {
            padding: 3rem 0;
        }
        .usage-tips h2 {
            font-size: 1.8rem;
            text-align: center;
            margin-bottom: 1.5rem;
        }
        .tips-content {
            max-width: 700px;
            margin: 0 auto;
            background: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 0.5rem;
            padding: 2rem;
        }
        .tips-content ul {
            padding-left: 1.25rem;
            color: var(--text-secondary);
        }
        .tips-content ul li {
            margin-bottom: 0.75rem;
        }
        .disclaimer {
            padding: 2rem 0;
            background: #F9FAFB;
            border-top: 1px solid var(--border);
        }
        .disclaimer h2 {
            font-size: 1.8rem;
            text-align: center;
            margin-bottom: 1rem;
        }
        .disclaimer p {
            max-width: 800px;
            margin: 0 auto;
            color: var(--text-secondary);
            font-size: 0.95rem;
            text-align: center;
        }
        footer {
            padding: 2rem 0;
            text-align: center;
            background: var(--background);
            border-top: 1px solid var(--border);
        }
        footer p {
            color: var(--text-secondary);
            font-size: 0.95rem;
        }
        footer a {
            color: var(--primary);
            text-decoration: none;
            font-weight: 500;
        }
        footer a:hover {
            text-decoration: underline;
        }
        .loader {
            --size: 40px;
            width: var(--size);
            height: var(--size);
            border-radius: 50%;
            border: 4px solid var(--border);
            border-top-color: var(--primary);
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            display: none;
            animation: spin 1s linear infinite;
            z-index: 1000;
        }
        @keyframes spin {
            to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @media (max-width: 768px) {
            header h1 { font-size: 2rem; }
            header p { font-size: 1rem; }
            .card-grid { grid-template-columns: 1fr; }
            .container { padding: 0 1rem; }
            .language-toggle { top: 0.5rem; right: 1rem; }
        }
        .fade-in {
            opacity: 0;
            animation: fadeIn 0.5s ease-in forwards;
        }
        @keyframes fadeIn {
            to { opacity: 1; }
        }
        .lang-transition {
            animation: langFade 0.3s ease-in-out;
        }
        @keyframes langFade {
            0% { opacity: 0.5; }
            100% { opacity: 1; }
        }
    </style>
</head>
<body>
    <header class="fade-in">
        <div class="container">
            <div class="language-toggle">
                <button data-lang="en">EN</button>
                <button data-lang="zh-CN">中文</button>
            </div>
            <h1 data-i18n="header_title">OpenWeb Proxy</h1>
            <p data-i18n="header_subtitle">A free and open-source web proxy to access the internet securely and anonymously.</p>
        </div>
    </header>

    <section class="proxy-form fade-in">
        <div class="container">
            <div class="input-group">
                <input type="text" id="targetUrl" data-i18n-placeholder="form_placeholder" placeholder="Enter website URL (e.g., https://example.com)" autocomplete="off">
                <button type="button" id="goBtn" data-i18n="form_button">
                    <i class="fas fa-paper-plane"></i> Go
                </button>
            </div>
        </div>
    </section>

    <section class="popular-sites fade-in">
        <div class="container">
            <h2 data-i18n="popular_title">Popular Websites</h2>
            <div class="card-grid" id="cardGrid">
                <div class="card" onclick="openSite('https://example.com/google.com')" data-category="search">
                    <img src="https://www.google.com/favicon.ico" alt="Google">
                    <h4>Google</h4>
                </div>
                <div class="card" onclick="openSite('https://example.com/bing.com')" data-category="search ai">
                    <img src="https://www.bing.com/favicon.ico" alt="Bing">
                    <h4>Bing</h4>
                </div>
                <div class="card" onclick="openSite('https://example.com/youtube.com')" data-category="video">
                    <img src="https://www.youtube.com/favicon.ico" alt="YouTube">
                    <h4>YouTube</h4>
                </div>
                <div class="card" onclick="openSite('https://example.com/twitter.com')" data-category="social">
                    <img src="https://www.twitter.com/favicon.ico" alt="X/Twitter">
                    <h4>X / Twitter</h4>
                </div>
                <div class="card" onclick="openSite('https://example.com/wikipedia.org')" data-category="education">
                    <img src="https://www.wikipedia.org/static/favicon/wikipedia.ico" alt="Wikipedia">
                    <h4>Wikipedia</h4>
                </div>
                <div class="card" onclick="openSite('https://example.com/reddit.com')" data-category="social">
                    <img src="https://www.reddit.com/favicon.ico" alt="Reddit">
                    <h4>Reddit</h4>
                </div>
                <div class="card" onclick="openSite('https://example.com/netflix.com')" data-category="entertainment">
                    <img src="https://www.netflix.com/favicon.ico" alt="Netflix">
                    <h4>Netflix</h4>
                </div>
                <div class="card" onclick="openSite('https://example.com/perplexity.ai')" data-category="ai">
                    <img src="https://www.perplexity.ai/favicon.ico" alt="Perplexity">
                    <h4>Perplexity</h4>
                </div>
            </div>
        </div>
    </section>

    <section class="usage-tips fade-in">
        <div class="container">
            <h2 data-i18n="tips_title">How to Use OpenWeb Proxy</h2>
            <div class="tips-content">
                <h3 data-i18n="tips_getting_started">Getting Started</h3>
                <ul>
                    <li data-i18n="tips_item_1">Enter a valid website URL in the input box above and click 'Go' to visit.</li>
                    <li data-i18n="tips_item_2">Click on a popular website card for quick access.</li>
                    <li data-i18n="tips_item_3">Avoid logging into sensitive accounts (e.g., banking or email) while using this proxy.</li>
                </ul>
                <h3 data-i18n="tips_why_use">Why Use OpenWeb Proxy?</h3>
                <ul>
                    <li data-i18n="tips_item_4">Bypass network restrictions securely.</li>
                    <li data-i18n="tips_item_5">Free and open-source, hosted on GitHub.</li>
                    <li data-i18n="tips_item_6">Lightweight and easy to deploy.</li>
                </ul>
            </div>
        </div>
    </section>

    <section class="disclaimer fade-in">
        <div class="container">
            <h2 data-i18n="disclaimer_title">Disclaimer</h2>
            <p data-i18n="disclaimer_text">
                OpenWeb Proxy is provided "as is" without any warranties. The authors and contributors are not responsible for any damages, data loss, or legal consequences arising from the use of this service. Users are solely responsible for ensuring compliance with local laws and regulations. Avoid using this proxy for illegal activities or accessing sensitive accounts, as it may expose your data to risks. Always verify the authenticity of websites accessed through this proxy.
            </p>
        </div>
    </section>

    <footer class="fade-in">
        <div class="container">
            <p data-i18n="footer_text">
                Created by <a href="https://github.com/your-username" target="_blank">Your Name</a> | 
                <a href="https://github.com/your-username/openweb-proxy" target="_blank">Fork on GitHub</a> | 
                Licensed under MIT
            </p>
        </div>
    </footer>

    <div class="loader"></div>

    <script>
        const translations = {
            en: {
                title: "OpenWeb Proxy - Free Web Proxy Service",
                header_title: "OpenWeb Proxy",
                header_subtitle: "A free and open-source web proxy to access the internet securely and anonymously.",
                form_placeholder: "Enter website URL (e.g., https://example.com)",
                form_button: "Go",
                popular_title: "Popular Websites",
                tips_title: "How to Use OpenWeb Proxy",
                tips_getting_started: "Getting Started",
                tips_item_1: "Enter a valid website URL in the input box above and click 'Go' to visit.",
                tips_item_2: "Click on a popular website card for quick access.",
                tips_item_3: "Avoid logging into sensitive accounts (e.g., banking or email) while using this proxy.",
                tips_why_use: "Why Use OpenWeb Proxy?",
                tips_item_4: "Bypass network restrictions securely.",
                tips_item_5: "Free and open-source, hosted on GitHub.",
                tips_item_6: "Lightweight and easy to deploy.",
                disclaimer_title: "Disclaimer",
                disclaimer_text: "OpenWeb Proxy is provided 'as is' without any warranties. The authors and contributors are not responsible for any damages, data loss, or legal consequences arising from the use of this service. Users are solely responsible for ensuring compliance with local laws and regulations. Avoid using this proxy for illegal activities or accessing sensitive accounts, as it may expose your data to risks. Always verify the authenticity of websites accessed through this proxy.",
                footer_text: "Created by <a href='https://github.com/Solaina888' target='_blank'>Solaina</a> | <a href='https://github.com/Solaina888/openweb-proxy' target='_blank'>Fork on GitHub</a> | Licensed under MIT",
                error_invalid_url: "Invalid URL",
                error_invalid_url_text: "Please enter a valid website address (e.g., https://example.com)"
            },
            'zh-CN': {
                title: "OpenWeb 代理 - 免费网页代理服务",
                header_title: "OpenWeb 代理",
                header_subtitle: "一个免费且开源的网页代理，帮助您安全匿名地访问互联网。",
                form_placeholder: "输入网站地址（例如，https://example.com）",
                form_button: "前往",
                popular_title: "热门网站",
                tips_title: "如何使用 OpenWeb 代理",
                tips_getting_started: "开始使用",
                tips_item_1: "在上面的输入框中输入有效的网站地址，然后点击“前往”访问。",
                tips_item_2: "点击热门网站卡片以快速访问。",
                tips_item_3: "使用此代理时，请避免登录敏感账户（如银行或邮箱）。",
                tips_why_use: "为何选择 OpenWeb 代理？",
                tips_item_4: "安全绕过网络限制。",
                tips_item_5: "免费且开源，托管于 GitHub。",
                tips_item_6: "轻量级，易于部署。",
                disclaimer_title: "免责声明",
                disclaimer_text: "OpenWeb 代理按“原样”提供，不提供任何担保。作者及贡献者对因使用本服务而导致的任何损害、数据丢失或法律后果不承担责任。用户需自行确保遵守当地法律法规。禁止使用此代理进行非法活动或访问敏感账户，因其可能导致数据风险。始终验证通过此代理访问的网站的真实性。",
                footer_text: "由 <a href='https://github.com/Solaina888' target='_blank'>Solaina</a> 创建 | <a href='https://github.com/Solaina888/openweb-proxy' target='_blank'>在 GitHub 上 Fork</a> | MIT 许可",
                error_invalid_url: "无效网址",
                error_invalid_url_text: "请输入有效的网站地址（例如，https://example.com）"
            }
        };

        function getCookie(name) {
            const value = '; ' + document.cookie;
            const parts = value.split(';' + name + '=');
            return parts.length === 2 ? parts.pop().split(';').shift() : null;
        }

        function setCookie(name, value, days) {
            const expires = new Date();
            expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
            document.cookie = name + '=' + value + ';expires=' + expires.toUTCString() + ';path=/';
        }

        function detectBrowserLanguage() {
            const lang = navigator.language || navigator.languages[0];
            return lang.includes('zh') ? 'zh-CN' : 'en';
        }

        function setLanguage(lang) {
            if (!translations[lang]) lang = 'en';
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                if (translations[lang][key]) {
                    el.innerHTML = translations[lang][key];
                }
            });
            document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
                const key = el.getAttribute('data-i18n-placeholder');
                if (translations[lang][key]) {
                    el.placeholder = translations[lang][key];
                }
            });
            document.querySelectorAll('.language-toggle button').forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
            });
            document.documentElement.lang = lang;
            document.querySelector('body').classList.add('lang-transition');
            setTimeout(() => document.querySelector('body').classList.remove('lang-transition'), 300);
            setCookie('__OWP_LANG__', lang, 30);
        }

        document.addEventListener('DOMContentLoaded', () => {
            const savedLang = getCookie('__OWP_LANG__');
            const lang = savedLang || detectBrowserLanguage();
            setLanguage(lang);

            document.querySelectorAll('.language-toggle button').forEach(btn => {
                btn.addEventListener('click', () => {
                    const newLang = btn.getAttribute('data-lang');
                    if (newLang !== getCookie('__OWP_LANG__')) {
                        setLanguage(newLang);
                    }
                });
            });

            document.getElementById('goBtn').addEventListener('click', () => {
                const url = document.getElementById('targetUrl').value;
                if (isValidURL(url)) {
                    document.querySelector('.loader').style.display = 'block';
                    setTimeout(() => {
                        window.open(window.location.origin + '/' + url, '_blank');
                        document.querySelector('.loader').style.display = 'none';
                    }, 1000);
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: translations[lang].error_invalid_url,
                        text: translations[lang].error_invalid_url_text,
                        background: '#FFFFFF',
                        color: '#1F2937',
                        confirmButtonColor: '#2563EB'
                    });
                }
            });

            function isValidURL(str) {
                if (!str || str.trim() === '') return false;
                let urlStr = str.trim();
                if (!urlStr.includes('://')) urlStr = 'https://' + urlStr;
                try {
                    const url = new URL(urlStr);
                    if (!['http:', 'https:'].includes(url.protocol)) return false;
                    const hostname = url.hostname;
                    if (!hostname || !hostname.includes('.') || hostname.startsWith('.') || hostname.endsWith('.')) return false;
                    const tld = hostname.split('.').pop();
                    const validTLDs = ['com', 'org', 'net', 'edu', 'gov', 'co', 'io', 'ai', 'tv', 'me', 'info', 'biz', 'us', 'uk', 'ca', 'de', 'fr', 'jp', 'cn', 'ru', 'au', 'in'];
                    if (!validTLDs.includes(tld.toLowerCase())) return false;
                    const hostnameRegex = /^[a-zA-Z0-9.-]+$/;
                    if (!hostnameRegex.test(hostname) || hostname.length > 255) return false;
                    return true;
                } catch {
                    return false;
                }
            }

            function openSite(url) {
                document.querySelector('.loader').style.display = 'block';
                setTimeout(() => {
                    window.open(url, '_blank');
                    document.querySelector('.loader').style.display = 'none';
                }, 1000);
            }

            const fadeInElements = document.querySelectorAll('.fade-in');
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.animationPlayState = 'running';
                    }
                });
            }, { threshold: 0.1 });
            fadeInElements.forEach(el => observer.observe(el));
        });
    </script>
</body>
</html>
`;
const pwdPage = `
<!DOCTYPE html>
<html>
    <head>
        <script>
            function setPassword() {
                try {
                    var cookieDomain = window.location.hostname;
                    var password = document.getElementById('password').value;
                    var currentOrigin = window.location.origin;
                    var oneWeekLater = new Date();
                    oneWeekLater.setTime(oneWeekLater.getTime() + (7 * 24 * 60 * 60 * 1000)); // 一周的毫秒数
                    document.cookie = "${passwordCookieName}" + "=" + password + "; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + cookieDomain;
                    document.cookie = "${passwordCookieName}" + "=" + password + "; expires=" + oneWeekLater.toUTCString() + "; path=/; domain=" + cookieDomain;
                } catch(e) {
                    alert(e.message);
                }
                //window.location.href = currentOrigin + "?" + oneWeekLater.toUTCString();
                location.reload();
            }
        </script>
    </head>
    <body>
        <div>
            <input id="password" type="password" placeholder="Password">
            <button onclick="setPassword()">
                Submit
            </button>
        </div>
    </body>
</html>
`;
const redirectError = `
<html><head></head><body><h2>Error while redirecting: the website you want to access to may contain wrong redirect information, and we can not parse the info</h2></body></html>
`;
//new URL(请求路径, base路径).href;
async function handleRequest(request) {
	//获取所有cookie
	var siteCookie = request.headers.get('Cookie');
	if (password != "") {
		if(siteCookie != null && siteCookie != ""){
			var pwd = getCook(passwordCookieName, siteCookie);
			console.log(pwd);
			if (pwd != null && pwd != "") {
				if(pwd != password){
					return handleWrongPwd();
				}
			}else{
				return handleWrongPwd();
			}
		}else{
			return handleWrongPwd();
	    }
	}
	const url = new URL(request.url);
	//if(request.url.endsWith("favicon.ico")){
	//	return Response.redirect("https://www.cyberodyser.com/favicon.ico", 301);
	//}
	if(request.url.endsWith("robots.txt")){
		return getHTMLResponse(`
			User-Agent: *
			Disallow: /*
			Allow: /$
		`);
	}
	//var siteOnly = url.pathname.substring(url.pathname.indexOf(str) + str.length);
	var actualUrlStr = url.pathname.substring(url.pathname.indexOf(str) + str.length) + url.search + url.hash;
	if (actualUrlStr == "") { //先返回引导界面
		return getHTMLResponse(mainPage);
	}
try {
        var test = actualUrlStr;
        if (!test.startsWith("http")) {
            test = "https://" + test;
        }
        var u = new URL(test);
        if (!u.host.includes(".")) {
            throw new Error("Invalid hostname");
        }
        // Additional validation for hostname
        const hostnameRegex = /^[a-zA-Z0-9.-]+$/;
        if (!hostnameRegex.test(u.hostname) || u.hostname.length > 255) {
            throw new Error("Invalid hostname format");
        }
        const tld = u.hostname.split('.').pop();
        const validTLDs = ['com', 'org', 'net', 'edu', 'gov', 'co', 'io', 'ai', 'tv', 'me', 'info', 'biz', 'us', 'uk', 'ca', 'de', 'fr', 'jp', 'cn', 'ru', 'au', 'in'];
        if (!validTLDs.includes(tld.toLowerCase())) {
            throw new Error("Invalid TLD");
        }
    } catch (e) {
        // Return custom error page for invalid URLs
        return getHTMLResponse(errorPage);
    }
	if (!actualUrlStr.startsWith("http") && !actualUrlStr.includes("://")) { //从www.xxx.com转到https://www.xxx.com
		//actualUrlStr = "https://" + actualUrlStr;
		return Response.redirect(thisProxyServerUrlHttps + "https://" + actualUrlStr, 301);
	}
	//if(!actualUrlStr.endsWith("/")) actualUrlStr += "/";
	const actualUrl = new URL(actualUrlStr);
	let clientHeaderWithChange = new Headers();
	//***代理发送数据的Header：修改部分header防止403 forbidden，要先修改，   因为添加Request之后header是只读的（***ChatGPT，未测试）
	for (var pair of request.headers.entries()) {
		//console.log(pair[0]+ ': '+ pair[1]);
		clientHeaderWithChange.set(pair[0], pair[1].replaceAll(thisProxyServerUrlHttps, actualUrlStr).replaceAll(thisProxyServerUrl_hostOnly, actualUrl.host));
	}
	let clientRequestBodyWithChange
	if (request.body) {
		clientRequestBodyWithChange = await request.text();
		clientRequestBodyWithChange = clientRequestBodyWithChange
			.replaceAll(thisProxyServerUrlHttps, actualUrlStr)
			.replaceAll(thisProxyServerUrl_hostOnly, actualUrl.host);
	}
	const modifiedRequest = new Request(actualUrl, {
		headers: clientHeaderWithChange,
		method: request.method,
		body: (request.body) ? clientRequestBodyWithChange : request.body,
		//redirect: 'follow'
		redirect: "manual"
		//因为有时候会
		//https://www.jyshare.com/front-end/61   重定向到
		//https://www.jyshare.com/front-end/61/
		//但是相对目录就变了
	});
	//console.log(actualUrl);
	const response = await fetch(modifiedRequest);
	if (response.status.toString().startsWith("3") && response.headers.get("Location") != null) {
		//console.log(base_url + response.headers.get("Location"))
		try {
			return Response.redirect(thisProxyServerUrlHttps + new URL(response.headers.get("Location"), actualUrlStr).href, 301);
		} catch {
			getHTMLResponse(redirectError + "<br>the redirect url:" + response.headers.get("Location") + ";the url you are now at:" + actualUrlStr);
		}
	}
	var modifiedResponse;
	var bd;
	var hasProxyHintCook = (getCook(proxyHintCookieName, siteCookie) != "");
	const contentType = response.headers.get("Content-Type");
	if (contentType && contentType.startsWith("text/")) {
	    bd = await response.text();
	    //ChatGPT
	    let regex = new RegExp(`(?<!src="|href=")(https?:\\/\\/[^\s'"]+)`, 'g');
	    bd = bd.replace(regex, (match) => {
	   		if (match.includes("http")) {
	   			return thisProxyServerUrlHttps + match;
	   		} else {
	   			return thisProxyServerUrl_hostOnly + "/" + match;
	   		}
	    });
	    console.log(bd); // 输出替换后的文本
	    if (contentType && (contentType.includes("text/html") || contentType.includes("text/javascript"))){
	    	bd = bd.replace("window.location", "window." + replaceUrlObj);
	    	bd = bd.replace("document.location", "document." + replaceUrlObj);
	    }
	    //bd.includes("<html")  //不加>因为html标签上可能加属性         这个方法不好用因为一些JS中竟然也会出现这个字符串
	    //也需要加上这个方法因为有时候server返回json也是html
	    if (contentType && contentType.includes("text/html") && bd.includes("<html")) {
	    	//console.log("STR" + actualUrlStr)
	    	bd = covToAbs(bd, actualUrlStr);
	    	bd = removeIntegrityAttributes(bd);
	    	bd = 
	    	"<script>" + 
	    	((!hasProxyHintCook)?proxyHintInjection:"") + 
	    	httpRequestInjection + 
	    	"</script>" + 
	    	bd;
	    }
	    //else{
	    //   //const type = response.headers.get('Content-Type');type == null || (type.indexOf("image/") == -1 && type.indexOf("application/") == -1)
	    //   if(actualUrlStr.includes(".css")){ //js不用，因为我已经把网络消息给注入了
	    //     for(var r of CSSReplace){
	    //       bd = bd.replace(r, thisProxyServerUrlHttps + r);
	    //     }
	    //   }
	    //   //问题:在设置css background image 的时候可以使用相对目录  
	    // }
	    //console.log(bd);
	    modifiedResponse = new Response(bd, response);
	} else {
	    //var blob = await response.blob();
	    //modifiedResponse = new Response(blob, response);
	    //会导致大文件无法代理memory out
	    modifiedResponse = new Response(response.body, response);
	}
	let headers = modifiedResponse.headers;
	let cookieHeaders = [];
	// Collect all 'Set-Cookie' headers regardless of case
	for (let [key, value] of headers.entries()) {
		if (key.toLowerCase() == 'set-cookie') {
			cookieHeaders.push({ headerName: key, headerValue: value });
		}
	}
	if (cookieHeaders.length > 0) {
		cookieHeaders.forEach(cookieHeader => {
			let cookies = cookieHeader.headerValue.split(',').map(cookie => cookie.trim());
			for (let i = 0; i < cookies.length; i++) {
				let parts = cookies[i].split(';').map(part => part.trim());
				//console.log(parts);
				// Modify Path
				let pathIndex = parts.findIndex(part => part.toLowerCase().startsWith('path='));
				let originalPath;
				if (pathIndex !== -1) {
					originalPath = parts[pathIndex].substring("path=".length);
				}
				let absolutePath = "/" + new URL(originalPath, actualUrlStr).href;;
				if (pathIndex !== -1) {
					parts[pathIndex] = `Path=${absolutePath}`;
				} else {
					parts.push(`Path=${absolutePath}`);
				}
				// Modify Domain
				let domainIndex = parts.findIndex(part => part.toLowerCase().startsWith('domain='));
				if (domainIndex !== -1) {
					parts[domainIndex] = `domain=${thisProxyServerUrl_hostOnly}`;
				} else {
					parts.push(`domain=${thisProxyServerUrl_hostOnly}`);
				}
				cookies[i] = parts.join('; ');
			}
			// Re-join cookies and set the header
			headers.set(cookieHeader.headerName, cookies.join(', '));
		});
	}
	//bd != null && bd.includes("<html")
	if (contentType && contentType.includes("text/html") && response.status == 200 && bd.includes("<html")) { //如果是HTML再加cookie，因为有些网址会通过不同的链接添加CSS等文件
		let cookieValue = lastVisitProxyCookie + "=" + actualUrl.origin + "; Path=/; Domain=" + thisProxyServerUrl_hostOnly;
		//origin末尾不带/
		//例如：console.log(new URL("https://www.baidu.com/w/s?q=2#e"));
		//origin: "https://www.baidu.com"
		headers.append("Set-Cookie", cookieValue);
		if(!hasProxyHintCook){
			//添加代理提示
			const expiryDate = new Date();
			expiryDate.setTime(expiryDate.getTime() + 24 * 60 * 60 * 1000); // 24小时
			//var hintCookie = `${proxyHintCookieName}=1; expires=${expiryDate.toUTCString()}; path=/`;
			//headers.append("Set-Cookie", hintCookie);
		}
	}
	// 添加允许跨域访问的响应头
	modifiedResponse.headers.set('Access-Control-Allow-Origin', '*');
	//modifiedResponse.headers.set("Content-Security-Policy", "default-src *; script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline'; img-src * data:; media-src *; frame-src *; font-src *; connect-src *; base-uri *; form-action *;");
	if (modifiedResponse.headers.has("Content-Security-Policy")) {
		modifiedResponse.headers.delete("Content-Security-Policy");
	}
	if (modifiedResponse.headers.has("Permissions-Policy")) {
		modifiedResponse.headers.delete("Permissions-Policy");
	}
	modifiedResponse.headers.set("X-Frame-Options", "ALLOWALL");
	if(!hasProxyHintCook){
		//设置content立刻过期，防止多次弹代理警告（但是如果是Content-no-change还是会弹出）
		modifiedResponse.headers.set("Cache-Control", "max-age=0");
	}
	return modifiedResponse;
}
function escapeRegExp(string) {
	return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); // $& 表示匹配的字符
}
//https://stackoverflow.com/questions/5142337/read-a-javascript-cookie-by-name
function getCook(cookiename, cookies) {
	// Get name followed by anything except a semicolon
	var cookiestring = RegExp(cookiename + "=[^;]+").exec(cookies);
	// Return everything after the equal sign, or an empty string if the cookie name not found
	return decodeURIComponent(!!cookiestring ? cookiestring.toString().replace(/^[^=]+./, "") : "");
}
const matchList = [[/href=("|')([^"']*)("|')/g, `href="`], [/src=("|')([^"']*)("|')/g, `src="`]];
function covToAbs(body, requestPathNow) {
	var original = [];
	var target = [];
	for (var match of matchList) {
		var setAttr = body.matchAll(match[0]);
		if (setAttr != null) {
			for (var replace of setAttr) {
				if (replace.length == 0) continue;
				var strReplace = replace[0];
				if (!strReplace.includes(thisProxyServerUrl_hostOnly)) {
					if (!isPosEmbed(body, replace.index)) {
						var relativePath = strReplace.substring(match[1].toString().length, strReplace.length - 1);
						if (!relativePath.startsWith("data:") && !relativePath.startsWith("mailto:") && !relativePath.startsWith("javascript:") && !relativePath.startsWith("chrome") && !relativePath.startsWith("edge")) {
							try {
								var absolutePath = thisProxyServerUrlHttps + new URL(relativePath, requestPathNow).href;
								//body = body.replace(strReplace, match[1].toString() + absolutePath + `"`);
								original.push(strReplace);
								target.push(match[1].toString() + absolutePath + `"`);
							} catch {
								// 无视
							}
						}
					}
				}
			}
		}
	}
	for (var i = 0; i < original.length; i++) {
		body = body.replace(original[i], target[i]);
	}
	return body;
}
function removeIntegrityAttributes(body) {
	return body.replace(/integrity=("|')([^"']*)("|')/g, '');
}
// console.log(isPosEmbed("<script src='https://www.google.com/'>uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu</script>",2));
// VM195:1 false
// console.log(isPosEmbed("<script src='https://www.google.com/'>uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu</script>",10));
// VM207:1 false
// console.log(isPosEmbed("<script src='https://www.google.com/'>uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu</script>",50));
// VM222:1 true
function isPosEmbed(html, pos) {
	if (pos > html.length || pos < 0) return false;
	//取从前面`<`开始后面`>`结束，如果中间有任何`<`或者`>`的话，就是content
	//<xx></xx><script>XXXXX[T]XXXXXXX</script><tt>XXXXX</tt>
	//         |-------------X--------------|
	//                !               !
	//         conclusion: in content
	// Find the position of the previous '<'
	let start = html.lastIndexOf('<', pos);
	if (start === -1) start = 0;
	// Find the position of the next '>'
	let end = html.indexOf('>', pos);
	if (end === -1) end = html.length;
	// Extract the substring between start and end
	let content = html.slice(start + 1, end);
	// Check if there are any '<' or '>' within the substring (excluding the outer ones)
	if (content.includes(">") || content.includes("<")) {
		return true; // in content
	}
	return false;
}
function handleWrongPwd(){
	if(showPasswordPage){
		return getHTMLResponse(pwdPage);
	}else{
		return getHTMLResponse("<h1>403 Forbidden</h1><br>You do not have access to view this webpage.");
	}
}
function getHTMLResponse(html) {
	return new Response(html, {
		headers: {
			"Content-Type": "text/html; charset=utf-8"
		}
	});
}
const errorPage = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title data-i18n="title">OpenWeb Proxy - Invalid URL</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="shortcut icon" href="https://via.placeholder.com/32.png?text=OWP" type="image/png">
    <style>
        :root {
            --primary: #2563EB;
            --secondary: #3B82F6;
            --text: #1F2937;
            --text-secondary: #4B5563;
            --background: #FFFFFF;
            --card-bg: #F9FAFB;
            --border: #E5E7EB;
        }
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        body {
            background: var(--background);
            color: var(--text);
            line-height: 1.6;
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            overflow-x: hidden;
        }
        .container {
            max-width: 700px;
            margin: 2rem auto;
            padding: 0 1.5rem;
            text-align: center;
            background: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 0.5rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            flex: 1;
            position: relative;
        }
        .language-toggle {
            position: absolute;
            top: 1rem;
            right: 1.5rem;
            display: flex;
            gap: 0.5rem;
        }
        .language-toggle button {
            background: none;
            border: none;
            color: var(--text-secondary);
            font-size: 0.9rem;
            cursor: pointer;
            padding: 0.25rem 0.5rem;
            transition: color 0.3s ease;
        }
        .language-toggle button.active {
            color: var(--primary);
            font-weight: 600;
        }
        .language-toggle button:hover {
            color: var(--secondary);
        }
        h1 {
            font-size: 2rem;
            font-weight: 700;
            color: var(--text);
            margin-bottom: 1rem;
        }
        p {
            font-size: 1rem;
            color: var(--text-secondary);
            margin-bottom: 1.5rem;
        }
        .input-group {
            display: flex;
            background: var(--background);
            border: 1px solid var(--border);
            border-radius: 0.5rem;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            margin: 1.5rem 0;
            transition: box-shadow 0.3s ease;
        }
        .input-group:focus-within {
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        input#targetUrl {
            flex: 1;
            padding: 1rem;
            font-size: 1rem;
            border: none;
            background: transparent;
            color: var(--text);
            outline: none;
        }
        button#goBtn {
            background: var(--primary);
            color: white;
            border: none;
            padding: 0 1.5rem;
            font-size: 1rem;
            cursor: pointer;
            transition: background 0.3s ease;
        }
        button#goBtn:hover {
            background: var(--secondary);
        }
        .home-btn {
            display: inline-block;
            padding: 0.8rem 1.5rem;
            background: var(--primary);
            color: white;
            text-decoration: none;
            border-radius: 0.5rem;
            margin: 1rem 0;
            transition: background 0.3s ease, box-shadow 0.3s ease;
        }
        .home-btn:hover {
            background: var(--secondary);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .disclaimer {
            margin: 2rem 0;
            padding: 1rem;
            background: #F3F4F6;
            border-radius: 0.5rem;
        }
        .disclaimer h2 {
            font-size: 1.5rem;
            margin-bottom: 0.75rem;
        }
        .disclaimer p {
            font-size: 0.9rem;
            color: var(--text-secondary);
        }
        footer {
            padding: 1.5rem 0;
            text-align: center;
            background: var(--background);
            border-top: 1px solid var(--border);
        }
        footer p {
            font-size: 0.9rem;
            color: var(--text-secondary);
        }
        footer a {
            color: var(--primary);
            text-decoration: none;
            font-weight: 500;
        }
        footer a:hover {
            text-decoration: underline;
        }
        .loader {
            --size: 40px;
            width: var(--size);
            height: var(--size);
            border-radius: 50%;
            border: 4px solid var(--border);
            border-top-color: var(--primary);
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            display: none;
            animation: spin 1s linear infinite;
            z-index: 1000;
        }
        @keyframes spin {
            to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        .fade-in {
            opacity: 0;
            animation: fadeIn 0.5s ease-in forwards;
        }
        @keyframes fadeIn {
            to { opacity: 1; }
        }
        .lang-transition {
            animation: langFade 0.3s ease-in-out;
        }
        @keyframes langFade {
            0% { opacity: 0.5; }
            100% { opacity: 1; }
        }
        @media (max-width: 768px) {
            h1 { font-size: 1.75rem; }
            p { font-size: 0.95rem; }
            .container { padding: 1.5rem; }
            .language-toggle { top: 0.5rem; right: 1rem; }
        }
    </style>
</head>
<body>
    <div class="container fade-in">
        <div class="language-toggle">
            <button data-lang="en">EN</button>
            <button data-lang="zh-CN">中文</button>
        </div>
        <h1 data-i18n="error_title">Invalid URL Detected</h1>
        <p data-i18n="error_message_1">The URL you entered is not valid. Please ensure you have entered a correct website address (e.g., https://example.com).</p>
        <p data-i18n="error_message_2">Try entering a valid URL below or return to the homepage to browse popular sites.</p>
        <div class="input-group">
            <input type="text" id="targetUrl" data-i18n-placeholder="form_placeholder" placeholder="Enter a valid URL (e.g., https://example.com)" autocomplete="off">
            <button type="button" id="goBtn" data-i18n="form_button">
                <i class="fas fa-paper-plane"></i> Go
            </button>
        </div>
        <a href="https://example.com" class="home-btn" data-i18n="home_button">Return to Homepage</a>
        <div class="disclaimer">
            <h2 data-i18n="disclaimer_title">Disclaimer</h2>
            <p data-i18n="disclaimer_text">
                OpenWeb Proxy is provided "as is" without warranties. Use at your own risk and avoid accessing sensitive accounts. Ensure compliance with local laws.
            </p>
        </div>
    </div>
    <footer class="fade-in">
        <div class="container">
            <p data-i18n="footer_text">
                Created by <a href="https://github.com/your-username" target="_blank">Your Name</a> | 
                <a href="https://github.com/your-username/openweb-proxy" target="_blank">Fork on GitHub</a> | 
                Licensed under MIT
            </p>
        </div>
    </footer>
    <div class="loader"></div>
    <script>
        const translations = {
            en: {
                title: "OpenWeb Proxy - Invalid URL",
                error_title: "Invalid URL Detected",
                error_message_1: "The URL you entered is not valid. Please ensure you have entered a correct website address (e.g., https://example.com).",
                error_message_2: "Try entering a valid URL below or return to the homepage to browse popular sites.",
                form_placeholder: "Enter a valid URL (e.g., https://example.com)",
                form_button: "Go",
                home_button: "Return to Homepage",
                disclaimer_title: "Disclaimer",
                disclaimer_text: "OpenWeb Proxy is provided 'as is' without warranties. Use at your own risk and avoid accessing sensitive accounts. Ensure compliance with local laws.",
                footer_text: "Created by <a href='https://github.com/your-username' target='_blank'>Your Name</a> | <a href='https://github.com/your-username/openweb-proxy' target='_blank'>Fork on GitHub</a> | Licensed under MIT"
            },
            'zh-CN': {
                title: "OpenWeb 代理 - 无效网址",
                error_title: "检测到无效网址",
                error_message_1: "您输入的网址无效。请确保输入了正确的网站地址（例如，https://example.com）。",
                error_message_2: "请在下方输入有效网址，或返回主页浏览热门网站。",
                form_placeholder: "输入有效网址（例如，https://example.com）",
                form_button: "前往",
                home_button: "返回主页",
                disclaimer_title: "免责声明",
                disclaimer_text: "OpenWeb 代理按“原样”提供，不提供任何担保。请自行承担风险，避免访问敏感账户，并确保遵守当地法律。",
                footer_text: "由 <a href='https://github.com/your-username' target='_blank'>Your Name</a> 创建 | <a href='https://github.com/your-username/openweb-proxy' target='_blank'>在 GitHub 上 Fork</a> | MIT 许可"
            }
        };

        function getCookie(name) {
            const value = ';' + document.cookie;
            const parts = value.split(';' + name + '=');
            return parts.length === 2 ? parts.pop().split(';').shift() : null;
        }

        function setCookie(name, value, days) {
            const expires = new Date();
            expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
            document.cookie = name + '=' + value + ';expires=' + expires.toUTCString() + ';path=/';
        }

        function detectBrowserLanguage() {
            const lang = navigator.language || navigator.languages[0];
            return lang.includes('zh') ? 'zh-CN' : 'en';
        }

        function setLanguage(lang) {
            if (!translations[lang]) lang = 'en';
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                if (translations[lang][key]) {
                    el.innerHTML = translations[lang][key];
                }
            });
            document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
                const key = el.getAttribute('data-i18n-placeholder');
                if (translations[lang][key]) {
                    el.placeholder = translations[lang][key];
                }
            });
            document.querySelectorAll('.language-toggle button').forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
            });
            document.documentElement.lang = lang;
            document.querySelector('body').classList.add('lang-transition');
            setTimeout(() => document.querySelector('body').classList.remove('lang-transition'), 300);
            setCookie('__OWP_LANG__', lang, 30);
        }

        document.addEventListener('DOMContentLoaded', () => {
            const savedLang = getCookie('__OWP_LANG__');
            const lang = savedLang || detectBrowserLanguage();
            setLanguage(lang);

            document.querySelectorAll('.language-toggle button').forEach(btn => {
                btn.addEventListener('click', () => {
                    const newLang = btn.getAttribute('data-lang');
                    if (newLang !== getCookie('__OWP_LANG__')) {
                        setLanguage(newLang);
                    }
                });
            });

            document.getElementById('goBtn').addEventListener('click', () => {
                const url = document.getElementById('targetUrl').value;
                if (isValidURL(url)) {
                    document.querySelector('.loader').style.display = 'block';
                    setTimeout(() => {
                        window.location.href = window.location.origin + '/' + url;
                        document.querySelector('.loader').style.display = 'none';
                    }, 1000);
                } else {
                    alert(translations[lang].error_invalid_url_text);
                }
            });

            function isValidURL(str) {
                if (!str || str.trim() === '') return false;
                let urlStr = str.trim();
                if (!urlStr.includes('://')) urlStr = 'https://' + urlStr;
                try {
                    const url = new URL(urlStr);
                    if (!['http:', 'https:'].includes(url.protocol)) return false;
                    const hostname = url.hostname;
                    if (!hostname || !hostname.includes('.') || hostname.startsWith('.') || hostname.endsWith('.')) return false;
                    const tld = hostname.split('.').pop();
                    const validTLDs = ['com', 'org', 'net', 'edu', 'gov', 'co', 'io', 'ai', 'tv', 'me', 'info', 'biz', 'us', 'uk', 'ca', 'de', 'fr', 'jp', 'cn', 'ru', 'au', 'in'];
                    if (!validTLDs.includes(tld.toLowerCase())) return false;
                    const hostnameRegex = /^[a-zA-Z0-9.-]+$/;
                    if (!hostnameRegex.test(hostname) || hostname.length > 255) return false;
                    return true;
                } catch {
                    return false;
                }
            }

            const fadeInElements = document.querySelectorAll('.fade-in');
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.animationPlayState = 'running';
                    }
                });
            }, { threshold: 0.1 });
            fadeInElements.forEach(el => observer.observe(el));
        });
    </script>
</body>
</html>
`;

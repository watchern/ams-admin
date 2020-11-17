var browserUtils = {
	getBrowserType: function() {
		return this.Browser.name;
	},
	
	getBrowserVersion: function(){
		return this.Browser.version;
	},
	
	isFirefox : function() {
		return this.Browser.firefox === true;
	},

	isIE : function() {
		return this.Browser.ie === true;
	},

	isIE6 : function() {
		return this.Browser.ie6 === true;
	},

	isIE11 : function() {
		return navigator.userAgent.toLowerCase().indexOf("trident/7.0") >= 0;
	},
	
	isEdge : function() {
		return this.Browser.edge === true;
	},

	isChrome : function() {
		return this.Browser.chrome === true;
	},
	
	isQQBrowser : function() {
		return this.Browser.qqBrowser === true;
	},

	isSafari : function() {
		return this.Browser.safari === true;
	},

	isOpera : function() {
		return this.Browser.opera === true;
	},

	isIE7 : function() {
		return this.Browser.ie7 === true;
	},

	isZhCN : function() {
		return /\bzh\-/.test(this.Browser.Lang);
	}

};

( function(exporter) {
	// exporter = exporter || window;
	var ua = navigator.userAgent.toLowerCase();
	var platform = navigator.platform.toLowerCase();
	var regexEdge = /(edge)[\s\/:]([\w\d\.]+)?.*?(safari|version[\s\/:]([\w\d\.]+)|$)/;
	var regex = /(opera|ie|firefox|chrome|version|iphone os|ipad os)[\s\/:]([\w\d\.]+)?.*?(safari|version[\s\/:]([\w\d\.]+)|$)/;
	var UA = ua.match(regexEdge) || ua.match(regex) || [ null, 'unknown', 0 ];
	var mode = null; // UA[1] == 'ie' && document.documentMode;
	var Browser = {
		name : (UA[1] == 'version') ? UA[3] : UA[1],
		version : mode || ((UA[1] == 'opera' && UA[4]) ? UA[4] : UA[2]),
		Platform : {
			name : ua.match(/ip(?:ad|od|hone)/) ? 'ios' : (ua.match(/(?:webos|android)/)
					|| platform.match(/mac|win|linux/) || [ 'other' ])[0],
			version : ua.match(/ip(?:ad|od|hone)/) ? null : (ua.match(/android(\s|\d|\.)*/)|| [ 'other' ])[0]
		}
	};
	if (Browser.version && (typeof Browser.version =="string")) {
		Browser.version = parseFloat(Browser.version.replace('_', '.'));
	}
	if (Browser.name == 'unknown') {
		if ((UA = /(msie\s|trident.*rv:)([\w.]+)/.exec(ua))) {
			Browser.name = 'ie';
			Browser.version = parseFloat(UA[2] || '0');
		}
	}
	Browser[Browser.name] = true;
	Browser[Browser.name + parseInt(Browser.version, 10)] = true;
	Browser.Platform[Browser.Platform.name] = true;
	if (Browser.Platform.android) {
		//Browser.Platform.androidApp = true;
	}
	Browser.Lang = (navigator.userLanguage || navigator.language || '').toLowerCase();
	if (ua.indexOf("qqbrowser") >= 0)
		Browser.qqBrowser = true;
	exporter['Browser'] = Browser;
})(browserUtils);

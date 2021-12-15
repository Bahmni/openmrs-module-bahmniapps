const importMap = {
	medication: [
		{ name: "drug-search-app", enabled: true, urls: ["http://localhost/medication/static/js/bundle.js", "http://localhost/medication/static/js/vendors~main.chunk.js","http://localhost/medication/static/js/main.chunk.js"] },
		{ name: "sample-app2", enabled: false, urls: ["../common/mf-app-shell/demo-apps/react-app2.js"] },
	],
	observations: [
		{ name: "sample-app", enabled: true, urls: ["../common/mf-app-shell/demo-apps/react-app.js"] },
		{ name: "sample-app2", enabled: false, urls: ["../common/mf-app-shell/demo-apps/react-app2.js"] },
	]
};

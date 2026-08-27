const { JSDOM } = require('jsdom');
JSDOM.fromURL('http://127.0.0.1:8090/', {
  runScripts: "dangerously",
  resources: "usable"
}).then(dom => {
  dom.window.onerror = function(msg, src, l, c, err) {
    console.log("JSDOM ERROR:", msg);
  };
  setTimeout(() => {
    console.log("JSDOM BODY LENGTH:", dom.window.document.body.innerHTML.length);
    console.log(dom.window.document.body.innerHTML.substring(0, 500));
  }, 2000);
}).catch(console.error);

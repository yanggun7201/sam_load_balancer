const proxy = require('express-http-proxy');
const app = require('express')();
const bodyParser = require('body-parser');
const moment = require('moment');

// app.use('/proxy', proxy('www.google.com'));

const HOST = "localhost";
const PORT = 8080;
let count = 0;

const ports = [
  8082, 8083, 8084, 8085, 8086
]
const samCount = ports.length;

const queue = [];

const sleep = async () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, 500);
  });
}

const getTurn = async (key, url, index) => {
  queue.push(key);

  while (true) {
    if (queue[0] === key) {
      console.log("[" + getDatetime() + "] " + url + " " + index);
      setTimeout(() => {
        queue.shift();
      }, 2000);
      break;
    }
    await sleep();
  }
}

function getDatetime () {
  return moment().format("YYYY-MM-DD hh:mm:ss");
}

function selectProxyPort() {
  const server = "http://" + HOST + ":" + ports[(++count % samCount)];
  // console.log("[" + new Date().toISOString() + "] " + server);
  return server;
}

app.use('/', proxy(selectProxyPort, {
  timeout: 30000,
  limit: '10mb',
  proxyReqOptDecorator: function (proxyReqOpts, srcReq) {
    return new Promise(function (resolve) {
      // const originalUrl = "http://" + proxyReqOpts.host + ":" + proxyReqOpts.port + srcReq.originalUrl;
      const originalUrl = proxyReqOpts.port + srcReq.originalUrl;
      const index = count;

      srcReq.originalUrl = originalUrl;
      srcReq.index = index;

      (async () => {
        await getTurn(Math.random(), originalUrl, index);
        resolve(proxyReqOpts);
      })();
    })
  },
  userResDecorator: function (proxyRes, proxyResData, userReq, userRes) {
    if (userRes.statusCode !== 200) {
      console.log("[" + getDatetime() + "] " + userReq.originalUrl + " " + userReq.index, "[", userRes.statusCode, "]");
    }
    return proxyResData;
  },
}));

// parse various different custom JSON types as JSON
app.use(bodyParser.json({ type: 'application/*+json' }))

// parse some custom thing into a Buffer
app.use(bodyParser.raw({ type: 'application/vnd.custom-type' }))

// parse an HTML body into a string
app.use(bodyParser.text({ type: 'text/html' }))

// Start the Proxy
app.listen(PORT, HOST, () => {
  console.log(`Starting Proxy at ${HOST}:${PORT} to [${ports.join(",")}]`);
});

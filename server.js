const http = require("http");
const fs = require("fs");
const path = require("path");
const EventEmitter = require("events");

const PORT = 8000;
const MAX_EVENT_LISTENERS = 5000;

const MIME_TYPES = {
  default: "application/octet-stream",
  html: "text/html; charset=UTF-8",
  js: "application/javascript",
  css: "text/css",
  png: "image/png",
  jpg: "image/jpg",
  gif: "image/gif",
  ico: "image/x-icon",
  svg: "image/svg+xml",
};

const STATIC_PATH = path.join(process.cwd(), "./www");
const toBool = [() => true, () => false];

http
  .createServer(async (req, res) => {
    if (req.url === "/events") {
      sendSSE(req, res);
    } else if (req.method === "POST" && req.url === "/api/log") {
      postLog(req, res);
    } else if (req.method === "GET") {
      getFile(req, res);
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.write("Route not found");
      res.end();
      logActivity(req.method, req.url, 404);
    }
  })
  .listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
  });

const events = new EventEmitter();
events.setMaxListeners(MAX_EVENT_LISTENERS);

async function postLog(req, res) {
  let statusCode;

  statusCode = 201;
  res.writeHead(201, { "Content-Type": "application/json" });
  console.log(`${req.method} ${req.url} ${statusCode}`);
  events.emit("sendSSE", "hi?");
  res.end();
}

async function getFile(req, res) {
  const file = await prepareFile(req.url);
  const statusCode = file.found ? 200 : 404;
  const mimeType = MIME_TYPES[file.ext] || MIME_TYPES.default;
  res.writeHead(statusCode, { "Content-Type": mimeType });
  file.stream.pipe(res);
  logActivity(req.method, req.url, statusCode);
}


// https://developer.mozilla.org/en-US/docs/Learn/Server-side/Node_server_without_framework
async function prepareFile(url) {
  const paths = [STATIC_PATH, url];
  if (url.endsWith("/")) paths.push("index.html");
  const filePath = path.join(...paths);
  const pathTraversal = !filePath.startsWith(STATIC_PATH);
  const exists = await fs.promises.access(filePath).then(...toBool);
  const found = !pathTraversal && exists;
  const streamPath = found ? filePath : STATIC_PATH + "/404.html";
  const ext = path.extname(streamPath).substring(1).toLowerCase();
  const stream = fs.createReadStream(streamPath);
  return { found, ext, stream };
}

function logActivity(method, url, statusCode) {
  console.log(`${method} ${url} ${statusCode}`);
}


function sendSSE(req, res) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const id = new Date().getTime();

  events.on("sendSSE", (message)=>{
    console.log('message', message);
    constructSSE(res, id, "test");
  })
}

function constructSSE(res, id, data) {
  res.write("id: " + id + "\n");
  res.write("data: " + data + "\n\n");
}

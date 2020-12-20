var fs = require('fs'),
    http = require('http');

http.createServer(function (req, res) {
  let url = req.url;
  const index = url.indexOf('?');
  if (index != -1) {
    url = url.substr(0, index);
  }
  let fileName = __dirname + (url === '/' ? '/index.html' : url);
  if (!fs.existsSync(fileName) || fs.lstatSync(fileName).isDirectory()) {
    fileName += '.html';
  }
  fs.readFile(fileName, function (err, data) {
    if (err) {
      res.writeHead(404);
      res.end(JSON.stringify(err));
      return;
    }
    if (fileName.endsWith('.svg')) {
        res.setHeader('Content-Type', 'image/svg+xml')
    } else if (fileName.endsWith('.gif')) {
        res.setHeader('Content-Type', 'image/gif')
    } else if (fileName.endsWith('.jpg')) {
        res.setHeader('Content-Type', 'image/jpg')
    } else if (fileName.endsWith('.js')) {
        res.setHeader('Content-Type', 'text/javascript')
    } else if (fileName.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css')
    }
    res.writeHead(200);
    res.end(data);
  });
}).listen(8080);

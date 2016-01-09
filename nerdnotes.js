/*******************************************************************************
Permission to use, copy, modify, and/or distribute this software for any purpose
with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH 
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, 
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER 
TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
THIS SOFTWARE.
*******************************************************************************/

var http = require('http');
var fs = require('fs');
var path = require('path');
var marked = require('marked');
var url = require('url');

var configPath = path.join(__dirname, 'config.json');
var config = '';
try {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  if(config.verbose) {
  console.log('*** Configuration ***');
  console.log('  HTTP Port      : ' + config.httpPort);
  console.log('  Notes Path     : ' + config.notesPath);
  console.log('  CSS Path       : ' + config.cssPath);
  }
}
catch(err) {
  console.log("Error: Unable to parse " + configPath);
  console.log("Copy example-config.json to config.json and edit to suit " +
    "your environment.");
  process.exit();
}

var stylesheet = '<style>\n' + 
                 fs.readFileSync(path.join(__dirname, config.cssPath),
                                 'utf8') + 
                 '</style>\n';

var metadata = '<meta name="viewport" content="width=device-width, ' +
               'initial-scale=1">\n';

/*******************************************************************************
Start HTTP server instance
*******************************************************************************/
http.createServer(function (req, res) {
  if(config.verbose) console.log(new Date().toString(),
      "HTTP Request from " + req.connection.remoteAddress);
  // URL's for requesting directories or files must include the notes root
  // directory. This is added if the URL is only the host address.
  // uri is the relative path used by serving functions
  var uri = url.parse(req.url).pathname;
  if(uri == '' || uri == '/') uri = '/' + path.basename(config.notesPath);
  // filePath is the full system file path - for working with actual files
  var filePath = path.join(path.dirname(config.notesPath), uri);
  if(config.verbose) console.log(new Date().toString(),
       "Info: Notes Path = " + filePath);
  fs.exists(filePath, function(exists) {
    if(!exists) {
      if(config.verbose) console.log(new Date().toString(),
           "Error: File does not exist.");
      res.writeHead(404, {"Content-Type": "text/plain"});
      res.write("404 Not Found\n" + 
                "Check the notesPath value in your config.json file\n");
      res.end();
    } else if(fs.statSync(filePath).isDirectory()) {
      ServeIndex(req, res, uri);
    } else {
      ServeMarkdown(req, res, uri);
    }
  });
}).listen(config.httpPort);
console.log(new Date().toString(), "Notesweb listening on port " + 
            config.httpPort);

/*******************************************************************************
Build and return a simple navigation header. The header will be the current, 
relative path where each directory is a link.
*******************************************************************************/
function navHeading(uri) {
  var navHtml = '<h3>';
  var links = uri.split(path.sep);
  var nextPath = '';
  for(var i = 0; i < links.length; i++) {
    if(links[i] != '') { // Check for trailing slash
      nextPath = nextPath + '/' + links[i];
      navHtml = navHtml + '/';
      navHtml = navHtml + '<a href="' + nextPath + '">' + links[i] + '</a>';
    }
  }
  navHtml = navHtml + '\n</h3>\n';
  if(config.verbose) console.log(new Date().toString(), "Info: Built " +
    navHtml);
  return navHtml;
}

/*******************************************************************************
Build an index page for any directory with a list of files and sub-
directories it contains.
*******************************************************************************/
function ServeIndex(req, res, uri) {
  var indexPath = path.join(path.dirname(config.notesPath), uri);
  var indexHtml = stylesheet + metadata +
              '<html>\n' +
	      '<body>\n' +
	      navHeading(uri) +
	      '<ul>';
  var fileList = fs.readdirSync(indexPath);
  for(var i = 0; i < fileList.length; i++) {
    if(fileList[i][0] != '.') { // Skip hidden files
      var linkPath = path.join('/', uri, fileList[i]);
      var filePath = path.join(indexPath, fileList[i]);
      var countText = '';
      var isDir = false;
      if(fs.statSync(filePath).isDirectory()) {
        isDir = true;
        var fileCount = fs.readdirSync(filePath).length;
        countText = ' (' + fileCount + ')';
      }
      indexHtml = indexHtml +
                  '<li>' + 
  		'<a href="' + linkPath + '">' + (isDir ? '<em>':'') + 
                  fileList[i] + (isDir ? '</em>':'') + '</a>' + countText + 
  		'</li>\n';
    }
  }
  indexHtml = indexHtml +
              '</ul>\n' +
	      '</body>\n' +
              '</html>';
  res.writeHead(200, {"Content-Type": "text/html"});
  res.write(indexHtml, 'utf8');
  res.end();
}

/*******************************************************************************
Use the 'marked' module to convert markdown files to HTML and return.
*******************************************************************************/
function ServeMarkdown(req, res, uri)  {
  if(config.verbose) console.log(new Date().toString(),
       "Serving: " + uri);
  var filePath = path.join(path.dirname(config.notesPath), uri);
  fs.exists(filePath, function(exists) {
    if(!exists) {
      if(config.verbose) console.log(new Date().toString(),
           "Error: File does not exist.");
      res.writeHead(404, {"Content-Type": "text/plain"});
      res.write("404 Not Found\n");
      res.end();
      return;
    }
    fs.readFile(filePath, 'utf8', function(err, file) {
      if(err) {
        if(config.verbose) console.log(new Date().toString(),
             "Error: Unable to read file.");
        res.writeHead(500, {"Content-Type": "text/plain"});
        res.write(err + "\n");
        res.end();
        return;
      }
      var notesHtml = stylesheet + metadata + navHeading(uri) + marked(file);
      if(config.verbose) console.log(new Date().toString(),
           "Info: Writing file to client.");
      res.writeHead(200, {"Content-Type": "text/html"});
      res.write(notesHtml, 'utf8');
      res.end();
    });
  });
}

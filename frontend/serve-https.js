const https = require('https');
const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, 'dist');
const PORT = process.env.HTTPS_PORT || 443;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp',
};

const options = {
  key: fs.readFileSync(path.join(__dirname, '../backend/client-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '../backend/client-cert.pem')),
};

https
  .createServer(options, (req, res) => {
    const urlPath = req.url.split('?')[0];
    const filePath = path.join(DIST, urlPath);

    if (!filePath.startsWith(DIST)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    const serve = (fp) => {
      fs.readFile(fp, (err, data) => {
        if (err) {
          if (fp !== path.join(DIST, 'index.html')) {
            serve(path.join(DIST, 'index.html'));
          } else {
            res.writeHead(404);
            res.end('Not found');
          }
          return;
        }
        const ext = path.extname(fp);
        res.writeHead(200, {
          'Content-Type': MIME[ext] || 'application/octet-stream',
        });
        res.end(data);
      });
    };

    serve(filePath);
  })
  .listen(PORT, () => {
    console.log(`Frontend HTTPS server running on port ${PORT}`);
  });

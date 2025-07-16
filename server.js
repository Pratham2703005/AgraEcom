const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
// In serverless environments, we shouldn't restrict the hostname
const hostname = dev ? 'localhost' : undefined;
const port = parseInt(process.env.PORT, 10) || 3000;

// Configure Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Export the handler for serverless environments
module.exports = async (req, res) => {
  await app.prepare();
  const parsedUrl = parse(req.url, true);
  const { pathname, query } = parsedUrl;

  try {
    // Handle specific routes that are causing issues
    if (pathname === '/admin/banners/new') {
      await app.render(req, res, '/admin/banners/new', query);
    } else if (pathname === '/admin/brands/new') {
      await app.render(req, res, '/admin/brands/new', query);
    } else if (pathname === '/admin/brands/view-all') {
      await app.render(req, res, '/admin/brands/view-all', query);
    } else {
      await handle(req, res, parsedUrl);
    }
  } catch (err) {
    console.error('Error in serverless function:', req.url);
    console.error(err);
    res.statusCode = 500;
    res.end(dev ? `Serverless Error: ${err.message}\n\n${err.stack}` : 'Internal Server Error');
  }
};

// Prepare the app and handle any initialization errors
app.prepare().catch(err => {
  console.error('Error during Next.js initialization:');
  console.error(err);
  process.exit(1);
}).then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      const { pathname, query } = parsedUrl;

      // Handle specific routes that are causing issues
      if (pathname === '/admin/banners/new') {
        await app.render(req, res, '/admin/banners/new', query);
      } else if (pathname === '/admin/brands/new') {
        await app.render(req, res, '/admin/brands/new', query);
      } else if (pathname === '/admin/brands/view-all') {
        await app.render(req, res, '/admin/brands/view-all', query);
      } else {
        await handle(req, res, parsedUrl);
      }
    } catch (err) {
      console.error('Error occurred handling', req.url);
      console.error(err);
      
      // Send detailed error in development, generic message in production
      res.statusCode = 500;
      if (dev) {
        res.end(`Internal Server Error: ${err.message}\n\n${err.stack}`);
      } else {
        res.end('Internal Server Error');
      }
    }
  }).listen(port, (err) => {
    if (err) {
      console.error('Error starting server:');
      console.error(err);
      process.exit(1);
    }
    
    // In serverless environments, hostname might be undefined
    const serverUrl = hostname 
      ? `http://${hostname}:${port}` 
      : `on port ${port}`;
    console.log(`> Ready ${serverUrl}`);
  });
});
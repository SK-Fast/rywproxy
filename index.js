const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 3000;

const http = require('https'),
    httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({});

const server = http.createServer(function (req, res) {
    proxy.web(req, res, {
        target: 'https://rayongwit.ac.th/',
        secure: true,
        ws: false,
        prependPath: false,
        ignorePath: false,
        changeOrigin: true,
        auth: false
    })
})

proxy.on('proxyRes', function (proxyRes, req, res) {
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin ?? "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "*");
})

console.log("Listening")
server.listen(port)
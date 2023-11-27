import http from 'node:http'
import httpProxy from 'npm:http-proxy@1.18.1'

const host = Deno.env.get("HOST") || '0.0.0.0';
const port = Deno.env.get("PORT") || 3000;

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
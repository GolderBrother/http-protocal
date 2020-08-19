// HTTP是协议名，http是实现HTTP协议的node模块
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
// 创建一个http服务器

const HTML_PATH_LIST = ['/get.html', '/post.html'];
const server = http.createServer(function (req, res) {
    const { pathname } = url.parse(req.url);
    if (HTML_PATH_LIST.includes(pathname)) {
        res.statusCode = 200;
        // Content-Type: text/html; charset=utf-8
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        // 以同步的方式读取文件，获取内容
        const content = fs.readFileSync(path.join(__dirname, 'static', pathname.slice(1)));
        //向客户端写响应
        res.write(content);
        //结束 这次写入
        res.end();
    } else if (pathname === '/get') {
        console.log(req.method, req.url, req.headers);
        // GET http://127.0.0.1:8000/get {
        // connection: 'keep-alive',
        // host: '127.0.0.1:8000',
        // name: 'james',
        // age: '18'
        // }
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.write('get');
        res.end();
    } else if (pathname === '/post') {
        console.log(req.method, req.url, req.headers);
        const buffers = [];
        //tcp传输的时候,有可能会分包.客户给服务器发10M 可能分成10次发送,每次发1M
        //on data得到的只有请求体
        req.on('data', (data) => {
            buffers.push(data);
        });
        req.on('end', () => {
            res.statusCode = 200;
            //Buffer是一个类,是node里的一个类,类似于字节数组
            const body = Buffer.concat(buffers);
            console.log('body', body);
            res.write(body);
            res.setHeader('Content-Type', 'text/plain');
            res.write(body);
            res.end();
        });
    } else {
        res.statusCode = 200;
        res.end();
    }
});

server.listen(8000);
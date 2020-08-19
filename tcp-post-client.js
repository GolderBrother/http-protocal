// 传输层模块，相当于实现TCP的一个模块
const net = require('net');
const urlUtil = require('url');
// https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest/readyState
const ReadyState = {
    UNSENT: 0, // 代理被创建，但尚未调用 open() 方法
    OPENED: 1, // open() 方法已经被调用。
    HEADERS_RECEIVED: 2, // send() 方法已经被调用，并且头部和状态已经可获得。
    LOADING: 3, // 下载中； responseText 属性已经包含部分数据。
    DONE: 4 // 	下载操作已完成。
};


/**
GET /get HTTP/1.1
Host: 127.0.0.1:8080
Connection: keep-alive
name: james
age: 18

*/

class XMLHttpRequest {
    constructor() {
        // 默认是初始化的,未调用open方法
        this.readyState = ReadyState.UNSENT;
        // 设置当前创建的请求一直处于连接状态,下次不需要重新创建
        this.headers = { 'Connection': 'keep-alive' };
    }
    open(method, url) {
        this.method = method;
        this.url = url;
        // 主机、端口、路径
        const { hostname, port, path } = urlUtil.parse(url);
        console.log(`open url`, url);
        console.log(`open urlUtil.parse(url)`, urlUtil.parse(url));
        // open url http://127.0.0.1:8000/post
        // open urlUtil.parse(url) Url {
        // protocol: 'http:',
        // slashes: true,
        // auth: null,
        // host: '127.0.0.1:8000',
        // port: '8000',
        // hostname: '127.0.0.1',
        // hash: null,
        // search: null,
        // query: null,
        // pathname: '/post',
        // path: '/post',
        // href: 'http://127.0.0.1:8000/post'
        // }
        this.hostname = hostname;
        this.port = port;
        this.path = path;
        // Host: www.baidu.com
        this.headers['Host'] = `${hostname}:${port}`;

        // 通过传输层的net模块发起请求
        const socket = this.socket = net.createConnection({
            hostname,
            port
        }, () => { // 连接成功之后可以监听服务器的数据
            socket.on('data', (data) => {
                data = data.toString();
                console.log('data', data);

                // data HTTP/1.1 200 OK
                // Content-Type: text/plain
                // Date: Wed, 19 Aug 2020 13:49:30 GMT
                // Connection: keep-alive
                // Transfer-Encoding: chunked

                // 3
                // get
                // 0 -> 表示成功

                // 结尾还有两个 \r\n
                // 解析出请求体
                const [response, bodyRows] = data.split('\r\n\r\n');
                // 解析出状态行和请求头
                const [statusLine, ...headerRows] = response.split('\r\n');
                // 从请求行中解 析请求状态和文本描述
                const [, status, statusText] = statusLine.split(' ');
                this.status = status;
                this.statusText = statusText;
                this.responseHeaders = headerRows.reduce((memo, row) => {
                    const [key, value] = row.split(': ');
                    memo[key] = value;
                    return memo;
                }, {});
                this.readyState = ReadyState.HEADERS_RECEIVED;
                typeof this.onreadystatechange === 'function' && this.onreadystatechange();
                // 响应头，响应行，响应体
                const [, body,] = bodyRows.split('\r\n');
                this.readyState = ReadyState.LOADING;
                typeof this.onreadystatechange === 'function' && this.onreadystatechange();
                this.response = this.responseText = body;
                this.readyState = ReadyState.DONE;
                typeof this.onreadystatechange === 'function' && this.onreadystatechange();
                typeof this.onload === 'function' && this.onload();
            });
        });
        this.readyState = ReadyState.OPENED;
        typeof this.onreadystatechange === 'function' && this.onreadystatechange();
    }

    // 设置请求头
    setRequestHeader(header, value) {
        this.headers[header] = value;
    }

    // 构建响应头
    getAllResponseHeaders() {
        let result = '';
        for (const key in this.headers) {
            result += `${key}: ${this.headers[key]}\r\n`;
        }
        return result;
    }

    // 获取响应头
    getResponseHeader(key) {
        return this.responseHeadersp[key];
    }

    // 发送请求
    send(body) {
        const rows = [];
        // GET /get HTTP/1.1
        rows.push(`${this.method} ${this.url} HTTP/1.1`);
        // Content-Length: 47
        rows.push(`Content-Length: ${Buffer.byteLength(body)}`);
        rows.push(...Object.keys(this.headers).map(key => `${key}: ${this.headers[key]}`));
        const request = rows.join('\r\n') + '\r\n\r\n' + body;
        console.log(`request`, request);
        this.socket.write(request);
    }
}

const xhr = new XMLHttpRequest();
xhr.onreadystatechange = function () {
    console.log('onreadystatechange', xhr.readyState);
}
xhr.open('POST', 'http://127.0.0.1:8000/post');
xhr.responseType = 'text';
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.onload = function () {
    console.log('readyState', xhr.readyState);
    console.log('status', xhr.status);
    console.log('statusText', xhr.statusText);
    console.log('getAllResponseHeaders', xhr.getAllResponseHeaders());
    console.log('response', xhr.response);
}
//http是应用层的是解析数据的 tcp是传输层的与内容无关的
xhr.send('{"name":"james","age":18}');

// onreadystatechange 1
// request POST http://127.0.0.1:8000/post HTTP/1.1
// Content-Length: 25
// Connection: keep-alive
// Host: 127.0.0.1:8000
//   search: null,
//   query: null,
//   pathname: '/post',
//   path: '/post',
//   href: 'http://127.0.0.1:8000/post'
// }
// onreadystatechange 1
// request POST http://127.0.0.1:8000/post HTTP/1.1
// Content-Length: 25
// Connection: keep-alive
// Host: 127.0.0.1:8000
// Content-Type: application/json

// {"name":"james","age":18}

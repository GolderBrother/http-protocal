const net = require('net');
/**
 * 创建一个tcp服务器,每当有客户端来连接了,就会为他创建一个socket
 */
const server = net.createServer(socket => {
    socket.on('data', (data) => {
        console.log('data', data);
        // 解析请求
        const request = data.toString();
        const [requestLine, ...headerRows] = request.split('\r\n');
        const [method, url] = requestLine.split(' ');
        const headers = headerRows.reduce((memo, row) => {
            const [key, value] = row.split(': ');
            memo[key] = value;
            return memo;
        }, {});
        console.log('method', method);
        console.log('url', url);
        console.log('headers', headers);

        // 构建响应体
        // data <Buffer 47 45 54 20 68 74 74 70 3a 2f 2f 31 32 37 2e 30 2e 30 2e 31 3a 38 30 30 30 2f 67 65 74 20 48 54 54 50 2f 31 2e 31 0d 0a 43 6f 6e 6e 65 63 74 69 6f 6e ... 60 more bytes>
        // method GET
        // url http://127.0.0.1:8000/get
        // headers {
        // Connection: 'keep-alive',
        // Host: '127.0.0.1:8000',
        // name: 'james',
        // age: '18',
        // '': undefined
        // }
        // response HTTP/1.1 200 OK
        // Content-Type: text/plain
        // Connection: keep-alive
        // Transfer-Encoding: chunked
        // Content-Length: 3

        // 3
        // get
        // 0
        const rows = [];
        rows.push(`HTTP/1.1 200 OK`);
        rows.push(`Content-Type: text/plain`);
        rows.push(`Connection: keep-alive`);
        rows.push(`Transfer-Encoding: chunked`);
        const body = 'get';
        rows.push(`Content-Length: ${Buffer.byteLength(body)}`);//返回这个字符串的字节长度 一般body.length
        rows.push(`\r\n${Buffer.byteLength(body).toString(16)}\r\n${body}\r\n0`);
        const response = rows.join('\r\n');
        console.log('response', response);
        socket.end(response);
    });
});
server.listen(8000);
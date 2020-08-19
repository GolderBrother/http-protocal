const net = require('net');
const Parser = require('./Parser');
/**
 * 创建一个tcp服务器,每当有客户端来连接了,就会为他创建一个socket
 * socket 就像是电话机一样,你发我收, 我发你收
 */
const server = net.createServer(socket => {
    socket.on('data', (data) => {
        const parser = new Parser();
        const { method, url, headers, body } = parser.parse(data);
        console.log('parser.parse(data)', parser.parse(data));
        console.log('method', method);
        console.log('url', url);
        console.log('headers', headers);

        // parser.parse(data) {
        //     method: 'POST',
        //     url: 'http://127.0.0.1:8000/post',
        //     headers: {
        //       'Content-Length': '25',
        //       Connection: 'keep-alive',
        //       Host: '127.0.0.1:8000',
        //       'Content-Type': 'application/json'
        //     },
        //     body: '{"name":"james","age":18}'
        //   }
        //   method POST
        //   url http://127.0.0.1:8000/post
        //   headers {
        //     'Content-Length': '25',
        //     Connection: 'keep-alive',
        //     Host: '127.0.0.1:8000',
        //     'Content-Type': 'application/json'
        //   }
        //   response HTTP/1.1 200 OK
        //   Content-Type: text/plain
        //   Date: Wed, 19 Aug 2020 14:22:09 GMT
        //   Connection: keep-alive
        //   Content-Length: 25

        //   19
        //   {"name":"james","age":18}
        //   0

        


        // 构建响应体
        const rows = [];
        rows.push(`HTTP/1.1 200 OK`);
        rows.push(`Content-Type: text/plain`);
        rows.push(`Date: ${new Date().toGMTString()}`);
        rows.push(`Connection: keep-alive`);
        rows.push(`Content-Length: ${Buffer.byteLength(body)}`);//返回这个字符串的字节长度 一般body.length
        rows.push(`\r\n${Buffer.byteLength(body).toString(16)}\r\n${body}\r\n0`);
        const response = rows.join('\r\n');
        console.log('response', response);
        socket.end(response);
    });
});

server.listen(8000);
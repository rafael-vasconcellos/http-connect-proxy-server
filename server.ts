import http, { IncomingMessage, RequestOptions, ServerResponse } from 'http';
import net from 'net';
import url from 'url';



const PORT = process.env.PORT ?? 8080;

// Handler para requisições HTTP (GET, POST etc.)
function requestHandler(clientReq: IncomingMessage, clientRes: ServerResponse) {
    const parsedUrl = url.parse(clientReq.url || '');

    if (!parsedUrl.hostname || !parsedUrl.path) {
        clientRes.writeHead(400);
        clientRes.end('URL inválida');
        return;
    }
    
    const options: RequestOptions = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 443,
        path: parsedUrl.path,
        method: clientReq.method,
        headers: clientReq.headers
    };

    const proxyReq = http.request(options, (proxyRes) => {
        clientRes.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
        proxyRes.pipe(clientRes, { end: true });
    });

    proxyReq.on('error', (err) => {
        console.error('Erro na requisição proxy:', err.message);
        clientRes.writeHead(500);
        clientRes.end('Erro no proxy');
        proxyReq.end(); // Adicionado para garantir o encerramento
    });

    clientReq.pipe(proxyReq, { end: true });
};

// Handler para conexões HTTPS via método CONNECT
function connectHandler(req: IncomingMessage, clientSocket: net.Socket, head: Buffer) { 
    const [ hostname, port ] = (req.url || '').split(':');
    const targetPort = port ? parseInt(port, 10) : 443;
    const serverSocket = net.connect(targetPort, hostname, () => {
        clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
        serverSocket.write(head);
        serverSocket.pipe(clientSocket);
        clientSocket.pipe(serverSocket);
    });

    serverSocket.on('error', (err) => {
        console.error('Erro no túnel CONNECT:', err.message);
        clientSocket.end();
    });

    clientSocket.on('error', (err) => {
        console.error('Erro no socket do cliente:', err.message);
    }); 
};




// Cria o servidor proxy
const proxyServer = http.createServer(requestHandler);

proxyServer.on('connect', connectHandler);

proxyServer.listen(PORT, () => {
    console.log(`Proxy HTTP ouvindo na porta ${PORT}`);
});

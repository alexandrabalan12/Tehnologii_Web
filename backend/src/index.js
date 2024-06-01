import http from 'http';
import handleAPI from './routes/apiRoutes.js';
const PORT = process.env.PORT;

const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all domains (for development purposes)
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    try {
        handleAPI(req, res);
    } catch(err) {
        console.log(err);
        res.writeHead(500, {
            'Content-Type': 'text/plain'
        });
        res.end('<h1>Server error</h1>');
    }
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
import database from '../models/database.js';
import protectedRoute from '../middleware/authMiddleware.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET;

// Hash password function
const hashPassword = async (password) => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
};

// Compare password function using bcrypt
const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

// Generate JWT token
const generateToken = async (user) => {
    const payload = { id: user.id, email: user.email, role: user.role };
    return await jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = async (req, res) => {
    const { email, password, role } = req.body;

    const is_valid_role = ['client', 'company'].includes(role);

    if (!email || !password || !role || !is_valid_role) {
        res.statusCode = 400;
        res.write(JSON.stringify({ message: 'All fields are required' }));
        res.end();
        return;
    }

    const hashedPassword = await hashPassword(password);

    const query = 'INSERT INTO users (email, role, password) VALUES (?, ?, ?)';
    const query_values = [email, role, hashedPassword];

    try {
        const response = await database.query(query, query_values);
        res.statusCode = 201;
        res.write(JSON.stringify({ message: 'User registered successfully', userId: response[0].insertId }));
        res.end();
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            res.statusCode = 409; // Conflict status code
            res.write(JSON.stringify({ message: 'Email already exists' }));
        } else {
            console.log('err', err);
            res.statusCode = 500;
            res.write(JSON.stringify({ message: 'Database error', error: err }));
        }
        res.end();
    }
};

const loginUser = async (req, res) => {
    const { email, password, role } = req.body;

    console.log({ email, password, role });

    if (!email || !password || !role) {
        res.statusCode = 400;
        res.write(JSON.stringify({ message: 'Email and password are required' }));
        res.end();
        return;
    }

    const hashedPassword = await hashPassword(password);

    const query = 'SELECT * FROM users WHERE (email = ? AND role = ?)';

    console.log(hashedPassword);
    try {
        const [results] = await database.query(query, [email, role]);
        console.log(results);
        if (results.length === 0) {
            res.statusCode = 401;
            res.write(JSON.stringify({ message: 'Invalid email or password' }));
        } else {
            const user = results[0];
            const isPasswordValid = await comparePassword(password, user.password);
            console.log(isPasswordValid);
            if (!isPasswordValid) {
                res.statusCode = 401;
                res.write(JSON.stringify({ message: 'Invalid email or password' }));
            } else {
                console.log(1);
                const token = await generateToken(user);
                console.log(token);
                res.statusCode = 200;
                res.write(JSON.stringify({ message: 'Login successful', token: token }));
            }
        }
        res.end();
    } catch (err) {
        console.log('err', err);
        res.statusCode = 500;
        res.write(JSON.stringify({ message: 'Database error', error: err }));
        res.end();
    }
};

const getUser = async(req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.write(JSON.stringify({user: req.user }));
    res.end();
};

const authRoutes = (req, res) => {
    // TODO: better structure for routes
    if(req.url.startsWith('/api/users/login') && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            req.body = JSON.parse(body);
            loginUser(req, res);
        });
    } else if(req.url.startsWith('/api/users/register') && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            req.body = JSON.parse(body);
            registerUser(req, res);
        });
    }  else if (req.url.startsWith('/api/user-data') && req.method === 'GET') {
        protectedRoute(getUser)(req, res);
    }
};

export default authRoutes;
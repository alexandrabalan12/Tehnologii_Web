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
    console.log({password, hashedPassword});
    return await bcrypt.compare(password, hashedPassword);
};

// Generate JWT token
const generateToken = async (user) => {
    const payload = { id: user.id, email: user.email, role: user.role };
    return await jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.statusCode = 400;
        res.write(JSON.stringify({ message: 'Email and password are required' }));
        res.end();
        return;
    }

    const hashedPassword = await hashPassword(password);

    const query = 'INSERT INTO users (email, password) VALUES (?, ?)';
    const query_values = [email, hashedPassword];

    try {
        const response = await database.query(query, query_values);
        const userId = response[0].insertId;
        res.statusCode = 201;
        res.write(JSON.stringify({ message: 'User registered successfully', userId: userId }));
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

const setUserRole = async (req, res) => {
    const { userId, role } = req.body;

    const is_valid_role = ['client', 'company'].includes(role);

    if (!userId || !role || !is_valid_role) {
        res.statusCode = 400;
        res.write(JSON.stringify({ message: 'User ID and valid role are required' }));
        res.end();
        return;
    }

    try {
        const checkRoleQuery = 'SELECT role FROM users WHERE id = ?';
        const [userRows] = await database.query(checkRoleQuery, [userId]);

        if (userRows.length === 0) {
            res.statusCode = 404; // Not Found status code
            res.write(JSON.stringify({ message: 'User not found' }));
        } else if (userRows[0].role) {
            res.statusCode = 409; // Conflict status code
            res.write(JSON.stringify({ message: 'User role is already set' }));
        } else {
            const setRoleQuery = 'UPDATE users SET role = ? WHERE id = ?';
            const query_values = [role, userId];
            await database.query(setRoleQuery, query_values);

            res.statusCode = 200;
            res.write(JSON.stringify({ message: 'User role updated successfully' }));
        }
        res.end();
    } catch (err) {
        console.log('err', err);
        res.statusCode = 500;
        res.write(JSON.stringify({ message: 'Database error', error: err }));
        res.end();
    }
};

const loginUser = async (req, res) => {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
        res.statusCode = 400;
        res.write(JSON.stringify({ message: 'Email, password, and role are required' }));
        res.end();
        return;
    }

    const userQuery = 'SELECT * FROM users WHERE email = ? AND role = ?';
    const companyQuery = 'SELECT * FROM companies WHERE user_id = ?';

    try {
        const [userResults] = await database.query(userQuery, [email, role]);
        if (userResults.length === 0) {
            res.statusCode = 401;
            res.write(JSON.stringify({ message: 'Invalid email or password' }));
        } else {
            const user = userResults[0];
            const isPasswordValid = await comparePassword(password, user.password);
            if (!isPasswordValid) {
                res.statusCode = 401;
                res.write(JSON.stringify({ message: 'Invalid email or password' }));
            } else {
                let response = { message: 'Login successful' };
                const token = await generateToken(user);
                response.token = token;

                if (role === 'company') {
                    const [companyResults] = await database.query(companyQuery, [user.id]);
                    response.company_details_set = companyResults.length > 0;
                }

                res.statusCode = 200;
                res.write(JSON.stringify(response));
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
    } else if(req.url.startsWith('/api/user-role') && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            req.body = JSON.parse(body);
            setUserRole(req, res);
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
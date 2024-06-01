import database from '../../models/database.js';
import protectedRoute from '../../middleware/authMiddleware.js';

const validateProfessionalArea = (value) => {
    const correct_values = [
        'structural_engineering',
        'interior_design',
        'roofing',
        'masonry',
        'plumbing'
    ];

    return correct_values.includes(value);
};

const createCompanyDetails = async (req, res) => {
    const { user_id, company_name, phone_number, description, location, address, professional_area, owner_name, open_to_travel } = req.body;

    if (
        !user_id ||
        !company_name || 
        !phone_number || 
        !description || 
        !location || 
        !address || 
        !validateProfessionalArea(professional_area) || 
        !owner_name || 
        open_to_travel === undefined
    ) {
        res.statusCode = 400;
        res.write(JSON.stringify({ message: 'All fields are required' }));
        res.end();
        return;
    }

    const selectQuery = 'SELECT COUNT(*) AS count FROM companies WHERE user_id = ?';
    const selectValues = [user_id];

    try {
        const [rows] = await database.query(selectQuery, selectValues);
        const count = rows[0].count;

        if (count > 0) {
            res.statusCode = 409; // Conflict status code
            res.write(JSON.stringify({ message: 'Company details already exist for this user' }));
        } else {
            const insertQuery = `
                INSERT INTO companies (
                    user_id, company_name, phone_number, description, location, address, professional_area, owner_name, open_to_travel
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const insertValues = [user_id, company_name, phone_number, description, location, address, professional_area, owner_name, open_to_travel];
            await database.query(insertQuery, insertValues);
            res.statusCode = 201;
            res.write(JSON.stringify({ message: 'Company details set successfully' }));
        }
        res.end();
    } catch (err) {
        console.log('err', err);
        res.statusCode = 500;
        res.write(JSON.stringify({ message: 'Database error', error: err }));
        res.end();
    }
};

const updateCompanyDetails = async (req, res) => {
    const { user_id, company_name, phone_number, description, location, address, professional_area, owner_name, open_to_travel } = req.body;
    const companyId = req.url.split('/')[4];

    if (
        !user_id ||
        !companyId ||
        !company_name ||
        !phone_number ||
        !description ||
        !location ||
        !address ||
        !validateProfessionalArea(professional_area) ||
        !owner_name ||
        open_to_travel === undefined
    ) {
        res.statusCode = 400;
        res.write(JSON.stringify({ message: 'All fields are required' }));
        res.end();
        return;
    }

    const selectUserQuery = 'SELECT COUNT(*) AS count FROM users WHERE id = ?';
    const selectUserValues = [user_id];

    try {
        const [userRows] = await database.query(selectUserQuery, selectUserValues);
        const userCount = userRows[0].count;

        if (userCount === 0) {
            res.statusCode = 404; // Not Found status code
            res.write(JSON.stringify({ message: 'User not found' }));
            res.end();
            return;
        }

        const selectQuery = 'SELECT COUNT(*) AS count FROM companies WHERE id = ?';
        const selectValues = [companyId];

        const [rows] = await database.query(selectQuery, selectValues);
        const count = rows[0].count;

        if (count === 0) {
            res.statusCode = 404; // Not Found status code
            res.write(JSON.stringify({ message: 'Company details not found for this user' }));
        } else {
            const updateQuery = `
                UPDATE companies
                SET company_name = ?, phone_number = ?, description = ?, location = ?, address = ?, professional_area = ?, owner_name = ?, open_to_travel = ?
                WHERE id = ?
            `;
            const updateValues = [company_name, phone_number, description, location, address, professional_area, owner_name, open_to_travel, companyId];
            await database.query(updateQuery, updateValues);
            res.statusCode = 200;
            res.write(JSON.stringify({ message: 'Company details updated successfully' }));
        }
        res.end();
    } catch (err) {
        console.log('err', err);
        res.statusCode = 500;
        res.write(JSON.stringify({ message: 'Database error', error: err }));
        res.end();
    }
};

const getCompanyDetails = async(req, res) => {
    const companyId = req.url.split('/')[4];

    if (!companyId) {
        res.statusCode = 400;
        res.write(JSON.stringify({ message: 'Company ID is required' }));
        res.end();
        return;
    }

    const selectQuery = 'SELECT * FROM companies WHERE id = ?';
    const selectValues = [companyId];

    try {
        const [rows] = await database.query(selectQuery, selectValues);

        if (rows.length === 0) {
            res.statusCode = 404; // Not Found status code
            res.write(JSON.stringify({ message: 'Company not found' }));
        } else {
            res.statusCode = 200;
            res.write(JSON.stringify({ message: 'Company details retrieved successfully', data: rows[0] }));
        }
        res.end();
    } catch (err) {
        console.log('err', err);
        res.statusCode = 500;
        res.write(JSON.stringify({ message: 'Database error', error: err }));
        res.end();
    }
};

const getCompanyReviews = async (req, res) => {
    const company_id = req.url.split('/')[4];

    if (!company_id) {
        res.statusCode = 400;
        res.write(JSON.stringify({ message: 'Company ID is required' }));
        res.end();
        return;
    }

    try {
        const selectCompanyQuery = 'SELECT * FROM companies WHERE id = ?';
        const [companyRows] = await database.query(selectCompanyQuery, [company_id]);

        if (companyRows.length === 0) {
            res.statusCode = 404; // Not Found status code
            res.write(JSON.stringify({ message: 'Company not found' }));
            res.end();
            return;
        }
    
        const selectReviewsQuery = `
            SELECT * FROM reviews
            WHERE company_id = ?
            ORDER BY created_at DESC
        `;
        const [reviewRows] = await database.query(selectReviewsQuery, [company_id]);
    
        if (reviewRows.length === 0) {
            res.statusCode = 404; // Not Found status code
            res.write(JSON.stringify({ message: 'No reviews found for this company' }));
        } else {
            res.statusCode = 200;
            res.write(JSON.stringify({ message: 'Reviews retrieved successfully', data: reviewRows }));
        }
        res.end();
    } catch (err) {
        console.log('err', err);
        res.statusCode = 500;
        res.write(JSON.stringify({ message: 'Database error', error: err }));
        res.end();
    }
};

const companyCompaniesRoutes = (req, res) => {
    if(req.url.startsWith('/api/company/company-details') && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk;
        });
        req.on('end', () => {
            req.body = JSON.parse(body);
            protectedRoute(createCompanyDetails)(req, res);
        });
    } else if(req.url.startsWith('/api/company/company-details') && req.method === 'PUT') {
        let body = '';
        req.on('data', chunk => {
            body += chunk;
        });
        req.on('end', () => {
            req.body = JSON.parse(body);
            protectedRoute(updateCompanyDetails)(req, res);
        });
    } else if(req.url.startsWith('/api/company/company-details') && req.method === 'GET') {
        protectedRoute(getCompanyDetails)(req, res);
    } else if(req.url.startsWith('/api/company/company-reviews/') && req.method === 'GET') {
        protectedRoute(getCompanyReviews)(req, res);
    }
};

export default companyCompaniesRoutes;
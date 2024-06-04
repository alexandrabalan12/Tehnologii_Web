import database from '../../models/database.js';
import protectedRoute from '../../middleware/authMiddleware.js';

const createPortfolioProject = async (req, res) => {
    const { company_id, name, professional_area, description } = req.body;

    if (
        !company_id || 
        !name || 
        !professional_area || 
        !description
    ) {
        res.statusCode = 400;
        res.write(JSON.stringify({ message: 'All fields are required' }));
        res.end();
        return;
    }

    const selectQuery = 'SELECT COUNT(*) AS count FROM companies WHERE id = ?';
    const selectValues = [company_id];

    try {
        const [rows] = await database.query(selectQuery, selectValues);
        const count = rows[0].count;

        if (count === 0) {
            res.statusCode = 404; // Not Found status code
            res.write(JSON.stringify({ message: 'Company not found' }));
        } else {
            const insertQuery = `
                INSERT INTO portfolio_projects (
                    company_id, name, professional_area, description
                ) VALUES (?, ?, ?, ?)
            `;
            const insertValues = [company_id, name, professional_area, description];
            await database.query(insertQuery, insertValues);
            res.statusCode = 201;
            res.write(JSON.stringify({ message: 'Portfolio project created successfully' }));
        }
        res.end();
    } catch (err) {
        console.log('err', err);
        res.statusCode = 500;
        res.write(JSON.stringify({ message: 'Database error', error: err }));
        res.end();
    }
};

const getPortfolioProjects = async (req, res) => {
    const company_id = req.url.split('/')[4];

    if (!company_id) {
        res.statusCode = 400;
        res.write(JSON.stringify({ message: 'Company ID is required' }));
        res.end();
        return;
    }

    const selectQuery = 'SELECT * FROM portfolio_projects WHERE company_id = ?';
    const selectValues = [company_id];

    try {
        const [rows] = await database.query(selectQuery, selectValues);

        if (rows.length === 0) {
            res.statusCode = 404; // Not Found status code
            res.write(JSON.stringify({ message: 'No portfolio projects found for this company' }));
        } else {
            res.statusCode = 200;
            res.write(JSON.stringify({ portfolio_projects: rows }));
        }
        res.end();
    } catch (err) {
        console.log('err', err);
        res.statusCode = 500;
        res.write(JSON.stringify({ message: 'Database error', error: err }));
        res.end();
    }
};

const getPortfolioProjectById = async (req, res) => {
    const id = req.url.split('/')[4];

    if (!id) {
        res.statusCode = 400;
        res.write(JSON.stringify({ message: 'Project ID is required' }));
        res.end();
        return;
    }

    const selectQuery = 'SELECT * FROM portfolio_projects WHERE id = ?';
    const selectValues = [id];

    try {
        const [rows] = await database.query(selectQuery, selectValues);

        if (rows.length === 0) {
            res.statusCode = 404; // Not Found status code
            res.write(JSON.stringify({ message: 'Portfolio project not found' }));
        } else {
            res.statusCode = 200;
            res.write(JSON.stringify({ portfolio_project: rows[0] }));
        }
        res.end();
    } catch (err) {
        console.log('err', err);
        res.statusCode = 500;
        res.write(JSON.stringify({ message: 'Database error', error: err }));
        res.end();
    }
};

const deletePortfolioProjectById = async (req, res) => {
    const id = req.url.split('/')[4];

    if (!id) {
        res.statusCode = 400;
        res.write(JSON.stringify({ message: 'Project ID is required' }));
        res.end();
        return;
    }

    const deleteQuery = 'DELETE FROM portfolio_projects WHERE id = ?';
    const deleteValues = [id];

    try {
        const [result] = await database.query(deleteQuery, deleteValues);

        if (result.affectedRows === 0) {
            res.statusCode = 404; // Not Found status code
            res.write(JSON.stringify({ message: 'Portfolio project not found' }));
        } else {
            res.statusCode = 200;
            res.write(JSON.stringify({ message: 'Portfolio project deleted successfully' }));
        }
        res.end();
    } catch (err) {
        console.log('err', err);
        res.statusCode = 500;
        res.write(JSON.stringify({ message: 'Database error', error: err }));
        res.end();
    }
};

const companyPortfolioRoutes = (req, res) => {
    if(req.url.startsWith('/api/company/portfolio-new') && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk;
        });
        req.on('end', () => {
            req.body = JSON.parse(body);
            protectedRoute(createPortfolioProject)(req, res);
        });
    } else if(req.url.startsWith('/api/company/portfolio-projects') && req.method === 'GET') {
        protectedRoute(getPortfolioProjects)(req, res);
    } else if(req.url.startsWith('/api/company/portfolio') && req.method === 'GET') {
        protectedRoute(getPortfolioProjectById)(req, res);
    } else if(req.url.startsWith('/api/company/portfolio-delete') && req.method === 'DELETE') {
        protectedRoute(deletePortfolioProjectById)(req, res);
    }
};

export default companyPortfolioRoutes;
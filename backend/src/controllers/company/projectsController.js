import database from '../../models/database.js';
import protectedRoute from '../../middleware/authMiddleware.js';

const getProjectDetails = async (req, res) => {
    const projectId = req.url.split('/')[4];

    if (!projectId) {
        res.statusCode = 400;
        res.write(JSON.stringify({ message: 'Project ID is required' }));
        res.end();
        return;
    }
    
    try {
        // Fetch project details
        const selectProjectQuery = 'SELECT * FROM projects WHERE id = ?';
        const [projectRows] = await database.query(selectProjectQuery, [projectId]);

        if (projectRows.length === 0) {
            res.statusCode = 404; // Not Found status code
            res.write(JSON.stringify({ message: 'Project not found' }));
            res.end();
            return;
        }

        const project = projectRows[0];
    
        res.statusCode = 200;
        res.write(JSON.stringify({ project }));
        res.end();
    } catch (err) {
        console.log('err', err);
        res.statusCode = 500;
        res.write(JSON.stringify({ message: 'Database error', error: err }));
        res.end();
    }
};

const getAllProjects = async (req, res) => {
    const { statuses, location, professional_area, min_budget, max_budget } = req.body;

    let filters = [];
    let values = [];

    if (statuses && statuses.length > 0) {
        const statusPlaceholders = statuses.map(() => '?').join(',');
        filters.push(`status IN (${statusPlaceholders})`);
        values = values.concat(statuses);
    }

    if (location) {
        filters.push('location = ?');
        values.push(location);
    }

    if (professional_area) {
        filters.push('professional_area = ?');
        values.push(professional_area);
    }

    if (min_budget) {
        filters.push('CAST(price AS DECIMAL) >= ?');
        values.push(min_budget);
    }

    if (max_budget) {
        filters.push('CAST(price AS DECIMAL) <= ?');
        values.push(max_budget);
    }

    const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

    try {
        const selectProjectsQuery = `
            SELECT * FROM projects
            ${whereClause}
        `;
        const [projectRows] = await database.query(selectProjectsQuery, values);
    
        res.statusCode = 200;
        res.write(JSON.stringify({ projects: projectRows }));
        res.end();
    } catch (err) {
        console.log('err', err);
        res.statusCode = 500;
        res.write(JSON.stringify({ message: 'Database error', error: err }));
        res.end();
    }
};

const companyProjectRoutes = (req, res) => {
    if(req.url.startsWith('/api/company/project-details') && req.method === 'GET') {
        protectedRoute(getProjectDetails)(req, res);
    } else if(req.url.startsWith('/api/company/projects') && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk;
        });
        req.on('end', () => {
            req.body = JSON.parse(body);
            protectedRoute(getAllProjects)(req, res);
        });
    }
};

export default companyProjectRoutes;
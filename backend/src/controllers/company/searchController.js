import database from '../../models/database.js';
import protectedRoute from '../../middleware/authMiddleware.js';

const searchController = async (req, res) => {
    const urlParts = req.url.split('?');
    if (urlParts.length < 2) {
        res.statusCode = 400;
        res.write(JSON.stringify({ message: 'Query parameter is required' }));
        res.end();
        return;
    }

    const queryParam = new URLSearchParams(urlParts[1]).get('query');

    if (!queryParam) {
        res.statusCode = 400;
        res.write(JSON.stringify({ message: 'Query parameter is required' }));
        res.end();
        return;
    }

    const searchQuery = `%${queryParam}%`;

    try {
        // Search for open projects
        const searchProjectsQuery = `
            SELECT * FROM projects
            WHERE status = 'open' AND (
                name LIKE ? OR description LIKE ? OR location LIKE ? OR professional_area LIKE ? OR price LIKE ?
            )`;
        const [projectRows] = await database.query(searchProjectsQuery, [searchQuery, searchQuery, searchQuery, searchQuery, searchQuery]);

        const response = {
            projects: projectRows
        };

        res.statusCode = 200;
        res.write(JSON.stringify(response));
        res.end();
    } catch (err) {
        console.log('err', err);
        res.statusCode = 500;
        res.write(JSON.stringify({ message: 'Database error', error: err }));
        res.end();
    }
};

const companySearchRoutes = (req, res) => {
    if(req.url.startsWith('/api/company/search') && req.method === 'GET') {
        protectedRoute(searchController)(req, res);
    }
};

export default companySearchRoutes;
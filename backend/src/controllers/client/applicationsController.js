import database from '../../models/database.js';
import protectedRoute from '../../middleware/authMiddleware.js';

const getJobApplicationDetails = async (req, res) => {
    const application_id = req.url.split('/')[4];

    if (!application_id) {
        res.statusCode = 400;
        res.write(JSON.stringify({ message: 'Application ID is required' }));
        res.end();
        return;
    }

    try {
        const selectApplicationQuery = `
            SELECT ja.*, p.name AS project_name, c.company_name
            FROM job_applications ja
            JOIN projects p ON ja.project_id = p.id
            JOIN companies c ON ja.company_id = c.id
            WHERE ja.id = ?
        `;
        const [applicationRows] = await database.query(selectApplicationQuery, [application_id]);

        if (applicationRows.length === 0) {
            res.statusCode = 404; // Not Found status code
            res.write(JSON.stringify({ message: 'Application not found' }));
            res.end();
            return;
        }

        const application = applicationRows[0];

        res.statusCode = 200;
        res.write(JSON.stringify(application));
        res.end();
    } catch (err) {
        console.log('err', err);
        res.statusCode = 500;
        res.write(JSON.stringify({ message: 'Database error', error: err }));
        res.end();
    }
};

const clientJobApplicationRoutes = (req, res) => {
    if(req.url.startsWith('/api/client/application') && req.method === 'GET') {
        protectedRoute(getJobApplicationDetails)(req, res);
    }
};

export default clientJobApplicationRoutes;
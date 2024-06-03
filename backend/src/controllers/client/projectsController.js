import database from '../../models/database.js';
import protectedRoute from '../../middleware/authMiddleware.js';

const createProject = async (req, res) => {
    const {
        user_id,
        name,
        description,
        status,
        location,
        professional_area,
        price,
        requirements
    } = req.body;

    if (!user_id || !name || !description || !status || !location || !professional_area || !price || !requirements) {
        res.statusCode = 400;
        res.write(JSON.stringify({ message: 'All fields are required' }));
        res.end();
        return;
    }
    
    try {
        // Check if user exists and is a client
        const selectUserQuery = 'SELECT role FROM users WHERE id = ?';
        const [userRows] = await database.query(selectUserQuery, [user_id]);
        
        if (userRows.length === 0) {
            res.statusCode = 404; // Not Found status code
            res.write(JSON.stringify({ message: 'User not found' }));
            res.end();
            return;
        }
        
        if (userRows[0].role !== 'client') {
            res.statusCode = 403; // Forbidden status code
            res.write(JSON.stringify({ message: 'User is not a client' }));
            res.end();
            return;
        }
    
        // Insert new project
        const insertQuery = `
            INSERT INTO projects (
                user_id, name, description, status, location, professional_area, price, requirements
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const insertValues = [user_id, name, description, status, location, professional_area, price, JSON.stringify(requirements)];
        const [result] = await database.query(insertQuery, insertValues);
    
        res.statusCode = 201;
        res.write(JSON.stringify({ message: 'Project created successfully', project_id: result.insertId }));
        res.end();
    } catch (err) {
        console.log('err', err);
        res.statusCode = 500;
        res.write(JSON.stringify({ message: 'Database error', error: err }));
        res.end();
    }
};

const getProjectWithApplications = async (req, res) => {
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

        // Fetch associated job applications with company names
        const selectApplicationsQuery = `
            SELECT ja.*, c.company_name
            FROM job_applications ja
            JOIN companies c ON ja.company_id = c.id
            WHERE ja.project_id = ?`;
        const [applicationRows] = await database.query(selectApplicationsQuery, [projectId]);

        // Combine project details with job applications
        const response = {
            project,
            jobApplications: applicationRows
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

const getAllProjectsWithApplicants = async (req, res) => {
    const { user_id, statuses } = req.body;

    if (!user_id) {
        res.statusCode = 400;
        res.write(JSON.stringify({ message: 'User ID is required' }));
        res.end();
        return;
    }

    let filters = [`user_id = ?`];
    let values = [user_id];

    if (statuses && statuses.length > 0) {
        const statusPlaceholders = statuses.map(() => '?').join(',');
        filters.push(`status IN (${statusPlaceholders})`);
        values = values.concat(statuses);
    }

    const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

    try {
        const selectProjectsQuery = `
            SELECT * FROM projects
            ${whereClause}
        `;
        const [projectRows] = await database.query(selectProjectsQuery, values);

        // Fetch the number of job applicants for each project
        const projectIds = projectRows.map(project => project.id);
        let projectApplicants = {};

        if (projectIds.length > 0) {
            const selectApplicantsQuery = `
                SELECT project_id, COUNT(*) as applicant_count
                FROM job_applications
                WHERE project_id IN (${projectIds.map(() => '?').join(',')})
                GROUP BY project_id
            `;
            const [applicantCounts] = await database.query(selectApplicantsQuery, projectIds);

            applicantCounts.forEach(row => {
                projectApplicants[row.project_id] = row.applicant_count;
            });
        }

        // Add applicant count to each project
        const projectsWithApplicants = projectRows.map(project => ({
            ...project,
            applicant_count: projectApplicants[project.id] || 0
        }));

        res.statusCode = 200;
        res.write(JSON.stringify({ projects: projectsWithApplicants }));
        res.end();
    } catch (err) {
        console.log('err', err);
        res.statusCode = 500;
        res.write(JSON.stringify({ message: 'Database error', error: err }));
        res.end();
    }
};

const closeProject = async (req, res) => {
    const projectId = req.url.split('/')[4];

    console.log(projectId);
    if (!projectId) {
        res.statusCode = 400;
        res.write(JSON.stringify({ message: 'Project ID is required' }));
        res.end();
        return;
    }

    try {
        // Update project status to "closed"
        const updateProjectQuery = 'UPDATE projects SET status = ? WHERE id = ?';
        const [result] = await database.query(updateProjectQuery, ['closed', projectId]);

        if (result.affectedRows === 0) {
            res.statusCode = 404; // Not Found status code
            res.write(JSON.stringify({ message: 'Project not found' }));
            res.end();
            return;
        }

        res.statusCode = 200;
        res.write(JSON.stringify({ message: 'Project status updated to closed' }));
        res.end();
    } catch (err) {
        console.log('err', err);
        res.statusCode = 500;
        res.write(JSON.stringify({ message: 'Database error', error: err }));
        res.end();
    }
};

const clientProjectRoutes = (req, res) => {
    if(req.url.startsWith('/api/client/project-new') && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk;
        });
        req.on('end', () => {
            req.body = JSON.parse(body);
            protectedRoute(createProject)(req, res);
        });
    } else if(req.url.startsWith('/api/client/project-details') && req.method === 'GET') {
        protectedRoute(getProjectWithApplications)(req, res);
    } else if(req.url.startsWith('/api/client/projects') && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk;
        });
        req.on('end', () => {
            req.body = JSON.parse(body);
            protectedRoute(getAllProjectsWithApplicants)(req, res);
        });
    } else if(req.url.startsWith('/api/client/project-close') && req.method === 'PUT') {
        protectedRoute(closeProject)(req, res);   
    }
};

export default clientProjectRoutes;
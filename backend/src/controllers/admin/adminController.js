import database from '../../models/database.js';
import protectedRoute from '../../middleware/authMiddleware.js';

const getAllCompanies = async (req, res) => {
    try {
        const selectAllCompaniesQuery = 'SELECT * FROM companies';
        const [companyRows] = await database.query(selectAllCompaniesQuery);

        if (companyRows.length === 0) {
            res.statusCode = 404; // Not Found status code
            res.write(JSON.stringify({ message: 'No companies found' }));
        } else {
            res.statusCode = 200;
            res.write(JSON.stringify({ message: 'Companies retrieved successfully', data: companyRows }));
        }
        res.end();
    } catch (err) {
        console.error('err', err);
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

        const companyName = companyRows[0].company_name;

        const selectReviewsQuery = `
            SELECT * FROM reviews
            WHERE company_id = ?
            ORDER BY created_at DESC
        `;
        const [reviewRows] = await database.query(selectReviewsQuery, [company_id]);

        if (reviewRows.length === 0) {
            res.statusCode = 404; // Not Found status code
            res.write(JSON.stringify({ message: 'No reviews found for this company', company_name: companyName }));
        } else {
            res.statusCode = 200;
            res.write(JSON.stringify({ message: 'Reviews retrieved successfully', company_name: companyName, data: reviewRows }));
        }
        res.end();
    } catch (err) {
        console.error('err', err);
        res.statusCode = 500;
        res.write(JSON.stringify({ message: 'Database error', error: err }));
        res.end();
    }
};

const deleteReview = async (req, res) => {
    const review_id = req.url.split('/')[4];

    if (!review_id) {
        res.statusCode = 400;
        res.write(JSON.stringify({ message: 'Review ID is required' }));
        res.end();
        return;
    }

    try {
        const deleteReviewQuery = 'DELETE FROM reviews WHERE id = ?';
        const [result] = await database.query(deleteReviewQuery, [review_id]);

        if (result.affectedRows === 0) {
            res.statusCode = 404; // Not Found status code
            res.write(JSON.stringify({ message: 'Review not found' }));
        } else {
            res.statusCode = 200;
            res.write(JSON.stringify({ message: 'Review deleted successfully' }));
        }
        res.end();
    } catch (err) {
        console.error('err', err);
        res.statusCode = 500;
        res.write(JSON.stringify({ message: 'Database error', error: err }));
        res.end();
    }
};


const adminRoutes = (req, res) => {
    if(req.url.startsWith('/api/admin/delete-review') && req.method === 'DELETE') {
        protectedRoute(deleteReview)(req, res);
    } else if(req.url.startsWith('/api/admin/companies') && req.method === 'GET') {
        protectedRoute(getAllCompanies)(req, res);
    } else if(req.url.startsWith('/api/admin/company-reviews/') && req.method === 'GET') {
        protectedRoute(getCompanyReviews)(req, res);
    }
};

export default adminRoutes;
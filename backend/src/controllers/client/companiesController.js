import database from "../../models/database.js";
import protectedRoute from "../../middleware/authMiddleware.js";

const createReview = async (req, res) => {
  const company_id = req.url.split("/")[4];
  const {
    user_id,
    user_reviewer_name,
    user_reviewer_occupation,
    rating,
    review_content,
  } = req.body;

  if (
    !user_id ||
    !company_id ||
    !user_reviewer_name ||
    !user_reviewer_occupation ||
    rating === undefined ||
    !review_content
  ) {
    res.statusCode = 400;
    res.write(JSON.stringify({ message: "All fields are required" }));
    res.end();
    return;
  }

  try {
    const selectUserQuery = "SELECT COUNT(*) AS count FROM users WHERE id = ?";
    const [userRows] = await database.query(selectUserQuery, [user_id]);
    const userCount = userRows[0].count;

    if (userCount === 0) {
      res.statusCode = 404;
      res.write(JSON.stringify({ message: "User not found" }));
      res.end();
      return;
    }

    const selectCompanyQuery =
      "SELECT COUNT(*) AS count FROM companies WHERE id = ?";
    const [companyRows] = await database.query(selectCompanyQuery, [
      company_id,
    ]);
    const companyCount = companyRows[0].count;

    if (companyCount === 0) {
      res.statusCode = 404;
      res.write(JSON.stringify({ message: "Company not found" }));
      res.end();
      return;
    }

    const insertQuery = `
            INSERT INTO reviews (
                company_id, user_reviewer_id, user_reviewer_name, user_reviewer_occupation, rating, review_content
            ) VALUES (?, ?, ?, ?, ?, ?)
        `;
    const insertValues = [
      company_id,
      user_id,
      user_reviewer_name,
      user_reviewer_occupation,
      rating,
      review_content,
    ];
    await database.query(insertQuery, insertValues);

    res.statusCode = 201;
    res.write(JSON.stringify({ message: "Review created successfully" }));
    res.end();
  } catch (err) {
    console.log("err", err);
    res.statusCode = 500;
    res.write(JSON.stringify({ message: "Database error", error: err }));
    res.end();
  }
};

const getCompanyReviews = async (req, res) => {
  const company_id = req.url.split("/")[4];

  if (!company_id) {
    res.statusCode = 400;
    res.write(JSON.stringify({ message: "Company ID is required" }));
    res.end();
    return;
  }

  try {
    const selectCompanyQuery = "SELECT * FROM companies WHERE id = ?";
    const [companyRows] = await database.query(selectCompanyQuery, [
      company_id,
    ]);

    if (companyRows.length === 0) {
      res.statusCode = 404;
      res.write(JSON.stringify({ message: "Company not found" }));
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
      res.statusCode = 404;
      res.write(
        JSON.stringify({
          message: "No reviews found for this company",
          company_name: companyName,
        })
      );
    } else {
      res.statusCode = 200;
      res.write(
        JSON.stringify({
          message: "Reviews retrieved successfully",
          company_name: companyName,
          data: reviewRows,
        })
      );
    }
    res.end();
  } catch (err) {
    console.log("err", err);
    res.statusCode = 500;
    res.write(JSON.stringify({ message: "Database error", error: err }));
    res.end();
  }
};

const getCompanyDetails = async (req, res) => {
  const company_id = req.url.split("/")[4];

  if (!company_id) {
    res.statusCode = 400;
    res.write(JSON.stringify({ message: "Company ID is required" }));
    res.end();
    return;
  }

  try {
    const selectCompanyQuery = `
            SELECT c.*, u.email AS owner_email
            FROM companies c
            JOIN users u ON c.user_id = u.id
            WHERE c.id = ?
        `;
    const [companyRows] = await database.query(selectCompanyQuery, [
      company_id,
    ]);

    if (companyRows.length === 0) {
      res.statusCode = 404;
      res.write(JSON.stringify({ message: "Company not found" }));
      res.end();
      return;
    }

    const company = companyRows[0];

    res.statusCode = 200;
    res.write(JSON.stringify(company));
    res.end();
  } catch (err) {
    console.log("err", err);
    res.statusCode = 500;
    res.write(JSON.stringify({ message: "Database error", error: err }));
    res.end();
  }
};

const clientCompaniesRoutes = (req, res) => {
  if (
    req.url.startsWith("/api/client/company-reviews/") &&
    req.method === "POST"
  ) {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      req.body = JSON.parse(body);
      protectedRoute(createReview)(req, res);
    });
  } else if (
    req.url.startsWith("/api/client/company-details/") &&
    req.method === "GET"
  ) {
    protectedRoute(getCompanyDetails)(req, res);
  } else if (
    req.url.startsWith("/api/client/company-reviews/") &&
    req.method === "GET"
  ) {
    protectedRoute(getCompanyReviews)(req, res);
  }
};

export default clientCompaniesRoutes;

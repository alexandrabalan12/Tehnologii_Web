import database from "../../models/database.js";
import protectedRoute from "../../middleware/authMiddleware.js";

const createJobApplication = async (req, res) => {
  const { project_id, company_id, message, delivery_date, estimated_price } =
    req.body;

  if (
    !project_id ||
    !company_id ||
    !message ||
    !delivery_date ||
    !estimated_price
  ) {
    res.statusCode = 400;
    res.write(JSON.stringify({ message: "All fields are required" }));
    res.end();
    return;
  }

  try {
    const selectCompanyQuery = "SELECT id FROM companies WHERE id = ?";
    const [companyRows] = await database.query(selectCompanyQuery, [
      company_id,
    ]);

    if (companyRows.length === 0) {
      res.statusCode = 404;
      res.write(JSON.stringify({ message: "Company not found" }));
      res.end();
      return;
    }

    const selectProjectQuery = "SELECT status FROM projects WHERE id = ?";
    const [projectRows] = await database.query(selectProjectQuery, [
      project_id,
    ]);

    if (projectRows.length === 0) {
      res.statusCode = 404;
      res.write(JSON.stringify({ message: "Project not found" }));
      res.end();
      return;
    }

    if (projectRows[0].status !== "open") {
      res.statusCode = 403;
      res.write(
        JSON.stringify({
          message: "Cannot apply to this project as it is not open",
        })
      );
      res.end();
      return;
    }

    const checkApplicationQuery =
      "SELECT id FROM job_applications WHERE project_id = ? AND company_id = ?";
    const [applicationRows] = await database.query(checkApplicationQuery, [
      project_id,
      company_id,
    ]);

    if (applicationRows.length > 0) {
      res.statusCode = 409;
      res.write(
        JSON.stringify({
          message: "Application already exists for this project",
        })
      );
      res.end();
      return;
    }

    const insertQuery = `
            INSERT INTO job_applications (
                project_id, company_id, message, delivery_date, estimated_price
            ) VALUES (?, ?, ?, ?, ?)
        `;
    const insertValues = [
      project_id,
      company_id,
      message,
      delivery_date,
      estimated_price,
    ];
    await database.query(insertQuery, insertValues);

    res.statusCode = 201;
    res.write(
      JSON.stringify({ message: "Job application created successfully" })
    );
    res.end();
  } catch (err) {
    console.log("err", err);
    res.statusCode = 500;
    res.write(JSON.stringify({ message: "Database error", error: err }));
    res.end();
  }
};

const getJobApplicationDetails = async (req, res) => {
  const application_id = req.url.split("/")[4];

  if (!application_id) {
    res.statusCode = 400;
    res.write(JSON.stringify({ message: "Application ID is required" }));
    res.end();
    return;
  }

  try {
    const selectApplicationQuery = `
            SELECT ja.*, p.name AS project_name, c.name AS company_name
            FROM job_applications ja
            JOIN projects p ON ja.project_id = p.id
            JOIN companies c ON ja.company_id = c.id
            WHERE ja.id = ?
        `;
    const [applicationRows] = await database.query(selectApplicationQuery, [
      application_id,
    ]);

    if (applicationRows.length === 0) {
      res.statusCode = 404;
      res.write(JSON.stringify({ message: "Application not found" }));
      res.end();
      return;
    }

    const application = applicationRows[0];

    res.statusCode = 200;
    res.write(JSON.stringify(application));
    res.end();
  } catch (err) {
    console.log("err", err);
    res.statusCode = 500;
    res.write(JSON.stringify({ message: "Database error", error: err }));
    res.end();
  }
};

const companyApplicationRoutes = (req, res) => {
  if (
    req.url.startsWith("/api/company/application-new") &&
    req.method === "POST"
  ) {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      req.body = JSON.parse(body);
      protectedRoute(createJobApplication)(req, res);
    });
  } else if (
    req.url.startsWith("/api/company/application") &&
    req.method === "GET"
  ) {
    protectedRoute(getJobApplicationDetails)(req, res);
  }
};

export default companyApplicationRoutes;

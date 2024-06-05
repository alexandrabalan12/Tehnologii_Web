import database from "../../models/database.js";
import protectedRoute from "../../middleware/authMiddleware.js";

const getPortfolioProjects = async (req, res) => {
  const company_id = req.url.split("/")[4];

  if (!company_id) {
    res.statusCode = 400;
    res.write(JSON.stringify({ message: "Company ID is required" }));
    res.end();
    return;
  }

  const selectQuery = `
        SELECT pp.*, c.company_name 
        FROM portfolio_projects pp
        JOIN companies c ON pp.company_id = c.id
        WHERE pp.company_id = ?
    `;
  const selectValues = [company_id];

  try {
    const [rows] = await database.query(selectQuery, selectValues);

    if (rows.length === 0) {
      res.statusCode = 404;
      res.write(
        JSON.stringify({
          message: "No portfolio projects found for this company",
        })
      );
    } else {
      const response = {
        company_name: rows[0].company_name,
        portfolio_projects: rows.map((row) => ({
          id: row.id,
          company_id: row.company_id,
          name: row.name,
          professional_area: row.professional_area,
          description: row.description,
          images: row.images,
        })),
      };
      res.statusCode = 200;
      res.write(JSON.stringify(response));
    }
    res.end();
  } catch (err) {
    console.log("err", err);
    res.statusCode = 500;
    res.write(JSON.stringify({ message: "Database error", error: err }));
    res.end();
  }
};

const getPortfolioProjectById = async (req, res) => {
  const id = req.url.split("/")[4];

  if (!id) {
    res.statusCode = 400;
    res.write(JSON.stringify({ message: "Project ID is required" }));
    res.end();
    return;
  }

  const selectQuery = `
        SELECT pp.*, c.company_name 
        FROM portfolio_projects pp
        JOIN companies c ON pp.company_id = c.id
        WHERE pp.id = ?
    `;
  const selectValues = [id];

  try {
    const [rows] = await database.query(selectQuery, selectValues);

    if (rows.length === 0) {
      res.statusCode = 404;
      res.write(JSON.stringify({ message: "Portfolio project not found" }));
    } else {
      const response = {
        id: rows[0].id,
        company_id: rows[0].company_id,
        company_name: rows[0].company_name,
        name: rows[0].name,
        professional_area: rows[0].professional_area,
        description: rows[0].description,
        images: rows[0].images,
      };
      res.statusCode = 200;
      res.write(JSON.stringify({ portfolio_project: response }));
    }
    res.end();
  } catch (err) {
    console.log("err", err);
    res.statusCode = 500;
    res.write(JSON.stringify({ message: "Database error", error: err }));
    res.end();
  }
};

const clientPortfolioRoutes = (req, res) => {
  if (
    req.url.startsWith("/api/client/portfolio-projects") &&
    req.method === "GET"
  ) {
    protectedRoute(getPortfolioProjects)(req, res);
  } else if (
    req.url.startsWith("/api/client/portfolio") &&
    req.method === "GET"
  ) {
    protectedRoute(getPortfolioProjectById)(req, res);
  }
};

export default clientPortfolioRoutes;

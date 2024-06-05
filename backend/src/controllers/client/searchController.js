import database from "../../models/database.js";
import protectedRoute from "../../middleware/authMiddleware.js";

const searchController = async (req, res) => {
  const urlParts = req.url.split("?");
  if (urlParts.length < 2) {
    res.statusCode = 400;
    res.write(JSON.stringify({ message: "Query parameter is required" }));
    res.end();
    return;
  }

  const queryParam = new URLSearchParams(urlParts[1]).get("query");

  if (!queryParam) {
    res.statusCode = 400;
    res.write(JSON.stringify({ message: "Query parameter is required" }));
    res.end();
    return;
  }

  const searchQuery = `%${queryParam}%`;

  try {
    const searchCompaniesQuery = `
            SELECT * FROM companies
            WHERE company_name LIKE ? OR description LIKE ? OR location LIKE ? OR address LIKE ? OR owner_name LIKE ?`;
    const [companyRows] = await database.query(searchCompaniesQuery, [
      searchQuery,
      searchQuery,
      searchQuery,
      searchQuery,
      searchQuery,
    ]);

    const response = {
      companies: companyRows,
    };

    res.statusCode = 200;
    res.write(JSON.stringify(response));
    res.end();
  } catch (err) {
    console.log("err", err);
    res.statusCode = 500;
    res.write(JSON.stringify({ message: "Database error", error: err }));
    res.end();
  }
};

const clientSearchRoutes = (req, res) => {
  if (req.url.startsWith("/api/client/search") && req.method === "GET") {
    protectedRoute(searchController)(req, res);
  }
};

export default clientSearchRoutes;

import authRoutes from "../controllers/authController.js";
import companyCompaniesRoutes from "../controllers/company/companiesController.js";
import companyProjectRoutes from "../controllers/company/projectsController.js";
import companyApplicationRoutes from "../controllers/company/applicationsController.js";
import companySearchRoutes from "../controllers/company/searchController.js";
import companyPortfolioRoutes from "../controllers/company/portfolioController.js";
import clientCompaniesRoutes from "../controllers/client/companiesController.js";
import clientProjectRoutes from "../controllers/client/projectsController.js";
import clientJobApplicationRoutes from "../controllers/client/applicationsController.js";
import clientSearchRoutes from "../controllers/client/searchController.js";
import clientPortfolioRoutes from "../controllers/client/portfolioController.js";
import adminRoutes from "../controllers/admin/adminController.js";

const logger = (req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
};

const jsonMiddleware = (req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  next();
};

const userTypeMiddleware = (req, res, next) => {
  const userType = req.headers["user-type"];

  if (req.url.startsWith("/api/user")) {
    next();
  } else if (
    !userType ||
    (userType === "company" && !req.url.startsWith("/api/company")) ||
    (userType === "client" && !req.url.startsWith("/api/client"))
  ) {
    res.statusCode = 403;
    res.end(
      "Access Forbidden: You do not have permission to access this route."
    );
  } else if (req.url.startsWith("/api/admin") && userType !== "admin") {
    res.statusCode = 403;
    res.end(
      "Access Forbidden: You do not have permission to access this route."
    );
  } else {
    next();
  }
};

const notFoundHandler = (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.statusCode = 404;
  res.write(
    JSON.stringify({
      message: "Route not found",
    })
  );

  res.end();
};

const handleAPI = (req, res) => {
  logger(req, res, () => {
    jsonMiddleware(req, res, () => {
      userTypeMiddleware(req, res, () => {
        if (req.url.startsWith("/api/user")) {
          authRoutes(req, res);
        } else if (req.url.startsWith("/api/company/company")) {
          companyCompaniesRoutes(req, res);
        } else if (req.url.startsWith("/api/company/project")) {
          companyProjectRoutes(req, res);
        } else if (req.url.startsWith("/api/company/application")) {
          companyApplicationRoutes(req, res);
        } else if (req.url.startsWith("/api/company/search")) {
          companySearchRoutes(req, res);
        } else if (req.url.startsWith("/api/company/portfolio")) {
          companyPortfolioRoutes(req, res);
        } else if (req.url.startsWith("/api/client/company")) {
          clientCompaniesRoutes(req, res);
        } else if (req.url.startsWith("/api/client/project")) {
          clientProjectRoutes(req, res);
        } else if (req.url.startsWith("/api/client/application")) {
          clientJobApplicationRoutes(req, res);
        } else if (req.url.startsWith("/api/client/portfolio")) {
          clientPortfolioRoutes(req, res);
        } else if (req.url.startsWith("/api/client/search")) {
          clientSearchRoutes(req, res);
        } else if (req.url.startsWith("/api/admin")) {
          adminRoutes(req, res);
        } else {
          notFoundHandler(req, res);
        }
      });
    });
  });
};

export default handleAPI;

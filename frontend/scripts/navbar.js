// Navbar templates
const navbarNotLogged = `
    <nav class="navbar">
        <div class="navbar-container">
            <a href="index.html" class="logo1">PlaCo</a>
            <input type="checkbox" class="navigation-mobile-toggle" id="navi-toggle">
            <label class="navbar-mobile-button" for="navi-toggle">
                <img src="./assets/nav-menu.png" alt="Menu" />
            </label>
            <div class="nav-menu" id="navbar-menu">
                <a href="login.html" class="nav-link">Available projects</a>
                <a href="aboutus.html" class="nav-link">About us</a>        
                <a href="login.html" class="nav-link login">Login</a>
                <a href="signup.html" class="signup-btn">Sign up</a>
            </div>   
        </div>
    </nav>
`;

const navbarClient = `
    <nav class="navbar">
        <div class="navbar-container">
            <a href="index.html" class="logo1">PlaCo</a>
            <input
                type="checkbox"
                class="navigation-mobile-toggle"
                id="navi-toggle"
            />
            <label class="navbar-mobile-button" for="navi-toggle">
                <img src="./assets/nav-menu.png" alt="Menu" />
            </label>
            <div class="nav-menu" id="navbar-menu">
                <!-- continut navigatie -->
                <a href="client-closedprojects.html" class="nav-link">Closed projects</a>
                <a href="aboutus.html" class="nav-link">About us</a>
                <div class="nav-search input-group__area">
                    <img src="./assets/icon_search.png" />
                    <input
                        id="navbar-search"
                        name="navbar-seach"
                        type="text"
                        placeholder="Search for companies"
                    />
                </div>
                <button id="logout-button" class="signup-btn">Log out</button>
            </div>
        </div>
    </nav>
`;

const navbarCompany = `
    <nav class="navbar">
        <div class="navbar-container">
            <a href="index.html" class="logo1">PlaCo</a>
            <input
                type="checkbox"
                class="navigation-mobile-toggle"
                id="navi-toggle"
            />
            <label class="navbar-mobile-button" for="navi-toggle">
                <img src="./assets/nav-menu.png" alt="Menu" />
            </label>
            <div class="nav-menu" id="navbar-menu">
                <!-- continut navigatie -->
                <a href="company-availableprojects.html" class="nav-link">Available projects</a>
                <a href="aboutus.html" class="nav-link">About us</a>
                <div class="nav-search input-group__area">
                    <img src="./assets/icon_search.png" />
                    <input
                        id="navbar-search"
                        name="navbar-seach"
                        type="text"
                        placeholder="Search for projects"
                    />
                </div>
                <a href="/company-account-details.html">
                    <img src="./assets/profile.png" />
                </a>
                <button id="logout-button" class="signup-btn">Log out</button>
            </div>
        </div>
    </nav>
`;

document.addEventListener("DOMContentLoaded", async () => {
  // variabile
  let user_data = null;

  const cached_data = JSON.parse(localStorage.getItem("userData") || "{}");

  if (cached_data && cached_data.role) {
    user_data = cached_data;
    user_role = cached_data.role;
  }

  // definim functii
  function handleSearch() {
    const input = document.getElementById("navbar-search");
    const userType = user_data.role;

    input.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        const encodedQuery = encodeURIComponent(input.value);
        window.location.href = `http://127.0.0.1:5500/${userType}-search.html?query=${encodedQuery}`;
      }
    });
  }

  function routeGuard() {
    const route = window.location.pathname.slice(1);
    const type = route.split("-")[0];

    if (type === "client" || type === "company") {
      if (!user_data) {
        window.location.href = "http://127.0.0.1:5500/login.html";
      }

      if (user_data.role !== type) {
        window.location.href = "http://127.0.0.1:5500/login.html";
      }
    }
  }

  function setNavbar() {
    // setam navbar in functie de user
    const navbar_container = document.getElementById("navbar-container");

    if (user_data && user_data.role === "client") {
      navbar_container.innerHTML = navbarClient;
      handleSearch();
      handleLogout();
    } else if (user_data && user_data.role === "company") {
      navbar_container.innerHTML = navbarCompany;
      handleSearch();
      handleLogout();
    } else navbar_container.innerHTML = navbarNotLogged;
  }

  async function getUserData() {
    const token = await localStorage.getItem("authToken");

    if (!token) return;

    const response = await apiRequest(
      "http://localhost:8000/api/user-data",
      "GET",
      null,
      {
        authorization: token,
      }
    );

    console.log("user_Data", response);

    user_data = response.user;

    if (!user_data) {
      // userul nu e valid
      // stergem datele
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      localStorage.removeItem("userId");
    } else {
      // pastram datele sa fie si pt celelalte pagini
      localStorage.setItem("userData", JSON.stringify(user_data));
      localStorage.setItem("userId", user_data.id);
    }
  }

  // apelam functii

  // setam navbar initial
  setNavbar();

  await getUserData();
  setNavbar();
  routeGuard();
});

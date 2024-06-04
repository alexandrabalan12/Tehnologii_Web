async function apiRequest(url, method = "GET", payload = null, headers = {}) {
  const options = {
    method: method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (payload) {
    options.body = JSON.stringify(payload);
  }

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error("Error during the fetch operation:", error);
    throw error;
  }
}

function handleLogout() {
  const logout_button = document.getElementById("logout-button");

  logout_button.addEventListener("click", () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("userId");

    setTimeout(() => {
    window.location.href = "http://127.0.0.1:5500/index.html";
    }, 400);
  });
};

function formatReadableDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', options);
}

function formatCategory(str) {
  let formattedStr = str.replace(/_/g, " ");
  formattedStr =
    formattedStr.charAt(0).toUpperCase() + formattedStr.slice(1);
  return formattedStr;
}
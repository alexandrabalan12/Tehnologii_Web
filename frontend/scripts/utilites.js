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

function formatReadableDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', options);
}
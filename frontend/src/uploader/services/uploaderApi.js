/**
 * API utility for making authenticated requests to the backend
 * Automatically includes JWT token from localStorage
 */

/**
 * Make an authenticated fetch request
 * @param {string} url - The URL to fetch
 * @param {object} options - Fetch options (method, headers, body, etc.)
 * @returns {Promise<Response>} - The fetch response
 */
export async function authenticatedFetch(url, options = {}) {
  const token = localStorage.getItem("uploader_token");
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem("uploader_token");
    localStorage.removeItem("uploader_id");
    window.location.href = "/uploader-login";
    throw new Error("Authentication expired");
  }

  return response;
}

/**
 * Fetch a PDF as a blob for preview/download
 * @param {string} url - The URL to fetch
 * @returns {Promise<Blob>} - The PDF blob
 */
export async function fetchPdfBlob(url) {
  const token = localStorage.getItem("uploader_token");
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (response.status === 401) {
    localStorage.removeItem("uploader_token");
    localStorage.removeItem("uploader_id");
    window.location.href = "/uploader-login";
    throw new Error("Authentication expired");
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
  }
  
  return response.blob();
}

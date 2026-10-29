export async function apiRequest(endpoint, { method = 'GET', body, signal, params } = {}) {
  let url = endpoint;

  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value);
      }
    }
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const options = {
    method,
    signal,
    headers: {
      Accept: 'application/json',
    },
  };

  if (body) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  let data;
  try {
    data = await response.json();
  } catch (err) {
    throw new Error(`Failed to parse response from server (${response.status})`);
  }

  if (!response.ok) {
    const error = new Error(data?.error?.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.code = data?.error?.code;
    error.fields = data?.error?.fields;
    throw error;
  }

  return data;
}


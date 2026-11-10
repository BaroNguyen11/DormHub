import { api, queryString } from "../api/apiClient";

const inFlightGetRequests = new Map();

function getOnce(endpoint) {
  const existingRequest = inFlightGetRequests.get(endpoint);
  if (existingRequest) return existingRequest;

  const request = api(endpoint).finally(() => {
    if (inFlightGetRequests.get(endpoint) === request) {
      inFlightGetRequests.delete(endpoint);
    }
  });
  inFlightGetRequests.set(endpoint, request);
  return request;
}

function getResource(path, id) {
  return getOnce(`${path}/${encodeURIComponent(id)}`);
}

export const resources = {
  list: (path, params = {}) => getOnce(`${path}${queryString(params)}`),
  get: getResource,
  create: (path, body) => api(path, { method: "POST", body }),
  update: (path, id, body, method = "PATCH") =>
    api(`${path}/${encodeURIComponent(id)}`, { method, body }),
  action: (path, method = "POST", body) => api(path, { method, body }),
};

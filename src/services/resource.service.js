import { api, queryString } from "../api/apiClient";

export const resources = {
  list: (path, params = {}) => api(`${path}${queryString(params)}`),
  get: (path, id) => api(`${path}/${encodeURIComponent(id)}`),
  create: (path, body) => api(path, { method: "POST", body }),
  update: (path, id, body, method = "PATCH") =>
    api(`${path}/${encodeURIComponent(id)}`, { method, body }),
  action: (path, method = "POST", body) => api(path, { method, body }),
};

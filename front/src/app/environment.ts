// Environment config with API proxy support
export const environment = {
  api: window.location.hostname === 'localhost' ? 'http://localhost:8080' : '/api'
};

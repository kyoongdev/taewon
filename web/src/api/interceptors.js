import axiosInstance from "./api";
import TokenService from "./token.service";

const setup = (store) => {
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = TokenService.getAuthToken();
      if (token) {
        config.headers["Authorization"] = 'Bearer ' + token;
      }
      return config;
    },
    (error) => {
      debugger
      return Promise.reject(error);
    }
  );
  const responseSuccessHandler = response => {
    return response;
  };
  const responseErrorHandler = error => {
    if(!error.status && !error.response && error.message === 'Network Error') {
      error = {
        response: {
          data: {
            message: "Network error or Server was down."
          }
        }
      }
    }
    return Promise.reject(error);
  }
  axiosInstance.interceptors.response.use(
    response => responseSuccessHandler(response),
    error => responseErrorHandler(error)
  );
}

export default setup;
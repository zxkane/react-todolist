import axios from "axios";
import Swal from "sweetalert2";

export const AXIOS_CONFIG = {
  headers: {
    "Content-Type": "application/json",
  },
};

const instance = axios.create({
  baseURL: "/prod",
  headers: {
    "Content-Type": "application/json",
  },
});

instance.interceptors.request.use(
  (config: any) => {
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    console.info("response:", response);
    if (response.status === 401 || response.status === 403) {
      // Redirect to Authing Login
      // eslint-disable-next-line prefer-promise-reject-errors
      return Promise.reject("401 User Unauthorized");
    } else {
      if (response) {
        return Promise.resolve(response);
      } else {
        // eslint-disable-next-line prefer-promise-reject-errors
        return Promise.reject("response error");
      }
    }
  },
  (error) => {
    console.info("ERR:", error.response);
    // Swal.fire(error.message);
    Swal.fire(
      `${error.message}`,
      `${error?.response?.data?.message}`,
      undefined
    );
    console.log("-- error --");
    console.error(error);
    console.log("-- error --");
    // eslint-disable-next-line prefer-promise-reject-errors
    return Promise.reject({
      success: false,
      msg: error,
    });
  }
);

export default instance;
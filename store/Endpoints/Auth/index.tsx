import { defaults } from "../default";

export const authEndpoints = {
  loginApi: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/login/",
    },
  },
  registerApi: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/register/",
    },
  },
  verifyOtp: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/verify-otp/",
    },
  },
};

import { callApi } from "../../../utils/api/apiUtils";
import { authEndpoints } from "../../Endpoints/Auth";

export const loginApiCall = ({ body }: any) =>
  callApi({
    uriEndPoint: authEndpoints.loginApi.v1,
    body,
  });

export const registerApi = ({ body }: any) =>
  callApi({
    uriEndPoint: authEndpoints.registerApi.v1,
    body,
  });

export const verifyOtp = ({ body }: any) =>
  callApi({
    uriEndPoint: authEndpoints.verifyOtp.v1,
    body,
  });

import axios from "axios";

export class TokenService {
  public getLaunchTokenService = async (sessionId: string) => {
    const tokenResponse = await axios.post(
      `${process.env.RULE_MGMT_API_LOCATION}/apis/v1/rule-validation/launchtoken`,
      {
        token: {
          sessionId: sessionId
        }
      }
    );
    return tokenResponse.data;
  };
  public putValidateTokenCall = async (sessionId: string, retoken: string) => {
    try {
      const isTokenValid = await axios.put(
        `${process.env.RULE_MGMT_API_LOCATION}/apis/v1/rule-validation/launchtoken`,
        {
          token: {
            sessionId: sessionId,
            token: retoken
          }
        }
      );
      return {
        token: isTokenValid.data.token
      };
    } catch (error) {
      // use return error.response.data if you want to return the error message details
      return null;
    }
  };
}

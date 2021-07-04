"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const tslib_1 = require("tslib");
const axios_1 = tslib_1.__importDefault(require("axios"));
class TokenService {
    constructor() {
        this.getLaunchTokenService = async (sessionId) => {
            const tokenResponse = await axios_1.default.post(`${process.env.RULE_MGMT_API_LOCATION}/apis/v1/rule-validation/launchtoken`, {
                token: {
                    sessionId: sessionId
                }
            });
            return tokenResponse.data;
        };
        this.putValidateTokenCall = async (sessionId, retoken) => {
            try {
                const isTokenValid = await axios_1.default.put(`${process.env.RULE_MGMT_API_LOCATION}/apis/v1/rule-validation/launchtoken`, {
                    token: {
                        sessionId: sessionId,
                        token: retoken
                    }
                });
                return {
                    token: isTokenValid.data.token
                };
            }
            catch (error) {
                // use return error.response.data if you want to return the error message details
                return null;
            }
        };
    }
}
exports.TokenService = TokenService;
//# sourceMappingURL=TokenService.js.map
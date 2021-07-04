"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseRulesService = void 0;
const tslib_1 = require("tslib");
const axios_1 = tslib_1.__importDefault(require("axios"));
const constants_1 = require("../utils/constants");
const RulesService_1 = require("./RulesService");
class CourseRulesService {
    constructor() {
        this.commonRulesService = new RulesService_1.RulesService();
        this.getCourseRules = async (id, sessionId, _retoken) => {
            try {
                /*       if (process.env.BYPASS_RE_AUTH !== "true") {
                  const isTokenValid = await axios.put(
                    `${process.env.RULE_MGMT_API_LOCATION}/apis/v1/rule-validation/launchtoken`,
                    {
                      token: {
                        sessionId: sessionId,
                        token: retoken
                      }
                    }
                  );
                } */
                // eol: uncomment later  if (isTokenValid.status === 200) {
                const resp = await axios_1.default.get(`${process.env.RULE_MGMT_API_LOCATION}/apis/v1/rule-validation/course/${id}`, {
                    headers: {
                        sessionid: sessionId
                    }
                });
                if (resp.status != 200) {
                    throw new Error(`Cannot get /apis/v1/rule-validation/course/${id}`);
                }
                return resp.data;
                // eol: uncomment later}
            }
            catch (error) {
                console.error(error);
                return error.response.data;
            }
        };
        this.updateCourseRules = async (sessionId, sysId, subjbody) => {
            const { data: course } = await axios_1.default.get(`${process.env.RULE_MGMT_API_LOCATION}/apis/v1/rule-validation/course/${sysId}`, {
                headers: {
                    sessionid: sessionId
                }
            });
            delete course.rules;
            course.rules = subjbody;
            const result = await axios_1.default.patch(`${process.env.RULE_MGMT_API_LOCATION}/apis/v1/rule-validation/course/${sysId}`, { course }, {
                headers: {
                    sessionid: sessionId //the token is a variable which holds the token
                }
            });
            return result.data;
        };
        this.addOneRule = async (uiObj, templateComponent, existingCourse) => {
            const objectFields = {
                recordId: existingCourse.recordId,
                year: existingCourse.year,
                courseCode: existingCourse.code
            };
            let result;
            switch (uiObj.type) {
                case constants_1.CreateRuleType.Rule:
                    result = this.commonRulesService.createRuleObj(uiObj, templateComponent, existingCourse.rules, objectFields);
                    break;
                case constants_1.CreateRuleType.SharedComponent:
                    console.log(existingCourse);
                    // const publishedYears = existingCourse.publishedYears.split(",");
                    // const year = publishedYears[publishedYears.length - 1];
                    result = this.commonRulesService.createSharedComponent(uiObj, templateComponent, existingCourse.rules, objectFields);
                    break;
                case constants_1.CreateRuleType.TopLevelRuleGroup:
                    result = this.commonRulesService.createTopLevelRuleObj(uiObj, templateComponent, existingCourse.rules, objectFields);
                    break;
            }
            existingCourse.rules = result.rules;
            // console.log("existing rules", JSON.stringify(existingCourse.rules, null, 2));
            const updatedCourse = await this.patchObject(uiObj.sysId, existingCourse, uiObj.sessionId);
            return {
                newlyCreatedRuleId: result.newlyCreatedRuleId,
                course: updatedCourse
            };
        };
        this.updateOneRule = async (uiObj, existingCourse) => {
            const objectFields = {
                recordId: existingCourse.recordId,
                year: existingCourse.year,
                courseCode: existingCourse.code
            };
            existingCourse.rules = this.commonRulesService.updateRuleObj(uiObj, existingCourse.rules, objectFields);
            return await this.patchObject(uiObj.sysId, existingCourse, uiObj.sessionId);
        };
        this.moveTo = async (uiObj, existingCourse) => {
            existingCourse.rules = this.commonRulesService.moveTo(uiObj, existingCourse.rules);
            return await this.patchObject(uiObj.sysId, existingCourse, uiObj.sessionId);
        };
        this.deleteOneRule = async (ruleId, existingCourse, sessionId) => {
            existingCourse.rules = this.commonRulesService.deleteRuleInRuleObj(ruleId, existingCourse.rules);
            return await this.patchObject(existingCourse.versionId, existingCourse, sessionId);
        };
        this.addCourseRuleTemplate = async (existingCourse, templateComponent, sessionId) => {
            existingCourse.rules = templateComponent;
            const objectFields = {
                recordId: existingCourse.recordId,
                year: existingCourse.year,
                courseCode: existingCourse.code
            };
            this.commonRulesService.generateIdForRuleComponentAndChildren(templateComponent, objectFields);
            return await this.patchObject(existingCourse.versionId, existingCourse, sessionId);
        };
        this.generateNewInstanceTemplate = (subjectTemplate, objectFields) => {
            this.commonRulesService.generateIdForRuleComponentAndChildren(subjectTemplate, objectFields);
            return subjectTemplate;
        };
        this.getRuleUsageChainRecursive = (ruleObj, ruleId) => {
            return this.commonRulesService.getRuleUsageChainRecursive(ruleObj, ruleId, []);
        };
    }
    async patchObject(sysId, updatedCourse, sessionId) {
        const url = `${process.env.RULE_MGMT_API_LOCATION}/apis/v1/rule-validation/course/${sysId}`;
        const response = await axios_1.default.patch(url, { course: updatedCourse }, {
            headers: {
                sessionid: sessionId
            }
        });
        if (response.status != 200) {
            throw new Error(`Got ${response.status} ${response.statusText} from ${url}`);
        }
        return response.data;
    }
}
exports.CourseRulesService = CourseRulesService;
//# sourceMappingURL=CourseRulesService.js.map
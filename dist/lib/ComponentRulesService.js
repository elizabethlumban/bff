"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentRulesService = void 0;
const tslib_1 = require("tslib");
const axios_1 = tslib_1.__importDefault(require("axios"));
const constants_1 = require("../utils/constants");
const RulesService_1 = require("./RulesService");
class ComponentRulesService {
    constructor() {
        this.commonRulesService = new RulesService_1.RulesService();
        this.getComponentRules = async (sysId, sessionId, _retoken) => {
            try {
                console.log("get at componentRules Service", sessionId);
                //if (isTokenValid.status === 200) {
                const componentDetails = await axios_1.default.get(`${process.env.RULE_MGMT_API_LOCATION}/apis/v1/rule-validation/component/${sysId}`, {
                    headers: {
                        sessionid: sessionId
                    }
                });
                return componentDetails.data;
                // }
                //TODO: for status other than 200, for course details not found
            }
            catch (error) {
                return error.response.data;
            }
        };
        this.updateComponentRules = async (sysId, sessionId, componentBody) => {
            const { data: component } = await axios_1.default.get(`${process.env.RULE_MGMT_API_LOCATION}/apis/v1/rule-validation/component/${sysId}`, {
                headers: {
                    sessionid: sessionId
                }
            });
            delete component.rules;
            component.rules = componentBody;
            const result = await axios_1.default.patch(`${process.env.RULE_MGMT_API_LOCATION}/apis/v1/rule-validation/component/${sysId}`, { component }, {
                headers: {
                    sessionid: sessionId
                }
            });
            return result.data;
        };
        this.addOneRule = async (uiObj, templateComponent, existingComponent) => {
            const objectFields = {
                recordId: existingComponent.recordId,
                year: existingComponent.year
                // code: existingComponent.parentCourseCode // TODO mapping
            };
            let result;
            switch (uiObj.type) {
                case constants_1.CreateRuleType.Rule:
                    result = this.commonRulesService.createRuleObj(uiObj, templateComponent, existingComponent.rules, objectFields);
                    break;
                case constants_1.CreateRuleType.SharedComponent:
                    const publishedYears = existingComponent.publishedYears.split(",");
                    const year = publishedYears[publishedYears.length - 1];
                    result = this.commonRulesService.createSharedComponent(uiObj, templateComponent, existingComponent.rules, objectFields);
                    break;
                case constants_1.CreateRuleType.TopLevelRuleGroup:
                    result = this.commonRulesService.createTopLevelRuleObj(uiObj, templateComponent, existingComponent.rules, objectFields);
                    break;
            }
            existingComponent.rules = result.rules;
            const updatedComponent = await this.patchObject(uiObj.sysId, existingComponent, uiObj.sessionId);
            return {
                newlyCreatedRuleId: result.newlyCreatedRuleId,
                component: updatedComponent
            };
        };
        this.updateOneRule = async (uiObj, existingComponent) => {
            const objectFields = {
                recordId: existingComponent.recordId,
                year: existingComponent.year
            };
            existingComponent.rules = this.commonRulesService.updateRuleObj(uiObj, existingComponent.rules, existingComponent.year);
            return await this.patchObject(uiObj.sysId, existingComponent, uiObj.sessionId);
        };
        this.moveTo = async (uiObj, existingCourse) => {
            existingCourse.rules = this.commonRulesService.moveTo(uiObj, existingCourse.rules);
            return await this.patchObject(uiObj.sysId, existingCourse, uiObj.sessionId);
        };
        this.deleteOneRule = async (ruleId, existingComponent, sessionId) => {
            existingComponent.rules = this.commonRulesService.deleteRuleInRuleObj(ruleId, existingComponent.rules);
            return await this.patchObject(existingComponent.versionId, existingComponent, sessionId);
        };
        this.generateNewInstanceTemplate = (componentTemplate, objectFields) => {
            this.commonRulesService.generateIdForRuleComponentAndChildren(componentTemplate, objectFields);
            return componentTemplate;
        };
    }
    async patchObject(sysId, updatedComponent, sessionId) {
        const url = `${process.env.RULE_MGMT_API_LOCATION}/apis/v1/rule-validation/component/${sysId}`;
        const response = await axios_1.default.patch(url, { component: updatedComponent }, {
            headers: {
                sessionid: sessionId
            }
        });
        if (response.status != 200) {
            throw new Error(`Got ${response.status} ${response.statusText} from ${url}`);
        }
        console.log("response", response.data);
        return response.data;
    }
}
exports.ComponentRulesService = ComponentRulesService;
//# sourceMappingURL=ComponentRulesService.js.map
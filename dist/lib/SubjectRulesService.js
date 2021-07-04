"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubjectRulesService = void 0;
const tslib_1 = require("tslib");
const axios_1 = tslib_1.__importDefault(require("axios"));
const constants_1 = require("../utils/constants");
const rule_1 = require("../utils/types/rule");
const reqParser_1 = require("./ReqsParsers/reqParser");
const RulesService_1 = require("./RulesService");
const SearchService_1 = require("./SearchService");
class SubjectRulesService {
    constructor() {
        this.commonRulesService = new RulesService_1.RulesService();
        this.searchService = new SearchService_1.SearchService();
        this.getSubjectRules = async (sysId, sessionId, _retoken) => {
            try {
                /*  if (process.env.BYPASS_RE_AUTH !== "true") {
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
                //if (isTokenValid.status === 200) {
                const ruleResponse = await axios_1.default.get(`${process.env.RULE_MGMT_API_LOCATION}/apis/v1/rule-validation/subject/${sysId}`, {
                    headers: {
                        /*       authtoken: process.env.BYPASS_RE_AUTH ? retoken : "banana" */
                        sessionid: sessionId
                    }
                });
                return ruleResponse.data;
                //   }
            }
            catch (error) {
                return error.response.data;
            }
        };
        this.updateSubjectRules = async (sessionId, sysId, subjbody) => {
            const { data: subject } = await axios_1.default.get(`${process.env.RULE_MGMT_API_LOCATION}/apis/v1/rule-validation/subject/${sysId}`, {
                headers: {
                    sessionid: sessionId //the token is a variable which holds the token
                }
            });
            delete subject.rules;
            subject.rules = subjbody;
            const result = await axios_1.default.patch(`${process.env.RULE_MGMT_API_LOCATION}/apis/v1/rule-validation/subject/${sysId}`, { subject }, {
                headers: {
                    sessionid: sessionId //the token is a variable which holds the token
                }
            });
            return result.data;
        };
        this.addOneRule = async (uiObj, templateComponent, existingSubject) => {
            const objectFields = {
                recordId: existingSubject.recordId,
                year: existingSubject.year,
                courseCode: existingSubject.code
            };
            let result;
            switch (uiObj.type) {
                case constants_1.CreateRuleType.Rule:
                    result = this.commonRulesService.createRuleObj(uiObj, templateComponent, existingSubject.rules, existingSubject.recordId);
                    break;
                case constants_1.CreateRuleType.SharedComponent:
                    // console.log(existingSubject);
                    const publishedYears = existingSubject.publishedYears.split(",");
                    const year = publishedYears[publishedYears.length - 1];
                    result = this.commonRulesService.createSharedComponent(uiObj, templateComponent, existingSubject.rules, objectFields);
                    break;
                case constants_1.CreateRuleType.TopLevelRuleGroup:
                    result = this.commonRulesService.createTopLevelRuleObj(uiObj, templateComponent, existingSubject.rules, objectFields);
                    break;
            }
            existingSubject.rules = result.rules;
            const updatedSubject = await this.patchObject(uiObj.sysId, existingSubject, uiObj.sessionId);
            return {
                newlyCreatedRuleId: result.newlyCreatedRuleId,
                subject: updatedSubject
            };
        };
        this.updateOneRule = async (uiObj, existingSubject) => {
            const objectFields = {
                recordId: existingSubject.recordId,
                year: existingSubject.year
            };
            existingSubject.rules = this.commonRulesService.updateRuleObj(uiObj, existingSubject.rules, objectFields);
            return await this.patchObject(uiObj.sysId, existingSubject, uiObj.sessionId);
        };
        this.moveTo = async (uiObj, existingCourse) => {
            existingCourse.rules = this.commonRulesService.moveTo(uiObj, existingCourse.rules);
            return await this.patchObject(uiObj.sysId, existingCourse, uiObj.sessionId);
        };
        this.deleteOneRule = async (ruleId, existingSubject, sessionId) => {
            existingSubject.rules = this.commonRulesService.deleteRuleInRuleObj(ruleId, existingSubject.rules);
            return await this.patchObject(existingSubject.versionId, existingSubject, sessionId);
        };
        this.generateNewInstanceTemplate = (subjectTemplate, objectFields) => {
            this.commonRulesService.generateIdForRuleComponentAndChildren(subjectTemplate, objectFields);
            return subjectTemplate;
        };
        this.VALUE_TO_REPLACE = "<to fill in>";
        this.defaultCountConstraintUiObj = {
            type: constants_1.CreateRuleType.Rule,
            parentRuleId: this.VALUE_TO_REPLACE,
            ruleType: rule_1.RuleComponentType.CountConstraint,
            selectedOrDefaultFormat: "Default",
            parameters: {
                label: "Required Subjects",
                minimum: 1,
                maximum: 999,
                concurrency: "None",
                qualifier: ""
            },
            sessionId: "undefined",
            sysId: this.VALUE_TO_REPLACE
        };
        this.defaultSubjectSetUiObj = {
            ruleId: this.VALUE_TO_REPLACE,
            ruleType: rule_1.RuleComponentType.SubjectSet,
            selectedOrDefaultFormat: this.VALUE_TO_REPLACE,
            parameters: {
                label: "Subjects",
                staticSubjectCodes: [],
                ssType: "Static"
            },
            sessionId: "undefined",
            sysId: this.VALUE_TO_REPLACE
        };
        this.defaultInformationUiObj = {
            ruleId: this.VALUE_TO_REPLACE,
            ruleType: rule_1.RuleComponentType.Information,
            selectedOrDefaultFormat: this.VALUE_TO_REPLACE,
            parameters: {
                text: this.VALUE_TO_REPLACE
            },
            sessionId: "undefined",
            sysId: this.VALUE_TO_REPLACE
        };
    }
    async patchObject(sysId, updatedSubject, sessionId) {
        const url = `${process.env.RULE_MGMT_API_LOCATION}/apis/v1/rule-validation/subject/${sysId}`;
        const response = await axios_1.default.patch(url, { subject: updatedSubject }, {
            headers: {
                sessionid: sessionId
            }
        });
        if (response.status != 200) {
            throw new Error(`Got ${response.status} ${response.statusText} from ${url}`);
        }
        return response.data;
    }
    async generateRules(subject, templates, sessionId) {
        const logicConstructTemplate = templates.filter(template => template.type === rule_1.RuleComponentType.LogicConstruct)[0];
        const prereqRules = reqParser_1.parsePretextWithAList(subject.prerequisiteDescription, reqParser_1.ReqType.PRE_REQ);
        const prereqText = reqParser_1.toPlainText(subject.prerequisiteDescription);
        console.log("prereqRules", JSON.stringify(prereqRules));
        if (prereqRules || prereqText) {
            this.generateTopLevelGroup(rule_1.RuleSectionType.Prerequisites, JSON.parse(JSON.stringify(logicConstructTemplate)), subject);
            await this.generateRuleComponents([prereqRules], rule_1.RuleSectionType.Prerequisites, subject, templates, sessionId);
            this.generateInfoRuleComponents(prereqText, rule_1.RuleSectionType.Prerequisites, subject, templates);
        }
        const coreqRules = reqParser_1.parsePretextWithAList(subject.corequisiteDescription, reqParser_1.ReqType.CO_REQ);
        const coreqText = reqParser_1.toPlainText(subject.corequisiteDescription);
        console.log("coreqRules", JSON.stringify(coreqRules));
        if (coreqRules || coreqText) {
            this.generateTopLevelGroup(rule_1.RuleSectionType.Corequisites, JSON.parse(JSON.stringify(logicConstructTemplate)), subject);
            await this.generateRuleComponents([coreqRules], rule_1.RuleSectionType.Corequisites, subject, templates, sessionId);
            this.generateInfoRuleComponents(coreqText, rule_1.RuleSectionType.Corequisites, subject, templates);
        }
        const disallowedRules = reqParser_1.parsePretextWithAList(subject.disallowedSubjectsDescription, reqParser_1.ReqType.DISALLOWED);
        const disallowedText = reqParser_1.toPlainText(subject.disallowedSubjectsDescription);
        console.log("disallowedRules", JSON.stringify(disallowedRules));
        if (disallowedRules || disallowedText) {
            this.generateTopLevelGroup(rule_1.RuleSectionType.NonAllowedSubjects, JSON.parse(JSON.stringify(logicConstructTemplate)), subject);
            await this.generateRuleComponents([disallowedRules], rule_1.RuleSectionType.NonAllowedSubjects, subject, templates, sessionId);
            this.generateInfoRuleComponents(disallowedText, rule_1.RuleSectionType.NonAllowedSubjects, subject, templates);
        }
        return !(!prereqRules &&
            !prereqText &&
            !coreqRules &&
            !coreqText &&
            !disallowedRules &&
            !disallowedText);
    }
    generateTopLevelGroup(parentRuleSectionType, logicConstructTemplate, subject) {
        const logicConstructUiObj = {
            type: constants_1.CreateRuleType.TopLevelRuleGroup,
            parentIndex: 0,
            parentRuleSectionType: parentRuleSectionType,
            ruleType: rule_1.RuleComponentType.LogicConstruct,
            // selectedOrDefaultFormat?: "Default";
            parameters: {
                operator: "AND",
                label: parentRuleSectionType
            },
            sessionId: "undefined",
            sysId: subject.recordId
        };
        switch (parentRuleSectionType) {
            case rule_1.RuleSectionType.Prerequisites:
                logicConstructUiObj.parentIndex = 0;
                break;
            case rule_1.RuleSectionType.Corequisites:
                logicConstructUiObj.parentIndex = 1;
                break;
            case rule_1.RuleSectionType.NonAllowedSubjects:
                logicConstructUiObj.parentIndex = 2;
                break;
            default:
                throw new Error(`Unsupported section type:${parentRuleSectionType}`);
        }
        const objectFields = {
            recordId: subject.recordId,
            year: subject.year
        };
        return this.commonRulesService.createTopLevelRuleObj(logicConstructUiObj, logicConstructTemplate, subject.rules, objectFields);
    }
    async generateRuleComponents(parsedRules, type, subject, templates, sessionId
    // Can add information template
    ) {
        const parsedCountRule = parsedRules[0];
        console.log("parsedCountRule", parsedCountRule);
        if (!parsedCountRule) {
            return;
        }
        const subjects = await this.searchService.searchSubjectsByCodes(parsedCountRule.codes, sessionId);
        console.log("subjects", subjects);
        const subjectRecordIds = subjects.map((s) => s.recordId).filter(Boolean);
        // Abort if we can't find a subject
        if (subjectRecordIds.length !== parsedCountRule.codes.length) {
            return;
        }
        let countConstraintTemplate = templates.find(template => template.type === rule_1.RuleComponentType.CountConstraint);
        countConstraintTemplate = JSON.parse(JSON.stringify(countConstraintTemplate));
        const countConstraintUiObj = JSON.parse(JSON.stringify(this.defaultCountConstraintUiObj));
        countConstraintUiObj.sysId = subject.recordId;
        countConstraintUiObj.selectedOrDefaultFormat = countConstraintTemplate.formats[0].name;
        let section;
        switch (type) {
            case rule_1.RuleSectionType.Prerequisites:
                section = subject.rules.children[0];
                countConstraintUiObj.parameters.minimum = parsedCountRule.count;
                countConstraintUiObj.parameters.maximum = parsedCountRule.count;
                countConstraintUiObj.parameters.concurrency = parsedCountRule.concurrent
                    ? "Concurrent Prerequisite"
                    : "Prerequisite";
                break;
            case rule_1.RuleSectionType.Corequisites:
                section = subject.rules.children[1];
                countConstraintUiObj.parameters.minimum = parsedCountRule.count;
                countConstraintUiObj.parameters.maximum = parsedCountRule.count;
                countConstraintUiObj.parameters.concurrency = "Corequisite"; // Not sure
                break;
            case rule_1.RuleSectionType.NonAllowedSubjects:
                section = subject.rules.children[2];
                countConstraintUiObj.parameters.minimum = 0;
                countConstraintUiObj.parameters.maximum = 0;
                countConstraintUiObj.parameters.label = "Non-allowed subjects";
                break;
            default:
                throw new Error(`Unsupported section type:${type}`);
        }
        const group = section.children[0];
        countConstraintUiObj.parentRuleId = group.id;
        const objectFields = {
            recordId: subject.recordId,
            year: subject.year
        };
        const countConstraintCreateResult = this.commonRulesService.createRuleObj(countConstraintUiObj, JSON.parse(JSON.stringify(countConstraintTemplate)), subject.rules, objectFields);
        const countConstraintRuleTemplate = group.children[0];
        const subjectSet = countConstraintRuleTemplate.children[0].children[0];
        const subjectSetUiObj = JSON.parse(JSON.stringify(this.defaultSubjectSetUiObj));
        subjectSetUiObj.ruleId = subjectSet.id;
        subjectSetUiObj.sysId = subject.recordId;
        subjectSetUiObj.parameters.staticSubjectCodes = parsedCountRule.codes;
        subjectSetUiObj.parameters.staticSubjectReferences = subjectRecordIds;
        subjectSetUiObj.selectedOrDefaultFormat = subjectSet.selectedOrDefaultFormat;
        this.commonRulesService.updateRuleObj(subjectSetUiObj, subject.rules, objectFields);
        return countConstraintCreateResult;
    }
    generateInfoRuleComponents(text, type, subject, templates) {
        if (!text) {
            return;
        }
        let infoConstraintTemplate = templates.find(template => template.type === rule_1.RuleComponentType.Information);
        infoConstraintTemplate = JSON.parse(JSON.stringify(infoConstraintTemplate));
        const infoUiObj = JSON.parse(JSON.stringify(this.defaultInformationUiObj));
        infoUiObj.sysId = subject.recordId;
        infoUiObj.parameters.text = text;
        infoUiObj.selectedOrDefaultFormat = infoConstraintTemplate.formats[0].name;
        let section;
        switch (type) {
            case rule_1.RuleSectionType.Prerequisites:
                section = subject.rules.children[0];
                break;
            case rule_1.RuleSectionType.Corequisites:
                section = subject.rules.children[1];
                break;
            case rule_1.RuleSectionType.NonAllowedSubjects:
                section = subject.rules.children[2];
                break;
            default:
                throw new Error(`Unsupported section type:${type}`);
        }
        const group = section.children[0];
        infoUiObj.parentRuleId = group.id;
        const objectFields = {
            recordId: subject.recordId,
            year: subject.year
        };
        const infoCreateResult = this.commonRulesService.createRuleObj(infoUiObj, JSON.parse(JSON.stringify(infoConstraintTemplate)), subject.rules, objectFields);
        console.log("Here <<");
        return infoCreateResult;
    }
}
exports.SubjectRulesService = SubjectRulesService;
//# sourceMappingURL=SubjectRulesService.js.map
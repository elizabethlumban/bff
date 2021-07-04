"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateRuleType = exports.COURSE_RULE_SECTION = exports.COURSE_RULE_GROUP = exports.COURSE_RULES = exports.DEFAULT_FORMATS_ARRAY = exports.DEFAULT_FORMAT = exports.COURSE_RULES_SVC_BASE_URL = exports.PLAN_SVC_BASE_URL = exports.RULE_MODEL_SVC_BASE_URL = exports.CAPS_API_BASE_URL = exports.ERROR_UNAUTHORIZED = exports.MSG_400 = exports.MSG_404 = void 0;
// import { isDev } from "@utils/envUtil";
const rule_1 = require("./types/rule");
// if (isDev()) {
//   // This loads .env
//   console.log("In development mode");
// }
exports.MSG_404 = "Resource not found";
exports.MSG_400 = "Bad Request";
exports.ERROR_UNAUTHORIZED = {
    code: "403",
    name: "Forbidden",
    description: "You don't have permission to access this resource."
};
exports.CAPS_API_BASE_URL = process.env.CAPS_API_BASE_URL || "http://localhost:6005/apis/v1/caps-stub";
exports.RULE_MODEL_SVC_BASE_URL = process.env.RULE_MODEL_SVC_BASE_URL || "http://localhost:6003/apis/v1/rule-model";
exports.PLAN_SVC_BASE_URL = process.env.PLAN_SVC_BASE_URL || "http://localhost:6002/apis/v1";
exports.COURSE_RULES_SVC_BASE_URL = process.env.COURSE_RULES_SVC_BASE_URL || "http://localhost:6001/apis/v1/course-rules";
exports.DEFAULT_FORMAT = "Default";
exports.DEFAULT_FORMATS_ARRAY = [
    {
        id: "1",
        name: exports.DEFAULT_FORMAT,
        outputField: "output",
        transforms: [
            {
                stage: 1,
                type: "text",
                outputField: "output",
                template: "{{#each input.children}}{{result this}}{{/each}}"
            }
        ]
    }
];
exports.COURSE_RULES = {
    stereotype: rule_1.Stereotype.Rules,
    type: rule_1.RulesType.Course
};
exports.COURSE_RULE_GROUP = {
    id: "group_1",
    stereotype: rule_1.Stereotype.RuleGroup,
    type: rule_1.RuleGroupType.LogicConstruct
};
exports.COURSE_RULE_SECTION = {
    id: "course_rules",
    stereotype: rule_1.Stereotype.RuleSection,
    type: rule_1.RuleSectionType.CourseRules
};
var CreateRuleType;
(function (CreateRuleType) {
    CreateRuleType[CreateRuleType["SharedComponent"] = 0] = "SharedComponent";
    CreateRuleType[CreateRuleType["TopLevelRuleGroup"] = 1] = "TopLevelRuleGroup";
    CreateRuleType[CreateRuleType["Rule"] = 2] = "Rule";
})(CreateRuleType = exports.CreateRuleType || (exports.CreateRuleType = {}));
// console.log('constants', process.env.CAPS_API_BASE_URL);
//# sourceMappingURL=constants.js.map
// import { isDev } from "@utils/envUtil";
import { Stereotype, RuleSectionType, RulesType, RuleGroupType } from "./types/rule";

// if (isDev()) {
//   // This loads .env
//   console.log("In development mode");
// }

export const MSG_404 = "Resource not found";
export const MSG_400 = "Bad Request";
export const ERROR_UNAUTHORIZED = {
  code: "403",
  name: "Forbidden",
  description: "You don't have permission to access this resource."
};
export const CAPS_API_BASE_URL =
  process.env.CAPS_API_BASE_URL || "http://localhost:6005/apis/v1/caps-stub";
export const RULE_MODEL_SVC_BASE_URL =
  process.env.RULE_MODEL_SVC_BASE_URL || "http://localhost:6003/apis/v1/rule-model";
export const PLAN_SVC_BASE_URL = process.env.PLAN_SVC_BASE_URL || "http://localhost:6002/apis/v1";
export const COURSE_RULES_SVC_BASE_URL =
  process.env.COURSE_RULES_SVC_BASE_URL || "http://localhost:6001/apis/v1/course-rules";

export const DEFAULT_FORMAT = "Default";
export const DEFAULT_FORMATS_ARRAY = [
  {
    id: "1",
    name: DEFAULT_FORMAT,
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

export const COURSE_RULES = {
  stereotype: Stereotype.Rules,
  type: RulesType.Course
};

export const COURSE_RULE_GROUP = {
  id: "group_1",
  stereotype: Stereotype.RuleGroup,
  type: RuleGroupType.LogicConstruct
};

export const COURSE_RULE_SECTION = {
  id: "course_rules",
  stereotype: Stereotype.RuleSection,
  type: RuleSectionType.CourseRules
};

export enum CreateRuleType {
  SharedComponent,
  TopLevelRuleGroup,
  Rule
}
// console.log('constants', process.env.CAPS_API_BASE_URL);

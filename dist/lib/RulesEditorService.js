"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RulesEditorService = void 0;
const tslib_1 = require("tslib");
const axios_1 = tslib_1.__importDefault(require("axios"));
const rule_1 = require("../utils/types/rule");
// import { flattenDeep, pick } from "lodash";
/* export interface IRETemplateParameter {
  name: string;
  label: string;
  value: string;
  type: string;
  enumValues?: string[];
}

export interface IRETemplate {
  ruleType: string;
  parameters: IRETemplateParameter[];
  selectedSubjects?: string[];
  selectedFormat: string;
  formats:string[];
} */
class RulesEditorService {
    constructor() {
        this.getRuleTemplates = async () => {
            try {
                const excludedTemplates = [rule_1.RuleTemplateType.TotalCoursePoints];
                const allTemplates = await axios_1.default.get(`${process.env.RULE_MODEL_SVC_API_LOCATION}/apis/v1/rule-model/templates`);
                // console.log(allTemplates.status);
                // Return all templates with stereotype = RuleTemplate (excl. automatic rules)
                return allTemplates.data.filter((t) => t.stereotype === rule_1.Stereotype.RuleTemplate &&
                    !excludedTemplates.includes(t.type));
                /* const ruleTemplates = allTemplates.data.filter(
                  (t: IRuleComponent) =>
                    t.stereotype === Stereotype.RuleTemplate &&
                    !excludedTemplates.includes(t.type as RuleTemplateType)
                ); */
                /* const allowedParameters = ["text", "selfEvaluated", "label", "minimum", "maximum"]; */
                /* const templates = ruleTemplates.map((rt: IRuleComponent) => ({
                  ruleType: rt.type,
                  formats: rt.formats.map((f: IFormat) => f.name),
                  parameters: flattenDeep(
                    rt.children.map((rc: IRuleComponent) =>
                      rc.parameters
                        .filter((p: IParameter) => allowedParameters.includes(p.name))
                        .map(p => pick(p, ["name", "value", "label", "type", "enumValues"]))
                    )
                  ),
                  selectedFormat: rt.selectedOrDefaultFormat
                })); */
            }
            catch (error) {
                return error.response.data;
            }
        };
    }
    async getAllRuleInstanceTemplates() {
        try {
            const resp = await axios_1.default.get(`${process.env.RULE_MODEL_SVC_API_LOCATION}/apis/v1/rule-model/templates`);
            if (resp.status < 200 || resp.status >= 300) {
                throw new Error(`${resp.status} ${resp.statusText} while calling ${process.env.RULE_MODEL_SVC_API_LOCATION}/apis/v1/rule-model/templates`);
            }
            return resp.data;
        }
        catch (error) {
            return error.response.data; // TODO
        }
    }
    async getRuleInstanceTemplate(desiredType) {
        const allTemplates = await this.getAllRuleInstanceTemplates();
        let desiredTemplateType;
        let recognizedType = false;
        switch (desiredType) {
            case rule_1.RuleComponentType.Information:
                desiredTemplateType = rule_1.RuleTemplateType.Information;
                break;
            case rule_1.RuleComponentType.PointsConstraint:
                desiredTemplateType = rule_1.RuleTemplateType.PointsConstraint;
                break;
            case rule_1.RuleComponentType.CountConstraint:
                desiredTemplateType = rule_1.RuleTemplateType.CountConstraint;
                break;
            case rule_1.RuleGroupType.LogicConstruct:
            case rule_1.RulesType.Course:
            case rule_1.RulesType.Subject:
            case rule_1.RulesType.Component:
                recognizedType = true;
            default:
                if (!recognizedType) {
                    console.warn("Unrecognized type:", desiredType, ".  Just returning it as the template type");
                }
                desiredTemplateType = desiredType;
        }
        const filteredTemplates = allTemplates.filter((template) => template.type === desiredTemplateType);
        if (filteredTemplates.length !== 1) {
            console.error("Should only get 1 template ", filteredTemplates);
        }
        return filteredTemplates[0];
    }
}
exports.RulesEditorService = RulesEditorService;
/*
// Example mock (old approach)
const mockData = [
  {
    ruleType: "C1 Points Constraint",
    parameters: [
      {
        name: "label",
        label: "Label",
        value: "",
        type: "string"
      },
      {
        name: "minimum",
        label: "Minimum Points",
        value: 0,
        type: "number"
      },
      {
        name: "maximum",
        label: "Maximum Points",
        value: 0,
        type: "number"
      }
    ],
    selectedFormat: "Default",
    formats: ["Default", "List"]
  },
  {
    // information
    ruleType: "C2 Information",
    parameters: [
      {
        name: "text",
        label: "Text",
        value: "",
        type: "string"
      },
      {
        name: "selfEvaluated",
        label: "Self Evaluated",
        value: "False",
        type: "enum",
        enumValues: ["True", "False"]
      }
    ],
    selectedFormat: "Content",
    formats: ["Content", "Heading1", "Heading2", "Heading3", "Heading4"]
  }
]; */
//# sourceMappingURL=RulesEditorService.js.map
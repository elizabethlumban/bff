import axios from "axios";
import {
  IRuleComponent,
  Stereotype,
  RuleTemplateType,
  RuleComponentType,
  RuleGroupType,
  RulesType
  /*  IFormat,
  IParameter */
} from "../utils/types/rule";
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

export class RulesEditorService {
  public getRuleTemplates = async () => {
    try {
      const excludedTemplates = [RuleTemplateType.TotalCoursePoints];
      const allTemplates = await axios.get(
        `${process.env.RULE_MODEL_SVC_API_LOCATION}/apis/v1/rule-model/templates`
      );
      // console.log(allTemplates.status);

      // Return all templates with stereotype = RuleTemplate (excl. automatic rules)
      return allTemplates.data.filter(
        (t: IRuleComponent) =>
          t.stereotype === Stereotype.RuleTemplate &&
          !excludedTemplates.includes(t.type as RuleTemplateType)
      );

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
    } catch (error) {
      return error.response.data;
    }
  };

  async getAllRuleInstanceTemplates() {
    try {
      const resp = await axios.get(
        `${process.env.RULE_MODEL_SVC_API_LOCATION}/apis/v1/rule-model/templates`
      );
      if (resp.status < 200 || resp.status >= 300) {
        throw new Error(
          `${resp.status} ${resp.statusText} while calling ${process.env.RULE_MODEL_SVC_API_LOCATION}/apis/v1/rule-model/templates`
        );
      }
      return resp.data;
    } catch (error) {
      return error.response.data; // TODO
    }
  }

  public async getRuleInstanceTemplate(
    desiredType: RuleComponentType | RuleGroupType | RulesType
  ): Promise<IRuleComponent> {
    const allTemplates = await this.getAllRuleInstanceTemplates();
    let desiredTemplateType: RuleTemplateType | RuleGroupType;
    let recognizedType = false;
    switch (desiredType) {
      case RuleComponentType.Information:
        desiredTemplateType = RuleTemplateType.Information;
        break;
      case RuleComponentType.PointsConstraint:
        desiredTemplateType = RuleTemplateType.PointsConstraint;
        break;
      case RuleComponentType.CountConstraint:
        desiredTemplateType = RuleTemplateType.CountConstraint;
        break;

      case RuleGroupType.LogicConstruct:
      case RulesType.Course:
      case RulesType.Subject:
      case RulesType.Component:
        recognizedType = true;
      default:
        if (!recognizedType) {
          console.warn(
            "Unrecognized type:",
            desiredType,
            ".  Just returning it as the template type"
          );
        }
        desiredTemplateType = desiredType as RuleTemplateType | RuleGroupType;
    }
    const filteredTemplates = allTemplates.filter(
      (template: IRuleComponent) => template.type === desiredTemplateType
    );
    if (filteredTemplates.length !== 1) {
      console.error("Should only get 1 template ", filteredTemplates);
    }
    return filteredTemplates[0];
  }
}
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

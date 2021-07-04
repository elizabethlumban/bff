import axios from "axios";
import { CreateRuleType } from "../utils/constants";
import { IRuleComponent, RuleComponentType, RuleSectionType } from "../utils/types/rule";
import { ISubject } from "../utils/types/subject";
import { IParsedRule, parsePretextWithAList, ReqType, toPlainText } from "./ReqsParsers/reqParser";
import {
  RulesService,
  ICreateRuleBody,
  IUpdateRuleBody,
  ICreateTopLevelGroupBody,
  IMoveToRuleBody,
  ICreateSharedComponentBody,
  IObjectFields
} from "./RulesService";
import { SearchService } from "./SearchService";

export class SubjectRulesService {
  commonRulesService = new RulesService();
  searchService = new SearchService();

  public getSubjectRules = async (sysId: string, sessionId: string, _retoken?: string) => {
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
      const ruleResponse = await axios.get(
        `${process.env.RULE_MGMT_API_LOCATION}/apis/v1/rule-validation/subject/${sysId}`,
        {
          headers: {
            /*       authtoken: process.env.BYPASS_RE_AUTH ? retoken : "banana" */
            sessionid: sessionId
          }
        }
      );
      return ruleResponse.data;

      //   }
    } catch (error) {
      return error.response.data;
    }
  };

  public updateSubjectRules = async (sessionId: string, sysId: string, subjbody: any) => {
    const { data: subject } = await axios.get(
      `${process.env.RULE_MGMT_API_LOCATION}/apis/v1/rule-validation/subject/${sysId}`,
      {
        headers: {
          sessionid: sessionId //the token is a variable which holds the token
        }
      }
    );
    delete subject.rules;
    subject.rules = subjbody;
    const result = await axios.patch(
      `${process.env.RULE_MGMT_API_LOCATION}/apis/v1/rule-validation/subject/${sysId}`,
      { subject },
      {
        headers: {
          sessionid: sessionId //the token is a variable which holds the token
        }
      }
    );
    return result.data;
  };

  async patchObject(sysId: string, updatedSubject: any, sessionId: string) {
    const url = `${process.env.RULE_MGMT_API_LOCATION}/apis/v1/rule-validation/subject/${sysId}`;
    const response = await axios.patch(
      url,
      { subject: updatedSubject },
      {
        headers: {
          sessionid: sessionId
        }
      }
    );
    if (response.status != 200) {
      throw new Error(`Got ${response.status} ${response.statusText} from ${url}`);
    }
    return response.data;
  }

  public addOneRule = async (
    uiObj: ICreateRuleBody | ICreateTopLevelGroupBody,
    templateComponent: IRuleComponent,
    existingSubject: any
  ) => {
    const objectFields: IObjectFields = {
      recordId: existingSubject.recordId,
      year: existingSubject.year,
      courseCode: existingSubject.code
    } as IObjectFields;
    let result;
    switch (uiObj.type) {
      case CreateRuleType.Rule:
        result = this.commonRulesService.createRuleObj(
          uiObj as ICreateRuleBody,
          templateComponent,
          existingSubject.rules,
          existingSubject.recordId
        );
        break;
      case CreateRuleType.SharedComponent:
        // console.log(existingSubject);
        const publishedYears = existingSubject.publishedYears.split(",");
        const year = publishedYears[publishedYears.length - 1];
        result = this.commonRulesService.createSharedComponent(
          uiObj as ICreateSharedComponentBody,
          templateComponent,
          existingSubject.rules,
          objectFields
        );
        break;
      case CreateRuleType.TopLevelRuleGroup:
        result = this.commonRulesService.createTopLevelRuleObj(
          uiObj as ICreateTopLevelGroupBody,
          templateComponent,
          existingSubject.rules,
          objectFields
        );
        break;
    }
    existingSubject.rules = result.rules;
    const updatedSubject = await this.patchObject(uiObj.sysId, existingSubject, uiObj.sessionId);
    return {
      newlyCreatedRuleId: result.newlyCreatedRuleId,
      subject: updatedSubject
    };
  };

  public updateOneRule = async (uiObj: IUpdateRuleBody, existingSubject: any) => {
    const objectFields: IObjectFields = {
      recordId: existingSubject.recordId,
      year: existingSubject.year
    } as IObjectFields;
    existingSubject.rules = this.commonRulesService.updateRuleObj(
      uiObj,
      existingSubject.rules,
      objectFields
    );
    return await this.patchObject(uiObj.sysId, existingSubject, uiObj.sessionId);
  };

  public moveTo = async (uiObj: IMoveToRuleBody, existingCourse: any) => {
    existingCourse.rules = this.commonRulesService.moveTo(uiObj, existingCourse.rules);
    return await this.patchObject(uiObj.sysId, existingCourse, uiObj.sessionId);
  };

  public deleteOneRule = async (ruleId: string, existingSubject: any, sessionId: string) => {
    existingSubject.rules = this.commonRulesService.deleteRuleInRuleObj(
      ruleId,
      existingSubject.rules
    );
    return await this.patchObject(existingSubject.versionId, existingSubject, sessionId);
  };

  generateNewInstanceTemplate = (subjectTemplate: IRuleComponent, objectFields: IObjectFields) => {
    this.commonRulesService.generateIdForRuleComponentAndChildren(subjectTemplate, objectFields);
    return subjectTemplate;
  };

  async generateRules(subject: ISubject, templates: Array<IRuleComponent>, sessionId: string) {
    const logicConstructTemplate = templates.filter(
      template => template.type === RuleComponentType.LogicConstruct
    )[0];

    const prereqRules = parsePretextWithAList(subject.prerequisiteDescription, ReqType.PRE_REQ);
    const prereqText = toPlainText(subject.prerequisiteDescription);
    console.log("prereqRules", JSON.stringify(prereqRules));
    if (prereqRules || prereqText) {
      this.generateTopLevelGroup(
        RuleSectionType.Prerequisites,
        JSON.parse(JSON.stringify(logicConstructTemplate)),
        subject
      );
      await this.generateRuleComponents(
        [prereqRules],
        RuleSectionType.Prerequisites,
        subject,
        templates,
        sessionId
      );
      this.generateInfoRuleComponents(
        prereqText,
        RuleSectionType.Prerequisites,
        subject,
        templates
      );
    }

    const coreqRules = parsePretextWithAList(subject.corequisiteDescription, ReqType.CO_REQ);
    const coreqText = toPlainText(subject.corequisiteDescription);
    console.log("coreqRules", JSON.stringify(coreqRules));
    if (coreqRules || coreqText) {
      this.generateTopLevelGroup(
        RuleSectionType.Corequisites,
        JSON.parse(JSON.stringify(logicConstructTemplate)),
        subject
      );
      await this.generateRuleComponents(
        [coreqRules],
        RuleSectionType.Corequisites,
        subject,
        templates,
        sessionId
      );
      this.generateInfoRuleComponents(coreqText, RuleSectionType.Corequisites, subject, templates);
    }

    const disallowedRules = parsePretextWithAList(
      subject.disallowedSubjectsDescription,
      ReqType.DISALLOWED
    );
    const disallowedText = toPlainText(subject.disallowedSubjectsDescription);
    console.log("disallowedRules", JSON.stringify(disallowedRules));
    if (disallowedRules || disallowedText) {
      this.generateTopLevelGroup(
        RuleSectionType.NonAllowedSubjects,
        JSON.parse(JSON.stringify(logicConstructTemplate)),
        subject
      );
      await this.generateRuleComponents(
        [disallowedRules],
        RuleSectionType.NonAllowedSubjects,
        subject,
        templates,
        sessionId
      );
      this.generateInfoRuleComponents(
        disallowedText,
        RuleSectionType.NonAllowedSubjects,
        subject,
        templates
      );
    }
    return !(
      !prereqRules &&
      !prereqText &&
      !coreqRules &&
      !coreqText &&
      !disallowedRules &&
      !disallowedText
    );
  }

  generateTopLevelGroup(
    parentRuleSectionType: RuleSectionType,
    logicConstructTemplate: IRuleComponent,
    subject: ISubject
  ) {
    const logicConstructUiObj: ICreateTopLevelGroupBody = {
      type: CreateRuleType.TopLevelRuleGroup,
      parentIndex: 0,
      parentRuleSectionType: parentRuleSectionType,
      ruleType: RuleComponentType.LogicConstruct,
      // selectedOrDefaultFormat?: "Default";
      parameters: {
        operator: "AND",
        label: parentRuleSectionType
      },
      sessionId: "undefined", // should not be needed
      sysId: subject.recordId
    };

    switch (parentRuleSectionType) {
      case RuleSectionType.Prerequisites:
        logicConstructUiObj.parentIndex = 0;
        break;
      case RuleSectionType.Corequisites:
        logicConstructUiObj.parentIndex = 1;
        break;
      case RuleSectionType.NonAllowedSubjects:
        logicConstructUiObj.parentIndex = 2;
        break;
      default:
        throw new Error(`Unsupported section type:${parentRuleSectionType}`);
    }
    const objectFields: IObjectFields = {
      recordId: subject.recordId,
      year: subject.year
    } as IObjectFields;
    return this.commonRulesService.createTopLevelRuleObj(
      logicConstructUiObj,
      logicConstructTemplate,
      subject.rules,
      objectFields
    );
  }

  async generateRuleComponents(
    parsedRules: Array<IParsedRule | null>,
    type: RuleSectionType,
    subject: ISubject,
    templates: Array<IRuleComponent>,
    sessionId: string
    // Can add information template
  ) {
    const parsedCountRule = parsedRules[0];
    console.log("parsedCountRule", parsedCountRule);
    if (!parsedCountRule) {
      return;
    }
    const subjects = await this.searchService.searchSubjectsByCodes(
      parsedCountRule.codes,
      sessionId
    );
    console.log("subjects", subjects);
    const subjectRecordIds = subjects.map((s: ISubject) => s.recordId).filter(Boolean);

    // Abort if we can't find a subject
    if (subjectRecordIds.length !== parsedCountRule.codes.length) {
      return;
    }

    let countConstraintTemplate = templates.find(
      template => template.type === RuleComponentType.CountConstraint
    )!;
    countConstraintTemplate = JSON.parse(JSON.stringify(countConstraintTemplate));

    const countConstraintUiObj = JSON.parse(JSON.stringify(this.defaultCountConstraintUiObj));
    countConstraintUiObj.sysId = subject.recordId;
    countConstraintUiObj.selectedOrDefaultFormat = countConstraintTemplate.formats[0].name;

    let section: IRuleComponent;
    switch (type) {
      case RuleSectionType.Prerequisites:
        section = subject.rules.children[0];
        countConstraintUiObj.parameters.minimum = parsedCountRule.count;
        countConstraintUiObj.parameters.maximum = parsedCountRule.count;
        countConstraintUiObj.parameters.concurrency = parsedCountRule.concurrent
          ? "Concurrent Prerequisite"
          : "Prerequisite";
        break;
      case RuleSectionType.Corequisites:
        section = subject.rules.children[1];
        countConstraintUiObj.parameters.minimum = parsedCountRule.count;
        countConstraintUiObj.parameters.maximum = parsedCountRule.count;
        countConstraintUiObj.parameters.concurrency = "Corequisite"; // Not sure
        break;
      case RuleSectionType.NonAllowedSubjects:
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
    const objectFields: IObjectFields = {
      recordId: subject.recordId,
      year: subject.year
    } as IObjectFields;
    const countConstraintCreateResult = this.commonRulesService.createRuleObj(
      countConstraintUiObj,
      JSON.parse(JSON.stringify(countConstraintTemplate)),
      subject.rules,
      objectFields
    );

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

  generateInfoRuleComponents(
    text: string,
    type: RuleSectionType,
    subject: ISubject,
    templates: Array<IRuleComponent>
  ) {
    if (!text) {
      return;
    }

    let infoConstraintTemplate = templates.find(
      template => template.type === RuleComponentType.Information
    )!;
    infoConstraintTemplate = JSON.parse(JSON.stringify(infoConstraintTemplate));

    const infoUiObj = JSON.parse(JSON.stringify(this.defaultInformationUiObj));
    infoUiObj.sysId = subject.recordId;
    infoUiObj.parameters.text = text;
    infoUiObj.selectedOrDefaultFormat = infoConstraintTemplate.formats[0].name;

    let section: IRuleComponent;
    switch (type) {
      case RuleSectionType.Prerequisites:
        section = subject.rules.children[0];
        break;
      case RuleSectionType.Corequisites:
        section = subject.rules.children[1];
        break;
      case RuleSectionType.NonAllowedSubjects:
        section = subject.rules.children[2];
        break;
      default:
        throw new Error(`Unsupported section type:${type}`);
    }
    const group = section.children[0];
    infoUiObj.parentRuleId = group.id;

    const objectFields: IObjectFields = {
      recordId: subject.recordId,
      year: subject.year
    };
    const infoCreateResult = this.commonRulesService.createRuleObj(
      infoUiObj,
      JSON.parse(JSON.stringify(infoConstraintTemplate)),
      subject.rules,
      objectFields
    );
    console.log("Here <<");

    return infoCreateResult;
  }

  VALUE_TO_REPLACE = "<to fill in>";
  defaultCountConstraintUiObj: ICreateRuleBody = {
    type: CreateRuleType.Rule,
    parentRuleId: this.VALUE_TO_REPLACE,
    ruleType: RuleComponentType.CountConstraint,
    selectedOrDefaultFormat: "Default",
    parameters: {
      label: "Required Subjects",
      minimum: 1,
      maximum: 999,
      concurrency: "None",
      qualifier: ""
    },
    sessionId: "undefined", // TODO should not be needed
    sysId: this.VALUE_TO_REPLACE
  };

  defaultSubjectSetUiObj: IUpdateRuleBody = {
    ruleId: this.VALUE_TO_REPLACE,
    ruleType: RuleComponentType.SubjectSet,
    selectedOrDefaultFormat: this.VALUE_TO_REPLACE,
    parameters: {
      label: "Subjects",
      staticSubjectCodes: [],
      ssType: "Static"
    },
    sessionId: "undefined", // TODO should not be needed
    sysId: this.VALUE_TO_REPLACE
  };

  defaultInformationUiObj: IUpdateRuleBody = {
    ruleId: this.VALUE_TO_REPLACE,
    ruleType: RuleComponentType.Information,
    selectedOrDefaultFormat: this.VALUE_TO_REPLACE,
    parameters: {
      text: this.VALUE_TO_REPLACE
    },
    sessionId: "undefined", // TODO should not be needed
    sysId: this.VALUE_TO_REPLACE
  };
}

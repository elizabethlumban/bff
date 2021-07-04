import axios from "axios";
import { CreateRuleType } from "../utils/constants";
import { ICourse } from "../utils/types/course";
import { IRuleComponent } from "../utils/types/rule";
import {
  RulesService,
  ICreateRuleBody,
  IUpdateRuleBody,
  ICreateTopLevelGroupBody,
  IMoveToRuleBody,
  ICreateSharedComponentBody,
  IObjectFields
} from "./RulesService";

export class CourseRulesService {
  commonRulesService = new RulesService();

  public getCourseRules = async (id: string, sessionId: string, _retoken?: string) => {
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
      const resp = await axios.get(
        `${process.env.RULE_MGMT_API_LOCATION}/apis/v1/rule-validation/course/${id}`,
        {
          headers: {
            sessionid: sessionId
          }
        }
      );
      if (resp.status != 200) {
        throw new Error(`Cannot get /apis/v1/rule-validation/course/${id}`);
      }
      return resp.data;
      // eol: uncomment later}
    } catch (error) {
      console.error(error);
      return error.response.data;
    }
  };

  public updateCourseRules = async (
    sessionId: string,
    sysId: string,
    subjbody: IUpdateRuleBody
  ) => {
    const { data: course } = await axios.get(
      `${process.env.RULE_MGMT_API_LOCATION}/apis/v1/rule-validation/course/${sysId}`,
      {
        headers: {
          sessionid: sessionId
        }
      }
    );
    delete course.rules;
    course.rules = subjbody;
    const result = await axios.patch(
      `${process.env.RULE_MGMT_API_LOCATION}/apis/v1/rule-validation/course/${sysId}`,
      { course },
      {
        headers: {
          sessionid: sessionId //the token is a variable which holds the token
        }
      }
    );
    return result.data;
  };

  async patchObject(sysId: string, updatedCourse: any, sessionId: string) {
    const url = `${process.env.RULE_MGMT_API_LOCATION}/apis/v1/rule-validation/course/${sysId}`;
    const response = await axios.patch(
      url,
      { course: updatedCourse },
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
    uiObj: ICreateTopLevelGroupBody | ICreateRuleBody | ICreateSharedComponentBody,
    templateComponent: IRuleComponent,
    existingCourse: ICourse
  ) => {
    const objectFields: IObjectFields = {
      recordId: existingCourse.recordId,
      year: existingCourse.year,
      courseCode: existingCourse.code
    };
    let result;
    switch (uiObj.type) {
      case CreateRuleType.Rule:
        result = this.commonRulesService.createRuleObj(
          uiObj as ICreateRuleBody,
          templateComponent,
          existingCourse.rules,
          objectFields
        );
        break;
      case CreateRuleType.SharedComponent:
        console.log(existingCourse);
        // const publishedYears = existingCourse.publishedYears.split(",");
        // const year = publishedYears[publishedYears.length - 1];
        result = this.commonRulesService.createSharedComponent(
          uiObj as ICreateSharedComponentBody,
          templateComponent,
          existingCourse.rules,
          objectFields
        );
        break;
      case CreateRuleType.TopLevelRuleGroup:
        result = this.commonRulesService.createTopLevelRuleObj(
          uiObj as ICreateTopLevelGroupBody,
          templateComponent,
          existingCourse.rules,
          objectFields
        );
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

  public updateOneRule = async (uiObj: IUpdateRuleBody, existingCourse: any) => {
    const objectFields: IObjectFields = {
      recordId: existingCourse.recordId,
      year: existingCourse.year,
      courseCode: existingCourse.code
    } as IObjectFields;
    existingCourse.rules = this.commonRulesService.updateRuleObj(
      uiObj,
      existingCourse.rules,
      objectFields
    );
    return await this.patchObject(uiObj.sysId, existingCourse, uiObj.sessionId);
  };

  public moveTo = async (uiObj: IMoveToRuleBody, existingCourse: any) => {
    existingCourse.rules = this.commonRulesService.moveTo(uiObj, existingCourse.rules);
    return await this.patchObject(uiObj.sysId, existingCourse, uiObj.sessionId);
  };

  public deleteOneRule = async (ruleId: string, existingCourse: any, sessionId: string) => {
    existingCourse.rules = this.commonRulesService.deleteRuleInRuleObj(
      ruleId,
      existingCourse.rules
    );
    return await this.patchObject(existingCourse.versionId, existingCourse, sessionId);
  };

  public addCourseRuleTemplate = async (
    existingCourse: any,
    templateComponent: IRuleComponent,
    sessionId: string
  ) => {
    existingCourse.rules = templateComponent;
    const objectFields: IObjectFields = {
      recordId: existingCourse.recordId,
      year: existingCourse.year,
      courseCode: existingCourse.code
    } as IObjectFields;
    this.commonRulesService.generateIdForRuleComponentAndChildren(templateComponent, objectFields);
    return await this.patchObject(existingCourse.versionId, existingCourse, sessionId);
  };

  generateNewInstanceTemplate = (subjectTemplate: IRuleComponent, objectFields: IObjectFields) => {
    this.commonRulesService.generateIdForRuleComponentAndChildren(subjectTemplate, objectFields);
    return subjectTemplate;
  };

  getRuleUsageChainRecursive = (ruleObj: IRuleComponent, ruleId: string) => {
    return this.commonRulesService.getRuleUsageChainRecursive(ruleObj, ruleId, []);
  };
}

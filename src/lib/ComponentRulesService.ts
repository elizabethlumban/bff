import axios from "axios";
import { CreateRuleType } from "../utils/constants";
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

export class ComponentRulesService {
  commonRulesService = new RulesService();

  public getComponentRules = async (sysId: string, sessionId: string, _retoken?: string) => {
    try {
      console.log("get at componentRules Service", sessionId);
      //if (isTokenValid.status === 200) {

      const componentDetails = await axios.get(
        `${process.env.RULE_MGMT_API_LOCATION}/apis/v1/rule-validation/component/${sysId}`,
        {
          headers: {
            sessionid: sessionId
          }
        }
      );
      return componentDetails.data;
      // }
      //TODO: for status other than 200, for course details not found
    } catch (error) {
      return error.response.data;
    }
  };

  public updateComponentRules = async (sysId: string, sessionId: string, componentBody: any) => {
    const { data: component } = await axios.get(
      `${process.env.RULE_MGMT_API_LOCATION}/apis/v1/rule-validation/component/${sysId}`,
      {
        headers: {
          sessionid: sessionId
        }
      }
    );
    delete component.rules;
    component.rules = componentBody;
    const result = await axios.patch(
      `${process.env.RULE_MGMT_API_LOCATION}/apis/v1/rule-validation/component/${sysId}`,
      { component },
      {
        headers: {
          sessionid: sessionId
        }
      }
    );
    return result.data;
  };

  async patchObject(sysId: string, updatedComponent: any, sessionId: string) {
    const url = `${process.env.RULE_MGMT_API_LOCATION}/apis/v1/rule-validation/component/${sysId}`;
    const response = await axios.patch(
      url,
      { component: updatedComponent },
      {
        headers: {
          sessionid: sessionId
        }
      }
    );
    if (response.status != 200) {
      throw new Error(`Got ${response.status} ${response.statusText} from ${url}`);
    }
    console.log("response", response.data);
    return response.data;
  }

  public addOneRule = async (
    uiObj: ICreateRuleBody | ICreateTopLevelGroupBody,
    templateComponent: IRuleComponent,
    existingComponent: any
  ) => {
    const objectFields: IObjectFields = {
      recordId: existingComponent.recordId,
      year: existingComponent.year
      // code: existingComponent.parentCourseCode // TODO mapping
    };
    let result;
    switch (uiObj.type) {
      case CreateRuleType.Rule:
        result = this.commonRulesService.createRuleObj(
          uiObj as ICreateRuleBody,
          templateComponent,
          existingComponent.rules,
          objectFields
        );
        break;
      case CreateRuleType.SharedComponent:
        const publishedYears = existingComponent.publishedYears.split(",");
        const year = publishedYears[publishedYears.length - 1];
        result = this.commonRulesService.createSharedComponent(
          uiObj as ICreateSharedComponentBody,
          templateComponent,
          existingComponent.rules,
          objectFields
        );
        break;
      case CreateRuleType.TopLevelRuleGroup:
        result = this.commonRulesService.createTopLevelRuleObj(
          uiObj as ICreateTopLevelGroupBody,
          templateComponent,
          existingComponent.rules,
          objectFields
        );
        break;
    }
    existingComponent.rules = result.rules;
    const updatedComponent = await this.patchObject(
      uiObj.sysId,
      existingComponent,
      uiObj.sessionId
    );
    return {
      newlyCreatedRuleId: result.newlyCreatedRuleId,
      component: updatedComponent
    };
  };

  public updateOneRule = async (uiObj: IUpdateRuleBody, existingComponent: any) => {
    const objectFields: IObjectFields = {
      recordId: existingComponent.recordId,
      year: existingComponent.year
    };
    existingComponent.rules = this.commonRulesService.updateRuleObj(
      uiObj,
      existingComponent.rules,
      existingComponent.year
    );
    return await this.patchObject(uiObj.sysId, existingComponent, uiObj.sessionId);
  };

  public moveTo = async (uiObj: IMoveToRuleBody, existingCourse: any) => {
    existingCourse.rules = this.commonRulesService.moveTo(uiObj, existingCourse.rules);
    return await this.patchObject(uiObj.sysId, existingCourse, uiObj.sessionId);
  };

  public deleteOneRule = async (ruleId: string, existingComponent: any, sessionId: string) => {
    existingComponent.rules = this.commonRulesService.deleteRuleInRuleObj(
      ruleId,
      existingComponent.rules
    );
    return await this.patchObject(existingComponent.versionId, existingComponent, sessionId);
  };

  generateNewInstanceTemplate = (
    componentTemplate: IRuleComponent,
    objectFields: IObjectFields
  ) => {
    this.commonRulesService.generateIdForRuleComponentAndChildren(componentTemplate, objectFields);
    return componentTemplate;
  };
}

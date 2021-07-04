import { IRuleComponent, RuleComponentType, RuleSectionType } from "../utils/types/rule";
import { v4 as uuidv4 } from "uuid";
import { CreateRuleType } from "../utils/constants";
import { cloneDeep } from "lodash";

export class RulesService {
  twoLevelRuleTypes = [
    RuleComponentType.PointsConstraint,
    RuleComponentType.Information,
    RuleComponentType.CountConstraint,
    RuleComponentType.CountConstraintMMS
  ]; // TODO make this a config

  generateId(ruleType: string) {
    const ruleTypeWithoutSpaces = ruleType.replace(/\s/g, "");
    return `${ruleTypeWithoutSpaces}_${uuidv4()}`;
  }

  generateIdForRuleComponentAndChildren(component: IRuleComponent, objectFields: IObjectFields) {
    component.id = this.generateId(component.type);
    component.recordId = objectFields.recordId;
    for (const child of component.children) {
      this.generateIdForRuleComponentAndChildren(child, objectFields);
    }
  }

  validateArguments(
    numArgs: number,
    existingRuleObj: IRuleComponent,
    uiObj?: any,
    templateComponent?: IRuleComponent
  ) {
    if (!existingRuleObj) {
      throw new Error(`Rule object does not exist ${existingRuleObj}`);
    }
    if (numArgs > 1 && !uiObj) {
      throw new Error(`UI object does not exist ${uiObj}`);
    }
    if (numArgs > 2 && !templateComponent) {
      throw new Error(`templateComponent does not exist ${templateComponent}`);
    }
  }

  createTopLevelRuleObj(
    uiObj: ICreateTopLevelGroupBody,
    templateComponent: IRuleComponent,
    existingRuleObj: IRuleComponent,
    objectFields: IObjectFields
  ) {
    // console.log("uiObj", uiObj);
    this.validateArguments(3, existingRuleObj, uiObj, templateComponent);

    const ruleSectionComponent = existingRuleObj.children[uiObj.parentIndex];
    uiObj.parentIndex === 0
      ? ruleSectionComponent.children.unshift(templateComponent)
      : ruleSectionComponent.children.push(templateComponent);
    // console.log("insert top level", uiObj, ruleSectionComponent);

    this.generateIdForRuleComponentAndChildren(templateComponent, objectFields);
    if (uiObj.selectedOrDefaultFormat) {
      templateComponent.selectedOrDefaultFormat = uiObj.selectedOrDefaultFormat;
    }
    // console.log('templateComponent', templateComponent);

    const ruleComponent = templateComponent;
    for (const paramObj of ruleComponent.parameters) {
      const key = paramObj.name;
      if (key in uiObj.parameters) {
        paramObj.value = uiObj.parameters[key];
      }
    }
    return {
      newlyCreatedRuleId: ruleComponent.id,
      rules: existingRuleObj
    };
  }

  createRuleObj(
    uiObj: ICreateRuleBody,
    templateComponentOriginal: IRuleComponent,
    existingRuleObj: IRuleComponent,
    objectFields: IObjectFields
  ) {
    // console.log("uiObj", uiObj);
    this.validateArguments(3, existingRuleObj, uiObj, templateComponentOriginal);
    const templateComponent = cloneDeep(templateComponentOriginal);

    const ruleType = uiObj.ruleType;
    const [groupComponent, _parentObj] = this.navigateRuleObj(uiObj.parentRuleId, existingRuleObj);
    groupComponent.children.push(templateComponent); // TODO insert in order

    this.generateIdForRuleComponentAndChildren(templateComponent, objectFields);
    if (uiObj.selectedOrDefaultFormat) {
      templateComponent.selectedOrDefaultFormat = uiObj.selectedOrDefaultFormat;
    }
    // console.log('templateComponent', templateComponent);

    let ruleComponent = templateComponent;
    if (this.twoLevelRuleTypes.includes(ruleType)) {
      ruleComponent = templateComponent.children[0];
    }

    for (const paramObj of ruleComponent.parameters) {
      const key = paramObj.name;
      if (key in uiObj.parameters) {
        paramObj.value = uiObj.parameters[key];
      }
    }
    if (uiObj.childrenReferences) {
      ruleComponent.childrenReferences = uiObj.childrenReferences;
    }
    return {
      newlyCreatedRuleId: ruleComponent.id,
      rules: existingRuleObj
    };
  }

  public updateRuleObj(
    uiObj: IUpdateRuleBody,
    existingRuleObj: IRuleComponent,
    objectFields: IObjectFields
  ) {
    // console.log('uiObj', uiObj);
    this.validateArguments(2, existingRuleObj, uiObj);
    const [ruleComponent, parentObj] = this.navigateRuleObj(uiObj.ruleId, existingRuleObj);
    // TODO change type
    let templateComponent: any;
    if (this.twoLevelRuleTypes.includes(uiObj.ruleType)) {
      templateComponent = parentObj;
    } else {
      templateComponent = ruleComponent;
    }
    // console.log('templateComponent', templateComponent);
    if ("selectedOrDefaultFormat" in uiObj) {
      templateComponent.selectedOrDefaultFormat = uiObj.selectedOrDefaultFormat;
    }

    for (const paramObj of ruleComponent.parameters) {
      const key = paramObj.name;
      if (key in uiObj.parameters) {
        paramObj.value = uiObj.parameters[key];
      } else if (key === "dynamicQueryAttributes") {
        this.populateDynamicQueryAttributes(paramObj, uiObj, objectFields);
      }
    }
    if (uiObj.childrenReferences) {
      ruleComponent.childrenReferences = uiObj.childrenReferences;
    }
    return existingRuleObj;
  }

  public deleteRuleInRuleObj(ruleId: string, ruleObj: IRuleComponent) {
    // console.log('uiObj', uiObj);
    this.validateArguments(1, ruleObj);
    const [ruleComponent, parentObj] = this.navigateRuleObj(ruleId, ruleObj);
    let templateComponent: any;
    if (this.twoLevelRuleTypes.includes(ruleComponent.type)) {
      templateComponent = parentObj;
    } else {
      templateComponent = ruleComponent;
    }
    // console.log("templateComponent", templateComponent);

    const [_templateComponent, groupComponent] = this.navigateRuleObj(
      templateComponent.id,
      ruleObj
    );
    // console.log("groupComponent", groupComponent);
    console.log(`>> >> >> Deleting ${templateComponent.id}, requested: ${ruleId}`);
    groupComponent.children = groupComponent.children.filter(
      (child: any) => child.id !== templateComponent.id
    );
    if (groupComponent.sharedComponents) {
      groupComponent.sharedComponents = groupComponent.sharedComponents.filter(
        (child: any) => child.id !== templateComponent.id
      );
    }

    return ruleObj;
  }

  navigateRuleObj(ruleId: string, existingRuleObj: IRuleComponent) {
    if (!existingRuleObj) {
      throw new Error(`invalid existing rules object:${existingRuleObj}`);
    }
    const navigateResult = this.navigateRuleObjRecursively(ruleId, existingRuleObj, undefined);
    if (navigateResult) {
      return navigateResult; // [ruleComponent, parentRuleComponent]
    } else {
      throw new Error(`id ${ruleId} not found`);
    }
  }

  navigateRuleObjRecursively(
    desiredId: string,
    ruleObj: IRuleComponent,
    parent: IRuleComponent | undefined
  ): any {
    // console.log(`traversing id ${ruleObj.id} for ${desiredId}.`);
    // console.log(`${ruleObj.id} === ${desiredId} = ${ruleObj.id === desiredId}` );
    if (ruleObj.id === desiredId) {
      return [ruleObj, parent];
    }
    // console.log('childrens ids: ', ruleObj.children.map(
    //   (child:any) => child.id));
    if (ruleObj.sharedComponents) {
      for (const child of ruleObj.sharedComponents) {
        const idFound = this.navigateRuleObjRecursively(desiredId, child, ruleObj);
        if (idFound) {
          return idFound;
        }
      }
    }
    for (const child of ruleObj.children) {
      // console.log('to traverse child ',child.id)
      const idFound = this.navigateRuleObjRecursively(desiredId, child, ruleObj);
      if (idFound) {
        return idFound;
      } else {
        // console.log('did not find in child ', child.id );
      }
    }
    if (!ruleObj.children) {
      return false;
    }
  }

  public moveTo = (
    { movedRuleId, movedToRuleId, position }: IMoveToRuleBody,
    rootRule: IRuleComponent
  ) => {
    const [moved, movedParent] = this.navigateRuleObj(movedRuleId, rootRule);
    console.log(`Moved ${moved.id}, parent: ${movedParent.id}`);

    // Find the template/group and remove it from where it was
    const movedTarget: IRuleComponent = this.twoLevelRuleTypes.includes(moved.type)
      ? movedParent
      : moved;
    console.log(`Moved target ${movedTarget.id}`);

    // Delete the rule from where it was
    this.deleteRuleInRuleObj(moved.id, rootRule);

    // You can only move to a group or section
    const [movedTo, _movedToParent] = this.navigateRuleObj(movedToRuleId, rootRule);
    console.log(`Moved to ${movedTo.id}`);

    movedTo.children.splice(position, 0, movedTarget);
    return rootRule;
  };

  populateDynamicQueryAttributes(
    paramObj: any,
    uiObj: ICreateSharedComponentBody | IUpdateRuleBody,
    objectFields: IObjectFields
  ) {
    if (!uiObj.parameters.ssType || uiObj.parameters.ssType !== "Dynamic") {
      return;
    }

    const yearParamArray = JSON.parse(JSON.stringify(paramObj.compositeParameters)); //TODO use clone
    for (const yearParamObj of yearParamArray) {
      this.populateDynamicParamObj(yearParamObj, "year", [objectFields.year]);
    }
    paramObj.value = [yearParamArray]; // TODO structure

    if ("breadthCourseCode" in uiObj.parameters) {
      // TODO check actual parameter
      if (uiObj.parameters.breadthCourseCode === true) {
        uiObj.parameters.breadthCourseCode = [objectFields.courseCode];
      } else {
        delete uiObj.parameters.breadthCourseCode;
      }
    }

    for (const dynamicParameter of ["level", "areaOfStudy", "owningOrg"]) {
      if (dynamicParameter in uiObj.parameters) {
        const dynamicParamArray = JSON.parse(JSON.stringify(paramObj.compositeParameters));
        for (const dynamicParamObj of dynamicParamArray) {
          this.populateDynamicParamObj(
            dynamicParamObj,
            dynamicParameter,
            uiObj.parameters[dynamicParameter]
          );
        }
        paramObj.value.push(dynamicParamArray); // TODO structure
      }
    }
  }

  populateDynamicParamObj(obj: any, param: string, value: any) {
    if (obj.name === "name") {
      obj.value = param;
    } else if (obj.name === "values") {
      obj.value = value;
    } else {
      console.warn("Unexpected dynamicParamObj:", obj);
    }
  }

  createSharedComponent(
    uiObj: ICreateSharedComponentBody,
    templateComponentOriginal: IRuleComponent,
    existingRuleObj: IRuleComponent,
    objectFields: IObjectFields
  ) {
    // console.log("uiObj", uiObj);
    this.validateArguments(3, existingRuleObj, uiObj, templateComponentOriginal);

    const parentComponent = existingRuleObj;
    const templateComponent = JSON.parse(JSON.stringify(templateComponentOriginal));
    if (!parentComponent.sharedComponents) {
      parentComponent.sharedComponents = [];
    }
    parentComponent.sharedComponents.push(templateComponent);

    this.generateIdForRuleComponentAndChildren(templateComponent, objectFields);
    if (uiObj.selectedOrDefaultFormat) {
      templateComponent.selectedOrDefaultFormat = uiObj.selectedOrDefaultFormat;
    }
    // console.log('templateComponent', templateComponent);

    const ruleComponent = templateComponent;
    for (const paramObj of ruleComponent.parameters) {
      const key = paramObj.name;
      if (key in uiObj.parameters) {
        paramObj.value = uiObj.parameters[key];
      } else if (key === "dynamicQueryAttributes") {
        this.populateDynamicQueryAttributes(paramObj, uiObj, objectFields);
      }
    }

    return {
      newlyCreatedRuleId: ruleComponent.id,
      rules: existingRuleObj
    };
  }

  getRuleName(ruleObj: IRuleComponent) {
    let name = "";
    if (ruleObj.parameters) {
      const labelObj = ruleObj.parameters.find((obj: any) => obj.name === "label");
      if (labelObj) {
        name = labelObj.value;
      }
    }
    return name;
  }

  getRuleUsageChainRecursive = (
    ruleObj: IRuleComponent,
    ruleId: string,
    successChainOriginal: Array<any>
  ): Array<Array<any>> | false => {
    const successChain = JSON.parse(JSON.stringify(successChainOriginal));
    successChain.unshift({
      id: ruleObj.id,
      name: this.getRuleName(ruleObj)
    });
    let found = false;
    let successChains = [];
    if (ruleObj.childrenReferences) {
      for (const ruleObjRuleId of ruleObj.childrenReferences) {
        if (ruleId === ruleObjRuleId) {
          found = true;
          successChains.push(successChain);
        }
      }
    }
    if (found) {
      return successChains;
    } else {
      for (const child of ruleObj.children) {
        const result = this.getRuleUsageChainRecursive(child, ruleId, successChain);
        if (result) {
          successChains = successChains.concat(result);
          // console.log("successChains", successChains);
        }
      }
    }
    if (successChains.length > 0) {
      return successChains;
    } else {
      return false;
    }
  };
}

export interface ICreateTopLevelGroupBody {
  type: CreateRuleType;
  parentIndex: number;
  parentRuleSectionType: RuleSectionType;
  ruleType: RuleComponentType;
  selectedOrDefaultFormat?: string;
  parameters: any;
  sessionId: string;
  sysId: string;
}
export interface ICreateRuleBody {
  type: CreateRuleType;
  parentRuleId: string;
  ruleType: RuleComponentType;
  selectedOrDefaultFormat?: string;
  childrenReferences?: Array<any>;
  parameters: any;
  sessionId: string;
  sysId: string;
}

export interface IUpdateRuleBody {
  ruleId: string;
  ruleType: RuleComponentType;
  selectedOrDefaultFormat?: string;
  childrenReferences?: Array<any>;
  parameters: any;
  sessionId: string;
  sysId: string;
}

export interface IMoveToRuleBody {
  ruleId: string;
  sessionId: string;
  sysId: string;
  movedRuleId: string;
  movedToRuleId: string;
  position: number;
}

export interface ICreateSharedComponentBody {
  type: CreateRuleType;
  ruleType?: RuleComponentType;
  selectedOrDefaultFormat?: string;
  parameters: any;
  sessionId: string;
  sysId: string;
}

export interface IObjectFields {
  recordId: string;
  year?: string;
  courseCode?: string;
}

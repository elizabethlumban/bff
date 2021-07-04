"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RulesService = void 0;
const rule_1 = require("../utils/types/rule");
const uuid_1 = require("uuid");
const lodash_1 = require("lodash");
class RulesService {
    constructor() {
        this.twoLevelRuleTypes = [
            rule_1.RuleComponentType.PointsConstraint,
            rule_1.RuleComponentType.Information,
            rule_1.RuleComponentType.CountConstraint,
            rule_1.RuleComponentType.CountConstraintMMS
        ]; // TODO make this a config
        this.moveTo = ({ movedRuleId, movedToRuleId, position }, rootRule) => {
            const [moved, movedParent] = this.navigateRuleObj(movedRuleId, rootRule);
            console.log(`Moved ${moved.id}, parent: ${movedParent.id}`);
            // Find the template/group and remove it from where it was
            const movedTarget = this.twoLevelRuleTypes.includes(moved.type)
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
        this.getRuleUsageChainRecursive = (ruleObj, ruleId, successChainOriginal) => {
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
            }
            else {
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
            }
            else {
                return false;
            }
        };
    }
    generateId(ruleType) {
        const ruleTypeWithoutSpaces = ruleType.replace(/\s/g, "");
        return `${ruleTypeWithoutSpaces}_${uuid_1.v4()}`;
    }
    generateIdForRuleComponentAndChildren(component, objectFields) {
        component.id = this.generateId(component.type);
        component.recordId = objectFields.recordId;
        for (const child of component.children) {
            this.generateIdForRuleComponentAndChildren(child, objectFields);
        }
    }
    validateArguments(numArgs, existingRuleObj, uiObj, templateComponent) {
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
    createTopLevelRuleObj(uiObj, templateComponent, existingRuleObj, objectFields) {
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
    createRuleObj(uiObj, templateComponentOriginal, existingRuleObj, objectFields) {
        // console.log("uiObj", uiObj);
        this.validateArguments(3, existingRuleObj, uiObj, templateComponentOriginal);
        const templateComponent = lodash_1.cloneDeep(templateComponentOriginal);
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
    updateRuleObj(uiObj, existingRuleObj, objectFields) {
        // console.log('uiObj', uiObj);
        this.validateArguments(2, existingRuleObj, uiObj);
        const [ruleComponent, parentObj] = this.navigateRuleObj(uiObj.ruleId, existingRuleObj);
        // TODO change type
        let templateComponent;
        if (this.twoLevelRuleTypes.includes(uiObj.ruleType)) {
            templateComponent = parentObj;
        }
        else {
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
            }
            else if (key === "dynamicQueryAttributes") {
                this.populateDynamicQueryAttributes(paramObj, uiObj, objectFields);
            }
        }
        if (uiObj.childrenReferences) {
            ruleComponent.childrenReferences = uiObj.childrenReferences;
        }
        return existingRuleObj;
    }
    deleteRuleInRuleObj(ruleId, ruleObj) {
        // console.log('uiObj', uiObj);
        this.validateArguments(1, ruleObj);
        const [ruleComponent, parentObj] = this.navigateRuleObj(ruleId, ruleObj);
        let templateComponent;
        if (this.twoLevelRuleTypes.includes(ruleComponent.type)) {
            templateComponent = parentObj;
        }
        else {
            templateComponent = ruleComponent;
        }
        // console.log("templateComponent", templateComponent);
        const [_templateComponent, groupComponent] = this.navigateRuleObj(templateComponent.id, ruleObj);
        // console.log("groupComponent", groupComponent);
        console.log(`>> >> >> Deleting ${templateComponent.id}, requested: ${ruleId}`);
        groupComponent.children = groupComponent.children.filter((child) => child.id !== templateComponent.id);
        if (groupComponent.sharedComponents) {
            groupComponent.sharedComponents = groupComponent.sharedComponents.filter((child) => child.id !== templateComponent.id);
        }
        return ruleObj;
    }
    navigateRuleObj(ruleId, existingRuleObj) {
        if (!existingRuleObj) {
            throw new Error(`invalid existing rules object:${existingRuleObj}`);
        }
        const navigateResult = this.navigateRuleObjRecursively(ruleId, existingRuleObj, undefined);
        if (navigateResult) {
            return navigateResult; // [ruleComponent, parentRuleComponent]
        }
        else {
            throw new Error(`id ${ruleId} not found`);
        }
    }
    navigateRuleObjRecursively(desiredId, ruleObj, parent) {
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
            }
            else {
                // console.log('did not find in child ', child.id );
            }
        }
        if (!ruleObj.children) {
            return false;
        }
    }
    populateDynamicQueryAttributes(paramObj, uiObj, objectFields) {
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
            }
            else {
                delete uiObj.parameters.breadthCourseCode;
            }
        }
        for (const dynamicParameter of ["level", "areaOfStudy", "owningOrg"]) {
            if (dynamicParameter in uiObj.parameters) {
                const dynamicParamArray = JSON.parse(JSON.stringify(paramObj.compositeParameters));
                for (const dynamicParamObj of dynamicParamArray) {
                    this.populateDynamicParamObj(dynamicParamObj, dynamicParameter, uiObj.parameters[dynamicParameter]);
                }
                paramObj.value.push(dynamicParamArray); // TODO structure
            }
        }
    }
    populateDynamicParamObj(obj, param, value) {
        if (obj.name === "name") {
            obj.value = param;
        }
        else if (obj.name === "values") {
            obj.value = value;
        }
        else {
            console.warn("Unexpected dynamicParamObj:", obj);
        }
    }
    createSharedComponent(uiObj, templateComponentOriginal, existingRuleObj, objectFields) {
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
            }
            else if (key === "dynamicQueryAttributes") {
                this.populateDynamicQueryAttributes(paramObj, uiObj, objectFields);
            }
        }
        return {
            newlyCreatedRuleId: ruleComponent.id,
            rules: existingRuleObj
        };
    }
    getRuleName(ruleObj) {
        let name = "";
        if (ruleObj.parameters) {
            const labelObj = ruleObj.parameters.find((obj) => obj.name === "label");
            if (labelObj) {
                name = labelObj.value;
            }
        }
        return name;
    }
}
exports.RulesService = RulesService;
//# sourceMappingURL=RulesService.js.map
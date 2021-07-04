"use strict";
// Many of these types (top half) should have the same values as in .../rule-model-svc/src/engine/WellFormed.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuleComponentType = exports.RuleTemplateType = exports.RuleSectionType = exports.RuleGroupType = exports.RulesType = exports.Stereotype = void 0;
var Stereotype;
(function (Stereotype) {
    Stereotype["Rules"] = "Rules";
    Stereotype["RuleGroup"] = "RuleGroup";
    Stereotype["RuleSection"] = "RuleSection";
    Stereotype["RuleTemplate"] = "RuleTemplate";
    Stereotype["RuleComponent"] = "RuleComponent";
})(Stereotype = exports.Stereotype || (exports.Stereotype = {}));
var RulesType;
(function (RulesType) {
    RulesType["Course"] = "Course";
    RulesType["Component"] = "Component";
    RulesType["Subject"] = "Subject";
})(RulesType = exports.RulesType || (exports.RulesType = {}));
var RuleGroupType;
(function (RuleGroupType) {
    RuleGroupType["LogicConstruct"] = "Logic Construct";
})(RuleGroupType = exports.RuleGroupType || (exports.RuleGroupType = {}));
var RuleSectionType;
(function (RuleSectionType) {
    RuleSectionType["CourseRules"] = "Course Rules";
    RuleSectionType["CourseStructure"] = "Course Structure";
    RuleSectionType["MMSGroups"] = "MMS Groups";
    RuleSectionType["ComponentStructure"] = "Component Structure";
    RuleSectionType["MMSPage"] = "MMS Page";
    RuleSectionType["Prerequisites"] = "Prerequisites";
    RuleSectionType["Corequisites"] = "Corequisites";
    RuleSectionType["NonAllowedSubjects"] = "Non-allowed subjects";
})(RuleSectionType = exports.RuleSectionType || (exports.RuleSectionType = {}));
var RuleTemplateType;
(function (RuleTemplateType) {
    RuleTemplateType["TotalCoursePoints"] = "Total Course Points";
    RuleTemplateType["PointsConstraint"] = "Points Constraint";
    RuleTemplateType["CountConstraint"] = "Count Constraint";
    RuleTemplateType["Information"] = "Information";
    RuleTemplateType["CountConstraintMMS"] = "Count Constraint MMS";
    RuleTemplateType["Availability"] = "Availability";
    RuleTemplateType["Progression"] = "Progression";
    RuleTemplateType["Duration"] = "Duration";
})(RuleTemplateType = exports.RuleTemplateType || (exports.RuleTemplateType = {}));
var RuleComponentType;
(function (RuleComponentType) {
    RuleComponentType["TotalCoursePointsConstraint"] = "Total Course Points Constraint";
    RuleComponentType["PointsConstraint"] = "Points Constraint";
    RuleComponentType["SubjectSet"] = "Subject Set";
    RuleComponentType["LogicConstruct"] = "Logic Construct";
    RuleComponentType["MMSSet"] = "MMS Set";
    RuleComponentType["CountConstraint"] = "Count Constraint";
    RuleComponentType["CountConstraintMMS"] = "Count Constraint MMS";
    RuleComponentType["Availability"] = "Availability";
    RuleComponentType["Information"] = "Information";
    RuleComponentType["Duration"] = "Duration";
    RuleComponentType["Progression"] = "Progression";
})(RuleComponentType = exports.RuleComponentType || (exports.RuleComponentType = {}));
// Types above this line should have the same values as in .../rule-model-svc/src/engine/WellFormed.ts
var TransformType;
(function (TransformType) {
    TransformType["Text"] = "text";
    TransformType["Html"] = "html";
})(TransformType || (TransformType = {}));
//# sourceMappingURL=rule.js.map
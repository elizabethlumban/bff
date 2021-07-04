// Many of these types (top half) should have the same values as in .../rule-model-svc/src/engine/WellFormed.ts

export enum Stereotype {
  Rules = "Rules",
  RuleGroup = "RuleGroup",
  RuleSection = "RuleSection",
  RuleTemplate = "RuleTemplate",
  RuleComponent = "RuleComponent"
}

export type RuleType =
  | RulesType
  | RuleSectionType
  | RuleGroupType
  | RuleTemplateType
  | RuleComponentType;

export enum RulesType {
  Course = "Course",
  Component = "Component",
  Subject = "Subject"
}

export enum RuleGroupType {
  LogicConstruct = "Logic Construct"
}

export enum RuleSectionType {
  CourseRules = "Course Rules",
  CourseStructure = "Course Structure",
  MMSGroups = "MMS Groups",
  ComponentStructure = "Component Structure",
  MMSPage = "MMS Page",
  Prerequisites = "Prerequisites",
  Corequisites = "Corequisites",
  NonAllowedSubjects = "Non-allowed subjects"
}

export enum RuleTemplateType {
  TotalCoursePoints = "Total Course Points",
  PointsConstraint = "Points Constraint",
  CountConstraint = "Count Constraint",
  Information = "Information",
  CountConstraintMMS = "Count Constraint MMS",
  Availability = "Availability",
  Progression = "Progression",
  Duration = "Duration"
}

export enum RuleComponentType {
  TotalCoursePointsConstraint = "Total Course Points Constraint",
  PointsConstraint = "Points Constraint",
  SubjectSet = "Subject Set",
  LogicConstruct = "Logic Construct",
  MMSSet = "MMS Set",
  CountConstraint = "Count Constraint",
  CountConstraintMMS = "Count Constraint MMS",
  Availability = "Availability",
  Information = "Information",
  Duration = "Duration",
  Progression = "Progression"
}

// Types above this line should have the same values as in .../rule-model-svc/src/engine/WellFormed.ts

enum TransformType {
  Text = "text",
  Html = "html"
}

export interface IREText {
  section: RuleSectionType; // TODO: use Section enum
  html: string;
}

interface ITag {
  name: string;
  label: string;
}

interface ITransform {
  stage: number;
  type: TransformType;
  outputField: string;
  template: string;
}

export interface IFormat {
  id: string;
  name: string;
  outputField: string;
  transforms: ITransform[];
}

export interface IParameter {
  name: string;
  label: string;
  value: string;
  type: string;
  enumValues?: string[];
  arrayType?: string;
  compositeParameters?: any[];
}

export interface IContext {
  parameters?: IParameter[];
}
export interface ITransformOutput {
  stage: number;
  data: any;
  context: IContext;
}
export interface IRuleComponent {
  id: string;
  recordId: string;
  stereotype: Stereotype;
  tags: ITag[];
  type: string;
  formats: IFormat[];
  selectedOrDefaultFormat: string;
  valid?: boolean;
  generated?: ITransformOutput[];
  children: IRuleComponent[];
  parameters: any;
  childrenReferences: string[];
  sharedComponents?: IRuleComponent[];
}

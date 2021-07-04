import { IRuleComponent } from "./rule";

export interface ISubject {
  id: string;
  name: string;
  code: string;
  versionId: string;
  recordId: string;
  publishedYears: string;
  lastUpdateTS: Date;
  version: string;
  points: number;
  owningOrg: string;
  level: number;
  studyType: string;
  availability: any; // TODO Interface
  areaOfStudy: Array<any>; // TODO Interface
  overview: string;
  rules: IRuleComponent;
  disallowedSubjectsDescription: string;
  corequisiteDescription: string;
  prerequisiteDescription: string;
  isLegacy: string;
  newlyCreatedRules: boolean;
  year: string;
}

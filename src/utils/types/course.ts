import { IRuleComponent } from "./rule";
export interface ICourse {
  id: string;
  name: string;
  code: string;
  versionId: string;
  recordId: string;
  overview: string;
  courseRules: string;
  structure: string;
  publishedYears: string;
  lastUpdateTS: string;
  version: string;
  points: number;
  groups: any[];
  breadthSubjects: any[];
  rules: IRuleComponent;
  year: string;
}

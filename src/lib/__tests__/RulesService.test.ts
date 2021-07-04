/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable @typescript-eslint/camelcase */
import "jest";
// import { mocked } from "ts-jest/utils";
// import { expectedOptionsForCapsApiCall, authTokenFromCaps } from "@src/testUtil";
import { RulesService, ICreateRuleBody, IUpdateRuleBody } from "../RulesService";

// import axios from "axios";
import {
  Stereotype,
  RuleGroupType,
  RuleSectionType,
  RulesType,
  RuleTemplateType,
  RuleComponentType,
  IRuleComponent
} from "../../utils/types/rule";
import { CreateRuleType, DEFAULT_FORMAT, DEFAULT_FORMATS_ARRAY } from "../../utils/constants";
// jest.mock("axios");
// const MockAxios: any = mocked(axios, true);

const service = new RulesService();

describe("RulesService Test", () => {
  test("The test infrastructure is working", () => {
    expect(true).toBe(true);
  });

  describe("patch course rules", () => {
    test("Get the desired rules object by id", async () => {
      const desiredId = "compulsory_message_rc";
      const ruleObj = JSON.parse(JSON.stringify(exampleRuleObject));

      const [result, _parent] = service.navigateRuleObjRecursively(desiredId, ruleObj, undefined);
      // console.log(result);
      expect(result.id).toEqual(desiredId);
      expect(result.type).toEqual("Information");
    });

    test("Update rules object based on Points Constraint UI obj", async () => {
      const ruleObj = JSON.parse(JSON.stringify(exampleRuleObject));
      const uiObj: IUpdateRuleBody = {
        sessionId: "capsSecret",
        sysId: "12234",
        ruleId: "225_commerce_discipline_points_constraint",
        parameters: {
          label: "Level 3 subjects",
          minimum: 30
        } as unknown,
        ruleType: RuleComponentType.PointsConstraint,
        selectedOrDefaultFormat: "List",
        childrenReferences: [
          {
            referenceId: "DynamicSubjectSet123"
          }
        ]
      };

      const result = service.updateRuleObj(uiObj, ruleObj, { recordId: "123", year: "2020" });

      const ruleTemplate = result.children[0].children[0].children[0];
      // console.log(ruleTemplate);
      expect(ruleTemplate.selectedOrDefaultFormat).toEqual("List");

      const ruleComponent = ruleTemplate.children[0];
      const parameters = ruleComponent.parameters;
      // console.log(parameters);
      expect(parameters).toEqual([
        { name: "label", label: "Label", value: "Level 3 subjects", type: "string" },
        {
          name: "minimum",
          label: "Minimum Points",
          value: 30,
          type: "number"
        },
        {
          name: "maximum",
          label: "Maximum Points",
          value: 225,
          type: "number"
        },
        {
          name: "qualifier",
          label: "Qualifier",
          value: "",
          type: "enum",
          enumValues: ["Major", "Minor", "Specialisation"]
        }
      ]);
      expect(ruleComponent.childrenReferences).toEqual([{ referenceId: "DynamicSubjectSet123" }]);
    });

    test("Update Subject Set rule", async () => {
      const ruleObj = JSON.parse(JSON.stringify(exampleRuleObject));
      const uiObj: IUpdateRuleBody = {
        sessionId: "capsSecret",
        sysId: "12234",
        ruleId: "225_commerce_discipline_subject_set",
        parameters: {
          staticSubjectReferences: ["SUB00001"]
        },
        ruleType: RuleComponentType.SubjectSet
        // selectedOrDefaultFormat: "List"
      };

      const result = service.updateRuleObj(uiObj, ruleObj, { recordId: "123", year: "2020" });

      const ruleTemplate = result.children[0].children[0].children[0].children[0].children[0];
      // console.log("ruleTemplate", ruleTemplate);
      expect(ruleTemplate.selectedOrDefaultFormat).toEqual(
        uiObj.selectedOrDefaultFormat ? uiObj.selectedOrDefaultFormat : "Labelled"
      );

      const ruleComponent = ruleTemplate;
      const parameters = ruleComponent.parameters;
      // console.log(parameters);
      expect(parameters).toEqual([
        {
          name: "label",
          label: "Label",
          value: "commerce discipline subjects",
          type: "string"
        },
        {
          name: "staticSubjectReferences",
          label: "Static Subjects RecordIds",
          value: ["SUB00001"],
          type: "array",
          arrayType: "string"
        },
        {
          name: "ssType",
          label: "Type",
          value: "Static",
          type: "enum",
          enumValues: ["Static", "Dynamic"]
        }
      ]);
    });

    test("Update Logic Construct rule", async () => {
      const ruleObj = JSON.parse(JSON.stringify(exampleRuleObject));
      const uiObj: any = {
        sessionId: "capsSecret",
        sysId: 12234,
        ruleId: "group_1",
        ruleType: RuleComponentType.LogicConstruct,
        parameters: {
          label: "New label",
          operator: "OR"
        },
        selectedOrDefaultFormat: "Default H3"
      };

      const result = service.updateRuleObj(uiObj, ruleObj, { recordId: "123", year: "2020" });

      const ruleTemplate = result.children[0].children[0];
      // console.log("ruleTemplate", ruleTemplate);
      expect(ruleTemplate.selectedOrDefaultFormat).toEqual(
        uiObj.selectedOrDefaultFormat ? uiObj.selectedOrDefaultFormat : "Labelled"
      );

      const ruleComponent = ruleTemplate;
      const parameters = ruleComponent.parameters;
      // console.log(parameters);
      expect(parameters).toEqual([
        {
          name: "operator",
          label: "Operator",
          value: "OR",
          type: "enum",
          enumValues: ["OR", "XOR", "AND", "NOT"]
        },
        {
          name: "label",
          label: "Label",
          value: "New label",
          type: "string"
        }
      ]);
    });

    test("Delete two level rules object Information UI", async () => {
      const ruleObj = JSON.parse(JSON.stringify(exampleRuleObject));

      const result = service.deleteRuleInRuleObj("compulsory_message_rc", ruleObj);

      const ruleGroup = result.children[0].children[0];
      // console.log("ruleGroup", ruleGroup);
      const childIds = ruleGroup.children.map((child: any) => child.id);
      expect(childIds).not.toContain("compulsory_message_rt");
    });

    test("Add Information rule and template", async () => {
      const ruleObj = JSON.parse(JSON.stringify(exampleRuleObject));
      const uiObj: ICreateRuleBody = {
        type: CreateRuleType.Rule,
        sessionId: "capsSecret",
        sysId: "12234",
        parentRuleId: "group_1",
        ruleType: RuleComponentType.Information,
        parameters: {
          text:
            "There are compulsory requirements at each level, a compulsory quantitative requirement, and requirements for majoring in a commerce discipline.",
          selfEvaluated: "True"
        },
        selectedOrDefaultFormat: "Heading1"
      };
      const infoRuleTemplate = exampleTemplates.templates.filter(
        (template: any) => template.type === "Information"
      )[0] as unknown;
      const recordId = "COU001";
      const result = service.createRuleObj(uiObj, infoRuleTemplate as IRuleComponent, ruleObj, {
        recordId: "123",
        year: "2020"
      });

      expect(result.newlyCreatedRuleId).toBeDefined();
      const resultRules = result.rules;
      const ruleGroup = resultRules.children[0].children[0];
      console.log("result", result);
      const ruleTemplate = ruleGroup.children[ruleGroup.children.length - 1];
      expect(ruleTemplate.selectedOrDefaultFormat).toEqual("Heading1");

      const ruleComponent = ruleTemplate.children[0];
      console.log("ruleComponent", ruleComponent);
      const parameters = ruleComponent.parameters;
      // console.log(parameters);
      expect(parameters).toEqual([
        {
          name: "text",
          label: "Text",
          value:
            "There are compulsory requirements at each level, a compulsory quantitative requirement, and requirements for majoring in a commerce discipline.",
          type: "string"
        },
        {
          name: "selfEvaluated",
          label: "Self Evaluated",
          value: "True",
          type: "enum",
          enumValues: ["True", "False"]
        }
      ]);
    });
  });

  describe("Rule Usage Chain", () => {
    test("Get rule usage chain when it's used", async () => {
      const ruleObj = JSON.parse(JSON.stringify(exampleRuleObject));

      const result = service.getRuleUsageChainRecursive(ruleObj, "dynamicSubjectSetId1", []);
      // console.log(result);
      expect(result).toEqual([
        [
          { id: "compulsory_message_rc", name: "" },
          { id: "compulsory_message_rt", name: "" },
          { id: "group_1", name: "Bachelor of Commerce" },
          { id: "section_1", name: "" },
          { id: "B-COM", name: "" }
        ]
      ]);
    });

    test("Get false when it's not used", async () => {
      const ruleObj = JSON.parse(JSON.stringify(exampleRuleObject));

      const result = service.getRuleUsageChainRecursive(ruleObj, "wrong", []);
      // console.log(result);
      expect(result).toEqual(false);
    });

    test("Get rule usage chain when it's used twice", async () => {
      const ruleObj = JSON.parse(JSON.stringify(exampleRuleObject));

      const result = service.getRuleUsageChainRecursive(ruleObj, "dynamicSubjectSetId2", []);
      // console.log(result);
      expect(result).toEqual([
        [
          { id: "225_commerce_discipline_points_constraint", name: "" },
          { id: "225_commerce_discipline_template", name: "" },
          { id: "group_1", name: "Bachelor of Commerce" },
          { id: "section_1", name: "" },
          { id: "B-COM", name: "" }
        ],
        [
          { id: "compulsory_message_rc", name: "" },
          { id: "compulsory_message_rt", name: "" },
          { id: "group_1", name: "Bachelor of Commerce" },
          { id: "section_1", name: "" },
          { id: "B-COM", name: "" }
        ]
      ]);
    });
  });
});

const exampleRuleObject = {
  id: "B-COM",
  stereotype: Stereotype.Rules,
  tags: [],
  type: RulesType.Course,
  formats: DEFAULT_FORMATS_ARRAY,
  selectedOrDefaultFormat: DEFAULT_FORMAT,
  children: [
    {
      id: "section_1",
      stereotype: Stereotype.RuleSection,
      tags: [],
      type: RuleSectionType.CourseRules,
      formats: DEFAULT_FORMATS_ARRAY,
      selectedOrDefaultFormat: DEFAULT_FORMAT,
      children: [
        {
          id: "group_1",
          stereotype: Stereotype.RuleGroup,
          tags: [],
          type: RuleGroupType.LogicConstruct,
          formats: DEFAULT_FORMATS_ARRAY,
          selectedOrDefaultFormat: DEFAULT_FORMAT,
          children: [
            {
              id: "225_commerce_discipline_template",
              stereotype: Stereotype.RuleTemplate,
              type: RuleTemplateType.PointsConstraint,
              tags: [],
              selectedOrDefaultFormat: DEFAULT_FORMAT,
              formats: [
                {
                  id: "1",
                  name: "Default",
                  outputField: "text",
                  transforms: [
                    {
                      stage: 1,
                      type: "text",
                      outputField: "text",
                      template:
                        "<p>{{{results (root 0) 'output'}}} of {{{results (child (root 0) 0) 'output'}}}.</p>"
                    }
                  ]
                },
                {
                  id: "2",
                  name: "List",
                  outputField: "text",
                  transforms: [
                    {
                      stage: 1,
                      type: "text",
                      outputField: "text",
                      template:
                        "{{results 0 'output' 'Basic'}} from the following list of subjects: {{results 1 'output' 'List'}}"
                    }
                  ]
                }
              ],
              children: [
                {
                  id: "225_commerce_discipline_points_constraint",
                  type: RuleComponentType.PointsConstraint,
                  stereotype: Stereotype.RuleComponent,
                  tags: [],
                  children: [
                    {
                      id: "225_commerce_discipline_subject_set",
                      stereotype: "RuleComponent",
                      type: "Subject Set",
                      tags: [],
                      children: [],
                      childrenReferences: [],
                      selectedOrDefaultFormat: "Labelled",
                      formats: [
                        {
                          id: "1",
                          name: "List",
                          outputField: "output",
                          transforms: [
                            {
                              stage: 1,
                              type: "text",
                              outputField: "output",
                              template:
                                "{{#each input.staticSubjectReferences}} {{this}}{{#unless @last}},{{/unless}}{{/each}}"
                            }
                          ]
                        },
                        {
                          id: "2",
                          name: "Labelled",
                          outputField: "output",
                          transforms: [
                            {
                              stage: 1,
                              type: "text",
                              outputField: "output",
                              template: "{{input.label}}"
                            }
                          ]
                        }
                      ],
                      parameters: [
                        {
                          name: "label",
                          label: "Label",
                          value: "commerce discipline subjects",
                          type: "string"
                        },
                        {
                          name: "staticSubjectReferences",
                          label: "Static Subjects RecordIds",
                          value: ["SUB0001865", "SUB0001864", "SUB0000251", "SUB0003020"],
                          type: "array",
                          arrayType: "string"
                        },
                        {
                          name: "ssType",
                          label: "Type",
                          value: "Static",
                          type: "enum",
                          enumValues: ["Static", "Dynamic"]
                        }
                      ]
                    }
                  ],
                  childrenReferences: ["dynamicSubjectSetId2"],
                  selectedOrDefaultFormat: DEFAULT_FORMAT,
                  formats: DEFAULT_FORMATS_ARRAY,
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
                      value: 225,
                      type: "number"
                    },
                    {
                      name: "maximum",
                      label: "Maximum Points",
                      value: 225,
                      type: "number"
                    },
                    {
                      name: "qualifier",
                      label: "Qualifier",
                      value: "",
                      type: "enum",
                      enumValues: ["Major", "Minor", "Specialisation"]
                    }
                  ]
                }
              ]
            },
            {
              id: "compulsory_message_rt",
              stereotype: "RuleTemplate",
              type: "C2 Information",
              tags: [],
              selectedOrDefaultFormat: "Content",
              formats: [
                {
                  id: "1",
                  name: "Content",
                  outputField: "html",
                  transforms: [
                    {
                      stage: 1,
                      type: "html",
                      outputField: "html",
                      template: "<p>{{results (root 0) 'output'}}</p>"
                    }
                  ]
                },
                {
                  id: "2",
                  name: "Heading1",
                  outputField: "html",
                  transforms: [
                    {
                      stage: 1,
                      type: "html",
                      outputField: "html",
                      template: "<h1>{{results (root 0) 'output'}}</h1>"
                    }
                  ]
                },
                {
                  id: "3",
                  name: "Heading2",
                  outputField: "html",
                  transforms: [
                    {
                      stage: 1,
                      type: "html",
                      outputField: "html",
                      template: "<h2>{{results (root 0) 'output'}}</h2>"
                    }
                  ]
                },
                {
                  id: "4",
                  name: "Heading3",
                  outputField: "html",
                  transforms: [
                    {
                      stage: 1,
                      type: "html",
                      outputField: "html",
                      template: "<h3>{{results (root 0) 'output'}}</h3>"
                    }
                  ]
                },
                {
                  id: "5",
                  name: "Heading4",
                  outputField: "html",
                  transforms: [
                    {
                      stage: 1,
                      type: "html",
                      outputField: "html",
                      template: "<h4>{{results (root 0) 'output'}}</h4>"
                    }
                  ]
                }
              ],
              children: [
                {
                  id: "compulsory_message_rc",
                  stereotype: "RuleComponent",
                  type: "Information",
                  tags: [],
                  children: [],
                  childrenReferences: ["dynamicSubjectSetId1", "dynamicSubjectSetId2"],
                  selectedOrDefaultFormat: "Default",
                  formats: [
                    {
                      id: "1",
                      name: "Default",
                      outputField: "output",
                      transforms: [
                        {
                          stage: 1,
                          type: "text",
                          outputField: "output",
                          template: "{{input.text}}"
                        }
                      ]
                    }
                  ],
                  parameters: [
                    {
                      name: "text",
                      label: "Text",
                      value:
                        "There are compulsory requirements at each level, a compulsory quantitative requirement, and requirements for majoring in a commerce discipline.",
                      type: "string"
                    },
                    {
                      name: "selfEvaluated",
                      label: "Self Evaluated",
                      value: "False",
                      type: "enum",
                      enumValues: ["True", "False"]
                    }
                  ]
                }
              ]
            }
          ],
          parameters: [
            {
              name: "operator",
              label: "Operator",
              value: "AND",
              type: "enum",
              enumValues: ["OR", "XOR", "AND", "NOT"]
            },
            {
              name: "label",
              label: "Label",
              value: "Bachelor of Commerce",
              type: "string"
            }
          ]
        }
      ],
      parameters: []
    }
  ],
  parameters: []
};

const _exampleCourse = {
  number: "COU0000164",
  course_code: "B-ARTS",
  course_name: "Bachelor of Arts",
  year: 2018,
  published_years: "2018,2019,2020",
  is_legacy: "false",
  overview: "<p>The Bachelor of Arts offers ...</p>",
  course_rules: "<p>The Bachelor of Arts offers ...</p>",
  course_structure_and_available_Subjects: "",
  state: "Published",
  sys_updated_on: "12/06/2020 08:55:23",
  version: "2020.14",
  volume_of_learning: 300,
  new_field: "rubbish",
  breadth_subject: [
    {
      subject_code: "MULT20011",
      approval_state: "Approved"
    },
    {
      subject_code: "ECON30019",
      approval_state: "Approved"
    }
  ],
  re_rules: { rule: { id: "345345" } },
  groups: [
    {
      title: "Minors",
      operator: "OR",
      total_points: "",
      minimum_points: "",
      maximum_points: "",
      minimum_number_of_selections: "0",
      maximum_number_of_selections: "1",
      components: [
        {
          number: "SCP0000133",
          component_code: "B-ARTS_MINOR_1",
          component_title: "Chinese Societies",
          component_type: "Minor",
          version: "2020.14",
          published_years: "2020",
          sys_updated_on: "12/06/2020 08:55:23",
          state: "Published",
          component_coordinator: "",
          year: "2020",
          owning_org_unit: "Arts",
          credit_points: "75",
          legacy_course_structure:
            '<p><strong>Chinese Societies</strong></p>\r\n<p>Chinese Societies is available as a <strong>minor </strong>sequence in the Bachelor of Arts. The Minor sequence is made up of 75 points of study, specifically:</p>\r\n<p><em>Level 1</em></p>\r\n<ul><li>Language &amp; Power in Asian Societies; and</li><li>Any <a title="Arts Foundation Subject" href="https://handbook.unimelb.edu.au/components/b-arts-infspc-1/subject-options" rel="nofollow">Arts Foundation Subject</a> or</li><li>Any level one Chinese language subject where it is not counted toward another major; or</li><li>A level one subject in any Arts discipline</li></ul>\r\n<p><em>Level 2</em></p>\r\n<ul><li>25 points from Chinese <span style="text-align: start;">Societies</span></li></ul>\r\n<p><em>Level 3</em></p>\r\n<ul><li>25 points from Chinese <span style="text-align: start;">Societies</span></li></ul>\r\n<p><span style="font-weight: bold;">Total 75 points</span></p>',
          legacy_mms_subpage: "",
          legacy_subject_options:
            '<h2>Chinese Societies: Level 1</h2>\r\n<p><a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;68c1636b4f2d3e4090a0eefe0310c76f" rel="nofollow">ASIA10001</a></p>\r\n<h2>Chinese Societies: Level 2</h2>\r\n<p><a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;1153a32f4f2d3e4090a0eefe0310c734" rel="nofollow">CHIN20005</a> <a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;ff53e32f4f2d3e4090a0eefe0310c702" rel="nofollow">CHIN20007</a> <a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;3063e32f4f2d3e4090a0eefe0310c735" rel="nofollow">CHIN20008</a> <a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;3f83a72f4f2d3e4090a0eefe0310c79c" rel="nofollow">CHIN20016</a> <a href="#" rel="nofollow">CHIN20030</a></p>\r\n<h2>Chinese Societies: Level 3</h2>\r\n<p><a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;d993e72f4f2d3e4090a0eefe0310c70c" rel="nofollow">CHIN30002</a> <a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;c963e32f4f2d3e4090a0eefe0310c738" rel="nofollow">CHIN30010</a> <a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;a683a72f4f2d3e4090a0eefe0310c765" rel="nofollow">CHIN30001</a> <a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;c063e32f4f2d3e4090a0eefe0310c707" rel="nofollow">CHIN30018</a></p>',
          description:
            "<p>The Chinese Societies minor acquaints students with the literature and cultural history of China. It provides students with the foundation for further work at the graduate level in Chinese, Asian Studies or allied fields (linguistics, culture, history, literature, religion, and regional studies). It is an excellent general preparation for entry to professions, such academic teaching and research, foreign service, diplomacy, translation, business, import and export of information and culture, museums and libraries, tourism, and the like.</p>",
          contact:
            '<h3>Coordinator</h3>\r\n<p> </p>\r\n<p><a href="http://www.asiainstitute.unimelb.edu.au/about/staff/profiles/zhou_shaoming" target="_blank" rel="noopener noreferrer nofollow">Dr ZHOU Shaoming</a></p>\r\n<p><strong>Email:</strong> shaoming&#64;unimelb.edu.au</p>\r\n<p>Currently enrolled students:</p>\r\n<ul><li><a href="http://students.unimelb.edu.au/stop1" rel="nofollow">Contact Stop 1</a></li></ul>\r\n<p>Future students:</p>\r\n<ul><li><a href="https://futurestudents.unimelb.edu.au/" rel="nofollow">https://futurestudents.unimelb.edu.au</a></li></ul>\r\n<p> </p>\r\n<p><strong><a href="http://arts.unimelb.edu.au/amsc/contact.html" target="_blank" rel="noopener noreferrer nofollow"> </a></strong></p>',
          legacy_mms_notes: "<p>This minor was known as Chinese Studies prior to 2018.</p>",
          links: "<p>http://www.asiainstitute.unimelb.edu.au/study/chinese</p>",
          is_legacy: "true",
          display_order: "1",
          api_url:
            "https://unimelbtest.service-now.com/api/x_univ6_as_00001/v1/caps/years/2020/components/B-ARTS_MINOR_1",
          learning_outcome_preface: "",
          learning_outcome_format: "Numbered List with Headings"
        },
        {
          number: "SCP0000140",
          component_code: "B-ARTS_MINOR_8",
          component_title: "Knowledge and Learning",
          component_type: "Minor",
          version: "2020.14",
          published_years: "2020",
          sys_updated_on: "12/06/2020 08:55:23",
          state: "Published",
          component_coordinator: "",
          year: "2020",
          owning_org_unit: "Arts",
          credit_points: "75",
          legacy_course_structure:
            "<p><strong>Knowledge and Learning</strong> is available as a 75 point <strong>minor</strong> sequence, consisting of the following:</p>\r\n<p><strong>Level 1 (25 points)</strong></p>\r\n<p>HPSC10002 <em>Science and Pseudoscience (Arts Discipline)<br /></em>EDUC10050 <em>Understanding Knowing and Learning (Breadth)</em></p>\r\n<p><strong>Level 2 (25 points)</strong></p>\r\n<p>PHIL20001 <em>Science, Reason and Reality (Arts Discipline)<br /></em>EDUC20065 <em>Knowledge Learning and Culture</em> <em>(Breadth)</em></p>\r\n<p><strong>Level 3 (25 points)</strong></p>\r\n<p>HPSC30035 <em>Scientific Practice and Human Inquiry</em> (<em>Arts Discipline)<br /></em>EDUC30071 <em>Knowing and Learning in Professions</em> <em>(Breadth)</em></p>\r\n<p><br />Please note all Education subjects in this minor sequence will count towards the breadth requirements in the BA.</p>",
          legacy_mms_subpage: "",
          legacy_subject_options:
            '<h2>Level 1 Subjects</h2>\r\n<p><a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;f5f3e76f4f2d3e4090a0eefe0310c718" rel="nofollow">HPSC10002</a> <a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;9743632f4f2d3e4090a0eefe0310c77a" rel="nofollow">EDUC10050</a></p>\r\n<h2>Level 2 Subjects</h2>\r\n<p><a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;ad43232f4f2d3e4090a0eefe0310c707" rel="nofollow">EDUC20065</a> <a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;df85ebef4f2d3e4090a0eefe0310c7d1" rel="nofollow">PHIL20001</a></p>\r\n<h2>Level 3 Subjects</h2>\r\n<p><a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;ae43632f4f2d3e4090a0eefe0310c744" rel="nofollow">EDUC30071</a> <a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;adf3e76f4f2d3e4090a0eefe0310c708" rel="nofollow">HPSC30035</a></p>',
          description:
            "<p>A Knowledge and Learning minor offers students the opportunity to examine the ways in which differing forms of knowledge are constructed, produced, managed, and disseminated – and the learning processes which support this in a range of social, historical and political contexts. A key focus of the subjects in this sequence is an engagement with the production, transmission and reception of knowledge. This minor is jointly taught by teaching staff in the Faculty of Arts and Melbourne Graduate School of Education.</p>",
          contact:
            '<h3>Coordinator</h3>\r\n<p> </p>\r\n<p><a href="http://shaps.unimelb.edu.au/about/staff/dr-kristian-camilleri" target="_blank" rel="nofollow">Dr Kristian Camilleri</a></p>\r\n<p>Email: <a href="mailto:kcam&#64;unimelb.edu.au" rel="nofollow">kcam&#64;unimelb.edu.au</a></p>\r\n<p><a href="http://www.findanexpert.unimelb.edu.au/display/person6019" target="_blank" rel="nofollow">Dr John Quay</a></p>\r\n<p>Email: <a title="email" href="mailto:jquay&#64;unimelb.edu.au" rel="nofollow">jquay&#64;unimelb.edu.au</a></p>\r\n<p>Currently enrolled students:</p>\r\n<ul><li><a href="http://students.unimelb.edu.au/stop1" rel="nofollow">Contact Stop 1</a></li></ul>\r\n<p>Future students:</p>\r\n<ul><li><a href="https://futurestudents.unimelb.edu.au/" rel="nofollow">https://futurestudents.unimelb.edu.au</a></li></ul>',
          legacy_mms_notes: "",
          links: "<p>http://ba.unimelb.edu.au/about/study-area/knowledge-and-learning</p>",
          is_legacy: "true",
          display_order: "3",
          api_url:
            "https://unimelbtest.service-now.com/api/x_univ6_as_00001/v1/caps/years/2020/components/B-ARTS_MINOR_8",
          learning_outcome_preface: "",
          learning_outcome_format: "Numbered List with Headings",
          learning_outcome_heading: [
            {
              order: "1",
              prefix: "LO1",
              course: "Knowledge and Learning",
              heading:
                "<p>On successful completion of this minor, students will be able to:</p>\n<ul><li>apply critical and analytical skills and methods to the identification and resolution of problems across different fields and scholarly disciplines; and</li><li>demonstrate a detailed knowledge and understanding of selected fields of study across education, language, philosophy and history and philosophy of science; and</li><li>demonstrate a general understanding of the concepts and principles of selected areas of study outside core disciplines of the humanities, social sciences and languages; and</li><li>apply an independent approach to knowledge that uses rigorous methods of inquiry and appropriate methodologies with a respect for intellectual honesty and ethical values; and</li><li>articulate the relationship between diverse forms of knowledge and the social, historical and cultural contexts that produced them; and</li><li>communicate effectively in a variety of oral and written formats.</li></ul>"
            }
          ]
        }
      ]
    }
  ]
};

const exampleTemplates = {
  templates: [
    {
      id: "I-123",
      stereotype: "RuleTemplate",
      type: "Information",
      tags: [],
      selectedOrDefaultFormat: "Content",
      formats: [
        {
          id: "1",
          name: "Content",
          outputField: "html",
          transforms: [
            {
              stage: 1,
              type: "html",
              outputField: "html",
              template: "<p>{{results (root 0) 'output'}}</p>"
            }
          ]
        },
        {
          id: "2",
          name: "Heading1",
          outputField: "html",
          transforms: [
            {
              stage: 1,
              type: "html",
              outputField: "html",
              template: "<h1>{{results (root 0) 'output'}}</h1>"
            }
          ]
        },
        {
          id: "3",
          name: "Heading2",
          outputField: "html",
          transforms: [
            {
              stage: 1,
              type: "html",
              outputField: "html",
              template: "<h2>{{results (root 0) 'output'}}</h2>"
            }
          ]
        },
        {
          id: "4",
          name: "Heading3",
          outputField: "html",
          transforms: [
            {
              stage: 1,
              type: "html",
              outputField: "html",
              template: "<h3>{{results (root 0) 'output'}}</h3>"
            }
          ]
        },
        {
          id: "5",
          name: "Heading4",
          outputField: "html",
          transforms: [
            {
              stage: 1,
              type: "html",
              outputField: "html",
              template: "<h4>{{results (root 0) 'output'}}</h4>"
            }
          ]
        }
      ],
      children: [
        {
          id: "<enter id>",
          stereotype: "RuleComponent",
          type: "Information",
          tags: [],
          children: [],
          childrenReferences: [],
          selectedOrDefaultFormat: "Default",
          formats: [
            {
              id: "1",
              name: "Default",
              outputField: "output",
              transforms: [
                {
                  stage: 1,
                  type: "text",
                  outputField: "output",
                  template: "{{input.text}}"
                }
              ]
            }
          ],
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
          ]
        }
      ]
    },
    {
      id: "C1-Total Course RuleTemplate",
      stereotype: "RuleTemplate",
      type: "C1 Total Course Points",
      tags: [],
      selectedOrDefaultFormat: "Default",
      formats: [
        {
          id: "1",
          name: "Default",
          outputField: "output",
          transforms: [
            {
              stage: 1,
              type: "text",
              outputField: "output",
              template: "{{results (root 0) ''}}"
            }
          ]
        }
      ],
      children: [
        {
          id: "1",
          stereotype: "RuleComponent",
          type: "Total Course Points Constraint",
          tags: [],
          children: [],
          childrenReferences: [],
          selectedOrDefaultFormat: "Total Course Points",
          formats: [
            {
              id: "3",
              name: "Total Course Points",
              outputField: "text",
              transforms: [
                {
                  stage: 1,
                  type: "text",
                  outputField: "text",
                  template:
                    "The {{#if plan}}{{plan.course.name}}{{else}}{{context.courseName}}{{/if}} requires the successful completion of {{input.minimum}} points"
                }
              ]
            }
          ],
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
            },
            {
              name: "qualifier",
              label: "Qualifier",
              value: "",
              type: "enum",
              enumValues: ["Major", "Minor", "Specialisation"]
            }
          ]
        }
      ]
    },
    {
      id: "C1-Template",
      stereotype: "RuleTemplate",
      type: "C1 Points Constraint",
      tags: [],
      selectedOrDefaultFormat: "Default",
      formats: [
        {
          id: "1",
          name: "Default",
          outputField: "html",
          transforms: [
            {
              stage: 1,
              type: "html",
              outputField: "html",
              template:
                "<html><body><p>{{results (root 0) 'output' 'Basic'}} of {{results (root 1) 'output' ''}}</p></body></html>"
            }
          ]
        },
        {
          id: "2",
          name: "List",
          outputField: "html",
          transforms: [
            {
              stage: 1,
              type: "html",
              outputField: "html",
              template:
                "<html><body><p>{{results (root 0) 'output' 'Basic'}} from the following list of subjects: {{results (root 1) 'output' 'List'}}</p></body></html>"
            }
          ]
        }
      ],
      children: [
        {
          id: "1",
          type: "Points Constraint",
          tags: [],
          children: [],
          childrenReferences: [],
          selectedOrDefaultFormat: "Basic",
          formats: [
            {
              id: "1",
              name: "Basic",
              transforms: [
                {
                  stage: 1,
                  type: "text",
                  outputField: "main",
                  template:
                    "{{#if (eq input.minimum input.maximum)}}You must complete {{input.minimum}} points{{else}}You must complete {{#if input.minimum}}a minimum of {{input.minimum}} points{{/if}}{{#if input.minimum}}{{#if input.maximum}} and {{/if}}{{/if}}{{#if input.maximum}}a maximum of {{input.maximum}} points{{/if}}{{/if}}"
                },
                {
                  stage: 1,
                  type: "text",
                  outputField: "mms",
                  template: "{{#if input.qualifier}} from a {{input.qualifier}}{{/if}}"
                },
                {
                  stage: 2,
                  type: "text",
                  outputField: "output",
                  template: "<p>{{input.english}} <b>{{input.mms}}</b></p>"
                }
              ]
            },
            {
              id: "2",
              name: "Basic-Lenient",
              transforms: [
                {
                  stage: 1,
                  type: "text",
                  outputField: "main",
                  template:
                    "{{#if (eq input.minimum input.maximum)}}You must complete {{input.minimum}} points{{else}}You must complete {{#if input.minimum}}a minimum of {{input.minimum}} points{{/if}}{{#if input.minimum}}{{#if input.maximum}} and {{/if}}{{/if}}{{#if input.maximum}}a maximum of {{input.maximum}} points{{/if}}{{/if}}"
                },
                {
                  stage: 1,
                  type: "text",
                  outputField: "mms",
                  template: "{{#if input.qualifier}} from a {{input.qualifier}}{{/if}}"
                },
                {
                  stage: 2,
                  type: "text",
                  outputField: "output",
                  template: "<p>{{input.english}} <b>{{input.mms}}</b></p>"
                }
              ]
            },
            {
              id: "3",
              name: "Total Course Points",
              outputField: "text",
              transforms: [
                {
                  stage: 1,
                  type: "text",
                  outputField: "english",
                  template:
                    "The {{context.courseName}} requires the successful completion of {{input.minimum}} points"
                }
              ]
            },
            {
              id: "4",
              name: "Labelled",
              transforms: [
                {
                  stage: 1,
                  type: "text",
                  outputField: "output",
                  template: "{{label}}"
                }
              ]
            }
          ],
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
            },
            {
              name: "qualifier",
              label: "Qualifier",
              value: "",
              type: "enum",
              enumValues: ["Major", "Minor", "Specialisation"]
            }
          ]
        },
        {
          id: "123423434",
          type: "Subject Set",
          tags: [],
          children: [],
          childrenReferences: [],
          selectedOrDefaultFormat: "Labelled",
          formats: [
            {
              id: "1",
              name: "List",
              transforms: [
                {
                  stage: 1,
                  type: "text",
                  outputField: "output",
                  template:
                    "{{#each staticSubjectReferences}} {{this}}{{#unless @last}},{{/unless}}{{/each}}"
                }
              ]
            },
            {
              id: "2",
              name: "Labelled",
              transforms: [
                {
                  stage: 1,
                  type: "text",
                  outputField: "output",
                  template: "{{label}}"
                }
              ]
            }
          ],
          parameters: [
            {
              name: "label",
              label: "Label",
              value: "",
              type: "string"
            },
            {
              name: "staticSubjectReferences",
              label: "Static Subjects RecordIds",
              value: [],
              type: "array",
              arrayType: "string"
            },
            {
              name: "dynamicQueryAttributes",
              label: "Dynamic Subjects",
              value: 0,
              type: "composite",
              compositeParameters: [
                {
                  name: "groupOperator",
                  label: "Group Operator",
                  value: "and",
                  type: "enum",
                  enumValues: ["and", "or"]
                },
                {
                  name: "comparisonOperator",
                  label: "Comparison Operator",
                  value: "eq",
                  type: "enum",
                  enumValues: ["eq", "ne", "lt", "gt", "ge", "le", "in", "nin"]
                },
                {
                  name: "queryValue",
                  label: "Comparison Value",
                  value: "",
                  type: "string"
                }
              ]
            },
            {
              name: "ssType",
              label: "Type",
              value: "Static",
              type: "enum",
              enumValues: ["Static", "Dynamic"]
            }
          ]
        }
      ]
    }
  ]
};

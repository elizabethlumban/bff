/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable @typescript-eslint/camelcase */
import "jest";
import { isEmpty, isSubjectCode, parsePretextWithAList, ReqType } from "../reqParser";

describe("test-parser", () => {
  test("The test infrastructure is working", () => {
    expect(true).toBe(true);
  });

  describe("isSubjectCode", () => {
    expect(isSubjectCode("MGMT90026")).toBe(true);
    expect(isSubjectCode("MGMt90026")).toBe(false);
    expect(isSubjectCode("MGMT900267")).toBe(false);
    expect(isSubjectCode("MMGMT90026")).toBe(false);
    expect(isSubjectCode("")).toBe(false);
    expect(isSubjectCode(null)).toBe(false);
  });

  describe("isEmpty", () => {
    expect(isEmpty("")).toBe(true);
    expect(isEmpty(null)).toBe(true);
    expect(isEmpty("<p></p>")).toBe(true);
    expect(isEmpty("<p> N/A </p> <p> N/A </p>")).toBe(true);
    expect(isEmpty("<p> N/A </p> <p> Nil </p>")).toBe(true);
    expect(isEmpty("<p> N/A </p> <p> ABCD123 </p>")).toBe(false);
    expect(isEmpty("<p> <a>Subject</a> </p>")).toBe(false);
  });

  describe("parsePretextWithAList", () => {
    const req = (s: string) => parsePretextWithAList(s, ReqType.PRE_REQ);
    const disallow = (s: string) => parsePretextWithAList(s, ReqType.DISALLOWED);

    describe("matches", () => {
      describe("concurrent pre-req", () => {
        expect(
          req(
            '<p>(Can be taken concurrently)</p>\r\n<p><a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;e1616b2b4f2d3e4090a0eefe0310c7de" rel="nofollow">MKTG90004</a></p>'
          )
        ).toEqual({
          reqType: ReqType.PRE_REQ,
          count: 1,
          concurrent: true,
          codes: ["MKTG90004"]
        });
        expect(
          req(
            '<p>One of the following subjects (Subjects can be taken concurrently)</p>\r\n<p><a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;60d067e74f2d3e4090a0eefe0310c719" rel="nofollow">ABPL20040</a> <a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;84f06fe74f2d3e4090a0eefe0310c7e4" rel="nofollow">ABPL20028</a> <a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;f39023e74f2d3e4090a0eefe0310c76c" rel="nofollow">ABPL20027</a> <a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;984063a74f2d3e4090a0eefe0310c795" rel="nofollow">ABPL20038</a> <a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;1942eb6b4f2d3e4090a0eefe0310c796" rel="nofollow">ENEN20002</a></p>'
          )
        ).toEqual({
          reqType: ReqType.PRE_REQ,
          count: 1,
          concurrent: true,
          codes: ["ABPL20040", "ABPL20028", "ABPL20027", "ABPL20038", "ENEN20002"]
        });
        expect(
          req(
            '<p>To enrol in this subject, students must have completed or be concurrently enrolled in:</p>\r\n<p><a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;7da1ef2b4f2d3e4090a0eefe0310c71b" rel="nofollow">MUSI90006</a></p>'
          )
        ).toEqual({
          reqType: ReqType.PRE_REQ,
          count: 1,
          concurrent: true,
          codes: ["MUSI90006"]
        });
      });

      describe("non-concurrent reqs", () => {
        expect(
          req(
            '<p><a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;43f0232b4f2d3e4090a0eefe0310c784" rel="nofollow">MUSI20200</a> <a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;0291af2b4f2d3e4090a0eefe0310c70a" rel="nofollow">MUSI20055</a> <a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;ef816f2b4f2d3e4090a0eefe0310c735" rel="nofollow">MUSI20056</a> <a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;0131672b4f2d3e4090a0eefe0310c772" rel="nofollow">MUSI30213</a> <a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;7721272b4f2d3e4090a0eefe0310c7ff" rel="nofollow">MUSI30214</a></p>'
          )
        ).toEqual({
          reqType: ReqType.PRE_REQ,
          count: 5,
          concurrent: false,
          codes: ["MUSI20200", "MUSI20055", "MUSI20056", "MUSI30213", "MUSI30214"]
        });
        expect(req('<p><a href="#" rel="nofollow">VETS90082</a></p>')).toEqual({
          reqType: ReqType.PRE_REQ,
          count: 1,
          concurrent: false,
          codes: ["VETS90082"]
        });
        expect(req("<p>[[MUSI30239]]</p>")).toEqual({
          reqType: ReqType.PRE_REQ,
          count: 1,
          concurrent: false,
          codes: ["MUSI30239"]
        });
        expect(
          req(
            '<p><a href="#" rel="nofollow">COMP60001</a> <a href="#" rel="nofollow">COMP60002</a> <a href="#" rel="nofollow">COMP60003</a> <a href="#" rel="nofollow">COMP60004</a> <a href="#" rel="nofollow">COMP90060</a> <a href="#" rel="nofollow">COMP90061</a> <a href="#" rel="nofollow">COMP90062</a></p>'
          )
        ).toEqual({
          reqType: ReqType.PRE_REQ,
          count: 7,
          concurrent: false,
          codes: [
            "COMP60001",
            "COMP60002",
            "COMP60003",
            "COMP60004",
            "COMP90060",
            "COMP90061",
            "COMP90062"
          ]
        });
        expect(
          req(
            '<p>Completion of the following subjects:</p>\r\n<p><a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;80d2a7ab4f2d3e4090a0eefe0310c731" rel="nofollow">ANAT90011</a> <a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;87c267ab4f2d3e4090a0eefe0310c7e0" rel="nofollow">AUDI90027</a> <a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;1fc267ab4f2d3e4090a0eefe0310c7ef" rel="nofollow">AUDI90025</a> <a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;c1916f2b4f2d3e4090a0eefe0310c7c7" rel="nofollow">LING90033</a></p>'
          )
        ).toEqual({
          reqType: ReqType.PRE_REQ,
          count: 4,
          concurrent: false,
          codes: ["ANAT90011", "AUDI90027", "AUDI90025", "LING90033"]
        });
        expect(
          req(
            '<p>Students must have completed <strong>ONE</strong> of the following subjects:</p>\r\n<p><a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;43236fab4f2d3e4090a0eefe0310c7b2" rel="nofollow">COMP20003</a> <a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;1d33afab4f2d3e4090a0eefe0310c736" rel="nofollow">COMP20007</a> <a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;3a132fab4f2d3e4090a0eefe0310c79b" rel="nofollow">COMP90038</a></p>\r\n<p><strong> </strong></p>'
          )
        ).toEqual({
          reqType: ReqType.PRE_REQ,
          count: 1,
          concurrent: false,
          codes: ["COMP20003", "COMP20007", "COMP90038"]
        });
        expect(
          req(
            '<p><a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;3763272f4f2d3e4090a0eefe0310c743" rel="nofollow">FLTV10012</a></p>'
          )
        ).toEqual({
          reqType: ReqType.PRE_REQ,
          count: 1,
          concurrent: false,
          codes: ["FLTV10012"]
        });
        expect(
          req(
            '<p>Successful completion of all the below subjects:</p>\r\n<p><a href="/x_univ6_as_00001_versionable.do?sys_id&#61;0bbbd6004f6dc3c097093faf0310c746" rel="nofollow">LAWS50023</a></p>'
          )
        ).toEqual({
          reqType: ReqType.PRE_REQ,
          count: 1,
          concurrent: false,
          codes: ["LAWS50023"]
        });
        expect(
          req(
            '<p>One of <a href="/x_univ6_as_00001_versionable.do?sys_id&#61;4cb5afef4f2d3e4090a0eefe0310c77e" rel="nofollow">PHYC40009</a> <a href="/x_univ6_as_00001_versionable.do?sys_id&#61;d1d563234f6d3e4090a0eefe0310c75c" rel="nofollow">PHYC40010</a> <a href="/x_univ6_as_00001_versionable.do?sys_id&#61;1dd563234f6d3e4090a0eefe0310c75f" rel="nofollow">PHYC40011</a> <a href="/x_univ6_as_00001_versionable.do?sys_id&#61;18d523234f6d3e4090a0eefe0310c7df" rel="nofollow">PHYC40012</a></p>'
          )
        ).toEqual({
          reqType: ReqType.PRE_REQ,
          count: 1,
          concurrent: false,
          codes: ["PHYC40009", "PHYC40010", "PHYC40011", "PHYC40012"]
        });
        expect(
          req(
            '<p>The prerequisite for this subject is:</p>\r\n<p><a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;e3422f6b4f2d3e4090a0eefe0310c748" rel="nofollow">ELEN90056</a></p>'
          )
        ).toEqual({
          reqType: ReqType.PRE_REQ,
          count: 1,
          concurrent: false,
          codes: ["ELEN90056"]
        });
        expect(req("<p>Successful completion of PHTY90098, PHTY90099 and PHTY90100.</p>")).toEqual({
          reqType: ReqType.PRE_REQ,
          count: 3,
          concurrent: false,
          codes: ["PHTY90098", "PHTY90099", "PHTY90100"]
        });
        expect(
          req(
            '<p>Students must enrol in the following subjects:</p>\r\n<p><a href="#" rel="nofollow">VETS30015</a> <a href="#" rel="nofollow">VETS30016</a></p>'
          )
        ).toEqual({
          reqType: ReqType.PRE_REQ,
          count: 2,
          concurrent: false,
          codes: ["VETS30015", "VETS30016"]
        });
        expect(
          req(
            '<p>One of:</p>\r\n<p><a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;b40627234f6d3e4090a0eefe0310c7d9" rel="nofollow">BUSA90480</a> <a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;05262b234f6d3e4090a0eefe0310c7cc" rel="nofollow">BUSA90481</a> [[BUSA90351]] [[BUSA90350]] [[BUSA90352]] [[BUSA90353]] [[BUSA90354]]</p>'
          )
        ).toEqual({
          reqType: ReqType.PRE_REQ,
          count: 1,
          concurrent: false,
          codes: [
            "BUSA90480",
            "BUSA90481",
            "BUSA90351",
            "BUSA90350",
            "BUSA90352",
            "BUSA90353",
            "BUSA90354"
          ]
        });
        expect(
          req(
            '<p>The following subject must be completed before a final mark for the Research Subject sequence will be determined:</p>\r\n<p><a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;8e132fab4f2d3e4090a0eefe0310c75f" rel="nofollow">COMP90044</a></p>'
          )
        ).toEqual({
          reqType: ReqType.PRE_REQ,
          count: 1,
          concurrent: false,
          codes: ["COMP90044"]
        });
        expect(
          req(
            '<p>Students must be enrolled in, or have completed, the following subjects:</p>\r\n<p><a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;aed1e36b4f2d3e4090a0eefe0310c72d" rel="nofollow">MULT90004</a> <a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;45c1636b4f2d3e4090a0eefe0310c795" rel="nofollow">MULT90005</a></p>'
          )
        ).toEqual({
          reqType: ReqType.PRE_REQ,
          count: 2,
          concurrent: false,
          codes: ["MULT90004", "MULT90005"]
        });

        describe("disallowed reqs", () => {
          expect(
            disallow(
              '<p>Students cannot enrol in and gain credit for this subject and:</p>\r\n<p><a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;6901632b4f2d3e4090a0eefe0310c76c" rel="nofollow">ISYS90080</a> <a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;53b36f2f4f2d3e4090a0eefe0310c765" rel="nofollow">ENGR90033</a></p>'
            )
          ).toEqual({
            reqType: ReqType.DISALLOWED,
            count: 0,
            concurrent: false,
            codes: ["ISYS90080", "ENGR90033"]
          });
          expect(
            disallow(
              '<p><a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;6901632b4f2d3e4090a0eefe0310c76c" rel="nofollow">ISYS90080</a> <a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;53b36f2f4f2d3e4090a0eefe0310c765" rel="nofollow">ENGR90033</a></p>'
            )
          ).toEqual({
            reqType: ReqType.DISALLOWED,
            count: 0,
            concurrent: false,
            codes: ["ISYS90080", "ENGR90033"]
          });
          expect(
            disallow(
              '<p>When undertaking this subject students cannot gain credit for the following subjects:</p>\r\n<p> </p>\r\n<p><a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;e672ef6b4f2d3e4090a0eefe0310c77e" rel="nofollow">CVEN90022</a> <a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;a434eb6f4f2d3e4090a0eefe0310c7d1" rel="nofollow">CVEN90064</a> <a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;42342f6f4f2d3e4090a0eefe0310c755" rel="nofollow">CVEN90065</a> <a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;f272ef6b4f2d3e4090a0eefe0310c78f" rel="nofollow">CVEN90047</a></p>\r\n<p><em> </em></p>'
            )
          ).toEqual({
            reqType: ReqType.DISALLOWED,
            count: 0,
            concurrent: false,
            codes: ["CVEN90022", "CVEN90064", "CVEN90065", "CVEN90047"]
          });
        });
      });
    });

    describe("non-matches", () => {
      expect(req('<p><a href="#" rel="nofollow">VETS900899</a></p>')).toBeNull();
      expect(
        req(
          '<p>Students must have completed the following subject (or equivalent approved by the Subject Coordinator) prior to enrolling in this subject:</p>\r\n<p><a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;cbe3636f4f2d3e4090a0eefe0310c727" rel="nofollow">CHEN30005</a></p>\r\n<p>(Prerequisite does not apply to students admitted to the 200 point program of the Master of Engineering).</p>'
        )
      ).toBeNull();
      expect(
        req(
          "<p>This subject is only available to students in the Specialist Certificate in Public Administration (Advanced)</p>"
        )
      ).toBeNull();
      expect(
        req(
          '<p>One of:</p>\r\n<p><a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;f8e3236f4f2d3e4090a0eefe0310c789" rel="nofollow">ITAL10010</a> <a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;f1c267ab4f2d3e4090a0eefe0310c775" rel="nofollow">ITAL20003</a> <a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;43a2e3ab4f2d3e4090a0eefe0310c745" rel="nofollow">ITAL30016</a></p>\r\n<p>OR</p>\r\n<p>All students enrolling in Italian at The University of Melbourne for the first time, must have a result at least equivalent to Italian 8 from the online Italian <a title="Language Placement Test" href="http://arts.unimelb.edu.au/soll/resources/language-placement-testing" target="_blank" rel="noopener noreferrer nofollow">Language Placement Test</a> in order to enrol in this subject.</p>\r\n<p>This applies to all students, including total beginners and those who have experience with the language, whether through formal study, such as VCE or equivalent, or informally through family or overseas travel. The results of the test are binding and enrolment can only be changed in consultation with the relevant course coordinator.</p>'
        )
      ).toBeNull();
      expect(
        req("<p>Entry to the Bachelor of Fine Arts (Degree with Honours): Music Theatre Major.</p>")
      ).toBeNull();
      expect(
        req(
          '<p><a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;db132fab4f2d3e4090a0eefe0310c7cb" rel="nofollow">MULT50001</a> (may be taken conrurrently)</p>\r\n<ul><li>This subject is only available to students enrolled in a BH-Arts, Bachelor of Arts (Degree with Honours) or a GD-Arts, Graduate Diploma (Advanced)</li></ul>'
        )
      ).toBeNull();
      expect(
        req(
          '<p><strong>Melbourne Law Masters Students: </strong>None</p>\r\n<p><strong>JD Students: </strong>Successful completion of the below subject:</p>\r\n<p><a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;ed32ab6b4f2d3e4090a0eefe0310c7a7" rel="nofollow">LAWS50049</a></p>'
        )
      ).toBeNull();
      expect(
        req(
          '<p>Enrolment may be subject to audition and the instrumental/vocal requirements of the ensemble.</p>\r\n<p><a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;0c512b2b4f2d3e4090a0eefe0310c722" rel="nofollow">MUSI40063</a></p>'
        )
      ).toBeNull();
      expect(
        req(
          '<p>Both</p>\r\n<p><a href="/x_univ6_as_00001_versionable.do?sys_id&#61;683ccd634ff10b8085cb98701310c7b8" rel="nofollow">CHEN20009</a> <a href="/x_univ6_as_00001_versionable.do?sys_id&#61;5c6143c4db816b840567147a3a9619fc" rel="nofollow">MAST20029</a></p>\r\n<p>and one of </p>\r\n<p><a href="#" rel="nofollow">CHEN20011</a></p>\r\n<p>CHEN20008 Chemical Process Analysis 2</p>\r\n<p><em>Note: CHEN20011 Chemical Process Analysis may be taken concurrently. </em></p>\r\n<p> </p>\r\n<p> </p>\r\n<p> </p>\r\n<p> </p>'
        )
      ).toBeNull();
      expect(
        req(
          '<p>EDUC90833 <strong>or</strong> EDUC90419</p>\r\n<p><a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;96c1636b4f2d3e4090a0eefe0310c7e0" rel="nofollow">EDUC90833</a> <a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;b3e1276b4f2d3e4090a0eefe0310c7f7" rel="nofollow">EDUC90419</a></p>'
        )
      ).toBeNull();
      expect(
        req(
          '<p>Full time teacher candidates:</p>\r\n<p><a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;6b802fa74f2d3e4090a0eefe0310c7d0" rel="nofollow">EDUC90878</a></p>'
        )
      ).toBeNull();
      expect(
        req(
          '<p>Mathematics</p>\r\n<p>One of</p>\r\n<ul style="list-style-position: inside;"><li style="list-style-type: disc;">VCE Units 3/4 Mathematical Methods or equivalent.</li><li style="list-style-type: disc;">Admission into the Bachelor of Science</li></ul>\r\n<p>OR</p>\r\n<p>Both of:</p>\r\n<p><a href="/x_univ6_as_00001_versionable.do?sys_id&#61;da71eb2b4f2d3e4090a0eefe0310c773" rel="nofollow">MAST10014</a> <a href="/x_univ6_as_00001_versionable.do?sys_id&#61;ab71eb2b4f2d3e4090a0eefe0310c7e3" rel="nofollow">MAST10015</a></p>'
        )
      ).toBeNull();
      expect(
        req(
          '<p class="MsoNormal">One of</p>\r\n<p><a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;2391af2b4f2d3e4090a0eefe0310c76b" rel="nofollow">MAST20026</a> <a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;25916f2b4f2d3e4090a0eefe0310c7f3" rel="nofollow">MAST10009</a></p>\r\n<p>and one of</p>\r\n<p><a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;0f816f2b4f2d3e4090a0eefe0310c70d" rel="nofollow">MAST20004</a> <a href="/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;88c0e3e74f2d3e4090a0eefe0310c757" rel="nofollow">MAST20006</a></p>'
        )
      ).toBeNull();
      expect(
        disallow(
          '<p>Students may not gain credit for both <a href="/view/current/FNCE30001" rel="nofollow">FNCE30001 Investments</a> and either 306-331 Investments or <a href="/view/current/actl30006" rel="nofollow">ACTL30006 Financial Mathematics III</a>.</p>'
        )
      ).toBeNull();
    });
  });
});

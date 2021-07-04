"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePretextWithAList = exports.howManyAllowed = exports.isConcurrent = exports.ReqType = exports.isSubjectCode = exports.isEmpty = exports.toPlainText = void 0;
const jsdom_1 = require("jsdom");
const lodash_1 = require("lodash");
exports.toPlainText = (htmlInput) => {
    let html = htmlInput === null || htmlInput === void 0 ? void 0 : htmlInput.trim();
    if (exports.isEmpty(htmlInput)) {
        return "";
    }
    if (html) {
        html = html
            .replace(/<\s*br\s*\/?\s*>/gi, "\n")
            .replace(/\[\[/g, " ")
            .replace(/\]\]/g, " ");
        const dom = new jsdom_1.JSDOM(html);
        const paragraphs = dom.window.document.querySelectorAll("p");
        const paragraphsText = [];
        for (let i = 0; i < paragraphs.length; i++) {
            const p = paragraphs.item(i);
            const pText = (p.textContent || "").trim();
            paragraphsText.push(pText);
        }
        return paragraphsText.join("\n").trim();
    }
    return "";
};
exports.isEmpty = (htmlInput) => {
    const html = htmlInput === null || htmlInput === void 0 ? void 0 : htmlInput.trim();
    if (html) {
        const dom = new jsdom_1.JSDOM(html);
        const paragraphs = dom.window.document.querySelectorAll("p");
        for (let i = 0; i < paragraphs.length; i++) {
            const p = paragraphs.item(i);
            const innertHtml = p.innerHTML.trim().toUpperCase();
            if (innertHtml && innertHtml != "N/A" && innertHtml != "NIL") {
                return false;
            }
        }
        return true;
    }
    return true;
};
// Based https://ask.unimelb.edu.au/app/answers/detail/a_id/5026/~/understanding-subject-codes
exports.isSubjectCode = (code) => {
    const plainCode = (code === null || code === void 0 ? void 0 : code.trim()) || "";
    return !!(plainCode && plainCode.length === 9 && plainCode.match(/^[A-Z]{4}\d{5}$/));
};
var ReqType;
(function (ReqType) {
    ReqType["PRE_REQ"] = "PRE_REQ";
    ReqType["CO_REQ"] = "CO_REQ";
    ReqType["DISALLOWED"] = "DISALLOWED";
})(ReqType = exports.ReqType || (exports.ReqType = {}));
exports.isConcurrent = (rawPrefix, req) => {
    const prefix = rawPrefix.toLowerCase().trim();
    if (req !== ReqType.PRE_REQ || !prefix) {
        return false;
    }
    // Get the some negative cases out of the way:
    if (prefix.match(/(can|may|should|must)\s?not be taken concurrently/gi)) {
        return false;
    }
    // "<p>One of the following subjects (Subjects can be taken concurrently)</p>\r\n<p><a href=\"/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;60d067e74f2d3e4090a0eefe0310c719\" rel=\"nofollow\">ABPL20040</a> <a href=\"/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;84f06fe74f2d3e4090a0eefe0310c7e4\" rel=\"nofollow\">ABPL20028</a> <a href=\"/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;f39023e74f2d3e4090a0eefe0310c76c\" rel=\"nofollow\">ABPL20027</a> <a href=\"/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;984063a74f2d3e4090a0eefe0310c795\" rel=\"nofollow\">ABPL20038</a> <a href=\"/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;1942eb6b4f2d3e4090a0eefe0310c796\" rel=\"nofollow\">ENEN20002</a></p>"
    return (prefix.match(/(can|may) be taken concurrently/gi) ||
        // "<p>This subject requires students to have completed, or have a concurrent enrolment in, the below subject:</p>\r\n<p><a href=\"/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;f9226b6b4f2d3e4090a0eefe0310c768\" rel=\"nofollow\">LAWS50033</a></p>\r\n<p> </p>"
        prefix.match(/have\s*a? concurrent enrolment/gi) ||
        prefix.match(/completed or be (concurrently\s*)?enrolled/) ||
        prefix.match(/not permitted/));
};
exports.howManyAllowed = (rawPrefix, totalNumber, reqType) => {
    if (reqType === ReqType.DISALLOWED) {
        return 0;
    }
    const prefix = rawPrefix.toLowerCase().trim();
    if (!prefix) {
        return totalNumber;
    }
    if (prefix.match(/one of the (below|following)/gi) || prefix.match(/one of\s*:?$/gi)) {
        return 1;
    }
    else if (prefix.match(/must enrol in the (following|below)/gi) ||
        prefix.match(/all(\sof)? the (following|below)/gi)) {
        return totalNumber;
    }
    return totalNumber;
};
const prefixMatchesReq = (rawPrefix, req) => {
    const prefix = rawPrefix.toLowerCase().trim();
    if (!prefix) {
        return true;
    }
    // Do not match these ...
    if (prefix.match(/students: .* students:/gi) ||
        prefix.match(/candidates: .* candidates:/gi) ||
        prefix.match(/audition/gi) ||
        prefix.match(/\sVCE\s/g) ||
        prefix.match(/permission/gi) ||
        prefix.match(/quota/gi) ||
        prefix.match(/questionnaire/gi) ||
        prefix.match(/placement test/gi) ||
        prefix.match(/approval/gi) ||
        prefix.match(/approved (applicant|student)/gi) ||
        prefix.match(/equivalent/gi) ||
        prefix.match(/refer to/gi) ||
        prefix.match(/entry into/gi) ||
        prefix.match(/one of .*(and|or) one of/gi)) {
        return false;
    }
    // Typical prefixes for pre/co-reqs
    if (req === ReqType.PRE_REQ || req === ReqType.CO_REQ) {
        return (prefix.match(/can be taken concurrently/gi) ||
            prefix.match(/successful completion of/gi) ||
            prefix.match(/completion of .*the (below|following)/gi) ||
            // "<p>Students must have completed the following subject (or equivalent approved by the Subject Coordinator) prior to enrolling in this subject:</p>\r\n<p><a href=\"/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;cbe3636f4f2d3e4090a0eefe0310c727\" rel=\"nofollow\">CHEN30005</a></p>\r\n<p>(Prerequisite does not apply to students admitted to the 200 point program of the Master of Engineering).</p>"
            prefix.match(/completed the (below|following) subject/gi) ||
            prefix.match(/completed or be (concurrently\s*)?enrolled/gi) ||
            // "<p>One of the following subjects (Subjects can be taken concurrently)</p>\r\n<p><a href=\"/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;60d067e74f2d3e4090a0eefe0310c719\" rel=\"nofollow\">ABPL20040</a> <a href=\"/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;84f06fe74f2d3e4090a0eefe0310c7e4\" rel=\"nofollow\">ABPL20028</a> <a href=\"/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;f39023e74f2d3e4090a0eefe0310c76c\" rel=\"nofollow\">ABPL20027</a> <a href=\"/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;984063a74f2d3e4090a0eefe0310c795\" rel=\"nofollow\">ABPL20038</a> <a href=\"/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;1942eb6b4f2d3e4090a0eefe0310c796\" rel=\"nofollow\">ENEN20002</a></p>"
            prefix.match(/one of the (below|following)/gi) ||
            prefix.match(/one of\s*:?$/gi) ||
            // "<p>one of</p>\r\n<p>  <a href=\"/x_univ6_as_00001_versionable.do?sys_id&#61;0c6faf6bdba8ab4cf3e4446b3a961941\" rel=\"nofollow\">AGRI20043</a>  <a href=\"/x_univ6_as_00001_versionable.do?sys_id&#61;17604f8c4f340b8085cb98701310c701\" rel=\"nofollow\">BCMB20002</a></p>\r\n<p>and one of</p>\r\n<p>  <a href=\"/x_univ6_as_00001_versionable.do?sys_id&#61;6a606ba74f2d3e4090a0eefe0310c786\" rel=\"nofollow\">MIIM20001</a> <a href=\"/x_univ6_as_00001_versionable.do?sys_id&#61;2bee2e47db10a388f397bc5a3a9619b5\" rel=\"nofollow\">AGRI20044</a></p>"
            // "including the following"
            prefix.match(/including the following/gi) ||
            // "the following subject"
            prefix.match(/the following/gi) ||
            // "<p>Prerequisites are both:</p>\r\n<p><a href=\"/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;678263ab4f2d3e4090a0eefe0310c70c\" rel=\"nofollow\">BIOM20001</a> <a href=\"/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;c672ef6b4f2d3e4090a0eefe0310c757\" rel=\"nofollow\">BIOM20002</a></p>"
            prefix.match(/Prerequisites? .* (are|is)/gi) ||
            // "<p>Students must enrol in the following subjects:</p>\r\n<p><a href=\"#\" rel=\"nofollow\">VETS30015</a> <a href=\"#\" rel=\"nofollow\">VETS30016</a></p>"
            prefix.match(/must enrol in the (following|below)/gi));
        // "<p>This subject requires students to have completed, or have a concurrent enrolment in, the below subject:</p>\r\n<p><a href=\"/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;f9226b6b4f2d3e4090a0eefe0310c768\" rel=\"nofollow\">LAWS50033</a></p>\r\n<p> </p>"
        // "<p>Students must have completed <strong>ONE</strong> of the following subjects:</p>\r\n<p><a href=\"/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;43236fab4f2d3e4090a0eefe0310c7b2\" rel=\"nofollow\">COMP20003</a> <a href=\"/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;1d33afab4f2d3e4090a0eefe0310c736\" rel=\"nofollow\">COMP20007</a> <a href=\"/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;3a132fab4f2d3e4090a0eefe0310c79b\" rel=\"nofollow\">COMP90038</a></p>\r\n<p><strong> </strong></p>"
    }
    // Typical prefixes for disallowed
    if (req === ReqType.DISALLOWED) {
        return (
        // "<p>Students cannot enrol in and gain credit for this subject and:</p>\r\n<p><a href=\"/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;6901632b4f2d3e4090a0eefe0310c76c\" rel=\"nofollow\">ISYS90080</a> <a href=\"/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;53b36f2f4f2d3e4090a0eefe0310c765\" rel=\"nofollow\">ENGR90033</a></p>"
        prefix.match(/(can|may|must)\s*not enrol in/gi) ||
            prefix.match(/credit will not be/gi) ||
            prefix.match(/not (permitted|eligible|allowed|available)/gi) ||
            prefix.match(/(can|may|must)\s*not gain credit/gi));
        // "<p>This subject requires students to have completed, or have a concurrent enrolment in, the below subject:</p>\r\n<p><a href=\"/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;f9226b6b4f2d3e4090a0eefe0310c768\" rel=\"nofollow\">LAWS50033</a></p>\r\n<p> </p>"
        // "<p>Students must have completed <strong>ONE</strong> of the following subjects:</p>\r\n<p><a href=\"/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;43236fab4f2d3e4090a0eefe0310c7b2\" rel=\"nofollow\">COMP20003</a> <a href=\"/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;1d33afab4f2d3e4090a0eefe0310c736\" rel=\"nofollow\">COMP20007</a> <a href=\"/nav_to.do?uri&#61;/x_univ6_as_00001_subject.do?sys_id&#61;3a132fab4f2d3e4090a0eefe0310c79b\" rel=\"nofollow\">COMP90038</a></p>\r\n<p><strong> </strong></p>"
    }
    return false;
};
exports.parsePretextWithAList = (htmlInput, reqType) => {
    const html = htmlInput === null || htmlInput === void 0 ? void 0 : htmlInput.trim();
    const dom = new jsdom_1.JSDOM(html);
    const paragraphs = dom.window.document.querySelectorAll("p");
    const paragraphsText = [];
    for (let i = 0; i < paragraphs.length; i++) {
        const p = paragraphs.item(i);
        const pText = (p.textContent || "").trim();
        paragraphsText.push(pText);
    }
    const text = lodash_1.trim(paragraphsText
        .join(" ")
        .replace(/\[\[/g, " ")
        .replace(/\]\]/g, " ")
        .replace(/\s+/g, " ")
        .trim(), " .");
    // Divide the text into prefix and codes
    const match = text.match(/^(?<pre>.*?)(?<codes>([A-Z]{4}\d{5}(\s|and|,|AND|;)*)+)$/);
    let { pre, codes } = Object.assign({ pre: "", codes: "" }, match === null || match === void 0 ? void 0 : match.groups);
    pre = pre.trim();
    codes = codes.trim();
    const subjectCodes = lodash_1.uniq((codes.match(/[A-Z]{4}\d{5}/g) || []).filter(Boolean));
    // if (text.includes("Can be taken concurrently")) {
    //   console.log(text);
    //   console.log(pre);
    //   console.log(codes);
    //   console.log(subjectCodes.join(" - "));
    // }
    // If the prefix has codes => we can't do much
    if (pre.match(/[A-Z]{4}\d{5}/) || subjectCodes.length === 0) {
        return null;
    }
    else if (!pre || prefixMatchesReq(pre, reqType)) {
        return {
            reqType,
            count: exports.howManyAllowed(pre, subjectCodes.length, reqType),
            concurrent: !!exports.isConcurrent(pre, reqType),
            codes: subjectCodes
        };
    }
    else {
        return null;
    }
};
//# sourceMappingURL=reqParser.js.map
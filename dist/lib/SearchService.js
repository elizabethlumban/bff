"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchService = void 0;
const tslib_1 = require("tslib");
const axios_1 = tslib_1.__importDefault(require("axios"));
class SearchService {
    constructor() {
        this.searchSubjectsByRecordIds = async (recordIds, sessionId) => {
            const year = new Date().getFullYear();
            const params = JSON.stringify({ recordIds, year });
            const { data: subjects } = await axios_1.default.get(`${process.env.RULE_MGMT_API_LOCATION}/apis/v1/rule-validation/subject?query=SearchSubjectsByRecordIds&params=${params}`, { headers: { sessionid: sessionId } });
            return subjects;
        };
        this.searchSubjectsByCodes = async (codes, sessionId) => {
            // const sessionId = process.env.BYPASS_RE_AUTH === "true" ? "test" : sessionid;
            const queryParams = {
                query: "SearchSubjectsByCode",
                params: {
                    code: codes,
                    year: new Date().getFullYear()
                }
            };
            console.log(codes);
            const response = await axios_1.default.get("/v1/rule-validation/subject", {
                baseURL: `${process.env.RULE_MGMT_API_LOCATION}/apis`,
                params: queryParams,
                headers: { sessionid: sessionId }
            });
            if (response.status === 200) {
                return response.data;
            }
            else {
                throw new Error(`response status ${response.status} text ${response.statusText} ` +
                    `for GET /v1/rule-validation/subject ${queryParams} ${sessionId}`);
            }
        };
        this.supportedSubjectFilters = [
            "name",
            "code",
            "recordId",
            "points",
            "owningOrg",
            "areaOfStudy",
            "level",
            "type",
            "supportingOrg",
            "discontinue"
        ];
        this.searchSubjectsByFilters = async (sessionId, incomingQueryParams) => {
            // console.log(incomingQueryParams)
            const queryParams = {
                query: SubjectQueries.SearchSubjectsByFiltersQuery,
                params: {
                    year: new Date().getFullYear()
                }
            };
            if (incomingQueryParams.nameOrCode) {
                const searchValue = incomingQueryParams.nameOrCode;
                const regexMatches = searchValue.match(/^"[A-Z]{4}\d{5}"$/g);
                if (regexMatches) {
                    // console.log(`Search by code: ${searchValue}`);
                    incomingQueryParams.code = searchValue;
                }
                else {
                    // console.log(`Search by name: ${searchValue}`);
                    incomingQueryParams.name = [searchValue];
                }
            }
            for (const filter of this.supportedSubjectFilters) {
                if (filter in incomingQueryParams) {
                    // console.log(filter);
                    queryParams.params[filter] = JSON.parse(incomingQueryParams[filter]);
                }
            }
            // console.log(`get ${process.env.RULE_MGMT_API_LOCATION}/apis/v1/rule-validation/subject `, queryParams);
            const response = await axios_1.default.get("/v1/rule-validation/subject", {
                baseURL: `${process.env.RULE_MGMT_API_LOCATION}/apis`,
                params: queryParams,
                headers: { sessionid: sessionId }
            });
            if (response.status === 200) {
                return response.data;
            }
            else {
                throw new Error(`response status ${response.status} text ${response.statusText} ` +
                    `for GET /v1/rule-validation/subject ${queryParams} ${sessionId}`);
            }
        };
        this.supportedComponentFilters = [
            "type",
            "code",
            "recordId",
            "points",
            "name",
            "year",
            "parentCourseCode",
            "parentCourseName"
        ];
        this.searchComponents = async (sessionId, incomingQueryParams) => {
            // console.log(incomingQueryParams)
            const queryParams = {
                query: "SearchComponentsByFilters",
                params: {
                    year: new Date().getFullYear()
                }
            };
            for (const filter of this.supportedComponentFilters) {
                if (filter in incomingQueryParams) {
                    console.log(incomingQueryParams[filter]);
                    queryParams.params[filter] = JSON.parse(incomingQueryParams[filter]);
                }
            }
            console.log(`get ${process.env.RULE_MGMT_API_LOCATION}/apis/v1/rule-validation/component `, queryParams);
            const response = await axios_1.default.get("/v1/rule-validation/component", {
                baseURL: `${process.env.RULE_MGMT_API_LOCATION}/apis`,
                params: queryParams,
                headers: { sessionid: sessionId }
            });
            if (response.status === 200) {
                return response.data;
            }
            else {
                throw new Error(`response status ${response.status} text ${response.statusText} ` +
                    `for GET /v1/rule-validation/component ${queryParams} ${sessionId}`);
            }
        };
    }
}
exports.SearchService = SearchService;
var SubjectQueries;
(function (SubjectQueries) {
    SubjectQueries["SearchSubjectsByFiltersQuery"] = "SearchSubjectsByFilters";
    SubjectQueries["SearchSubjectsByCodeQuery"] = "SearchSubjectsByCode";
    SubjectQueries["SearchSubjectsByRecordIdsQuery"] = "SearchSubjectsByRecordIds";
})(SubjectQueries || (SubjectQueries = {}));
//# sourceMappingURL=SearchService.js.map
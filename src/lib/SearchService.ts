import axios from "axios";

export class SearchService {
  public searchSubjectsByRecordIds = async (recordIds: string[], sessionId: string) => {
    const year = new Date().getFullYear();
    const params = JSON.stringify({ recordIds, year });

    const {
      data: subjects
    } = await axios.get(
      `${process.env.RULE_MGMT_API_LOCATION}/apis/v1/rule-validation/subject?query=SearchSubjectsByRecordIds&params=${params}`,
      { headers: { sessionid: sessionId } }
    );

    return subjects;
  };

  public searchSubjectsByCodes = async (codes: string | Array<string>, sessionId: string) => {
    // const sessionId = process.env.BYPASS_RE_AUTH === "true" ? "test" : sessionid;
    const queryParams = {
      query: "SearchSubjectsByCode",
      params: {
        code: codes,
        year: new Date().getFullYear()
      }
    };
    console.log(codes);

    const response = await axios.get("/v1/rule-validation/subject", {
      baseURL: `${process.env.RULE_MGMT_API_LOCATION}/apis`,
      params: queryParams,
      headers: { sessionid: sessionId }
    });

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(
        `response status ${response.status} text ${response.statusText} ` +
          `for GET /v1/rule-validation/subject ${queryParams} ${sessionId}`
      );
    }
  };

  supportedSubjectFilters = [
    "name",
    "code",
    "recordId",
    "points",
    "owningOrg",
    "areaOfStudy",
    "level",
    "type",
    "supportingOrg", // TODO
    "discontinue"
  ];

  public searchSubjectsByFilters = async (sessionId: string, incomingQueryParams: any) => {
    // console.log(incomingQueryParams)
    const queryParams = {
      query: SubjectQueries.SearchSubjectsByFiltersQuery,
      params: {
        year: new Date().getFullYear()
      } as any
    };
    if (incomingQueryParams.nameOrCode) {
      const searchValue = incomingQueryParams.nameOrCode as string;
      const regexMatches = searchValue.match(/^"[A-Z]{4}\d{5}"$/g);
      if (regexMatches) {
        // console.log(`Search by code: ${searchValue}`);
        incomingQueryParams.code = searchValue;
      } else {
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
    const response = await axios.get("/v1/rule-validation/subject", {
      baseURL: `${process.env.RULE_MGMT_API_LOCATION}/apis`,
      params: queryParams,
      headers: { sessionid: sessionId }
    });

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(
        `response status ${response.status} text ${response.statusText} ` +
          `for GET /v1/rule-validation/subject ${queryParams} ${sessionId}`
      );
    }
  };

  supportedComponentFilters = [
    "type",
    "code",
    "recordId",
    "points",
    "name",
    "year",
    "parentCourseCode",
    "parentCourseName"
  ];

  public searchComponents = async (sessionId: string, incomingQueryParams: any) => {
    // console.log(incomingQueryParams)
    const queryParams = {
      query: "SearchComponentsByFilters",
      params: {
        year: new Date().getFullYear()
      } as any
    };
    for (const filter of this.supportedComponentFilters) {
      if (filter in incomingQueryParams) {
        console.log(incomingQueryParams[filter]);
        queryParams.params[filter] = JSON.parse(incomingQueryParams[filter]);
      }
    }

    console.log(
      `get ${process.env.RULE_MGMT_API_LOCATION}/apis/v1/rule-validation/component `,
      queryParams
    );
    const response = await axios.get("/v1/rule-validation/component", {
      baseURL: `${process.env.RULE_MGMT_API_LOCATION}/apis`,
      params: queryParams,
      headers: { sessionid: sessionId }
    });

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(
        `response status ${response.status} text ${response.statusText} ` +
          `for GET /v1/rule-validation/component ${queryParams} ${sessionId}`
      );
    }
  };
}

enum SubjectQueries {
  SearchSubjectsByFiltersQuery = "SearchSubjectsByFilters",
  SearchSubjectsByCodeQuery = "SearchSubjectsByCode",
  SearchSubjectsByRecordIdsQuery = "SearchSubjectsByRecordIds"
}

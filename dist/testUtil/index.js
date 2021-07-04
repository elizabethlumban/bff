"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockRequestResponse = void 0;
require("jest");
jest.setTimeout(60 * 1000);
function mockRequestResponse() {
    const req = {
        query: {},
        params: {},
        body: {},
        headers: {},
        user: {}
    };
    req.header = (h) => req.headers[h];
    function resetMock() {
        this.end.mockClear();
        this.json.mockClear();
        this.send.mockClear();
        this.status.mockClear();
    }
    const res = {
        end: jest.fn(),
        json: jest.fn(),
        send: jest.fn(),
        status: jest.fn(),
        reset: resetMock
    };
    res.end.mockImplementation(() => res);
    res.json.mockImplementation(() => res);
    res.send.mockImplementation(() => res);
    res.status.mockImplementation(() => res);
    const next = jest.fn();
    return { req, res, next };
}
exports.mockRequestResponse = mockRequestResponse;
//# sourceMappingURL=index.js.map
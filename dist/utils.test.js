"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const node_test_1 = require("node:test");
const utils_1 = require("./utils");
const childProcess = require("child_process");
const payload = `DKIM records for example.com:
[
  {
    "name": "_domainkey.example.com",
    "records": ["v=DKIM1; k=rsa; p=abc"]
  }
]`;
(0, node_test_1.test)("copyToClipboard sends JSON via stdin instead of a shell command", (t) => {
    const execSync = t.mock.method(childProcess, "execSync", () => Buffer.from(""));
    const execFileSync = t.mock.method(childProcess, "execFileSync", () => Buffer.from(""));
    (0, utils_1.copyToClipboard)(payload);
    strict_1.default.equal(execSync.mock.callCount(), 0, "must not run a shell command");
    strict_1.default.equal(execFileSync.mock.callCount(), 1);
    const [file, args, options] = execFileSync.mock.calls[0].arguments;
    strict_1.default.equal(typeof file, "string");
    strict_1.default.doesNotMatch(String(file), /name:/);
    strict_1.default.doesNotMatch(JSON.stringify(args !== null && args !== void 0 ? args : []), /name:/);
    strict_1.default.equal(options === null || options === void 0 ? void 0 : options.input, payload);
});

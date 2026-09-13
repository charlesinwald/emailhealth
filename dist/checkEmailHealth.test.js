"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const node_dns_1 = require("node:dns");
const node_test_1 = require("node:test");
const checkEmailHealth_1 = require("./checkEmailHealth");
(0, node_test_1.test)("returns MX and TXT reports even when the IP lookup succeeds", (t) => __awaiter(void 0, void 0, void 0, function* () {
    t.mock.method(node_dns_1.promises.Resolver.prototype, "resolve", (_name, rrtype) => __awaiter(void 0, void 0, void 0, function* () {
        if (rrtype === "NS")
            return ["ns1.example.com"];
        if (rrtype === "A")
            return ["1.2.3.4"];
        throw new Error(`unexpected resolve type ${rrtype}`);
    }));
    t.mock.method(node_dns_1.promises.Resolver.prototype, "resolveMx", () => __awaiter(void 0, void 0, void 0, function* () {
        return [
            { exchange: "mx.example.com", priority: 10 },
        ];
    }));
    t.mock.method(node_dns_1.promises.Resolver.prototype, "resolveTxt", (name) => __awaiter(void 0, void 0, void 0, function* () {
        if (name.startsWith("_spf.")) {
            throw Object.assign(new Error("queryTxt ENOTFOUND _spf.example.com"), {
                code: "ENOTFOUND",
            });
        }
        if (name.startsWith("_dmarc."))
            return [["v=DMARC1; p=none"]];
        if (name.includes("_domainkey."))
            return [["v=DKIM1; k=rsa; p=abc"]];
        return [["v=spf1 include:_spf.google.com ~all"]];
    }));
    const reports = yield (0, checkEmailHealth_1.checkEmailHealth)("user@example.com");
    strict_1.default.ok(reports, "checkEmailHealth must return a reports array");
    strict_1.default.deepEqual(reports.map((report) => report.title), [
        "NS Records",
        "IP Address",
        "MX Records",
        "TXT Records",
        "SPF Records",
        "DMARC Records",
        "DKIM Records",
    ]);
}));

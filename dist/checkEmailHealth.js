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
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkEmailHealth = exports.resolveDkimRecords = exports.dkimLookupNames = exports.selectSpfRecords = void 0;
const node_dns_1 = require("node:dns");
const utils_1 = require("./utils");
const SPF_RECORD_PREFIX = /^v=spf1\b/i;
const COMMON_DKIM_SELECTORS = [
    "default",
    "google",
    "k1",
    "s1",
    "s2",
    "selector1",
    "selector2",
];
const selectSpfRecords = (txtRecords) => txtRecords
    .map((chunks) => chunks.join(""))
    .filter((record) => SPF_RECORD_PREFIX.test(record.trim()));
exports.selectSpfRecords = selectSpfRecords;
const dkimLookupNames = (domain) => [
    `_domainkey.${domain}`,
    ...COMMON_DKIM_SELECTORS.map((selector) => `${selector}._domainkey.${domain}`),
];
exports.dkimLookupNames = dkimLookupNames;
const joinTxtRecords = (records) => records.map((chunks) => chunks.join(""));
const resolveDkimRecords = (domain, nsResolver) => __awaiter(void 0, void 0, void 0, function* () {
    const results = yield Promise.allSettled((0, exports.dkimLookupNames)(domain).map((name) => __awaiter(void 0, void 0, void 0, function* () {
        return ({
            name,
            records: joinTxtRecords(yield nsResolver.resolveTxt(name)),
        });
    })));
    return results.flatMap((result) => result.status === "fulfilled" && result.value.records.length > 0
        ? [result.value]
        : []);
});
exports.resolveDkimRecords = resolveDkimRecords;
const checkEmailHealth = (email) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Checking email health for ${email}`);
    const domain = email.split("@")[1];
    const reports = [];
    let txtRecords = [];
    try {
        const nsResolver = new node_dns_1.promises.Resolver({ timeout: 5000, tries: 2 });
        const nsRecords = yield nsResolver.resolve(domain, "NS");
        console.log(`NS records for ${domain}: ${nsRecords}`);
        reports.push({
            email,
            title: "NS Records",
            status: "healthy",
            message: `NS records for ${domain}: ${nsRecords}`,
        });
        try {
            const ipAddress = yield nsResolver.resolve(domain, "A");
            console.log(`IP address for ${domain}: ${ipAddress}`);
            reports.push({
                email,
                title: "IP Address",
                status: "healthy",
                message: `IP address for ${domain}: ${ipAddress}`,
            });
        }
        catch (error) {
            console.error(`Error resolving IP address for ${domain}: ${error}`);
            reports.push({
                email,
                title: "IP Address",
                status: "unhealthy",
                message: `Error resolving IP address for ${domain}: ${error}`,
            });
        }
        try {
            const mxRecords = yield nsResolver.resolveMx(domain);
            console.log(`MX records for ${domain}: ${(0, utils_1.parseNestedObject)(mxRecords)}`);
            reports.push({
                email,
                title: "MX Records",
                status: "healthy",
                message: `MX records for ${domain}:\n${(0, utils_1.parseNestedObject)(mxRecords)}`,
            });
        }
        catch (error) {
            console.error(`Error resolving MX records for ${domain}: ${error}`);
            reports.push({
                email,
                title: "MX Records",
                status: "unhealthy",
                message: `Error resolving MX records for ${domain}: ${error}`,
            });
        }
        try {
            txtRecords = yield nsResolver.resolveTxt(domain);
            console.log(`TXT records for ${domain}: ${(0, utils_1.parseNestedObject)(txtRecords)}`);
            reports.push({
                email,
                title: "TXT Records",
                status: "healthy",
                message: `TXT records for ${domain}:\n${(0, utils_1.parseNestedObject)(txtRecords)}`,
            });
        }
        catch (error) {
            console.error(`Error resolving TXT records for ${domain}: ${error}`);
            reports.push({
                email,
                title: "TXT Records",
                status: "unhealthy",
                message: `Error resolving TXT records for ${domain}: ${error}`,
            });
        }
        try {
            const spfRecords = yield nsResolver.resolveTxt(`_spf.${domain}`);
            console.log(`SPF records for ${domain}: ${(0, utils_1.parseNestedObject)(spfRecords)}`);
            reports.push({
                email,
                title: "SPF Records",
                status: "healthy",
                message: `SPF records for ${domain}:\n${(0, utils_1.parseNestedObject)(spfRecords)}`,
            });
        }
        catch (error) {
            const spfFromTxt = (0, exports.selectSpfRecords)(txtRecords);
            if (spfFromTxt.length > 0) {
                console.log(`SPF records for ${domain} from TXT: ${(0, utils_1.parseNestedObject)(spfFromTxt)}`);
                reports.push({
                    email,
                    title: "SPF Records",
                    status: "healthy",
                    message: `SPF records for ${domain}:\n${(0, utils_1.parseNestedObject)(spfFromTxt)}`,
                });
            }
            else {
                console.error(`Error resolving SPF records for ${domain}: ${error}`);
                reports.push({
                    email,
                    title: "SPF Records",
                    status: "unhealthy",
                    message: `Error resolving SPF records for ${domain}: ${error}`,
                });
            }
        }
        try {
            const dmarcRecords = yield nsResolver.resolveTxt(`_dmarc.${domain}`);
            console.log(`DMARC records for ${domain}: ${(0, utils_1.parseNestedObject)(dmarcRecords)}`);
            reports.push({
                email,
                title: "DMARC Records",
                status: "healthy",
                message: `DMARC records for ${domain}:\n${(0, utils_1.parseNestedObject)(dmarcRecords)}`,
            });
        }
        catch (error) {
            console.error(`Error resolving DMARC records for ${domain}: ${error}`);
            reports.push({
                email,
                title: "DMARC Records",
                status: "unhealthy",
                message: `Error resolving DMARC records for ${domain}: ${error}`,
            });
        }
        const dkimRecords = yield (0, exports.resolveDkimRecords)(domain, nsResolver);
        if (dkimRecords.length > 0) {
            console.log(`DKIM records for ${domain}: ${(0, utils_1.parseNestedObject)(dkimRecords)}`);
            reports.push({
                email,
                title: "DKIM Records",
                status: "healthy",
                message: `DKIM records for ${domain}:\n${(0, utils_1.parseNestedObject)(dkimRecords)}`,
            });
        }
        else {
            console.error(`Error resolving DKIM records for ${domain}`);
            reports.push({
                email,
                title: "DKIM Records",
                status: "unhealthy",
                message: `Error resolving DKIM records for ${domain}: no TXT records found at ${(0, exports.dkimLookupNames)(domain).join(", ")}`,
            });
        }
        return reports;
    }
    catch (error) {
        console.error(`Error resolving DNS records for ${domain}: ${error}`);
        reports.push({
            email,
            title: "DNS Records",
            status: "unhealthy",
            message: `Error resolving DNS records for ${domain}: ${error}`,
        });
        return reports;
    }
});
exports.checkEmailHealth = checkEmailHealth;

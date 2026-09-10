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
exports.checkEmailHealth = exports.selectSpfRecords = void 0;
const node_dns_1 = require("node:dns");
const utils_1 = require("./utils");
const SPF_RECORD_PREFIX = /^v=spf1\b/i;
const selectSpfRecords = (txtRecords) => txtRecords
    .map((chunks) => chunks.join(""))
    .filter((record) => SPF_RECORD_PREFIX.test(record.trim()));
exports.selectSpfRecords = selectSpfRecords;
const checkEmailHealth = (email) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Checking email health for ${email}`);
    const domain = email.split("@")[1];
    const reports = [];
    let txtRecords = [];
    try {
        const ipAddress = yield node_dns_1.promises.resolve(domain);
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
        const mxRecords = yield node_dns_1.promises.resolveMx(domain);
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
        txtRecords = yield node_dns_1.promises.resolveTxt(domain);
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
        const spfRecords = yield node_dns_1.promises.resolveTxt(`_spf.${domain}`);
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
        const dmarcRecords = yield node_dns_1.promises.resolveTxt(`_dmarc.${domain}`);
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
    try {
        const dkimRecords = yield node_dns_1.promises.resolveTxt(`_dmarc.${domain}`);
        console.log(`DKIM records for ${domain}: ${(0, utils_1.parseNestedObject)(dkimRecords)}`);
        reports.push({
            email,
            title: "DKIM Records",
            status: "healthy",
            message: `DKIM records for ${domain}:\n${(0, utils_1.parseNestedObject)(dkimRecords)}`,
        });
    }
    catch (error) {
        console.error(`Error resolving DKIM records for ${domain}: ${error}`);
        reports.push({
            email,
            title: "DKIM Records",
            status: "unhealthy",
            message: `Error resolving DKIM records for ${domain}: ${error}`,
        });
    }
    return reports;
});
exports.checkEmailHealth = checkEmailHealth;

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
exports.checkEmailHealth = void 0;
const node_dns_1 = require("node:dns");
const utils_1 = require("./utils");
const checkEmailHealth = (email) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Checking email health for ${email}`);
    const domain = email.split("@")[1];
    try {
        const ipAddress = yield node_dns_1.promises.resolve(domain);
        console.log(`IP address for ${domain}: ${ipAddress}`);
    }
    catch (error) {
        console.error(`Error resolving IP address for ${domain}: ${error}`);
    }
    try {
        const mxRecords = yield node_dns_1.promises.resolveMx(domain);
        console.log(`MX records for ${domain}: ${(0, utils_1.parseNestedObject)(mxRecords)}`);
    }
    catch (error) {
        console.error(`Error resolving MX records for ${domain}: ${error}`);
    }
    try {
        const txtRecords = yield node_dns_1.promises.resolveTxt(domain);
        console.log(`TXT records for ${domain}: ${txtRecords}`);
    }
    catch (error) {
        console.error(`Error resolving TXT records for ${domain}: ${error}`);
    }
    try {
        const spfRecords = yield node_dns_1.promises.resolveTxt(`_spf.${domain}`);
        console.log(`SPF records for ${domain}: ${spfRecords}`);
    }
    catch (error) {
        console.error(`Error resolving SPF records for ${domain}: ${error}`);
    }
    try {
        const dmarcRecords = yield node_dns_1.promises.resolveTxt(`_dmarc.${domain}`);
        console.log(`DMARC records for ${domain}: ${dmarcRecords}`);
    }
    catch (error) {
        console.error(`Error resolving DMARC records for ${domain}: ${error}`);
    }
    try {
        const dkimRecords = yield node_dns_1.promises.resolveTxt(`_dmarc.${domain}`);
        console.log(`DKIM records for ${domain}: ${dkimRecords}`);
    }
    catch (error) {
        console.error(`Error resolving DKIM records for ${domain}: ${error}`);
    }
    return true;
});
exports.checkEmailHealth = checkEmailHealth;

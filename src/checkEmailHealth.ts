import { promises as dns } from "node:dns";
import { parseNestedObject } from "./utils";
import type { Report } from "./types";

const SPF_RECORD_PREFIX = /^v=spf1\b/i;
const COMMON_DKIM_SELECTORS = [
  "default",
  "google",
  "k1",
  "s1",
  "s2",
  "selector1",
  "selector2",
] as const;

export const selectSpfRecords = (txtRecords: string[][]): string[] =>
  txtRecords
    .map((chunks) => chunks.join(""))
    .filter((record) => SPF_RECORD_PREFIX.test(record.trim()));

export const dkimLookupNames = (domain: string): string[] => [
  `_domainkey.${domain}`,
  ...COMMON_DKIM_SELECTORS.map(
    (selector) => `${selector}._domainkey.${domain}`,
  ),
];

const joinTxtRecords = (records: string[][]): string[] =>
  records.map((chunks) => chunks.join(""));

export const resolveDkimRecords = async (
  domain: string,
  resolveTxt: typeof dns.resolveTxt = dns.resolveTxt,
): Promise<ReadonlyArray<{ name: string; records: string[] }>> => {
  const results = await Promise.allSettled(
    dkimLookupNames(domain).map(async (name) => ({
      name,
      records: joinTxtRecords(await resolveTxt(name)),
    })),
  );
  return results.flatMap((result) =>
    result.status === "fulfilled" && result.value.records.length > 0
      ? [result.value]
      : [],
  );
};

export const checkEmailHealth = async (email: string) => {
  console.log(`Checking email health for ${email}`);
  const domain = email.split("@")[1];
  const reports: Report[] = [];
  let txtRecords: string[][] = [];
  try {
    const ipAddress = await dns.resolve(domain);
    console.log(`IP address for ${domain}: ${ipAddress}`);
    reports.push({
      email,
      title: "IP Address",
      status: "healthy",
      message: `IP address for ${domain}: ${ipAddress}`,
    });
  } catch (error) {
    console.error(`Error resolving IP address for ${domain}: ${error}`);
    reports.push({
      email,
      title: "IP Address",
      status: "unhealthy",
      message: `Error resolving IP address for ${domain}: ${error}`,
    });
  }
  try {
    const mxRecords = await dns.resolveMx(domain);
    console.log(`MX records for ${domain}: ${parseNestedObject(mxRecords)}`);
    reports.push({
      email,
      title: "MX Records",
      status: "healthy",
      message: `MX records for ${domain}:\n${parseNestedObject(mxRecords)}`,
    });
  } catch (error) {
    console.error(`Error resolving MX records for ${domain}: ${error}`);
    reports.push({
      email,
      title: "MX Records",
      status: "unhealthy",
      message: `Error resolving MX records for ${domain}: ${error}`,
    });
  }
  try {
    txtRecords = await dns.resolveTxt(domain);
    console.log(`TXT records for ${domain}: ${parseNestedObject(txtRecords)}`);
    reports.push({
      email,
      title: "TXT Records",
      status: "healthy",
      message: `TXT records for ${domain}:\n${parseNestedObject(txtRecords)}`,
    });
  } catch (error) {
    console.error(`Error resolving TXT records for ${domain}: ${error}`);
    reports.push({
      email,
      title: "TXT Records",
      status: "unhealthy",
      message: `Error resolving TXT records for ${domain}: ${error}`,
    });
  }
  try {
    const spfRecords = await dns.resolveTxt(`_spf.${domain}`);
    console.log(`SPF records for ${domain}: ${parseNestedObject(spfRecords)}`);
    reports.push({
      email,
      title: "SPF Records",
      status: "healthy",
      message: `SPF records for ${domain}:\n${parseNestedObject(spfRecords)}`,
    });
  } catch (error) {
    const spfFromTxt = selectSpfRecords(txtRecords);
    if (spfFromTxt.length > 0) {
      console.log(
        `SPF records for ${domain} from TXT: ${parseNestedObject(spfFromTxt)}`,
      );
      reports.push({
        email,
        title: "SPF Records",
        status: "healthy",
        message: `SPF records for ${domain}:\n${parseNestedObject(spfFromTxt)}`,
      });
    } else {
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
    const dmarcRecords = await dns.resolveTxt(`_dmarc.${domain}`);
    console.log(
      `DMARC records for ${domain}: ${parseNestedObject(dmarcRecords)}`,
    );
    reports.push({
      email,
      title: "DMARC Records",
      status: "healthy",
      message: `DMARC records for ${domain}:\n${parseNestedObject(dmarcRecords)}`,
    });
  } catch (error) {
    console.error(`Error resolving DMARC records for ${domain}: ${error}`);
    reports.push({
      email,
      title: "DMARC Records",
      status: "unhealthy",
      message: `Error resolving DMARC records for ${domain}: ${error}`,
    });
  }
  const dkimRecords = await resolveDkimRecords(domain);
  if (dkimRecords.length > 0) {
    console.log(
      `DKIM records for ${domain}: ${parseNestedObject(dkimRecords)}`,
    );
    reports.push({
      email,
      title: "DKIM Records",
      status: "healthy",
      message: `DKIM records for ${domain}:\n${parseNestedObject(dkimRecords)}`,
    });
  } else {
    console.error(`Error resolving DKIM records for ${domain}`);
    reports.push({
      email,
      title: "DKIM Records",
      status: "unhealthy",
      message: `Error resolving DKIM records for ${domain}: no TXT records found at ${dkimLookupNames(domain).join(", ")}`,
    });
  }
  return reports;
};

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

// checks for SPF records in the TXT records when not found by the SPF record prefix
export const selectSpfRecords = (txtRecords: string[][]): string[] =>
  txtRecords
    .map((chunks) => chunks.join(""))
    .filter((record) => SPF_RECORD_PREFIX.test(record.trim()));

 // checks for DKIM records at the domain and some common selectors
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
  nsResolver: dns.Resolver,
): Promise<ReadonlyArray<{ name: string; records: string[] }>> => {
  const results = await Promise.allSettled(
    dkimLookupNames(domain).map(async (name) => ({
      name,
      records: joinTxtRecords(await nsResolver.resolveTxt(name)),
    })),
  );
  return results.flatMap((result) =>
    result.status === "fulfilled" && result.value.records.length > 0
      ? [result.value]
      : [],
  );
};

export const DNSErrorHandler = (error: Error) => {
  if (error.message.includes("ENOTFOUND")) {
    return "Domain not found";
  } else if (error.message.includes("ENODATA")) {
    return "No DNS data found";
  } else if (error.message.includes("ETIMEOUT")) {
    return "DNS resolution timed out";
  } else if (error.message.includes("ECONNREFUSED")) {
    return "DNS resolution refused";
  } else if (error.message.includes("ECONNRESET")) {
    return "DNS connection reset";
  } else if (error.message.includes("ECONNABORTED")) {
    return "DNS connection aborted";
  } else if (error.message.includes("ECONNRESET")) {
    return "DNS connection reset";
  }
  return "DNS resolution failed";
};

export const checkEmailHealth = async (email: string) => {
  console.log(`Checking email health for ${email}`);
  const domain = email.split("@")[1];
  const reports: Report[] = [];
  let txtRecords: string[][] = [];

  try {
    const nsResolver = new dns.Resolver({ timeout: 5000, tries: 2 });
    const nsRecords = await nsResolver.resolve(domain, "NS");
    console.log(`NS records for ${domain}: ${nsRecords}`);
    reports.push({
      email,
      title: "NS Records",
      status: "healthy",
      message: `NS records for ${domain}: ${nsRecords}`,
    });

    try {
      const ipAddress = await nsResolver.resolve(domain, "A");
      console.log(`IP address for ${domain}: ${ipAddress}`);
      reports.push({
        email,
        title: "IP Address",
        status: "healthy",
        message: `IP address for ${domain}: ${ipAddress}`,
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error(
          `Error resolving IP address for ${domain}: ${DNSErrorHandler(error)}`,
        );
        reports.push({
          email,
          title: "IP Address",
          status: "unhealthy",
          message: `Error resolving IP address for ${domain}: ${DNSErrorHandler(error)}`,
        });
      }
    }
    try {
      const mxRecords = await nsResolver.resolveMx(domain);
      console.log(`MX records for ${domain}: ${parseNestedObject(mxRecords)}`);
      if (mxRecords.length > 0) {
        const sortedMxRecords = mxRecords.sort((a, b) => a.priority - b.priority);
        const containsNullRecords = sortedMxRecords.some(record => record.exchange === ".");
        if (containsNullRecords) {
          reports.push({
            email,
            title: "MX Records",
            status: "unhealthy",
            message: `MX records for ${domain} contain null records`,
          });
        } else {
          reports.push({
            email,
            title: "MX Records",
            status: "healthy",
            message: `MX records for ${domain}:\n${parseNestedObject(sortedMxRecords)}`,
          });
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(
          `Error resolving MX records for ${domain}: ${DNSErrorHandler(error)}`,
        );
        reports.push({
          email,
          title: "MX Records",
          status: "unhealthy",
          message: `Error resolving MX records for ${domain}: ${DNSErrorHandler(error)}`,
        });
      }
    }
    try {
      txtRecords = await nsResolver.resolveTxt(domain);
      console.log(
        `TXT records for ${domain}: ${parseNestedObject(txtRecords)}`,
      );
      reports.push({
        email,
        title: "TXT Records",
        status: "healthy",
        message: `TXT records for ${domain}:\n${parseNestedObject(txtRecords)}`,
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error(
          `Error resolving TXT records for ${domain}: ${DNSErrorHandler(error)}`,
        );
        reports.push({
          email,
          title: "TXT Records",
          status: "unhealthy",
          message: `Error resolving TXT records for ${domain}: ${DNSErrorHandler(error)}`,
        });
      }
    }
    try {
      const spfRecords = await nsResolver.resolveTxt(`_spf.${domain}`);
      console.log(
        `SPF records for ${domain}: ${parseNestedObject(spfRecords)}`,
      );
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
        if (error instanceof Error) {
          reports.push({
            email,
            title: "SPF Records",
            status: "unhealthy",
            message: `Error resolving SPF records for ${domain}: ${DNSErrorHandler(error)}`,
          });
        }
      }
    }
    try {
      const dmarcRecords = await nsResolver.resolveTxt(`_dmarc.${domain}`);
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
      if (error instanceof Error) {
        console.error(
          `Error resolving DMARC records for ${domain}: ${DNSErrorHandler(error)}`,
        );
        reports.push({
          email,
          title: "DMARC Records",
          status: "unhealthy",
          message: `Error resolving DMARC records for ${domain}: ${DNSErrorHandler(error)}`,
        });
      }
    }
    const dkimRecords = await resolveDkimRecords(
      domain,
      nsResolver as dns.Resolver,
    );
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
  } catch (error) {
    if (error instanceof Error) {
      console.error(
        `Error resolving DNS records for ${domain}: ${DNSErrorHandler(error)}`,
      );
      reports.push({
        email,
        title: "DNS Records",
        status: "unhealthy",
        message: `Error resolving DNS records for ${domain}: ${DNSErrorHandler(error)}`,
      });
    }
    return reports;
  }
};

import { promises as dns } from "node:dns";
import { parseNestedObject } from "./utils";

export const checkEmailHealth = async (email: string) => {
  console.log(`Checking email health for ${email}`);
  const domain = email.split("@")[1];
  try {
    const ipAddress = await dns.resolve(domain);
    console.log(`IP address for ${domain}: ${ipAddress}`);
  } catch (error) {
    console.error(`Error resolving IP address for ${domain}: ${error}`);
  }
  try {
    const mxRecords = await dns.resolveMx(domain);
    console.log(`MX records for ${domain}: ${parseNestedObject(mxRecords)}`);
  } catch (error) {
    console.error(`Error resolving MX records for ${domain}: ${error}`);
  }
  try {
    const txtRecords = await dns.resolveTxt(domain);
    console.log(`TXT records for ${domain}: ${txtRecords}`);
  } catch (error) {
    console.error(`Error resolving TXT records for ${domain}: ${error}`);
  }
  try {
    const spfRecords = await dns.resolveTxt(`_spf.${domain}`);
    console.log(`SPF records for ${domain}: ${spfRecords}`);
  } catch (error) {
    console.error(`Error resolving SPF records for ${domain}: ${error}`);
  }
  try {
    const dmarcRecords = await dns.resolveTxt(`_dmarc.${domain}`);
    console.log(`DMARC records for ${domain}: ${dmarcRecords}`);
  } catch (error) {
    console.error(`Error resolving DMARC records for ${domain}: ${error}`);
  }
  try {
    const dkimRecords = await dns.resolveTxt(`_dmarc.${domain}`);
    console.log(`DKIM records for ${domain}: ${dkimRecords}`);
  } catch (error) {
    console.error(`Error resolving DKIM records for ${domain}: ${error}`);
  }
  return true;
};

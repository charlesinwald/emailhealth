import assert from "node:assert/strict";
import { promises as dns } from "node:dns";
import { test } from "node:test";
import { checkEmailHealth } from "./checkEmailHealth";

test("returns MX and TXT reports even when the IP lookup succeeds", async (t) => {
  t.mock.method(
    dns.Resolver.prototype,
    "resolve",
    async (_name: string, rrtype?: string) => {
      if (rrtype === "NS") return ["ns1.example.com"];
      if (rrtype === "A") return ["1.2.3.4"];
      throw new Error(`unexpected resolve type ${rrtype}`);
    },
  );
  t.mock.method(dns.Resolver.prototype, "resolveMx", async () => [
    { exchange: "mx.example.com", priority: 10 },
  ]);
  t.mock.method(
    dns.Resolver.prototype,
    "resolveTxt",
    async (name: string) => {
      if (name.startsWith("_spf.")) {
        throw Object.assign(new Error("queryTxt ENOTFOUND _spf.example.com"), {
          code: "ENOTFOUND",
        });
      }
      if (name.startsWith("_dmarc.")) return [["v=DMARC1; p=none"]];
      if (name.includes("_domainkey.")) return [["v=DKIM1; k=rsa; p=abc"]];
      return [["v=spf1 include:_spf.google.com ~all"]];
    },
  );

  const reports = await checkEmailHealth("user@example.com");
  assert.ok(reports, "checkEmailHealth must return a reports array");
  assert.deepEqual(
    reports.map((report) => report.title),
    [
      "NS Records",
      "IP Address",
      "MX Records",
      "TXT Records",
      "SPF Records",
      "DMARC Records",
      "DKIM Records",
    ],
  );
});

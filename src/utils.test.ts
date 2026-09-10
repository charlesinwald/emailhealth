import assert from "node:assert/strict";
import { test } from "node:test";
import { copyToClipboard } from "./utils";

const childProcess = require("child_process") as typeof import("child_process");

const payload = `DKIM records for example.com:
[
  {
    "name": "_domainkey.example.com",
    "records": ["v=DKIM1; k=rsa; p=abc"]
  }
]`;

test("copyToClipboard sends JSON via stdin instead of a shell command", (t) => {
  const execSync = t.mock.method(childProcess, "execSync", () =>
    Buffer.from(""),
  );
  const execFileSync = t.mock.method(childProcess, "execFileSync", () =>
    Buffer.from(""),
  );

  copyToClipboard(payload);

  assert.equal(execSync.mock.callCount(), 0, "must not run a shell command");
  assert.equal(execFileSync.mock.callCount(), 1);

  const [file, args, options] = execFileSync.mock.calls[0].arguments;
  assert.equal(typeof file, "string");
  assert.doesNotMatch(String(file), /name:/);
  assert.doesNotMatch(JSON.stringify(args ?? []), /name:/);
  assert.equal(options?.input, payload);
});

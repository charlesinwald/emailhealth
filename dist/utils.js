"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyToClipboard = exports.getOSType = exports.formatReportMessage = exports.parseNestedObject = exports.readCommandLineArguments = void 0;
const child_process_1 = require("child_process");
const commander_1 = require("commander");
// Ensure the email is a valid email address with Regex
function validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}
const readCommandLineArguments = () => {
    var _a;
    commander_1.program
        .argument("<email>", "The email to check", (email) => {
        try {
            if (!validateEmail(email)) {
                throw new Error("Invalid email");
            }
            return email;
        }
        catch (error) {
            console.error("Invalid email");
            process.exit(1);
        }
    })
        .parse(process.argv);
    const opts = commander_1.program.opts();
    const [positionalEmail] = commander_1.program.args;
    return { email: (_a = opts.email) !== null && _a !== void 0 ? _a : positionalEmail };
};
exports.readCommandLineArguments = readCommandLineArguments;
const parseNestedObject = (obj) => {
    return JSON.stringify(obj, null, 2);
};
exports.parseNestedObject = parseNestedObject;
const formatReportMessage = (message) => message.replace(/\\n/g, "\n");
exports.formatReportMessage = formatReportMessage;
const getOSType = () => {
    switch (process.platform) {
        case "darwin":
            return "macOS";
        case "linux":
            return "Linux";
        case "win32":
            return "Windows";
        default:
            return "Unknown";
    }
};
exports.getOSType = getOSType;
const copyToClipboard = (text) => {
    switch ((0, exports.getOSType)()) {
        case "Windows":
            (0, child_process_1.execFileSync)("clip", [], { input: text, stdio: ["pipe", "ignore", "pipe"] });
            return;
        case "macOS":
            (0, child_process_1.execFileSync)("pbcopy", [], { input: text, stdio: ["pipe", "ignore", "pipe"] });
            return;
        case "Linux":
            (0, child_process_1.execFileSync)("xclip", ["-selection", "clipboard"], {
                input: text,
                stdio: ["pipe", "ignore", "pipe"],
            });
            return;
        default:
            return text;
    }
};
exports.copyToClipboard = copyToClipboard;

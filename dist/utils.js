"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readCommandLineArguments = void 0;
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

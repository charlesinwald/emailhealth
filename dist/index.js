"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const checkEmailHealth_1 = require("./checkEmailHealth");
const utils_1 = require("./utils");
const main = () => {
    const args = (0, utils_1.readCommandLineArguments)();
    const email = args.email;
    (0, checkEmailHealth_1.checkEmailHealth)(email);
};
main();

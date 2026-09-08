import { checkEmailHealth } from "./checkEmailHealth";
import { readCommandLineArguments } from "./utils";

const main = () => {
  const args = readCommandLineArguments();
  const email = args.email;
  checkEmailHealth(email);
};

main();

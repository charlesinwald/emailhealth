import { readCommandLineArguments } from "./utils";

const checkEmailHealth = async (email: string) => {
  console.log(`Checking email health for ${email}`);
  return true;
};

const main = () => {
  const args = readCommandLineArguments();
  const email = args.email;
  checkEmailHealth(email);
};

main();

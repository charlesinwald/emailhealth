import { program } from "commander";

// Ensure the email is a valid email address with Regex
function validateEmail(email: string) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

export const readCommandLineArguments = () => {
  program
    .argument("<email>", "The email to check", (email) => {
      try {
        if (!validateEmail(email)) {
          throw new Error("Invalid email");
        }
        return email;
      } catch (error) {
        console.error("Invalid email");
        process.exit(1);
      }
    })
    .parse(process.argv);

  const opts = program.opts();
  const [positionalEmail] = program.args;
  return { email: opts.email ?? positionalEmail };
};

export const parseNestedObject = (obj: any) => {
  return JSON.stringify(obj, null, 2);
};
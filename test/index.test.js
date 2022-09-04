const process = require("process");
const cp = require("child_process");

const {
  generateReadmeFromConfig,
  isPathtoRelativeMdFile,
} = require("../generate-github-skills-readme-from-lab-config");

test("generate readme", async () => {
  const readme = await generateReadmeFromConfig(
    "test/config.yml",
    "test/course-details.md",
    "test/out/readme.md"
  );

  expect(readme).toMatchSnapshot();
});



// shows how the runner will run a javascript action with env / stdout protocol
test("test runs", () => {
  process.env["INPUT_CONFIG-FILE"] = "test/config.yml";
  process.env["INPUT_COURSE-DETAILS-FILE"] = "test/course-details.md";
  process.env["INPUT_README-FILE"] = "test/out/readme.md";
  process.env["INPUT_INLINE-MARKDOWN-LINKS"] = "false";
  const result = cp.execSync(`node index.js`, { env: process.env }).toString();
  console.log(result);
});

describe("Addon", () => {
  describe("Files & Inline links", () => {
    test("relative file logic", () => {
      expect(isPathtoRelativeMdFile('./steps/0.md')).toBe(true)
      expect(isPathtoRelativeMdFile('steps/0.md')).toBe(true)
      expect(isPathtoRelativeMdFile('https://www.google.com/steps/0.md')).toBe(false)
      expect(isPathtoRelativeMdFile('https://www.google.com')).toBe(false)
    })

    test("generate readme with inline files", async () => {
      const readme = await generateReadmeFromConfig(
        "test/config-with-files.yml",
        "test/course-details.md",
        "test/out/readme-with-files-no-inline-links.md"
      );
    
      expect(readme).toMatchSnapshot();
    });
    
    test("generate readme with inline files - inline all links options", async () => {
      const readme = await generateReadmeFromConfig(
        "test/config-with-files.yml",
        "test/course-details.md",
        "test/out/readme-with-files-inline-links.md",
        {
          inlineMDlinks: true,
        }
      );
    
      expect(readme).toMatchSnapshot();
    });

    describe("test runs", () => {
      test("with files with inline links", () => {
        process.env["INPUT_CONFIG-FILE"] = "test/config-with-files.yml";
        process.env["INPUT_COURSE-DETAILS-FILE"] = "test/course-details.md";
        process.env["INPUT_README-FILE"] = "test/out/readme-with-files-inline-links.md";
        process.env["INPUT_INLINE-MARKDOWN-LINKS"] = "true";
        const result = cp
          .execSync(`node index.js`, { env: process.env })
          .toString();
        console.log(result);
      });
  
      test("with files no inline links", () => {
        process.env["INPUT_CONFIG-FILE"] = "test/config-with-files.yml";
        process.env["INPUT_COURSE-DETAILS-FILE"] = "test/course-details.md";
        process.env["INPUT_README-FILE"] = "test/out/readme-with-files-no-inline-links.md";
        process.env["INPUT_INLINE-MARKDOWN-LINKS"] = "false";
        const result = cp
          .execSync(`node index.js`, { env: process.env })
          .toString();
        console.log(result);
      });
    })
  });
});

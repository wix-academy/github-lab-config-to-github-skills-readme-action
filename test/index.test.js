const process = require("process");
const cp = require("child_process");
const { Octokit } = require("octokit");

const itif = (condition) => condition ? it : it.skip;
const itSkipInCI = itif(!process.env['CI'])

const describeif = (condition) => condition ? describe : describe.skip;
const describeSkipInCI = describeif(!process.env['CI'])

const {
  generateReadmeFromConfig,
  isPathtoRelativeMdFile,
  extractYTVidfromUrl
} = require("../generate-github-skills-readme-from-lab-config");

test("generate readme", async () => {
  const readme = await generateReadmeFromConfig(
    "test/config.yml",
    "test/course-details.md",
    "test/out/readme.md"
  );

  const readmeWithRoot = await generateReadmeFromConfig(
    "config.yml",
    "course-details.md",
    "out/readme.md",
    "test/",
  );

  expect(readme).toEqual(readmeWithRoot);
  expect(readme).toMatchSnapshot();
});

test('generate readme with metadata', async () => {
  const readmeWithMetadata = await generateReadmeFromConfig(
    "config-metadata.yml",
    "course-details.md",
    "out/readme-metadata.md",
    "test/",
  );

  expect(readmeWithMetadata).toMatchSnapshot(); 
})

// For running this test you should set GITHUB_TOKEN ENV Variable on your machine/CI e.g., in ~/.zshrc
test('generate readme with course', async () => {
  process.env.GITHUB_SERVER_URL = 'https://github.com'
  process.env.GITHUB_REPOSITORY_OWNER = 'wix-academy'
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const readmeWithCourse = await generateReadmeFromConfig(
    "config-with-course.yml",
    "course-details.md",
    "out/readme-with-course.md",
    "test/",
    octokit
  );

  expect(readmeWithCourse).toMatchSnapshot(); 
})

test('extractYTVidfromUrl', () => {
  expect(extractYTVidfromUrl('https://www.youtube.com/embed/ISAplsTsIOE')).toBe('ISAplsTsIOE')
  expect(extractYTVidfromUrl('https://www.youtube.com/embed/ISAplsTsIOE/')).toBe('ISAplsTsIOE')
  expect(extractYTVidfromUrl('https://youtube.com/embed/ISAplsTsIOE')).toBe('ISAplsTsIOE')
  expect(extractYTVidfromUrl('http://youtube.com/embed/ISAplsTsIOE/')).toBe('ISAplsTsIOE')
  expect(extractYTVidfromUrl('https://youtu.be/gal01wQlHzo')).toBeFalsy()
})

// shows how the runner will run a javascript action with env / stdout protocol
itSkipInCI("test runs", () => {
  process.env["INPUT_CONFIG-FILE"] = "test/config.yml";
  process.env["INPUT_COURSE-DETAILS-FILE"] = "test/course-details.md";
  process.env["INPUT_README-FILE"] = "test/out/readme.md";
  process.env["INPUT_INLINE-MARKDOWN-LINKS"] = "false";
  process.env["INPUT_ROOT-PATH"] = "./"; 
  process.env["GITHUB_ACTION"] = '1';
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
      expect(isPathtoRelativeMdFile('steps/fdsfsd/fdsfsd/fdsf.txt')).toBe(false) 
      expect(isPathtoRelativeMdFile('steps/fdsfsd/fdsfsd/fdsf.md')).toBe(true) 
    })

    test("generate readme with inline files", async () => {
      const readme = await generateReadmeFromConfig(
        "config-with-files.yml",
        "course-details.md",
        "out/readme-with-files-no-inline-links.md",
        "test/"
      );
    
      expect(readme).toMatchSnapshot();
    });
    
    test("generate readme with inline files - inline all links options", async () => {
      const readme = await generateReadmeFromConfig(
        "config-with-files.yml",
        "course-details.md",
        "out/readme-with-files-inline-links.md",
        "test",
        {
          inlineMDlinks: true,
        }
      );
    
      expect(readme).toMatchSnapshot();
    });

    describeSkipInCI("test runs", () => {
      beforeEach(()=>{
        process.env["INPUT_CONFIG-FILE"] = "config-with-files.yml";
        process.env["INPUT_COURSE-DETAILS-FILE"] = "course-details.md";
        process.env["INPUT_ROOT-PATH"] = "./test";
        process.env["GITHUB_ACTION"] = '1';
      })
      test("with files with inline links", () => {
        process.env["INPUT_README-FILE"] = "out/readme-with-files-inline-links.md";
        process.env["INPUT_INLINE-MARKDOWN-LINKS"] = "true"; 
        
        const result = cp
          .execSync(`node index.js`, { env: process.env })
          .toString();
        console.log(result);
      });
  
      test("with files no inline links", () => {
        process.env["INPUT_README-FILE"] = "out/readme-with-files-no-inline-links.md";
        process.env["INPUT_INLINE-MARKDOWN-LINKS"] = "false";
        
        const result = cp
          .execSync(`node index.js`, { env: process.env })
          .toString();
        console.log(result);
      });
    })
  });
});

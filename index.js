const core = require('@actions/core');
const { generateReadmeFromConfig } = require('./generate-github-skills-readme-from-lab-config');

async function run() {
  try {
    const configPath = core.getInput('config-file');
    const courseDetailsPath = core.getInput('course-details-file');
    core.info(`Generating README.md from ${configPath}, ${courseDetailsPath} ...`);

    const readmeContent = await generateReadmeFromConfig(configPath, courseDetailsPath, core.error);

    core.setOutput('readme', readmeContent);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();

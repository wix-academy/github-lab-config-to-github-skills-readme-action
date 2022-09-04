const core = require('@actions/core');
const { generateReadmeFromConfig } = require('./generate-github-skills-readme-from-lab-config');

async function run() {
  try {
    const configPath = core.getInput('config-file');
    const courseDetailsPath = core.getInput('course-details-file');
    const readmePath = core.getInput('readme-file');
    const inlineMDlinks = core.getBooleanInput('inline-markdown-links');

    core.info(`Generating ${readmePath} from ${configPath}, ${courseDetailsPath} ...`);

    const readmeContent = await generateReadmeFromConfig(configPath, courseDetailsPath, readmePath, core.error, {
      inlineMDlinks
    });

    core.setOutput('readme', readmeContent);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();

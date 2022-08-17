const process = require('process');
const cp = require('child_process');

const { generateReadmeFromConfig } = require('../generate-github-skills-readme-from-lab-config')

test('generate readme', async () => {
  const readme = await generateReadmeFromConfig('test/config.yml', 'test/course-details.md', 'test/out/readme.md');

  expect(readme).toMatchSnapshot();
});

// shows how the runner will run a javascript action with env / stdout protocol
test('test runs', () => {
  process.env['INPUT_CONFIG-FILE'] = 'test/config.yml';
  process.env['INPUT_COURSE-DETAILS-FILE'] = 'test/course-details.md';
  process.env['INPUT_README-FILE'] = 'test/out/readme.md';
  const result = cp.execSync(`node index.js`, { env: process.env}).toString();
  console.log(result);
})

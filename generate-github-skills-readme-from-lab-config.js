const fs = require('fs').promises;
const { parse } = require('yaml');

function ytVideoMdTemplate(title, ytVideoId) {
    return `[![${title}](https://img.youtube.com/vi/${ytVideoId}/0.jpg)](https://www.youtube.com/watch?v=${ytVideoId} "${title}")`;
}

function readmeTemplate(title, description, courseDetailsFile, helpLink, helpText) {
    return `
# ${title}


${description}

## Course Details

${courseDetailsFile}

### Help

${helpLink && helpText ? `[${helpText}](${helpLink})` : `[Post on the #academy Slack channel](https://wix.slack.com/archives/CE2AFKXEK)`}

## Steps
    
`;
}

function stepTemplate(index, stepsCount, title, description, video, link) {
    const stepTitle = `${(index + 1).toString().padStart(2, '0')} - ${title}`;
    const ytVideoId = video && video.replace('https://youtube.com/embed/', '');

    return `
<details id=${index === stepsCount - 1 ? 'X' : index} ${index === 0 ? 'open' : ''}>
<summary><h2>${stepTitle}</h2></summary>

${description}

${ytVideoId ?
            `
#### Watch the video

${ytVideoMdTemplate(title, ytVideoId)} 
` : ''}

${link ? `👉 [${title}](${link})` : ''}
</details>
`;
}


async function generateReadmeFromConfig(configPath='config.yml', courseDetailsPath='course-details.md', readmePath='./README.md', consoleErr = console.error) {
    const yamlFile = await fs.readFile(configPath, 'utf8');
    const labConfig = parse(yamlFile);

    const { title, description, helpText, helpLink } = labConfig;

    const courseDetailsFile = await fs.readFile(courseDetailsPath, 'utf8');
    let _readmeTemplate = readmeTemplate(title, description, courseDetailsFile, helpLink, helpText);

    try {
        labConfig.steps.forEach((step, index) => {
            const { title, description, video, link } = step;

            const mdTemplate = stepTemplate(index, labConfig.steps.length, title, description, video, link)

            _readmeTemplate = _readmeTemplate.concat(mdTemplate);
        });

        await fs.writeFile(readmePath, _readmeTemplate)
        return _readmeTemplate;
    } catch (error) {
        consoleErr('README.md GitHub Skill format file creating error: ', error);
        throw error;
    }
}



module.exports = {
 generateReadmeFromConfig    
}

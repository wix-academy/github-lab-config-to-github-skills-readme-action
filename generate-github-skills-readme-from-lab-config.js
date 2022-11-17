const fs = require('fs').promises;
const path = require('path');
const { parse } = require('yaml');

function ytVideoMdTemplate(title, ytVideoId) {
    return `[![${title}](https://img.youtube.com/vi/${ytVideoId}/0.jpg)](https://www.youtube.com/watch?v=${ytVideoId} "${title}")`;
}

function readmeTemplate(title, description, courseDetailsFile, helpUrl, helpText) {
    return `
# ${title}


${description}

## Course Details

${courseDetailsFile}

### Help

${helpUrl && helpText ? `[${helpText}](${helpUrl})` : `[Post on the #academy Slack channel](https://wix.slack.com/archives/CE2AFKXEK)`}

## Steps
    
`;
}

function extractYTVidfromUrl(videoUrl) {
    return videoUrl && videoUrl.includes('youtube.com/embed/') && videoUrl.split('embed/')[1].split('/')[0]
}

function stepTemplate(index, stepsCount, title, description, video, link, {
    mdFileContent,
    noLink
}) {
    const stepTitle = `${(index + 1).toString().padStart(2, '0')} - ${title}`;
    const ytVideoId = extractYTVidfromUrl(video);

    return `
<details id=${index === stepsCount - 1 ? 'X' : index} ${index === 0 ? 'open' : ''}>
<summary><h2>${stepTitle}</h2></summary>

${description}

${ytVideoId ?
            `
#### Watch the video

${ytVideoMdTemplate(title, ytVideoId)} 
` : ''}
${mdFileContent ? mdFileContent+'\n' : ''}
${!noLink && link ? `👉 [${title}](${link})` : ''}
</details>
`;
}

function isPathtoRelativeMdFile(path) {
    return path.endsWith('.md') && !path.startsWith('https://') && RegExp('(./)?[a-zA-Z0-9/]*.md').test(path)
}

async function fetchCourseDetails(course, {octokit, reporter}) {
    const [owner, repo] = course.split('/');
    owner ||= process.env.GITHUB_REPOSITORY_OWNER;
    
    try {
        const courseConfigResponse = await octokit.rest.repos.getContent({
            owner,
            repo,
            path: 'config.yml'
        });
        
        const courseConfig =  parse(Buffer.from(courseConfigResponse.data.content, 'base64').toString());

        const link = `${process.env.GITHUB_SERVER_URL}/${owner}/${repo}`;
        const title = courseConfig.title;
        const description = courseConfig.description;
        
        return { link, title, description };
    } catch (error) {
        reporter.info(`failed to fetch course details for ${course}`)
        reporter.error(error);
        return null;
    }
}

async function generateReadmeFromConfig(
    configPath='config.yml', 
    courseDetailsPath='course-details.md', 
    readmePath='./README.md',
    rootPath='./',
    octokit = null,
    reporter = console, 
    // ADDON: Options
    {
        inlineMDlinks
    } = {}) {
    configPath = path.resolve(rootPath, configPath);
    courseDetailsPath = path.resolve(rootPath, courseDetailsPath);
    readmePath = path.resolve(rootPath, readmePath);

    const yamlFile = await fs.readFile(configPath, 'utf8');
    const labConfig = parse(yamlFile);

    const { title, description, helpText, helpUrl } = labConfig;

    const courseDetailsFile = await fs.readFile(courseDetailsPath, 'utf8');
    let _readmeTemplate = readmeTemplate(title, description, courseDetailsFile, helpUrl, helpText);

    let labConfigSteps = labConfig.steps; 
    // ADDON: files & inline md links
    labConfigSteps = await Promise.all(labConfigSteps.map(async (step, index) => {
        const { link, file, course, inlineMDlink } = step;
        
        let mdFileContent = null;
        let courseStep = false;
        if (course) {
            const courseDetails = await fetchCourseDetails(course, { octokit, reporter });
            if (courseDetails) {
                const { link: courseLink, title: courseTitle, description: courseDescription } = courseDetails;
                
                step.link ||= courseLink;
                step.title ||= courseTitle;
                step.description ||= courseDescription;

                courseStep = true;
            }
        } else {    
            if (((inlineMDlinks || inlineMDlink) && (link && isPathtoRelativeMdFile(link))) || file) {
                const filePath = file || (inlineMDlinks || inlineMDlink) && link;
                mdFileContent = await fs.readFile(path.resolve(rootPath, filePath), 'utf8');
            }
        }

        // TODO: YouTube thumbnail fetcher

        return {...step, index, mdFileContent, noLink: (inlineMDlinks || inlineMDlink)}
    }))
    labConfigSteps.sort((a, b) => a.index - b.index);

    try {
        labConfigSteps.forEach((step, index) => {
            const { title, description, video, link, ...addonProps } = step;
            
            const mdTemplate = stepTemplate(index, labConfigSteps.length, title, description, video, link, 
            // ADDON: Properties
            {
                ...addonProps,
                inlineMDlinks,
            })

            _readmeTemplate = _readmeTemplate.concat(mdTemplate);
        });

        await fs.writeFile(readmePath, _readmeTemplate)
        return _readmeTemplate;
    } catch (error) {
        reporter.error('README.md GitHub Skill format file creating error: ', error);
        throw error;
    }

}



module.exports = {
 generateReadmeFromConfig,
 isPathtoRelativeMdFile,
 extractYTVidfromUrl,
 readmeTemplate,
 stepTemplate
}

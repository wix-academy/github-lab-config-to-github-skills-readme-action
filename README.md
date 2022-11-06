# Migrate from GitHub Lab config.yml to GitHub Skill README

Use this action to continue maintaining or one time migrate your GitHub Lab config.yml (+ course-details.md) into one organized README.md file 
sturctured by [GitHub skills](https://skills.github.com/quickstart#writing-your-readme)

## How to use

Add to your GitHub actions workflow steps or create a new one you can follow our [template](https://github.com/wix-academy/.github/blob/master/workflow-templates/transform-lab-config.yml)

```yaml
      - name: Generate README
        uses: wix-academy/github-lab-config-to-github-skills-readme-action@v3.2
        with:
          config-file: 'config.yml'
          course-details-file: 'course-details.md'
          readme-file: 'README.md'
          
      - uses: stefanzweifel/git-auto-commit-action@v4.14.1
        with:
          commit_message: "generate README.md from config.yml + course-details.md"
```

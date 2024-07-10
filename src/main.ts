import * as core from '@actions/core'
import { getOctokit, context } from '@actions/github'
import path from 'path'
import { get } from './tool'
import {ghReleaseTagExists, listCrates} from './utils'

async function run(): Promise<void> {
    try {
        const mode = core.getInput('mode')
        const root = path.join(process.cwd(), core.getInput('cwd'))
        const github = getOctokit(core.getInput('token'))
        if (mode === 'get') {
            const crates = await listCrates(root)
            const projects = await Promise.all(crates.map(v => get(path.join(root, v, "Cargo.toml"), v)));
            const isSingleProject = projects.length === 1;
            const newProjects = projects.filter(v => v.isNew);
            const isPre = projects.find(v => v.isPre);
            if (newProjects.length > 0) {
                let tag;
                if (isSingleProject) {
                    tag = newProjects[0].version;
                    core.setOutput("tag", tag);
                    core.setOutput("name", newProjects[0].name + " release " + newProjects[0].version);
                    core.setOutput("body", "[Link to crates.io](https://crates.io/crates/" + newProjects[0].name + ")");
                } else {
                    tag = newProjects.map(v => v.pathname + "-" + v.version).join("+");
                    core.setOutput("tag", tag);
                    core.setOutput("name", newProjects[0].name + " release " + newProjects[0].version);
                    const body = projects.map(v => `${v.name} (${v.pathname}) v${v.version} - [Link to crates.io](https://crates.io/crates/${v.name})`).join("\n")
                    core.setOutput("body", body);
                }
                if (await ghReleaseTagExists(tag, github)) {
                    core.setOutput("isnew", false);
                    return;
                }
            }
            core.setOutput("isnew", newProjects.length > 0);
            core.setOutput("ispre", isPre);
        } else if (mode === 'publish') {
        }
    } catch (error) {
        if (error instanceof Error) core.setFailed(error.message)
    }
}

run()

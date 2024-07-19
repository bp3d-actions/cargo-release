import * as core from '@actions/core'
import * as exec from '@actions/exec'
import { getOctokit } from '@actions/github'
import path from 'path'
import {loadWorkspace} from './tool'
import {ghReleaseTagExists} from './utils'

async function run(): Promise<void> {
    try {
        const mode = core.getInput('mode')
        const root = path.join(process.cwd(), core.getInput('cwd'))
        const github = getOctokit(core.getInput('token'))
        if (mode === 'get') {
            const workspace = await loadWorkspace(root);
            const release = workspace.release;
            if (release.isNew && await ghReleaseTagExists(release.tag, github)) {
                release.isNew = false;
            }
            core.setOutput("tag", release.tag);
            core.setOutput("name", release.name);
            core.setOutput("body", release.body);
            core.setOutput("isnew", release.isNew);
            core.setOutput("ispre", release.isPre);
        } else if (mode === 'publish') {
            const workspace = await loadWorkspace(root);
            for (const project of workspace.projects) {
                if (project.isNew) {
                    await exec.exec("cargo publish", undefined, {cwd: path.join(root, project.pathname)});
                }
            }
        }
    } catch (error) {
        if (error instanceof Error) core.setFailed(error.message)
    }
}

run()

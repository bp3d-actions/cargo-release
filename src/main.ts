import * as core from '@actions/core'
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
            const release = await loadWorkspace(root);
            if (release.isNew && await ghReleaseTagExists(release.tag, github)) {
                release.isNew = false;
            }
            core.setOutput("tag", release.tag);
            core.setOutput("name", release.name);
            core.setOutput("body", release.body);
            core.setOutput("isnew", release.isNew);
            core.setOutput("ispre", release.isPre);
        } else if (mode === 'publish') {
        }
    } catch (error) {
        if (error instanceof Error) core.setFailed(error.message)
    }
}

run()

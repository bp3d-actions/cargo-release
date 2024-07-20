import {
    getLatestCratesIoVersion, listCrates,
    loadCargo,
    parseVersion
} from './utils'
import path from "path";

export interface Project {
    version: string
    name: string
    isNew: boolean
    isPre: boolean
    pathname: string
    publish: boolean
}

export async function get(path1: string, pathname: string): Promise<Project> {
    const project = await loadCargo(path1)
    const pversion = parseVersion(project.version)
    const latest = await getLatestCratesIoVersion(project.name)
    let isNew;
    if (!latest)
        isNew = true;
    else
        isNew = pversion.compare(latest) === 1;
    return {
        name: project.name,
        version: project.version,
        pathname: pathname,
        isNew,
        isPre: pversion.prerelease.length > 0,
        publish: project.publish
    }
}

export interface Release {
    tag: string,
    name: string,
    body: string,
    isNew: boolean,
    isPre: boolean,
}

export interface Workspace {
    release: Release,
    projects: Project[]
}

export async function loadWorkspace(root: string): Promise<Workspace> {
    const crates = await listCrates(root)
    let projects = await Promise.all(crates.map(v => get(path.join(root, v, "Cargo.toml"), v)));
    projects = projects.filter(v => v.publish);
    const isSingleProject = projects.length === 1;
    const newProjects = projects.filter(v => v.isNew);
    const isPre = projects.some(v => v.isPre);
    let tag = "";
    let name = "";
    let body = "";
    if (newProjects.length > 0) {
        if (isSingleProject) {
            tag = newProjects[0].version;
            name = newProjects[0].name + " release " + newProjects[0].version;
            body = "[Link to crates.io](https://crates.io/crates/" + newProjects[0].name + ")"
        } else {
            tag = newProjects.map(v => v.pathname + "-" + v.version).join("+");
            name = newProjects[0].name + " release " + newProjects[0].version;
            body = projects.map(v => `${v.name} (${v.pathname}) v${v.version}${v.isNew ? " (new)" : ""} - [Link to crates.io](https://crates.io/crates/${v.name})`).join("\n");
        }
    }
    return {
        release: {
            tag: tag,
            name: name,
            body: body,
            isNew: newProjects.length > 0,
            isPre: isPre,
        },
        projects: projects
    }
}

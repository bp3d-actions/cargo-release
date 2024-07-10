import {
    getLatestCratesIoVersion,
    loadCargo,
    parseVersion
} from './utils'

export interface Project {
    version: string
    name: string
    isNew: boolean
    isPre: boolean
    pathname: string
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
        isPre: pversion.prerelease.length > 0
    }
}

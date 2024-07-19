import { expect, test } from '@jest/globals'
import { loadCargo } from '../src/utils'
import {loadWorkspace} from "../src/tool";

test('load_cargo_simple_1', async () => {
    const project = await loadCargo('./tests/sample_cargo.toml')
    expect(project.name).toEqual('time-tz')
    expect(project.version).toEqual('1.0.2')
    expect(project.versionLineId).toEqual(3)
})

test('load_workspace_sample_1', async () => {
    const project = await loadWorkspace('./tests/workspace')
    expect(project.isPre).toEqual(true);
    expect(project.isNew).toEqual(true);
    expect(project.tag).toEqual("core-1.0.0-rc.1.0.0+tracing-1.0.0-rc.2.1.0");
    expect(project.name).toEqual("bp3d-debug release 1.0.0-rc.1.0.0");
    expect(project.body).toEqual("bp3d-debug (core) v1.0.0-rc.1.0.0 (new) - [Link to crates.io](https://crates.io/crates/bp3d-debug)\n" +
        "bp3d-tracing (tracing) v1.0.0-rc.2.1.0 (new) - [Link to crates.io](https://crates.io/crates/bp3d-tracing)");
})

test('load_workspace_sample_2', async () => {
    const project = await loadWorkspace('./tests/workspace2')
    expect(project.isPre).toEqual(false);
    expect(project.isNew).toEqual(false);
    expect(project.tag).toEqual("");
    expect(project.name).toEqual("");
    expect(project.body).toEqual("");
})

test('load_workspace_sample_3', async () => {
    const project = await loadWorkspace('./tests/workspace3')
    expect(project.isPre).toEqual(false);
    expect(project.isNew).toEqual(true);
    expect(project.tag).toEqual("3.0.0");
    expect(project.name).toEqual("time-tz release 3.0.0");
    expect(project.body).toEqual("[Link to crates.io](https://crates.io/crates/time-tz)");
})

test('load_workspace_sample_4', async () => {
    const project = await loadWorkspace('./tests/workspace4')
    expect(project.isPre).toEqual(true);
    expect(project.isNew).toEqual(true);
    expect(project.tag).toEqual("core-1.0.0-rc.1.0.0");
    expect(project.name).toEqual("bp3d-debug release 1.0.0-rc.1.0.0");
    expect(project.body).toEqual("bp3d-debug (core) v1.0.0-rc.1.0.0 (new) - [Link to crates.io](https://crates.io/crates/bp3d-debug)\n" +
        "bp3d-tracing (tracing) v1.0.0-alpha.2.0.0 - [Link to crates.io](https://crates.io/crates/bp3d-tracing)");
})

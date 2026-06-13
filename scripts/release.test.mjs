import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assertCleanStatus,
  assertMainBranch,
  assertValidVersion,
  formatTagName,
} from "./release.mjs";

describe("release helpers", () => {
  it("formats package versions as v-prefixed tag names", () => {
    assert.equal(formatTagName("0.1.0"), "v0.1.0");
    assert.equal(formatTagName("1.2.3-beta.1"), "v1.2.3-beta.1");
  });

  it("rejects missing or malformed versions", () => {
    assert.doesNotThrow(() => assertValidVersion("1.2.3"));
    assert.doesNotThrow(() => assertValidVersion("1.2.3-rc.0"));

    assert.throws(() => assertValidVersion(""), /Invalid package version/);
    assert.throws(() => assertValidVersion("1.2"), /Invalid package version/);
    assert.throws(
      () => assertValidVersion("version"),
      /Invalid package version/,
    );
  });

  it("requires the main branch", () => {
    assert.doesNotThrow(() => assertMainBranch("main"));

    assert.throws(
      () => assertMainBranch("feature/release"),
      /Release must run from main/,
    );
    assert.throws(() => assertMainBranch(""), /Release must run from main/);
  });

  it("requires a clean git status", () => {
    assert.doesNotThrow(() => assertCleanStatus(""));

    assert.throws(
      () => assertCleanStatus(" M package.json"),
      /working tree must be clean/,
    );
  });
});

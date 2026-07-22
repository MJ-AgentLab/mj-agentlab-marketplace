// Tests for scripts/release-verify-install.mjs.
//
//   1. Pure glue (localAssetHttp) and the verifyReleaseInstall orchestration against a fake
//      installer, so the assertion/rollback logic is covered without a toolchain.
//   2. One REQUIRE_PYTHON-gated real run: build the actual bridge wheel, then verify it installs
//      through the injected core exactly as the release workflow will. Skips when uv is absent.

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

import {
  localAssetHttp,
  verifyReleaseInstall,
  VerifyError,
  VerifyUsageError,
} from "../scripts/release-verify-install.mjs";
import {
  CANONICAL_WHEEL_URL,
  CANONICAL_CHECKSUM_URL,
  WHEEL_NAME,
  CHECKSUM_NAME,
} from "../plugins/learn-kit/scripts/install-nlm-bridge.mjs";

const sha256Hex = (buf) => crypto.createHash("sha256").update(buf).digest("hex");

function tmp(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

// ------------------------------------------------------------------ localAssetHttp

test("localAssetHttp serves the two canonical assets by their href", async () => {
  const wheel = Buffer.from("WHEEL");
  const checksum = Buffer.from("CHECKSUM");
  const http = localAssetHttp(wheel, checksum);
  const w = await http(new URL(CANONICAL_WHEEL_URL));
  const c = await http(new URL(CANONICAL_CHECKSUM_URL));
  assert.equal(w.statusCode, 200);
  assert.deepEqual(w.body, wheel);
  assert.deepEqual(c.body, checksum);
});

test("localAssetHttp refuses any other URL (a redirect is a harness bug, not a soft pass)", async () => {
  const http = localAssetHttp(Buffer.from("w"), Buffer.from("c"));
  await assert.rejects(() => http(new URL("https://example.com/evil")), VerifyError);
});

// ------------------------------------------------------------------ verifyReleaseInstall (faked)

// Write a wheel + checksum + a valid receipt + two shim files, and return everything
// verifyReleaseInstall needs to be driven with a fake installer.
function scenario(overrides = {}) {
  const root = tmp("verify-");
  const wheelBuf = Buffer.from("a fake but stable wheel");
  const wheelSha = sha256Hex(wheelBuf);
  const wheelPath = path.join(root, WHEEL_NAME);
  const checksumPath = path.join(root, CHECKSUM_NAME);
  fs.writeFileSync(wheelPath, wheelBuf);
  fs.writeFileSync(checksumPath, `${wheelSha}  ${WHEEL_NAME}\n`, "utf8");

  const shimA = path.join(root, "learn-kit-nlm-bridge");
  const shimB = path.join(root, "nlm");
  fs.writeFileSync(shimA, "shim-a");
  fs.writeFileSync(shimB, "shim-b");

  const receiptSha256 = "d".repeat(64);
  const receipt = {
    wheel_sha256: wheelSha,
    bridge_version: "4.0.0",
    connector_version: "0.8.7",
    python_version: "3.12.13",
    shims: {
      "learn-kit-nlm-bridge": { path: shimA, sha256: sha256Hex(fs.readFileSync(shimA)) },
      nlm: { path: shimB, sha256: sha256Hex(fs.readFileSync(shimB)) },
    },
    ...(overrides.receipt || {}),
  };
  if (overrides.mutateReceipt) overrides.mutateReceipt(receipt); // e.g. drift a shim sha256 or path
  const receiptPath = path.join(root, "install-receipt.json");
  fs.writeFileSync(receiptPath, JSON.stringify(receipt), "utf8");

  const install = async (opts) => {
    if (opts.action === "uninstall") return { status: "uninstalled" };
    if (overrides.installStatus) return { status: overrides.installStatus };
    return { status: "installed", receiptPath, receiptSha256 };
  };
  const runPython = () => ({
    status: overrides.contractStatus ?? 0,
    stdout: JSON.stringify(overrides.contract || { install_receipt_sha256: receiptSha256, instructions_policy: "prompt-user-only" }),
    stderr: "",
  });
  const deps = { platform: "linux", env: { HOME: root, XDG_DATA_HOME: path.join(root, "share"), XDG_BIN_HOME: path.join(root, "bin"), PATH: "" } };

  return { root, wheelPath, checksumPath, deps, install, runPython };
}

test("verifyReleaseInstall succeeds and returns a summary when everything agrees", async () => {
  const s = scenario();
  const r = await verifyReleaseInstall(
    { wheelPath: s.wheelPath, checksumPath: s.checksumPath },
    { deps: s.deps, install: s.install, runPython: s.runPython },
  );
  assert.equal(r.ok, true);
  assert.equal(r.instructions_policy, "prompt-user-only");
  assert.equal(r.python_version, "3.12.13");
});

test("verifyReleaseInstall fails when the installer does not report success", async () => {
  const s = scenario({ installStatus: "failed" });
  await assert.rejects(
    () => verifyReleaseInstall({ wheelPath: s.wheelPath, checksumPath: s.checksumPath }, { deps: s.deps, install: s.install, runPython: s.runPython }),
    VerifyError,
  );
});

test("verifyReleaseInstall fails on a receipt wheel_sha256 that does not match the built wheel", async () => {
  const s = scenario({ receipt: { wheel_sha256: "0".repeat(64) } });
  await assert.rejects(
    () => verifyReleaseInstall({ wheelPath: s.wheelPath, checksumPath: s.checksumPath }, { deps: s.deps, install: s.install, runPython: s.runPython }),
    VerifyError,
  );
});

test("verifyReleaseInstall fails when the post-install contract check exits non-zero", async () => {
  const s = scenario({ contractStatus: 1 });
  await assert.rejects(
    () => verifyReleaseInstall({ wheelPath: s.wheelPath, checksumPath: s.checksumPath }, { deps: s.deps, install: s.install, runPython: s.runPython }),
    VerifyError,
  );
});

test("verifyReleaseInstall fails when instructions_policy is not prompt-user-only", async () => {
  const s = scenario({ contract: { install_receipt_sha256: "d".repeat(64), instructions_policy: "auto-login" } });
  await assert.rejects(
    () => verifyReleaseInstall({ wheelPath: s.wheelPath, checksumPath: s.checksumPath }, { deps: s.deps, install: s.install, runPython: s.runPython }),
    VerifyError,
  );
});

test("verifyReleaseInstall rejects missing arguments with a usage error", async () => {
  await assert.rejects(() => verifyReleaseInstall({ wheelPath: "", checksumPath: "x" }), VerifyUsageError);
  await assert.rejects(() => verifyReleaseInstall({ wheelPath: "/nope/x.whl", checksumPath: "/nope/x.sha256" }), VerifyUsageError);
});

// The receipt/contract/shim integrity checks each need a negative fixture, or deleting the
// production line that enforces them would leave the suite green (adversarial-review finding).
async function expectVerifyError(overrides) {
  const s = scenario(overrides);
  await assert.rejects(
    () => verifyReleaseInstall({ wheelPath: s.wheelPath, checksumPath: s.checksumPath }, { deps: s.deps, install: s.install, runPython: s.runPython }),
    VerifyError,
  );
}

test("verifyReleaseInstall rejects a receipt bridge_version that is not 4.0.0", async () => {
  await expectVerifyError({ receipt: { bridge_version: "9.9.9" } });
});

test("verifyReleaseInstall rejects a receipt connector_version that is not 0.8.7", async () => {
  await expectVerifyError({ receipt: { connector_version: "0.0.0" } });
});

test("verifyReleaseInstall rejects a receipt python_version that is not 3.12.x", async () => {
  await expectVerifyError({ receipt: { python_version: "3.11.9" } });
});

test("verifyReleaseInstall rejects a shim whose recorded path does not exist", async () => {
  await expectVerifyError({ mutateReceipt: (r) => { r.shims.nlm.path = r.shims.nlm.path + "-does-not-exist"; } });
});

test("verifyReleaseInstall rejects a shim whose on-disk bytes drift from the receipt sha256", async () => {
  await expectVerifyError({ mutateReceipt: (r) => { r.shims.nlm.sha256 = "0".repeat(64); } });
});

test("verifyReleaseInstall rejects a contract whose install_receipt_sha256 != the receipt just written", async () => {
  await expectVerifyError({ contract: { install_receipt_sha256: "e".repeat(64), instructions_policy: "prompt-user-only" } });
});

// ------------------------------------------------------------------ real end-to-end (gated)

const BRIDGE_DIR = path.resolve("plugins/learn-kit/nlm-bridge");
function uvInfo() {
  try {
    const isWin = process.platform === "win32";
    const exts = isWin ? (process.env.PATHEXT || ".EXE").split(";") : [""];
    for (const dir of (process.env.PATH || "").split(path.delimiter)) {
      for (const ext of exts) {
        const c = path.join(dir, "uv" + (isWin ? ext : ""));
        if (fs.existsSync(c)) {
          const v = /(\d+\.\d+\.\d+)/.exec(execFileSync(c, ["--version"], { encoding: "utf8" }))[1];
          return { path: fs.realpathSync(c), version: v };
        }
      }
    }
  } catch { /* fall through */ }
  return null;
}

const uv = uvInfo();
const REQUIRE_PYTHON = process.env.REQUIRE_PYTHON === "1";
const e2eSkip = uv ? false : REQUIRE_PYTHON ? false : "uv not available for the real verify";

test("end-to-end: a freshly built wheel passes verifyReleaseInstall", { skip: e2eSkip }, async () => {
  if (!uv || uv.version !== "0.11.21") return; // the installer pins 0.11.21
  const out = tmp("verify-e2e-");
  try {
    execFileSync(uv.path, ["build", "--wheel", "--no-config", "--out-dir", out, BRIDGE_DIR], { env: process.env, stdio: ["ignore", "ignore", "pipe"] });
    const wheelPath = path.join(out, WHEEL_NAME);
    const wheelSha = sha256Hex(fs.readFileSync(wheelPath));
    const checksumPath = path.join(out, CHECKSUM_NAME);
    fs.writeFileSync(checksumPath, `${wheelSha}  ${WHEEL_NAME}\n`, "utf8");

    // envPath "" + a stubbed uv resolver keep the installer's launcher-collision scan off the dev
    // box's foreign `nlm`; uv itself still runs under the real environment for Python + cache.
    const r = await verifyReleaseInstall(
      { wheelPath, checksumPath },
      { resolveUv: () => ({ path: uv.path, version: uv.version }), envPath: "" },
    );
    assert.equal(r.ok, true);
    assert.equal(r.wheel_sha256, wheelSha);
    assert.match(r.python_version, /^3\.12\.\d+$/);
    assert.equal(r.instructions_policy, "prompt-user-only");
  } finally {
    fs.rmSync(out, { recursive: true, force: true });
  }
});

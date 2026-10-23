"""Exercise backup pipeline guards with disposable command stubs, no real accounts."""

import os
import subprocess
from pathlib import Path

import pytest

OPS = Path(__file__).resolve().parents[2] / "ops" / "backup"


@pytest.fixture
def backup_env(tmp_path):
    binaries = tmp_path / "bin"
    binaries.mkdir()

    def tool(name, content):
        file = binaries / name
        file.write_text("#!/usr/bin/env bash\nset -euo pipefail\n" + content)
        file.chmod(0o755)

    tool("pg_dump", 'if [[ "${STUB_DUMP_FAIL:-0}" == 1 ]]; then exit 7; fi; printf "disposable-test-dump"\n')
    tool(
        "age",
        """if [[ "$1" == "--encrypt" ]]; then
  while [[ $# -gt 0 ]]; do if [[ "$1" == "--output" ]]; then output="$2";shift;fi;shift;done
  { printf "stub-encrypted:";cat; } > "$output"
else
  cat "${@: -1}"
fi
""",
    )
    tool("psql", 'printf "%s\\n" "${STUB_TABLES:-0}"\n')
    tool("pg_restore", "cat >/dev/null\n")
    env = {
        **os.environ,
        "PATH": str(binaries) + os.pathsep + os.environ["PATH"],
        "PGDATABASE": "disposable_source",
        "BACKUP_DIR": str(tmp_path / "backups"),
        "BACKUP_AGE_RECIPIENT": "age1-disposable-test-recipient",
    }
    return env, tmp_path


def test_backup_requires_encryption_and_failed_dump_does_not_leave_archive(backup_env):
    env, _ = backup_env
    missing = subprocess.run(
        ["bash", str(OPS / "backup.sh"), "once"], env=env | {"BACKUP_AGE_RECIPIENT": ""}, capture_output=True
    )
    assert missing.returncode != 0
    failed = subprocess.run(
        ["bash", str(OPS / "backup.sh"), "once"], env=env | {"STUB_DUMP_FAIL": "1"}, capture_output=True
    )
    assert failed.returncode != 0 and not list(Path(env["BACKUP_DIR"]).glob("*.dump.age*"))


def test_backup_checksum_and_restore_refuse_wrong_or_nonempty_target(backup_env):
    env, temp = backup_env
    result = subprocess.run(["bash", str(OPS / "backup.sh"), "once"], env=env, capture_output=True)
    assert result.returncode == 0, result.stderr
    archives = list(Path(env["BACKUP_DIR"]).glob("*.dump.age"))
    assert len(archives) == 1
    archive = archives[0]
    key = temp / "test-key.txt"
    key.write_text("disposable-stub-key")
    command = ["bash", str(OPS / "restore-test.sh"), str(archive), str(key)]
    assert subprocess.run(command, env=env, capture_output=True).returncode != 0
    assert (
        subprocess.run(
            command, env=env | {"PGDATABASE": "roleplay_restore_test", "STUB_TABLES": "2"}, capture_output=True
        ).returncode
        != 0
    )
    assert (
        subprocess.run(command, env=env | {"PGDATABASE": "roleplay_restore_test"}, capture_output=True).returncode == 0
    )
    archive.write_bytes(archive.read_bytes() + b"corruption")
    assert (
        subprocess.run(command, env=env | {"PGDATABASE": "roleplay_restore_test"}, capture_output=True).returncode != 0
    )

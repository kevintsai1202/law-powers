"""同步共用規則副本。

母本：.agents/AGENTS.md
副本：skills/<每個含 SKILL.md 的技能目錄>/references/agents-rules.md

用途：技能經 Skills CLI 全域安裝後脫離 repo，.agents/AGENTS.md 不會隨行；
故將母本同步為各技能自帶的 references/agents-rules.md（references/ 已驗證
會被 Skills CLI 一併安裝）。修改母本後必須重跑本腳本。
"""
import argparse
import sys
from pathlib import Path

# 專案根目錄（本腳本位於 scripts/ 下一層）
ROOT = Path(__file__).resolve().parent.parent
# 母本路徑：唯一權威來源
SOURCE = ROOT / ".agents" / "AGENTS.md"
# 技能根目錄：其下每個含 SKILL.md 的子目錄視為一個技能
SKILLS_DIR = ROOT / "skills"
# 副本檔頭：標示為產生物，禁止手改
HEADER = (
    "<!-- 本檔為 .agents/AGENTS.md 之同步副本（隨技能一併發布）。\n"
    "     請勿直接修改：請改母本 .agents/AGENTS.md 後執行\n"
    "     python scripts/sync_agents_rules.py 重新同步。 -->\n\n"
)


def expected_content() -> str:
    """讀取母本並組出各副本應有的完整內容（檔頭警語＋母本全文）。"""
    return HEADER + SOURCE.read_text(encoding="utf-8")


def skill_dirs() -> list[Path]:
    """列出所有技能目錄——以「含 SKILL.md」為判定，
    自然排除 legal-writing-humanizer-workspace 等非技能資料夾。"""
    return sorted(
        d for d in SKILLS_DIR.iterdir()
        if d.is_dir() and (d / "SKILL.md").exists()
    )


def main() -> int:
    """主流程：預設寫入同步；--check 僅比對一致性（供 CI／驗收用）。
    回傳值即 process exit code：0＝成功／一致，1＝發現失步副本。"""
    parser = argparse.ArgumentParser(description="同步 .agents/AGENTS.md 至各技能 references/agents-rules.md")
    parser.add_argument("--check", action="store_true", help="僅檢查一致性，不寫入")
    args = parser.parse_args()

    content = expected_content()
    stale: list[Path] = []  # 失步（缺檔或內容不一致）的副本清單

    for d in skill_dirs():
        target = d / "references" / "agents-rules.md"
        if args.check:
            if not target.exists() or target.read_text(encoding="utf-8") != content:
                stale.append(target)
        else:
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(content, encoding="utf-8", newline="\n")
            print(f"synced: {target.relative_to(ROOT)}")

    if args.check:
        if stale:
            for t in stale:
                print(f"OUT-OF-SYNC: {t.relative_to(ROOT)}")
            return 1
        print("OK: all agents-rules.md in sync")
    return 0


if __name__ == "__main__":
    sys.exit(main())

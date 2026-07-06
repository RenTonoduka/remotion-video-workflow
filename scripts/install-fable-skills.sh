#!/usr/bin/env bash
# Fable品質スキルをユーザーグローバル (~/.claude) に展開するスクリプト。
# 実行後は、どのフォルダから Claude Code (Opus 4.8 等) を開いても
# fable-core / fable-check / fable-refactor スキルと品質ルールが有効になる。
#
# 使い方:
#   リポジトリ内から:      bash scripts/install-fable-skills.sh
#   リポジトリ外から:      curl -fsSL <このファイルのraw URL> | bash
#   アンインストール:      bash scripts/install-fable-skills.sh --uninstall
#
# 何度実行しても安全（冪等）。将来別のモデルに移行して不要になったら
# --uninstall で追加分だけがきれいに消える（他の設定には触らない）。
set -euo pipefail

REPO="RenTonoduka/remotion-video-workflow"
REPO_BRANCH="main"
SKILLS=(fable-core fable-check fable-refactor)
FILES=(
  ".claude/skills/fable-core/SKILL.md"
  ".claude/skills/fable-core/references/fable-vs-opus.md"
  ".claude/skills/fable-check/SKILL.md"
  ".claude/skills/fable-refactor/SKILL.md"
)
CLAUDE_DIR="${HOME}/.claude"
GLOBAL_MD="${CLAUDE_DIR}/CLAUDE.md"
MARKER_BEGIN="<!-- fable-quality:begin -->"
MARKER_END="<!-- fable-quality:end -->"

# ~/.claude/CLAUDE.md からマーカー区間を除去（存在しなければ何もしない）
remove_snippet() {
  if [ -f "${GLOBAL_MD}" ] && grep -qF "${MARKER_BEGIN}" "${GLOBAL_MD}"; then
    awk -v begin="${MARKER_BEGIN}" -v end="${MARKER_END}" '
      $0 == begin {skip=1; next}
      $0 == end {skip=0; next}
      !skip {print}
    ' "${GLOBAL_MD}" > "${GLOBAL_MD}.tmp"
    mv "${GLOBAL_MD}.tmp" "${GLOBAL_MD}"
  fi
}

if [ "${1:-}" = "--uninstall" ]; then
  for skill in "${SKILLS[@]}"; do
    rm -rf "${CLAUDE_DIR}/skills/${skill}"
    echo "removed: ~/.claude/skills/${skill}"
  done
  remove_snippet
  echo "アンインストール完了。Fable品質モードの追加分のみ削除しました（他の設定は無変更）。"
  exit 0
fi

# スキルの取得元を決定:
#   リポジトリ内で実行された場合はローカルのファイルを使う。
#   curl | bash などリポジトリ外で実行された場合は GitHub から直接取得する。
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" 2>/dev/null && pwd || echo .)"
if [ -f "${SCRIPT_DIR}/../.claude/skills/fable-core/SKILL.md" ]; then
  SRC_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
  echo "取得元: ローカルリポジトリ (${SRC_ROOT})"
else
  SRC_ROOT="$(mktemp -d)"
  trap 'rm -rf "${SRC_ROOT}"' EXIT
  echo "取得元: GitHub (${REPO}@${REPO_BRANCH})"
  for f in "${FILES[@]}"; do
    mkdir -p "${SRC_ROOT}/$(dirname "$f")"
    if ! curl -fsSL "https://raw.githubusercontent.com/${REPO}/${REPO_BRANCH}/${f}" -o "${SRC_ROOT}/${f}"; then
      echo "エラー: GitHub からの取得に失敗しました (${f})" >&2
      echo "リポジトリが非公開の場合は、クローンしてから実行してください:" >&2
      echo "  git clone --depth 1 https://github.com/${REPO} /tmp/fvw && bash /tmp/fvw/scripts/install-fable-skills.sh" >&2
      exit 1
    fi
  done
fi

# 1. スキル本体をコピー（既存があれば更新）
mkdir -p "${CLAUDE_DIR}/skills"
for skill in "${SKILLS[@]}"; do
  rm -rf "${CLAUDE_DIR}/skills/${skill}"
  cp -r "${SRC_ROOT}/.claude/skills/${skill}" "${CLAUDE_DIR}/skills/${skill}"
  echo "installed: ~/.claude/skills/${skill}"
done

# 2. グローバル CLAUDE.md にルーティングルールを追記（マーカー区間を置換、冪等）
SNIPPET="$(cat <<'EOF'
<!-- fable-quality:begin -->
# Fable品質モード（全プロジェクト共通）

使用モデルに関わらず（特に Opus 4.8）、以下を守ること:

- コードを変更・追加する前に `fable-core` スキルを読む（思考原則）
- コード変更を終える前に `fable-check` スキルの抜け漏れ検査を必ず実行する
- リファクタリング依頼では `fable-refactor` スキルの手順に従う
- トークン節約: 必要範囲のみ Read、探索は Grep/Glob、機械的作業は haiku サブエージェントに委譲、同じ事実を再調査しない
<!-- fable-quality:end -->
EOF
)"

touch "${GLOBAL_MD}"
remove_snippet
printf '\n%s\n' "${SNIPPET}" >> "${GLOBAL_MD}"
echo "updated: ~/.claude/CLAUDE.md"

echo ""
echo "完了。次回以降、どのフォルダで Claude Code を開いても Fable品質モードが有効です。"
echo "更新はこのスクリプトの再実行、削除は --uninstall を付けて実行してください。"

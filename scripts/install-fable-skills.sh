#!/usr/bin/env bash
# Fable品質スキルをユーザーグローバル (~/.claude) に展開するスクリプト。
# 実行後は、どのフォルダから Claude Code (Opus 4.8 等) を開いても
# fable-core / fable-check / fable-refactor スキルと品質ルールが有効になる。
#
# 使い方:  bash scripts/install-fable-skills.sh
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CLAUDE_DIR="${HOME}/.claude"
MARKER_BEGIN="<!-- fable-quality:begin -->"
MARKER_END="<!-- fable-quality:end -->"

mkdir -p "${CLAUDE_DIR}/skills"

# 1. スキル本体をコピー（既存があれば更新）
for skill in fable-core fable-check fable-refactor; do
  rm -rf "${CLAUDE_DIR}/skills/${skill}"
  cp -r "${REPO_ROOT}/.claude/skills/${skill}" "${CLAUDE_DIR}/skills/${skill}"
  echo "installed: ~/.claude/skills/${skill}"
done

# 2. グローバル CLAUDE.md にルーティングルールを追記（マーカー区間を置換、冪等）
GLOBAL_MD="${CLAUDE_DIR}/CLAUDE.md"
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
if grep -qF "${MARKER_BEGIN}" "${GLOBAL_MD}"; then
  # 既存のマーカー区間を最新版に置換
  awk -v begin="${MARKER_BEGIN}" -v end="${MARKER_END}" '
    $0 == begin {skip=1; next}
    $0 == end {skip=0; next}
    !skip {print}
  ' "${GLOBAL_MD}" > "${GLOBAL_MD}.tmp"
  mv "${GLOBAL_MD}.tmp" "${GLOBAL_MD}"
fi
printf '\n%s\n' "${SNIPPET}" >> "${GLOBAL_MD}"
echo "updated: ~/.claude/CLAUDE.md"

echo ""
echo "完了。次回以降、どのフォルダで Claude Code を開いても Fable品質モードが有効です。"
echo "更新したい時はこのスクリプトを再実行してください（冪等です）。"

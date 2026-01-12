#!/usr/bin/env python3
"""
文JSONをSRT形式に変換するスクリプト

使い方:
    python scripts/format_subtitles.py public/video.sentences.json
    python scripts/format_subtitles.py public/video.sentences.json -o public/subtitles.srt
"""

import argparse
import json
from pathlib import Path


def seconds_to_srt_timestamp(seconds: float) -> str:
    """
    秒数をSRTタイムスタンプ形式に変換

    Args:
        seconds: 秒数（小数点以下はミリ秒）

    Returns:
        "HH:MM:SS,mmm" 形式の文字列
    """
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int((seconds % 1) * 1000)

    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"


def format_to_srt(input_path: str, output_path: str = None) -> str:
    """
    文JSONをSRT形式に変換

    Args:
        input_path: 文JSONファイルのパス
        output_path: 出力SRTファイルのパス（省略時は自動生成）

    Returns:
        SRT形式の文字列
    """
    input_file = Path(input_path)
    if not input_file.exists():
        print(f"Error: File not found: {input_path}")
        return None

    # 出力パス生成
    if output_path is None:
        output_path = input_file.parent / f"{input_file.stem.replace('.sentences', '')}.srt"
    else:
        output_path = Path(output_path)

    # JSON読み込み
    with open(input_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    print(f"Converting: {input_path}")

    sentences = data.get("sentences", [])

    # SRT形式に変換
    srt_lines = []
    for sentence in sentences:
        # インデックス
        srt_lines.append(str(sentence["id"]))

        # タイムスタンプ
        start_ts = seconds_to_srt_timestamp(sentence["start"])
        end_ts = seconds_to_srt_timestamp(sentence["end"])
        srt_lines.append(f"{start_ts} --> {end_ts}")

        # テキスト（長い場合は改行）
        text = sentence["text"]
        if len(text) > 25:
            # 25文字を超える場合、適切な位置で改行
            mid = len(text) // 2
            # 句読点や助詞の後で分割を試みる
            split_pos = -1
            for i in range(mid - 5, mid + 5):
                if 0 <= i < len(text):
                    if text[i] in "、。！？!?,":
                        split_pos = i + 1
                        break

            if split_pos > 0:
                text = text[:split_pos] + "\n" + text[split_pos:]
            else:
                # 適切な位置がなければ中央で分割
                text = text[:mid] + "\n" + text[mid:]

        srt_lines.append(text)
        srt_lines.append("")  # 空行

    srt_content = "\n".join(srt_lines)

    # SRT保存
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(srt_content)

    print(f"\n✅ SRT file created!")
    print(f"   Subtitles: {len(sentences)}")
    print(f"   Output: {output_path}")

    return srt_content


def main():
    parser = argparse.ArgumentParser(
        description="文JSONをSRT形式に変換"
    )
    parser.add_argument("input_path", help="文JSONファイルのパス")
    parser.add_argument("-o", "--output", help="出力SRTファイルのパス")

    args = parser.parse_args()

    format_to_srt(
        input_path=args.input_path,
        output_path=args.output
    )


if __name__ == "__main__":
    main()

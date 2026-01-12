#!/usr/bin/env python3
"""
ワードタイムスタンプから文を結合するスクリプト
Whisper出力のセグメントを文単位に再構成

使い方:
    python scripts/combine_sentences.py transcripts/video.json
    python scripts/combine_sentences.py transcripts/video.json -o public/video.sentences.json
"""

import argparse
import json
import re
from pathlib import Path


def combine_words_to_sentences(input_path: str, output_path: str = None) -> dict:
    """
    Whisper出力のセグメントを文単位に再構成

    Args:
        input_path: Whisper出力JSONのパス
        output_path: 出力JSONのパス（省略時は自動生成）

    Returns:
        文単位に再構成されたdict
    """
    input_file = Path(input_path)
    if not input_file.exists():
        print(f"Error: File not found: {input_path}")
        return None

    # 出力パス生成
    if output_path is None:
        output_path = input_file.parent / f"{input_file.stem}.sentences.json"
    else:
        output_path = Path(output_path)

    # JSON読み込み
    with open(input_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    print(f"Processing: {input_path}")

    # 全ワードを収集（wordsフィールドがある場合はそれを使用）
    all_words = []
    if "words" in data and data["words"]:
        all_words = data["words"]
    else:
        # セグメントからワードを収集
        for segment in data.get("segments", []):
            if "words" in segment:
                all_words.extend(segment["words"])

    if not all_words:
        print("Warning: No word timestamps found, using segments as sentences")
        # ワードがない場合はセグメントをそのまま使用
        sentences = []
        for i, seg in enumerate(data.get("segments", [])):
            sentences.append({
                "id": i + 1,
                "text": seg["text"].strip(),
                "start": seg["start"],
                "end": seg["end"],
                "words": []
            })
    else:
        # 文の区切りパターン
        sentence_endings = re.compile(r'[。！？!?]')

        sentences = []
        current_sentence = {
            "text": "",
            "words": [],
            "start": None,
            "end": None
        }

        for word in all_words:
            word_text = word.get("word", "").strip()
            if not word_text:
                continue

            # 文の開始
            if current_sentence["start"] is None:
                current_sentence["start"] = word["start"]

            # テキストとワードを追加
            current_sentence["text"] += word_text
            current_sentence["words"].append(word)
            current_sentence["end"] = word["end"]

            # 文の終わりを検出
            if sentence_endings.search(word_text):
                sentences.append({
                    "id": len(sentences) + 1,
                    "text": current_sentence["text"].strip(),
                    "start": current_sentence["start"],
                    "end": current_sentence["end"],
                    "words": current_sentence["words"]
                })
                current_sentence = {
                    "text": "",
                    "words": [],
                    "start": None,
                    "end": None
                }

        # 最後の文（句点なしで終わった場合）
        if current_sentence["text"]:
            sentences.append({
                "id": len(sentences) + 1,
                "text": current_sentence["text"].strip(),
                "start": current_sentence["start"],
                "end": current_sentence["end"],
                "words": current_sentence["words"]
            })

    # 短すぎる文を結合（オプション）
    merged_sentences = []
    buffer = None

    for sentence in sentences:
        duration = sentence["end"] - sentence["start"]
        char_count = len(sentence["text"])

        # 1秒未満かつ10文字未満の文は次の文と結合を検討
        if duration < 1.0 and char_count < 10 and buffer is None:
            buffer = sentence
            continue

        if buffer:
            # 前の短い文と結合
            merged = {
                "id": len(merged_sentences) + 1,
                "text": buffer["text"] + sentence["text"],
                "start": buffer["start"],
                "end": sentence["end"],
                "words": buffer["words"] + sentence["words"]
            }
            merged_sentences.append(merged)
            buffer = None
        else:
            sentence["id"] = len(merged_sentences) + 1
            merged_sentences.append(sentence)

    # バッファに残った文があれば追加
    if buffer:
        buffer["id"] = len(merged_sentences) + 1
        merged_sentences.append(buffer)

    # 結果を構成
    result = {
        "language": data.get("language", "ja"),
        "duration": data.get("duration", 0),
        "sentence_count": len(merged_sentences),
        "sentences": merged_sentences
    }

    # JSON保存
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"\n✅ Sentences combined!")
    print(f"   Input segments: {len(data.get('segments', []))}")
    print(f"   Output sentences: {len(merged_sentences)}")
    print(f"   Output: {output_path}")

    return result


def main():
    parser = argparse.ArgumentParser(
        description="ワードタイムスタンプから文を結合"
    )
    parser.add_argument("input_path", help="Whisper出力JSONのパス")
    parser.add_argument("-o", "--output", help="出力JSONファイルのパス")

    args = parser.parse_args()

    combine_words_to_sentences(
        input_path=args.input_path,
        output_path=args.output
    )


if __name__ == "__main__":
    main()

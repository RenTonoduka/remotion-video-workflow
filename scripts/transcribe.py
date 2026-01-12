#!/usr/bin/env python3
"""
Whisper APIを使用した音声文字起こしスクリプト
ワードタイムスタンプ付きでJSONを出力

使い方:
    python scripts/transcribe.py public/main-video.mp4
    python scripts/transcribe.py public/audio.mp3 -o transcripts/output.json
    python scripts/transcribe.py audio.mp3 -l en  # 英語の場合
"""

import argparse
import json
import os
import sys
from pathlib import Path

try:
    from openai import OpenAI
except ImportError:
    print("Error: openai package not installed")
    print("Run: pip install openai")
    sys.exit(1)


def transcribe_audio(
    audio_path: str,
    output_path: str = None,
    language: str = "ja",
    model: str = "whisper-1"
) -> dict:
    """
    音声ファイルをWhisper APIで文字起こし

    Args:
        audio_path: 音声/動画ファイルのパス
        output_path: 出力JSONファイルのパス（省略時は自動生成）
        language: 言語コード（ja, en等）
        model: Whisperモデル名

    Returns:
        文字起こし結果のdict
    """
    # OpenAI クライアント初期化
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        print("Error: OPENAI_API_KEY environment variable not set")
        print("Run: export OPENAI_API_KEY='sk-...'")
        sys.exit(1)

    client = OpenAI(api_key=api_key)

    # ファイル存在確認
    audio_file = Path(audio_path)
    if not audio_file.exists():
        print(f"Error: File not found: {audio_path}")
        sys.exit(1)

    # 出力パス生成
    if output_path is None:
        output_dir = Path("transcripts")
        output_dir.mkdir(exist_ok=True)
        output_path = output_dir / f"{audio_file.stem}.json"
    else:
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)

    print(f"Transcribing: {audio_path}")
    print(f"Language: {language}")
    print(f"Output: {output_path}")

    # Whisper API呼び出し（verbose_jsonでワードタイムスタンプ取得）
    with open(audio_file, "rb") as f:
        response = client.audio.transcriptions.create(
            model=model,
            file=f,
            language=language,
            response_format="verbose_json",
            timestamp_granularities=["word", "segment"]
        )

    # レスポンスをdictに変換
    result = {
        "text": response.text,
        "language": response.language,
        "duration": response.duration,
        "segments": []
    }

    # セグメントとワード情報を追加
    for segment in response.segments:
        seg_dict = {
            "id": segment.id,
            "start": segment.start,
            "end": segment.end,
            "text": segment.text,
            "words": []
        }

        # ワードタイムスタンプを追加（存在する場合）
        if hasattr(response, 'words') and response.words:
            # セグメント内のワードを抽出
            seg_words = [
                w for w in response.words
                if w.start >= segment.start and w.end <= segment.end
            ]
            seg_dict["words"] = [
                {"word": w.word, "start": w.start, "end": w.end}
                for w in seg_words
            ]

        result["segments"].append(seg_dict)

    # 全ワードも保存（セグメント外のワードがある場合に備えて）
    if hasattr(response, 'words') and response.words:
        result["words"] = [
            {"word": w.word, "start": w.start, "end": w.end}
            for w in response.words
        ]

    # JSON保存
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"\n✅ Transcription complete!")
    print(f"   Duration: {result.get('duration', 'N/A')} seconds")
    print(f"   Segments: {len(result['segments'])}")
    print(f"   Output: {output_path}")

    # 料金目安
    duration_min = result.get('duration', 0) / 60
    cost = duration_min * 0.006
    print(f"   Estimated cost: ${cost:.4f} (${0.006}/min)")

    return result


def main():
    parser = argparse.ArgumentParser(
        description="Whisper APIで音声文字起こし（ワードタイムスタンプ付き）"
    )
    parser.add_argument("audio_path", help="音声/動画ファイルのパス")
    parser.add_argument("-o", "--output", help="出力JSONファイルのパス")
    parser.add_argument("-l", "--language", default="ja", help="言語コード（デフォルト: ja）")

    args = parser.parse_args()

    transcribe_audio(
        audio_path=args.audio_path,
        output_path=args.output,
        language=args.language
    )


if __name__ == "__main__":
    main()

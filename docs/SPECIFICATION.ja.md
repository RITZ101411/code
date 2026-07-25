# Specification

## 目的・動機

- VSCodeが重い（メモリ、起動時間）
- Zedは軽いがデザインが好みに合わない（テーマでは解決できない）
- 必要な機能は少ない。余計なものがないエディタが欲しい
- CLIとの併用を前提とし、エディタは「書く」に特化する

## 機能要件

### ファイルツリー

- サイドバーにディレクトリ構造を表示
- クリックでファイルを開く
- .gitignore等に基づく除外

### エディタ本体

- CodeMirror 6ベース
- 複数タブ対応
- シンタックスハイライト
- ファイル保存（Cmd+S / Ctrl+S）

### LSP統合

- 任意のLanguage Serverと接続（rust-analyzer, typescript-language-server等）
- 補完（completion）
- 診断（diagnostics）— エラー・警告のインライン表示
- 定義ジャンプ（go to definition）
- ホバー情報（hover）

### 検索

- ファイル内検索（CodeMirror標準）
- プロジェクト横断検索（ripgrep経由）

## 非機能要件

- 起動1秒以内
- メモリ100MB以下（通常利用時）
- macOS / Windows対応
- UIデザインを自分で完全にコントロールできること

## 技術選定

| レイヤー | 技術 | 理由 |
|---|---|---|
| シェル | Tauri v2 | 軽量、Rust、クロスプラットフォーム、WebView利用でChromium非同梱 |
| フロントエンド | TypeScript + CodeMirror 6 | 成熟したエディタエンジン、拡張性高い、モジュラーで軽量 |
| バックエンド | Rust | ファイルI/O・プロセス管理が高速 |
| 検索 | ripgrep | 高速grep、.gitignore対応 |
| LSP通信 | stdin/stdout JSON-RPC | Language Server標準プロトコル |

### CodeMirror 6 を Monaco Editor より選んだ理由

- バンドルサイズ: ~150KB（必要な拡張のみ） vs Monaco ~2.5MB
- モジュラー設計で不要な機能を含まない
- DOM構造・CSSを自由にカスタマイズ可能（Monacoは VSCode UI前提）
- LSPレスポンスを素直に統合できる

## アーキテクチャ

```
┌─────────────────────────────────┐
│  Tauri WebView                  │
│  ┌────────┬────────────────┐    │
│  │File    │  CodeMirror 6  │    │
│  │Tree    │  (エディタ)     │    │
│  │        ├────────────────┤    │
│  │        │  検索結果       │    │
│  └────────┴────────────────┘    │
└─────────────────────────────────┘
         ↕ Tauri IPC (invoke / event)
┌─────────────────────────────────┐
│  Rust バックエンド               │
│  - ファイルシステム操作           │
│  - LSPプロセス管理 (spawn)       │
│  - ripgrep実行                  │
│  - ファイル監視 (notify crate)   │
└─────────────────────────────────┘
```

## やらないこと

- ターミナル統合（CLIで別途やる）
- プラグインシステム（VSCode拡張互換等）
- Git GUI（CLIで操作）
- デバッガ統合（初期スコープ外）
- 設定のGUI（設定ファイル直接編集）
- マルチウィンドウ

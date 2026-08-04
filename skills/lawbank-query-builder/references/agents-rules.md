<!-- 本檔為 .agents/AGENTS.md 之同步副本（隨技能一併發布）。
     請勿直接修改：請改母本 .agents/AGENTS.md 後執行
     python scripts/sync_agents_rules.py 重新同步。 -->

# 全局 Agent 運作規則 (Taiwan Law Powers Rules)

本檔案定義了在此工作區（law-powers）中所有 Agent 必須無條件遵守的全局約束。

## 1. 檢索優先與防幻覺原則 (Search-First & Trust Gates)
*   **硬性約束**：Agent 不得在無檢索數據支持的情況下，向使用者提供確定性的法律條文內容或司法判決要旨。
*   **第一步行為**：任何法律事實的分析，都必須首先使用檢索工具進行資料查證，並依查詢意圖選擇工具：
    *   **判例（找相關判例／論理）**：**雙軌並行**——同一回合同時呼叫語意檢索 `dr-lawbot:search_bundle` 與關鍵字檢索 `taiwan-legal-db:search_judgments`，再依 `legal-research` 技能的「合併去重規則」整合：以司法院 JID（語意軌 `doc_id` ＝ 關鍵字軌 `jid`）為去重鍵，重複判決保留資訊較完整（有理由書全文）的一筆，雙軌皆命中者排序最優先。
    *   **判例（已知字號或結構化過濾）**：使用 `taiwan-legal-db:search_judgments`（精確定位，不需雙軌）。
    *   **法規條文**：使用 `taiwan-legal-db:search_regulations`、`get_pcode`、`query_regulation`。
        *   **母法不等於現行標準（硬性約束）**：台灣法規大量採「母法定基準 ＋ 授權命令調整」雙層結構。凡問題涉及**具體數值或操作基準**（金額、費率、額度、期間、級距、資格門檻、程序要件）者，**不得僅以母法條文作答**，必須依 `legal-research` 技能「步驟二之五：授權子法反查」確認有無授權訂定之辦法／標準／準則；查有子法者**一律以子法為準**，並同時引用母法授權條款與子法（完整名稱、條號、`pcode`）。
    *   **釋字／憲法法庭裁判**：使用 `taiwan-legal-db:search_interpretations`、`get_interpretation`。
*   **信任閘門 (Trust Gate)**：若檢索工具未能找到關聯的法條或判決，Agent 應啟動信任閘門，誠實告知「查無直接對應之官方文獻」，嚴禁憑空捏造或假定不存在的法規。

## 2. 嚴格引用驗證 (Citation Verification)
所有回覆中提及的法源依據，必須遵守以下格式：
*   **法律條文**：
    *   必須完整標示：`《法規完整名稱》第 XX 條第 XX 項`（例如：《中華民國民法》第 184 條第 1 項）。
    *   禁止對條文內容進行概括性的胡亂修改，條文原文必須與檢索到的官方數據一致。
*   **法院判決**：
    *   必須完整標示：`法院 + 年度 + 字號 + 裁判類別`（例如：最高法院 108 年度台上字第 2345 號民事判決）。
    *   禁止縮寫字號或編造案號。

## 3. 台灣法律專業術語規範
所有對話、回覆、法律分析與文書草稿，必須使用中華民國（台灣）法律用語：
*   **合約/契約**：使用「契約」或「合約」（不使用「合同」）。
*   **訴狀/起訴狀**：民事或行政訴訟使用「起訴狀」（不使用「起訴書」）。
*   **答辯狀**：使用「答辯狀」（不使用「辯護詞」，辯護詞為刑事辯護律師提交）。
*   **違約金**：契約約定使用「違約金」（不使用「罰款」）。
*   **損害賠償**：使用「損害賠償」（不使用「賠償金」或「索賠」）。

## 4. 自動免責聲明 (Disclaimer)
在每一次法律分析、合約審查或策略建議的回答末尾，必須自動且完整地附上以下免責聲明：
> **免責聲明**：本助理提供之所有分析、檢索與審查結果僅供參考，不構成中華民國法律意義下之正式法律意見。任何關鍵法律決策或訴訟行為，請務必諮詢中華民國執業律師。

## 5. MCP 自動引導安裝協議 (Automated MCP Bootstrapping)

### 5.1 工具偵測方法（平台中立）
*   **判定依據**：檢視當前 session 的**可用工具清單**，確認 `taiwan-legal-db` 與 `dr-lawbot` 兩個 MCP 伺服器之工具已載入。工具命名依平台而異——Claude Code 為 `mcp__taiwan-legal-db__*` 前綴；Gemini CLI／Antigravity 以伺服器名稱分組列示；其他 agent 依其 MCP 工具命名慣例。無法從工具清單判定時，改以該平台之 MCP 清單指令（`claude mcp list`／`gemini mcp list`／`codex mcp list`）或 MCP 設定檔內容佐證。
*   **禁止**：不得以「先呼叫一次查詢、看它失敗」反推工具不存在；亦不得因工具不存在就憑記憶回答法律問題（違反 §1 檢索優先原則）。Agent 亦**不得假設使用者環境為特定平台**——偵測與安裝一律先辨識當前平台再選擇對應途徑。

### 5.2 依賴矩陣（各技能缺工具時之行為）
| 技能 | taiwan-legal-db | dr-lawbot |
|---|---|---|
| `legal-research` | **必要**——缺少時暫停分析，依 §5.3 引導安裝 | 建議——缺少時降級為關鍵字單軌，一次性告知 |
| `legal-element-analysis` | **必要**——條文原文必須查證，缺少時先依 §5.3 引導安裝 | 建議——要件內涵之判決錨定 |
| `legal-case-analysis` | **必要**——判決全文必須以 `get_judgment` 查證，缺少時先依 §5.3 引導安裝 | 建議——見解比較與演變所需判決之語意檢索 |
| `compliance-verification` | **必要**——法規對照必須查證 | 可選——實證佐證 |
| `official-document-drafting` | 建議——公文引用法規字號時查證 | 不需要 |
| `legal-brainstorming` | 不需要（步驟五轉介 `legal-research` 時才需要） | 不需要 |
| `legal-graph`、`legal-writing-humanizer` | 不需要（消費上游技能之已驗證產出） | 不需要 |

### 5.3 安裝與註冊（獲使用者同意後執行）
1.  **引導詢問**：主動告知使用者目前未配置對應 MCP 工具，並提議協助自動完成安裝與配置；未獲同意不得逕行執行安裝指令。
2.  **安裝套件 `mcp-taiwan-legal-db`**：
    *   一般環境（含 Windows）：`pip install mcp-taiwan-legal-db`
    *   Debian／Ubuntu／WSL（externally-managed 環境，`pip` 會被 PEP 668 拒絕）：`pipx install mcp-taiwan-legal-db`
    *   **PATH 注意**：pip 產生的 console script（`mcp-taiwan-legal-db`）位於 Python 安裝目錄之 `Scripts`（Windows）或 `bin`（Linux／macOS）；該目錄不在 PATH 時，MCP 註冊會「成功」但連線失敗。安裝後先以 `where mcp-taiwan-legal-db`（PowerShell）或 `which mcp-taiwan-legal-db` 確認指令可解析，找不到時改以完整路徑註冊。
3.  **註冊 `taiwan-legal-db`（先辨識當前平台，優先用該平台官方 CLI 指令，其次手動設定檔）**：

    | 平台 | 註冊方式 |
    |---|---|
    | Claude Code（CLI／VSCode 擴充） | 先 `claude --version` 確認 CLI 可用，再執行 `claude mcp add taiwan-legal-db mcp-taiwan-legal-db --scope user`（自動寫入 `~/.claude.json`） |
    | Gemini CLI | `gemini mcp add -s user taiwan-legal-db mcp-taiwan-legal-db` |
    | Antigravity／Gemini IDE | 於 `~/.gemini/config/mcp_config.json` 之 `mcpServers` 寫入通用 JSON（見下） |
    | Codex CLI | `codex mcp add taiwan-legal-db -- mcp-taiwan-legal-db`（或編輯 `~/.codex/config.toml`：`[mcp_servers.taiwan-legal-db]` 下 `command = "mcp-taiwan-legal-db"`） |
    | Cursor | 於 `~/.cursor/mcp.json` 之 `mcpServers` 寫入通用 JSON（見下） |
    | Claude Desktop | 於 `%APPDATA%\Claude\claude_desktop_config.json`（macOS：`~/Library/Application Support/Claude/claude_desktop_config.json`）之 `mcpServers` 寫入通用 JSON（見下） |
    | 其他支援 MCP 之 agent | 查該平台文件，於其 MCP 設定檔之 `mcpServers`（或等價）區塊寫入通用 JSON（見下） |

    通用 JSON（stdio）：
    ```json
    "taiwan-legal-db": { "command": "mcp-taiwan-legal-db" }
    ```
    **注意**：平台 CLI（`claude`／`gemini`／`codex`）不在 PATH 時，一律退回手動設定檔；Agent 不得假設使用者環境必有特定平台之 CLI。
4.  **註冊 `dr-lawbot`（Remote MCP over HTTP，判例雙軌檢索之語意軌，建議一併安裝）**：

    | 平台 | 註冊方式 |
    |---|---|
    | Claude Code | `claude mcp add --transport http dr-lawbot https://tlr.dr-lawbot.com/mcp --scope user` |
    | Gemini CLI | `gemini mcp add -s user --transport http dr-lawbot https://tlr.dr-lawbot.com/mcp` |
    | Antigravity／Gemini IDE／Claude Desktop | 於 `mcpServers` 寫入 `"dr-lawbot": { "type": "http", "url": "https://tlr.dr-lawbot.com/mcp" }` |
    | Cursor | 於 `mcpServers` 寫入 `"dr-lawbot": { "url": "https://tlr.dr-lawbot.com/mcp" }` |
    | 其他平台 | 依該平台之 remote HTTP MCP 語法；鍵名（`type`／`transport`／`url`）以該平台文件為準 |

    *   **不支援 remote HTTP 的平台**：可改以 `npx mcp-remote https://tlr.dr-lawbot.com/mcp` 作為 stdio 橋接註冊（需 Node.js）；仍不可行時逕行優雅降級。
    *   **優雅降級**：使用者環境無法安裝 dr-lawbot 時，判例檢索退回 `taiwan-legal-db:search_judgments` 關鍵字單軌，一次性告知「語意檢索未啟用」，不得 fail-closed。

### 5.4 重啟硬閘門（Restart Gate）
註冊完成後，新工具**必須重啟 IDE／session 才會載入**。Agent 必須：
1.  明確告知使用者重啟後才能繼續。
2.  **重啟前不得繼續任何需要檢索的分析步驟**——不得「先分析、之後補查證」（違反 §1）。得先做的僅限：整理使用者已提供之案情事實、確認待辦清單。
3.  重啟後由 §5.5 煙霧測試確認安裝成功，再進入正式分析。

### 5.5 安裝後煙霧測試（Smoke Test）
重啟後的第一個法律任務開始前，先以一次廉價查詢確認連線：
*   呼叫 `taiwan-legal-db:query_regulation` 查詢一條必定存在之條文（例：《中華民國民法》第 184 條）。
*   回傳條文原文 → 安裝成功，正常進入技能流程。
*   呼叫失敗或工具仍不存在 → 回到 §5.3 檢查 PATH 與註冊設定，不得憑記憶續答。


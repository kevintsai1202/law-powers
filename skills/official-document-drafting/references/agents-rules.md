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
*   **三態判定（不可只分「有／無」）**：remote MCP（如 `dr-lawbot`）有三種狀態，處置方式完全不同，**誤判會導向錯誤的修復動作**：
    | 狀態 | 表徵 | 處置 |
    |---|---|---|
    | **未註冊** | 設定檔無該伺服器條目 | 依 §5.3 引導安裝與註冊 |
    | **已註冊但未授權** | 設定檔有條目，但工具清單無其工具；平台常另有「需認證／not connected」提示 | 依 §5.6 完成 OAuth 授權——**不要重跑註冊指令**，重註冊不會補上 token |
    | **可用** | 工具清單可見其工具 | 直接使用 |
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

**「未授權」等同「缺少」**：`dr-lawbot` 已註冊但 OAuth 未授權時，其工具不會出現在工具清單，效果與未安裝相同——本矩陣的降級行為照常適用（判例檢索退回關鍵字單軌，不 fail-closed）。差別僅在修復途徑：未授權走 §5.6，不走 §5.3。

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
    *   **⚠️ 註冊 ≠ 可用**：`dr-lawbot` 為需 **OAuth 授權**之 remote MCP，寫入設定檔只完成一半，必須再依 §5.6 完成授權才會出現在工具清單。此步驟**不得省略，也不得由 Agent 代為執行**（授權需開瀏覽器登入，屬互動流程）。
    *   **優雅降級**：使用者環境無法安裝 dr-lawbot 時，判例檢索退回 `taiwan-legal-db:search_judgments` 關鍵字單軌，一次性告知「語意檢索未啟用」，不得 fail-closed。

### 5.4 重啟硬閘門（Restart Gate）
註冊完成後，新工具**必須重啟 IDE／session 才會載入**。Agent 必須：
1.  明確告知使用者重啟後才能繼續。
2.  **重啟前不得繼續任何需要檢索的分析步驟**——不得「先分析、之後補查證」（違反 §1）。得先做的僅限：整理使用者已提供之案情事實、確認待辦清單。
3.  重啟後由 §5.5 煙霧測試確認安裝成功，再進入正式分析。

### 5.5 安裝後煙霧測試（Smoke Test）
重啟後的第一個法律任務開始前，先以一次廉價查詢確認連線：
*   **`taiwan-legal-db`**：呼叫 `query_regulation` 查詢一條必定存在之條文（例：《中華民國民法》第 184 條）。
    *   回傳條文原文 → 安裝成功，正常進入技能流程。
    *   呼叫失敗或工具仍不存在 → 回到 §5.3 檢查 PATH 與註冊設定，不得憑記憶續答。
*   **`dr-lawbot`**（已完成 §5.6 授權者才需測）：呼叫 `search_bundle` 發一則簡短案情（例：「車禍過失傷害損害賠償」），確認回傳 `twlegalrag.bundle/v1` 且 `allowed_citations` 欄位存在。
    *   工具仍不在清單 → 未重啟，或授權未完成，回 §5.6。
    *   回傳 401／授權錯誤 → token 已失效，回 §5.6 重新授權。

### 5.6 remote MCP 之 OAuth 授權與失效排查（`dr-lawbot`）

`dr-lawbot` 為需授權之 remote MCP。**寫入設定檔只是註冊，取得 token 才是授權**；兩者任一缺少，工具都不會出現在清單中。

#### 5.6.1 授權方式（必須由使用者在互動式環境操作）
| 平台 | 授權途徑 |
|---|---|
| Claude Code | 於**互動式** session 輸入 `/mcp` → 選 `dr-lawbot` → `Authenticate`，開瀏覽器完成登入 |
| 其他支援 remote MCP 之 agent | 依該平台之 MCP 授權介面（多為設定面板中的 Connect／Authenticate 按鈕） |

*   **Agent 不得代為授權**：OAuth 需瀏覽器互動；非互動 session（含 `-p` 一次性執行、排程、subagent）無法完成。此時應**明確告知使用者需在互動式環境自行授權**，並先以關鍵字單軌續行。
*   **不得向使用者索取授權碼、token 或 callback URL** 代填。

#### 5.6.2 失效徵兆與三層診斷（依序，全部為唯讀檢查）
token 會過期，徵兆是「設定沒動過，某天工具突然消失」。診斷順序：

1.  **確認註冊還在**：設定檔（Claude Code 為 `~/.claude.json`）內是否仍有該伺服器條目。有 → 問題在授權，**不要重註冊**。
2.  **確認伺服器活著**：對端點發一次未授權探測——
    ```bash
    curl -s -o /dev/null -w "HTTP %{http_code}\n" -X POST https://tlr.dr-lawbot.com/mcp \
      -H "Content-Type: application/json" -H "Accept: application/json, text/event-stream" \
      -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"probe","version":"0"}}}' --max-time 20
    ```
    *   `HTTP 401` → **服務正常，純粹缺 token**（這是預期結果，因為探測本身沒帶憑證）。
    *   連線逾時／5xx → 服務端問題，非本地設定，逕行優雅降級並告知使用者。
3.  **檢查平台的授權狀態紀錄**（Claude Code）：
    *   `~/.claude/mcp-needs-auth-cache.json`：**負向快取**。伺服器回過 401 後即被記入，後續 session 直接跳過連線、把工具排除在清單外。條目仍在 → 尚未授權成功。
    *   `~/.claude/.credentials.json`：授權成功後會寫入該伺服器之 token（可 `grep dr-lawbot` 確認條目存在，**不得讀取或輸出 token 內容**）。

#### 5.6.3 授權完成後仍看不到工具＝正常，需重啟
授權結果寫在**磁碟**，工具清單是 session 啟動時建立的**記憶體快照**，兩者不會即時同步。故：

*   憑證已寫入、負向快取條目已消失，但當前 session 的工具清單仍無該工具 → **這是預期行為**，依 §5.4 重啟硬閘門重啟 session 即可，**不需要再授權一次**。
*   `/mcp reconnect` 類指令只重試連線，**缺 token 的情形重連仍會 401**，不能替代授權。

#### 5.6.4 禁止的繞道
*   **不得**以 `curl` 帶 token 直接呼叫 dr-lawbot HTTP API 取代 MCP 工具。理由：會跳過 `search_bundle` 的 `allowed_citations`／`unread_candidates` 白名單分流，等同拆除 §1 防幻覺閘門。
*   授權未完成期間，一律走關鍵字單軌並依 §5.2 一次性告知，不得憑記憶補充判例。


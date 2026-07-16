# 全局 Agent 運作規則 (Taiwan Law Powers Rules)

本檔案定義了在此工作區（law-powers）中所有 Agent 必須無條件遵守的全局約束。

## 1. 檢索優先與防幻覺原則 (Search-First & Trust Gates)
*   **硬性約束**：Agent 不得在無檢索數據支持的情況下，向使用者提供確定性的法律條文內容或司法判決要旨。
*   **第一步行為**：任何法律事實的分析，都必須首先使用檢索工具進行資料查證，並依查詢意圖選擇工具：
    *   **判例（找相關判例／論理）**：**雙軌並行**——同一回合同時呼叫語意檢索 `dr-lawbot:search_bundle` 與關鍵字檢索 `taiwan-legal-db:search_judgments`，再依 `legal-research` 技能的「合併去重規則」整合：以司法院 JID（語意軌 `doc_id` ＝ 關鍵字軌 `jid`）為去重鍵，重複判決保留資訊較完整（有理由書全文）的一筆，雙軌皆命中者排序最優先。
    *   **判例（已知字號或結構化過濾）**：使用 `taiwan-legal-db:search_judgments`（精確定位，不需雙軌）。
    *   **法規條文**：使用 `taiwan-legal-db:search_regulations`、`get_pcode`、`query_regulation`。
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
若 Agent 在啟動或調用檢索時，發現本機環境中**缺乏** `taiwan-legal-db` 的 MCP 工具，Agent 必須主動協助使用者引導安裝，流程如下：
1.  **引導詢問**：主動告知使用者目前未配置 `mcp-taiwan-legal-db` 資料庫，並提議協助自動完成安裝與配置。
2.  **執行安裝指令**：獲得許可後，優先執行 `pip install mcp-taiwan-legal-db` 命令進行安裝（Debian/Ubuntu/WSL 可改用 `pipx install`）。
3.  **註冊 MCP（依 IDE 而定）**：
    *   **Claude Code（CLI／VSCode 擴充）**：優先執行官方指令，會自動寫入使用者設定檔 `~/.claude.json`，無須手動編輯：
        ```bash
        claude mcp add taiwan-legal-db mcp-taiwan-legal-db --scope user
        ```
    *   **Gemini IDE／Claude Desktop**：讀取並修改對應設定檔（`C:\Users\<UserName>\.gemini\config\mcp_config.json` 或 `C:\Users\<UserName>\AppData\Roaming\Claude\claude_desktop_config.json`），在 `mcpServers` 內寫入配置：
        ```json
        "taiwan-legal-db": {
          "command": "mcp-taiwan-legal-db"
        }
        ```
4.  **註冊語意檢索引擎 `dr-lawbot`（Remote MCP，判例雙軌檢索之語意軌，必須一併安裝）**：
    *   **Claude Code**：
        ```bash
        claude mcp add --transport http dr-lawbot https://tlr.dr-lawbot.com/mcp --scope user
        ```
    *   **Gemini IDE／Claude Desktop**：於 `mcpServers` 內寫入：
        ```json
        "dr-lawbot": { "type": "http", "url": "https://tlr.dr-lawbot.com/mcp" }
        ```
    *   **優雅降級**：若使用者環境無法安裝 dr-lawbot，Agent 於判例檢索時應退回 `taiwan-legal-db:search_judgments` 關鍵字檢索，並一次性告知「語意檢索未啟用」，不得 fail-closed。
5.  **引導重啟**：配置完成後，提示使用者重啟 IDE／session 以載入 `mcp__taiwan-legal-db__*` 工具。


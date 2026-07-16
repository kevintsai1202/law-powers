---
name: legal-research
description: 引導 Agent 精準、防幻覺地調用 taiwan-legal-db 與 dr-lawbot（語意判例檢索）MCP 工具來檢索台灣法規、判例及憲法裁判，並實施引用驗證與信任閘門。
---

# 台灣法源檢索與引用驗證 (Legal Research & Verification)

本技能用於規範與引導 AI 助理如何高效、嚴謹地調用 taiwan-legal-db（全國法規資料庫與司法院裁判）與 dr-lawbot（判例語意檢索）MCP 工具，並進行防幻覺的引用驗證與信任閘門防護。

## 執行流程

Agent 在進行任何法源檢索時，必須遵循以下步驟：

```mermaid
graph TD
    Step0["步驟零：環境檢測與自動安裝 (Bootstrapping)"]
    Step1["步驟一：構建檢索關鍵詞 (Query formulation)"]
    Step2["步驟二：查詢路由與工具調用 (Query Routing & Tool Execution)"]
    Step3["步驟三：引用驗證 (Citation Verification)"]
    Step4["步驟四：信任閘門防護 (Trust Gate)"]

    Step0 --> Step1
    Step1 --> Step2
    Step2 --> Step3
    Step3 --> Step4
```

---

### 步驟零：環境檢測與自動安裝 (Environment Check & Bootstrapping)
*   **規則**：Agent 在啟動或接收到法律查詢時，必須先確認是否能調用 `taiwan-legal-db`（法規／釋字／判決結構化檢索，**必要**）與 `dr-lawbot`（判例雙軌檢索之語意軌；未安裝時可降級為關鍵字單軌）兩組 MCP 工具。
*   **引導機制**：
    *   若 **`taiwan-legal-db` 不存在**，Agent **必須無條件暫停後續分析**，並主動詢問使用者是否同意自動安裝與配置檢索工具（`taiwan-legal-db` 與 `dr-lawbot`）。
    *   若僅 **`dr-lawbot` 不存在**，**不阻斷分析**：提示可安裝以提升相關判例檢索，並依步驟二「優雅降級」先以 `taiwan-legal-db:search_judgments` 關鍵字檢索續行，不得 fail-closed。
*   **自動化執行**：使用者同意後，Agent 必須：
    1. 安裝並註冊法規資料庫 MCP `taiwan-legal-db`：
        *   安裝：`pip install mcp-taiwan-legal-db`
        *   **Claude Code**：`claude mcp add taiwan-legal-db mcp-taiwan-legal-db --scope user`
        *   **Gemini IDE／Claude Desktop**：於設定檔 `mcpServers` 內寫入 `taiwan-legal-db`（`{"command": "mcp-taiwan-legal-db"}`）。
    2. 註冊語意檢索引擎 `dr-lawbot`（Remote MCP）：
        *   **Claude Code**：`claude mcp add --transport http dr-lawbot https://tlr.dr-lawbot.com/mcp --scope user`
        *   **Gemini IDE／Claude Desktop**：於 `mcpServers` 內寫入 `dr-lawbot`（`{"type": "http", "url": "https://tlr.dr-lawbot.com/mcp"}`）。
    3. 提示使用者：「我已完成自動配置，請重啟 IDE／session 以載入這些工具。」

### 步驟一：構建檢索關鍵詞 (Query Formulation)
*   **規則**：不要直接拿使用者口語化的描述進行搜尋。必須將其轉化為台灣法律用語的關鍵字組合。
*   **範例**：
    *   *使用者說*：「被老闆無預警開除」 $\rightarrow$ *檢索詞*：`勞基法 違法解雇 資遣費 預告期間`
    *   *使用者說*：「買到漏水屋想退錢」 $\rightarrow$ *檢索詞*：`民法 物之瑕疵擔保 漏水 解除契約`
    *   *使用者說*：「車禍被撞索賠」 $\rightarrow$ *檢索詞*：`車禍 侵權行為 損害賠償 過失傷害`

### 步驟二：查詢路由與工具調用 (Query Routing & Tool Execution)
*   **規則**：依查詢意圖選擇工具，預設「判例找論理 → **雙軌並行檢索**（語意＋關鍵字同時查，再合併去重）」。

#### 路由決策
| 需求 | 使用工具 |
|---|---|
| 從案情找相關判例、論理（**預設入口**） | **雙軌並行**：`dr-lawbot:search_bundle`（`search_type=hybrid`、`read_top=3`）＋ `taiwan-legal-db:search_judgments`（法律用語關鍵字），兩者於**同一回合並行呼叫**，結果依下方「合併去重規則」整合 |
| 已知字號，或依法院／年度／案類／輸贏方精確過濾 | `taiwan-legal-db:search_judgments`（`case_word`+`case_number`、或 `main_text`）——此情境為精確定位，**不需**雙軌 |
| 法規條文原文 | `taiwan-legal-db:search_regulations`、`get_pcode`、`query_regulation` |
| 釋字／憲法法庭裁判 | `taiwan-legal-db:search_interpretations`、`get_interpretation` |
| 對已選定判決取全文、抓引證關係（建圖用） | `taiwan-legal-db:get_judgment`、`get_citations` |

#### 雙軌並行檢索（預設路徑）
判例查詢預設**同時**發出以下兩路檢索（同一回合並行呼叫，勿串行等待）：

*   **語意軌（重召回）**：將案情以自然語言直接交給 `dr-lawbot:search_bundle`，取回 `twlegalrag.bundle/v1`。
    *   bundle 的 `allowed_citations` 是「已讀取理由書」的判決白名單；`unread_candidates` 僅供線索，**不得作為權威引用**。
    *   > 註（實測教訓）：本專案語意引擎的 CLI 版（`twlegalrag`）在 `read-top < 檢索筆數`時，會把未讀取理由書的判決也列入 `allowed_citations`；故技能一律走原生 MCP `dr-lawbot:search_bundle`，其白名單分流正確。若未來改用 CLI，務必令 `read-top = 檢索筆數`。
*   **關鍵字軌（重精確）**：使用 `taiwan-legal-db:search_judgments`，勿直接用口語，須先依步驟一轉為台灣法律用語：
    *   「被老闆無預警開除」→ `勞基法 違法解雇 資遣費 預告期間`
    *   「買到漏水屋想退錢」→ `民法 物之瑕疵擔保 漏水 解除契約`
    *   「車禍被撞索賠」→ `車禍 侵權行為 損害賠償 過失傷害`
    *   查特定案號時，用 `case_word`+`case_number`（勿把案號塞進 keyword）；篩輸贏方可用 `main_text`。

#### 合併去重規則 (Merge & Dedupe)
兩軌結果取回後，依下列規則合成單一判例清單：

1.  **去重鍵 (dedupe key)**：首選司法院 JID——語意軌的 `doc_id` 與關鍵字軌的 `jid` 為同一格式（實測例：`TPDV,93,訴,1804,20041130,2`），可直接字串比對。若任一側缺 JID，退用「法院＋年度＋字號＋裁判類別」正規化比對（例：`最高法院|111|台上|543|民事判決`）。同一判決不因兩軌回傳格式不同而重複列出。
2.  **重複時保留較好的一筆**，判準依序：
    *   **有理由書全文者優先**：語意軌 `allowed_citations` 內（已讀取理由書）的版本 ＞ 僅有摘要／列表欄位的版本。
    *   **兩邊都只有摘要**時（語意軌僅列於 `unread_candidates`）：保留關鍵字軌版本作為事實欄位來源（官方結構化資料），並可視需要以 `taiwan-legal-db:get_judgment` 補全文；語意軌的相似度線索僅供排序參考。
3.  **排序**：
    *   **雙軌皆命中**的判決最優先（兩個獨立引擎交叉印證，相關性最高）。
    *   其次依語意軌相似度順序，再次為僅關鍵字軌命中者。
4.  **驗證歸屬不變**：合併後每筆判決仍依其**來源軌**適用步驟三的雙軌驗證——來自 `allowed_citations` 者直接信任白名單；來自關鍵字軌或 `unread_candidates` 者，引用前須以 `get_judgment` 取得原文逐字比對。**合併不得使未讀判決繼承白名單地位。**
5.  **單軌空結果不阻斷**：任一軌回傳空結果時，以另一軌結果續行，並於回覆中註明僅單軌命中；兩軌皆空才觸發步驟四信任閘門。

#### 優雅降級
*   若環境未配置 `dr-lawbot`，判例檢索改用 `taiwan-legal-db:search_judgments` 關鍵字單軌檢索（合併去重規則自然退化為單軌），並**一次性**告知：「語意檢索未啟用，目前以關鍵字檢索；安裝 dr-lawbot 可提升相關判例檢索的涵蓋。」不 fail-closed。


### 步驟三：引用驗證 (Citation Verification)
*   **雙軌原則**：
    *   **語意路徑（`dr-lawbot:search_bundle`）**：直接信任 bundle 的 `allowed_citations` / `unread_candidates`——僅引用白名單內判決，未讀候選不得作為權威。工具層已強制此閘門，無須以 prompt 重造。
    *   **關鍵字／法規路徑（`taiwan-legal-db:*`）**：無工具層白名單保證，須執行下列手寫引用驗證。
*   **規則**：在回答中，提及的每一條法規與裁判，必須與 MCP 取得的原文完全比對一致。
*   **廢棄防護（`case_history`）**：引用任何判決前，檢查 bundle 的 `case_history`；若上訴審記錄顯示「主文含廢棄」，該判決**不得作為現行有效權威**，須明確標註「已被上級審廢棄」或排除之。且不得僅因無上訴審記錄即斷言判決「確定」——資料庫未收錄不等於確定。
*   **輸出格式要求**：引用格式一律**依 `.agents/AGENTS.md` §2（嚴格引用驗證）**。摘要：法條寫 `《法規完整名稱》第 XX 條第 XX 項`；裁判寫 `法院 + 年度 + 字號 + 裁判類別`（例：最高法院 111 年度台上字第 543 號民事判決）；不得簡化、修飾或概括原文。

### 步驟四：信任閘門防護 (Trust Gate)
*   **規則**：當檢索返回空結果，或現有資料不足以支持使用者的問題時，**禁止編造任何條文或字號**。語意路徑另以 bundle 的 `allowed_citations` 為準——白名單為空即視為查無支持依據。
*   **Fail-Closed 範本**：
    > 經檢索中華民國全國法規資料庫與司法院裁判系統，未查得直接相關之法條或最高法院判決支持此論點。為維護法律意見之準確性，本助理無法提供虛構的法源依據。建議您可以：
    > 1. 調整搜尋關鍵字（例如：將「XXX」改為「YYY」）。
    > 2. 提供更多詳細事實背景。
    > 3. 諮詢中華民國執業律師以獲得正式法律意見。

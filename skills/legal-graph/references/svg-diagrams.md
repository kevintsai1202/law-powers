# SVG 訴訟決策樹＋因果關係徑路圖 繪製規範

本檔為 `legal-graph` 步驟五之完整繪製規範。產出物為**單一自包含 SVG 檔**，上下雙面板：

*   **上面板：訴訟決策樹**——以「若…則…」分支呈現訴訟邏輯與程序步驟（請求權是否成立、抗辯是否阻斷、程序選擇），資料來自 `legal-brainstorming` 之策略報告（爭點與攻防）與 `legal-research` 查證後之條文／判決。
*   **下面板：因果關係徑路圖**——以線性鏈條呈現「加害行為 →（介入因素）→ 損害結果」之歸責路徑，每段因果評價（○✗△）**一律轉錄 `legal-element-analysis` 涵攝表**。

僅有其中一種資料時，退化為單面板（保留該面板標題，另一面板整段省略並等比縮減畫布高度）。

---

## 一、資料紀律（硬性約束，違反任一項即不得產出）

1.  **決策樹分支之法律判斷必須有依據**：每個判斷節點（菱形）之分支法效，須錨定已查證之條文（`taiwan-legal-db` 查證結果）或白名單（`allowed_citations`）內判決字號，以小字標注於分支旁；尚未查證者節點改**虛線框**並標「（待查證）」，不得假裝已確認。
2.  **因果評價不得臆測**：徑路圖每段箭頭之該當性符號（○✗△）只能轉錄 `legal-element-analysis` 涵攝表；尚未涵攝時全部標 △ 並於面板下方註明「尚未涵攝，僅為徑路假設」。
3.  **介入因素之中斷判斷**：介入因素節點須標明「中斷／不中斷因果關係」之評價與其依據（判決字號或涵攝表）；無依據時標 △ 不下結論。
4.  **與圖譜資料同源**：決策樹之爭點、徑路圖之事實節點，應與 `data.js` 圖譜之 `issue`／`fact`／`element` 節點取自同一份分析產出，名稱與結論不得兩處矛盾。
5.  **免責聲明**：SVG 底部固定一行小字免責聲明（agents-rules §4 之精簡版）：「本圖為 AI 輔助分析之視覺化摘要，不構成法律意見，引用前請洽專業律師確認。」

## 二、輸出位置與檔名

*   寫入**目前案件工作目錄**之 `outputs/`（不存在則建立），檔名 `decision-causal-<案件代稱>.svg`（案件代稱用短英數或拼音，避免路徑相容性問題）。
*   使用者指定路徑時從其指定。SVG 為獨立產出物，**不寫入** `data.js`，與 3D 圖譜互補：關係圖呈全貌網絡，本圖呈線性敘事（決策分支＋歸責鏈），適合書狀附圖與列印。

## 三、共用視覺語彙

| 項目 | 規格 |
|---|---|
| 畫布 | `viewBox="0 0 1200 H"`，H 依內容計算；白底（`<rect fill="#ffffff">`），供附卷列印 |
| 字型 | `font-family="'Microsoft JhengHei','Noto Sans TC','PingFang TC',sans-serif"` |
| 字級 | 面板標題 20（粗體）、節點主文 15、分支標籤 13、依據錨定小字 11、免責聲明 10 |
| 語意色 | 有利／該當○＝綠 `#2e7d32`；不利／不該當✗＝紅 `#c62828`；事實不明△＝黃 `#b8860b`；中性／程序＝藍灰 `#455a64`；主題深藍（標題、粗框）＝`#1e3a5f` |
| 節點底色 | 一般 `#eceff1`；終局結果節點白底粗框（框色依有利性：綠／紅／藍灰） |
| 自包含 | 禁止外部資源（圖片、字型、CSS 連結）、禁止 `<script>`；離線雙擊可開 |
| 可及性 | 根元素內附 `<title>` 與 `<desc>`（案件名＋圖表用途一句話） |
| 文字換行 | `<text>` 內以 `<tspan x="…" dy="1.3em">` 換行，每行 ≤ 12 個中文字；節點寬度以最長行估算（中文字寬 ≈ 字級 × 1.0），文字不得溢出節點框 |
| 箭頭 | `<defs>` 內定義 `<marker>`（每種語意色各一），線寬：決策樹 1.5、因果主鏈 3 |

## 四、上面板：訴訟決策樹

*   **節點形狀語彙**：
    *   **圓角矩形**（`rx="8"`）＝事實狀態或程序動作（如「案件分析」「提起給付之訴」）。
    *   **菱形**（`<polygon>`）＝判斷分支，內文為問句（如「被告是否違約？」「時效抗辯是否成立？」）。
    *   **白底粗框圓角矩形**＝終局結果（「請求權成立→賠償責任」「駁回請求」），框色依對本方之有利性上色。
*   **分支標線**：自菱形引出之每條線標「是／否」（或「成立／不成立」）；線旁小字錨定該分支法效之依據（條號或判決字號），例：`是→民法第226條`。
*   **佈局**：整體**由左至右**推進（起點在左、終局結果靠右對齊成一欄）；分支上「是」在上、「否」在下；連線用直角折線（`<path>` 之 H/V 段），**避免交叉**——無法避免時以跨線小半圓（`<path>` arc）示意。
*   **層級深度**：判斷菱形以 4 層為上限；更深之邏輯拆為第二棵樹（同面板往下另起一列）或於節點內文以「詳見策略報告§N」收束，勿硬塞。
*   **備位路線**：先位／備位請求以兩條平行路徑呈現，備位路徑整條用虛線（`stroke-dasharray="6 4"`）並於起點標「備位」。

## 五、下面板：因果關係徑路圖

*   **主鏈**：`加害行為 →（介入因素 ×0..n）→ 損害結果`，橫向等距排列，粗箭頭（線寬 3）相連；節點為圓角矩形，主文上方加小字類別標籤（「加害行為」「介入因素」「損害結果」）。
*   **每段箭頭之因果評價**：箭頭上方標「相當因果關係」＋該當性符號，顏色隨符號（○ 綠／✗ 紅／△ 黃），箭頭線色同步；箭頭下方小字錨定（「涵攝表：相當因果關係＝△」或判決字號）。
*   **介入因素節點**：節點下方以小字標中斷評價——「不中斷：常態風險之實現（判決字號）」或「中斷：異常獨立事件（判決字號）」；評價未定時標「△ 中斷與否待證」。
*   **多因競合**：兩個以上加害行為匯入同一損害時，各自畫水平支線匯入損害結果節點，匯流點前各自標評價；共同侵權（民法第 185 條）之連帶關係以大括號註記，不另畫網狀——網狀歸責留給 3D 圖譜。
*   **與決策樹的呼應**：徑路圖之「損害結果」若即決策樹某分支之前提（如「有無相當因果關係」菱形），於兩節點各加相同之角標編號（①②…）供對照，不畫跨面板連線。

## 六、範本骨架

以下為**雙面板最小可用範本**（示範一個判斷菱形＋一條三節點因果鏈）。實際產出時依案件內容增節點、重算座標與畫布高度；此範本本身即為合法 SVG，可直接開啟驗證視覺語彙。

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 700" font-family="'Microsoft JhengHei','Noto Sans TC','PingFang TC',sans-serif">
  <title>示範案件：訴訟決策樹與因果關係徑路圖</title>
  <desc>上面板為訴訟決策樹，下面板為因果關係徑路圖；示範用假資料。</desc>
  <defs>
    <marker id="ah-n" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto"><path d="M0,0 L10,4 L0,8 Z" fill="#455a64"/></marker>
    <marker id="ah-g" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto"><path d="M0,0 L10,4 L0,8 Z" fill="#2e7d32"/></marker>
    <marker id="ah-y" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto"><path d="M0,0 L10,4 L0,8 Z" fill="#b8860b"/></marker>
  </defs>
  <rect x="0" y="0" width="1200" height="700" fill="#ffffff"/>

  <!-- ── 上面板：訴訟決策樹 ── -->
  <text x="40" y="48" font-size="20" font-weight="bold" fill="#1e3a5f">壹、訴訟決策樹</text>
  <rect x="40" y="120" width="150" height="56" rx="8" fill="#eceff1" stroke="#455a64"/>
  <text x="115" y="153" font-size="15" text-anchor="middle" fill="#263238">案件分析</text>
  <polygon points="330,148 430,96 530,148 430,200" fill="#eceff1" stroke="#455a64"/>
  <text x="430" y="141" font-size="15" text-anchor="middle" fill="#263238">被告是否違約？<tspan x="430" dy="1.3em" font-size="11" fill="#546e7a">（民法第226條，已查證）</tspan></text>
  <line x1="190" y1="148" x2="326" y2="148" stroke="#455a64" stroke-width="1.5" marker-end="url(#ah-n)"/>
  <path d="M530,148 H600 V96 H666" fill="none" stroke="#2e7d32" stroke-width="1.5" marker-end="url(#ah-g)"/>
  <text x="560" y="88" font-size="13" fill="#2e7d32">是</text>
  <rect x="670" y="68" width="200" height="56" rx="8" fill="#ffffff" stroke="#2e7d32" stroke-width="2.5"/>
  <text x="770" y="101" font-size="15" text-anchor="middle" fill="#2e7d32">請求權成立→賠償責任</text>
  <path d="M530,148 H600 V228 H666" fill="none" stroke="#455a64" stroke-width="1.5" marker-end="url(#ah-n)"/>
  <text x="560" y="222" font-size="13" fill="#455a64">否</text>
  <rect x="670" y="200" width="200" height="56" rx="8" fill="#ffffff" stroke="#455a64" stroke-width="2.5"/>
  <text x="770" y="233" font-size="15" text-anchor="middle" fill="#455a64">駁回請求</text>

  <line x1="40" y1="330" x2="1160" y2="330" stroke="#cfd8dc" stroke-width="1"/>

  <!-- ── 下面板：因果關係徑路圖 ── -->
  <text x="40" y="386" font-size="20" font-weight="bold" fill="#1e3a5f">貳、因果關係徑路圖</text>
  <text x="60" y="452" font-size="11" fill="#546e7a">加害行為</text>
  <rect x="60" y="462" width="200" height="60" rx="8" fill="#eceff1" stroke="#455a64"/>
  <text x="160" y="497" font-size="15" text-anchor="middle" fill="#263238">醫療疏失</text>
  <line x1="260" y1="492" x2="446" y2="492" stroke="#2e7d32" stroke-width="3" marker-end="url(#ah-g)"/>
  <text x="355" y="478" font-size="13" text-anchor="middle" fill="#2e7d32">○ 相當因果關係</text>
  <text x="355" y="540" font-size="11" text-anchor="middle" fill="#546e7a">涵攝表：○（判決字號）</text>
  <text x="450" y="452" font-size="11" fill="#546e7a">介入因素</text>
  <rect x="450" y="462" width="200" height="60" rx="8" fill="#eceff1" stroke="#455a64"/>
  <text x="550" y="497" font-size="15" text-anchor="middle" fill="#263238">術後感染</text>
  <text x="550" y="556" font-size="11" text-anchor="middle" fill="#2e7d32">不中斷：常態風險之實現（判決字號）</text>
  <line x1="650" y1="492" x2="836" y2="492" stroke="#b8860b" stroke-width="3" marker-end="url(#ah-y)"/>
  <text x="745" y="478" font-size="13" text-anchor="middle" fill="#b8860b">△ 相當因果關係</text>
  <text x="745" y="540" font-size="11" text-anchor="middle" fill="#546e7a">涵攝表：△ 缺鑑定報告</text>
  <text x="840" y="452" font-size="11" fill="#546e7a">損害結果</text>
  <rect x="840" y="462" width="200" height="60" rx="8" fill="#eceff1" stroke="#455a64"/>
  <text x="940" y="497" font-size="15" text-anchor="middle" fill="#263238">病患死亡</text>

  <text x="40" y="672" font-size="10" fill="#90a4ae">本圖為 AI 輔助分析之視覺化摘要，不構成法律意見，引用前請洽專業律師確認。</text>
</svg>
```

## 七、產出後提示語

寫入完成後告知使用者：

> 「訴訟決策樹＋因果關係徑路圖已寫入 `<實際完整路徑>`（自包含 SVG，離線可開、可直接列印附卷）。決策樹分支依據與因果評價（○✗△）均錨定於已查證之條文／判決與涵攝表；若後續涵攝結果更新（△→○✗），請告知我重繪對應箭頭。」

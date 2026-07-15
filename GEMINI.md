# GEMINI.md (Gemini Agent 台灣法律技能包專屬指南)

本技能包完全相容於 Gemini-Agent 框架。在 Gemini 環境下運行本技能包時，請遵循以下規範：

## 執行與載入機制
1. **技能自動載入**：Gemini 會自動讀取並載入本專案中 `skills/<skill_name>/SKILL.md` 的 YAML Frontmatter。
2. **工具調用**：在與 Gemini 進行交互時，Gemini 會依據技能中的 Prompt 約束，動態綁定並呼叫已經登錄的 `mcp-taiwan-legal-db` 中的相關工具。

## Gemini 互動特別約束
*   **引導機制**：當調用 `legal-brainstorming` 時，Gemini 必須嚴格保持「一次只問一個問題」的單步問答模式，不要在單次輸出中羅列多個問題。
*   **圖譜相容性**：為下一階段（子項目二）做準備，Gemini 在整理判決引用關係時，請以 GFM (GitHub Flavored Markdown) 的表格或 Mermaid 語法來初步顯示關聯，直到視覺化界面（子項目三）完成為止。

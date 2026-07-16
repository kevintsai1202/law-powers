// 【虛構示範資料】legal-graph 技能關係圖 superset 範例
// 本檔為純虛構之教學／展示資料，所有當事人、公司、案號、事實均為杜撰，與任何真實個案無關。
// 用途：驅動 index.html / index-3d-src.html / index-2d.html 渲染器，示範各節點類型與連線語意。
// 更新資料只需改此檔；schema 對齊 skills/legal-graph/references/superset-extraction.md。
window.GRAPH_DATA = {
  "nodes": [
    // ── 原告（plaintiff）──
    {
      "id": "q1",
      "group": "plaintiff",
      "label": "示範電視台聯盟（甲台／乙台／丙台）"
    },

    // ── 被告當事人（party）──
    {
      "id": "p1",
      "group": "party",
      "label": "戊科技股份有限公司／示範負責人 A"
    },
    {
      "id": "p2",
      "group": "party",
      "label": "己貿易有限公司／示範負責人 B"
    },
    {
      "id": "p3",
      "group": "party",
      "label": "庚示範集團（機房示範，3 名被告）"
    },

    // ── 判決（judgment）──
    {
      "id": "j1",
      "group": "judgment",
      "label": "110示著訴1",
      "title": "一審（示範） 示範智慧財產法院 2023-01-01",
      "description": "【事實】示範電視台聯盟主張戊科技公司銷售之示範機上盒內建可收視其頻道之程式，侵害公開傳輸權。\n\n【判決】認定程式係消費者自行下載、機上盒未內建，屬科技中立，全部駁回。",
      "status": "bad",
      "family": "戊科技（示範機上盒）"
    },
    {
      "id": "j1_ev0",
      "group": "evidence",
      "label": "有利證據",
      "title": "defendant",
      "description": "公證錄影顯示系爭程式係消費者自行於公開網路下載，非機上盒內建",
      "favorable": "strong"
    },
    {
      "id": "j1_ev1",
      "group": "evidence",
      "label": "不利證據",
      "title": "plaintiff",
      "description": "產品外盒廣告文案疑似暗示可收視第四台內容",
      "favorable": "weak"
    },
    {
      "id": "j2",
      "group": "judgment",
      "label": "111示著上2",
      "title": "二審（示範・逆轉） 示範智慧財產法院 2024-02-02",
      "description": "【事實】示範電視台聯盟就 j1 敗訴部分上訴。\n\n【判決】認定機上盒出廠即內建越獄版程式、客服協助安裝；侵權請求權雖罹時效，改依不當得利判賠。",
      "status": "good",
      "family": "戊科技（示範機上盒）"
    },
    {
      "id": "j2_ev0",
      "group": "evidence",
      "label": "有利證據",
      "title": "defendant",
      "description": "侵權行為損害賠償請求權已罹 2 年時效",
      "favorable": "strong"
    },
    {
      "id": "j2_ev1",
      "group": "evidence",
      "label": "不利證據",
      "title": "plaintiff",
      "description": "網路開箱文仍載「越獄加強版」字樣，佐證出廠內建",
      "favorable": "weak"
    },
    {
      "id": "j3",
      "group": "judgment",
      "label": "110示訴3",
      "title": "刑事一審（示範） 示範地方法院 2023-03-03",
      "description": "【事實】庚示範集團設置機房擷取頻道訊號並重製上傳。\n\n【判決】正犯與幫助犯數名被告有罪，並依法人併罰規定科處公司罰金。",
      "status": "mixed",
      "family": "庚集團（機房示範）"
    },

    // ── 法條（law，公開法律，非虛構）──
    {
      "id": "l1",
      "group": "law",
      "label": "著作權法§87Ⅰ⑦",
      "title": "copyright",
      "description": "未經授權對公眾提供可公開傳輸／重製技術而受利益，視為侵害"
    },
    {
      "id": "l2",
      "group": "law",
      "label": "著作權法§88Ⅰ",
      "title": "copyright",
      "description": "因故意或過失不法侵害他人著作財產權者，負損害賠償責任"
    },
    {
      "id": "l3",
      "group": "law",
      "label": "公司法§23Ⅱ",
      "title": "company",
      "description": "公司負責人對於業務執行違反法令致他人受損害，與公司負連帶賠償責任"
    },
    {
      "id": "l4",
      "group": "law",
      "label": "民法§179",
      "title": "civil",
      "description": "無法律上原因而受利益致他人受損害者，應返還其利益（不當得利）"
    },
    {
      "id": "l5",
      "group": "law",
      "label": "民法§197Ⅱ",
      "title": "civil",
      "description": "損害賠償請求權雖因時效消滅，受害人仍得依不當得利規定請求返還"
    },

    // ── 爭點（issue）──
    {
      "id": "i1",
      "group": "issue",
      "label": "科技中立抗辯"
    },
    {
      "id": "i2",
      "group": "issue",
      "label": "時效抗辯／轉向不當得利"
    },

    // ══ 契約義務關係示範叢集（純虛構）：契約 → 條款 → 義務 三層模型 ══
    // ── 契約當事人（party，role 標示契約地位）──
    {
      "id": "c_p1",
      "group": "party",
      "label": "辛數位股份有限公司",
      "role": "甲方（委託人）",
      "family": "示範委託開發契約"
    },
    {
      "id": "c_p2",
      "group": "party",
      "label": "壬軟體工作室",
      "role": "乙方（受託人）",
      "family": "示範委託開發契約"
    },

    // ── 契約本體（contract）──
    {
      "id": "c1",
      "group": "contract",
      "label": "軟體開發委託契約（示範）",
      "title": "虛構之承攬性質委託開發契約",
      "description": "【契約概要】甲方委託乙方開發庫存管理系統，總價金新臺幣 200 萬元，開發期間 6 個月。性質上屬《中華民國民法》第 490 條之承攬契約。",
      "family": "示範委託開發契約"
    },

    // ── 條款（clause，risk 對應 compliance-verification 風險評級）──
    {
      "id": "cl1",
      "group": "clause",
      "label": "§3 交付期限",
      "title": "交付期限約定模糊",
      "description": "【條款原文】「乙方應於合理期間內交付全部開發成果。」\n\n【風險分析】「合理期間」定義不明，履行期無從特定，日後對於是否給付遲延極易產生爭議。\n\n【修改建議】明定具體日曆天（例：本契約簽訂後 180 日內交付）。",
      "risk": "medium",
      "family": "示範委託開發契約"
    },
    {
      "id": "cl2",
      "group": "clause",
      "label": "§5 報酬給付",
      "title": "分期付款約定明確",
      "description": "【條款原文】「總價金新臺幣 200 萬元，簽約時給付 30%，交付驗收合格後給付 70%。」\n\n【風險分析】給付期程與條件明確，無顯失公平情事。",
      "risk": "low",
      "family": "示範委託開發契約"
    },
    {
      "id": "cl3",
      "group": "clause",
      "label": "§8 保固維護",
      "title": "保固範圍明確",
      "description": "【條款原文】「乙方就交付成果提供 12 個月免費除錯保固，不含新功能開發。」\n\n【風險分析】保固範圍與期間明確，屬常見合理約定。",
      "risk": "low",
      "family": "示範委託開發契約"
    },
    {
      "id": "cl4",
      "group": "clause",
      "label": "§9 違約金",
      "title": "違約金無上限，顯失公平疑慮",
      "description": "【條款原文】「乙方每遲延一日，應按總價金千分之三給付懲罰性違約金，且無上限。」\n\n【風險分析】違約金未設上限，累計可能超過契約總價；若屬定型化條款，有依《中華民國民法》第 247 條之 1 顯失公平而無效之風險；縱屬有效，法院亦得依第 252 條酌減。\n\n【修改建議】增設違約金上限（例：以契約總價 20% 為限）。",
      "risk": "high",
      "family": "示範委託開發契約"
    },
    {
      "id": "cl5",
      "group": "clause",
      "label": "§10 保密義務",
      "title": "保密範圍合理",
      "description": "【條款原文】「乙方就開發過程知悉之甲方營業秘密負保密義務，契約終止後仍存續 3 年。」\n\n【風險分析】保密範圍與存續期間合理。",
      "risk": "low",
      "family": "示範委託開發契約"
    },

    // ── 義務（obligation，duty 標示民法給付義務分類）──
    {
      "id": "o1",
      "group": "obligation",
      "label": "交付軟體成果",
      "title": "乙方主給付義務",
      "description": "乙方應完成庫存管理系統之開發並交付，為本契約之主給付義務（承攬人完成工作義務）。",
      "duty": "main",
      "family": "示範委託開發契約"
    },
    {
      "id": "o2",
      "group": "obligation",
      "label": "給付報酬 200 萬元",
      "title": "甲方主給付義務",
      "description": "甲方應依 §5 分期給付報酬，為本契約之主給付義務（定作人給付報酬義務）。",
      "duty": "main",
      "family": "示範委託開發契約"
    },
    {
      "id": "o3",
      "group": "obligation",
      "label": "12 個月保固除錯",
      "title": "乙方從給付義務",
      "description": "交付後 12 個月內之免費除錯保固，輔助主給付目的之達成，屬從給付義務。",
      "duty": "collateral",
      "family": "示範委託開發契約"
    },
    {
      "id": "o4",
      "group": "obligation",
      "label": "保密",
      "title": "乙方附隨義務",
      "description": "保護甲方營業秘密之附隨義務；本例經 §10 明文約定，故甲方亦得請求履行，違反時並得依不完全給付請求損害賠償。",
      "duty": "incidental",
      "family": "示範委託開發契約"
    },

    // ── 契約叢集適用法條（law，公開法律，非虛構）──
    {
      "id": "l6",
      "group": "law",
      "label": "民法§490",
      "title": "civil",
      "description": "稱承攬者，謂當事人約定，一方為他方完成一定之工作，他方俟工作完成，給付報酬之契約"
    },
    {
      "id": "l7",
      "group": "law",
      "label": "民法§252",
      "title": "civil",
      "description": "約定之違約金額過高者，法院得減至相當之數額"
    },
    {
      "id": "l8",
      "group": "law",
      "label": "民法§247-1",
      "title": "civil",
      "description": "（節錄）依照當事人一方預定用於同類契約之條款而訂定之契約，為免除或減輕預定條款當事人責任、加重他方當事人責任、使他方當事人拋棄權利或限制其行使權利等各款約定，按其情形顯失公平者，該部分約定無效"
    }
  ],
  "edges": [
    // 當事人關聯
    { "from": "q1", "to": "j1", "label": "當事人", "title": "原告（示範電視台聯盟）提起獨立民事訴訟" },
    { "from": "p1", "to": "j1", "label": "當事人", "title": "被告（戊科技公司及示範負責人 A）" },
    { "from": "q1", "to": "j2", "label": "當事人", "title": "原告就一審敗訴部分上訴" },
    { "from": "p1", "to": "j2", "label": "當事人", "title": "被告（戊科技公司）" },
    { "from": "p3", "to": "j3", "label": "當事人", "title": "被告（庚示範集團）" },

    // 判決 → 證據
    { "from": "j1", "to": "j1_ev0", "label": "證據", "title": "被告提出，證明程式非機上盒內建" },
    { "from": "j1", "to": "j1_ev1", "label": "證據", "title": "原告提出，據以主張被告明知侵權" },
    { "from": "j2", "to": "j2_ev0", "label": "證據", "title": "被告提出時效抗辯" },
    { "from": "j2", "to": "j2_ev1", "label": "證據", "title": "原告提出，佐證出廠即內建" },

    // 法條關聯
    { "from": "j1", "to": "l1", "label": "法條關聯", "title": "原告主張視為侵害著作權" },
    { "from": "j1", "to": "l2", "label": "法條關聯", "title": "損害賠償請求權基礎" },
    { "from": "j2", "to": "l4", "label": "法條關聯", "title": "改依不當得利判賠" },
    { "from": "j2", "to": "l5", "label": "法條關聯", "title": "時效消滅後仍得請求返還利益" },
    { "from": "j1", "to": "l3", "label": "法條關聯", "title": "對負責人主張連帶賠償責任" },
    { "from": "j3", "to": "l1", "label": "法條關聯", "title": "刑事重製／公開傳輸相關" },

    // 爭點與抗辯
    { "from": "i1", "to": "j1", "label": "抗辯/阻斷", "title": "科技中立抗辯，阻斷一審侵權認定" },
    { "from": "i2", "to": "j2", "label": "抗辯/阻斷", "title": "時效抗辯成立，惟法院轉向不當得利" },

    // 判決間引用
    { "from": "j2", "to": "j1", "label": "引用", "title": "二審援引一審卷證並改判" },

    // ══ 契約義務關係示範叢集連線 ══
    // 當事人 → 契約（比照涉訟語意，表示該主體為契約當事人）
    { "from": "c_p1", "to": "c1", "label": "當事人", "title": "甲方（委託人）" },
    { "from": "c_p2", "to": "c1", "label": "當事人", "title": "乙方（受託人）" },

    // 契約 → 條款（包含）
    { "from": "c1", "to": "cl1", "label": "包含", "title": "第 3 條交付期限" },
    { "from": "c1", "to": "cl2", "label": "包含", "title": "第 5 條報酬給付" },
    { "from": "c1", "to": "cl3", "label": "包含", "title": "第 8 條保固維護" },
    { "from": "c1", "to": "cl4", "label": "包含", "title": "第 9 條違約金" },
    { "from": "c1", "to": "cl5", "label": "包含", "title": "第 10 條保密義務" },

    // 條款 → 義務（課予）
    { "from": "cl1", "to": "o1", "label": "課予", "title": "交付期限條款課予交付義務" },
    { "from": "cl2", "to": "o2", "label": "課予", "title": "報酬條款課予給付報酬義務" },
    { "from": "cl3", "to": "o3", "label": "課予", "title": "保固條款課予保固除錯義務" },
    { "from": "cl5", "to": "o4", "label": "課予", "title": "保密條款課予保密義務" },

    // 債務人 → 義務（負擔）
    { "from": "c_p2", "to": "o1", "label": "負擔", "title": "乙方為交付義務之債務人" },
    { "from": "c_p1", "to": "o2", "label": "負擔", "title": "甲方為報酬給付義務之債務人" },
    { "from": "c_p2", "to": "o3", "label": "負擔", "title": "乙方為保固義務之債務人" },
    { "from": "c_p2", "to": "o4", "label": "負擔", "title": "乙方為保密義務之債務人" },

    // 義務 → 債權人（得請求）
    { "from": "o1", "to": "c_p1", "label": "得請求", "title": "甲方得請求交付軟體成果" },
    { "from": "o2", "to": "c_p2", "label": "得請求", "title": "乙方得請求給付報酬" },
    { "from": "o3", "to": "c_p1", "label": "得請求", "title": "甲方得請求保固除錯" },
    { "from": "o4", "to": "c_p1", "label": "得請求", "title": "甲方得請求乙方履行保密義務" },

    // 義務 ↔ 義務（對價：雙務契約之牽連關係，無方向性）
    { "from": "o1", "to": "o2", "label": "對價", "title": "交付成果與給付報酬互為對價（同時履行抗辯之基礎）" },

    // 違約條款 → 義務（違約效果）
    { "from": "cl4", "to": "o1", "label": "違約效果", "title": "遲延交付觸發按日千分之三之懲罰性違約金" },

    // 契約／條款 → 法條（適用）
    { "from": "c1", "to": "l6", "label": "適用", "title": "本契約性質為承攬契約" },
    { "from": "cl4", "to": "l7", "label": "適用", "title": "違約金過高，法院得酌減" },
    { "from": "cl4", "to": "l8", "label": "適用", "title": "定型化條款落入 §247-1 各款且按其情形顯失公平者，該部分無效" }
  ]
};

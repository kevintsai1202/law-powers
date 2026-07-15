// 【虛構示範資料】legal-graph 技能關係圖 superset 範例
// 本檔為純虛構之教學／展示資料，所有當事人、公司、案號、事實均為杜撰，與任何真實個案無關。
// 用途：驅動同目錄自包含渲染器 index.html，示範各節點類型與連線語意。
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
    { "from": "j2", "to": "j1", "label": "引用", "title": "二審援引一審卷證並改判" }
  ]
};

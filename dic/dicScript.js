// ==========================================================
//  パーサー（== で意味ブロック分割）
// ==========================================================

function parseDictionaryText(text) {
  const entries = text
    .split(/^-{3,}$/m)  // --- 区切り
    .map(b => b.trim())
    .filter(b => b.length > 0);

  return entries.map(parseEntryBlock);
}

function parseEntryBlock(block) {
  const lines = block.split("\n").map(l => l.trim());

  let createdAt = "";
  let headword = "";
  let ipa = "";
  let pos = "";

  let senses = [];
  let current = null;

  lines.forEach(line => {
    if (!line) return;

    // ---- 単語全体の情報 ----

    if (line.startsWith("@")) {
      createdAt = line.slice(1).trim();
      return;
    }

    if (line.startsWith("#")) {
      const m = line.match(/^#(.+?)\s*\[(.+?)\]/);
      if (m) {
        headword = m[1].trim();
        pos = m[2].trim();
      } else {
        headword = line.slice(1).trim();
      }
      return;
    }

    if (line.startsWith(">")) {
      ipa = line.slice(1).trim();
      return;
    }

    // ---- == で意味ブロック開始 ----

    if (line === "==" || line === "== ") {
      current = {
        translations: [],
        comments: [],
        examples: [],
        inflections: [],
        notes: "",
        synonyms: [],
        antonyms: [],
        tags: []
      };
      senses.push(current);
      return;
    }

    // == が無くても、最初の - や C: が来たら 1 ブロック目自動生成
    if (!current && (line.startsWith("-") || line.match(/^[A-Z]:/))) {
      current = {
        translations: [],
        comments: [],
        examples: [],
        inflections: [],
        notes: "",
        synonyms: [],
        antonyms: [],
        tags: []
      };
      senses.push(current);
    }

    if (!current) return;

    // ---- 意味ブロック内部 ----

    if (line.startsWith("-")) {
      current.translations.push(line.slice(1).trim());
    }
    else if (line.startsWith("C:")) {
      current.comments.push(line.slice(2).trim());
    }
    else if (line.startsWith("E:")) {
      current.examples.push(line.slice(2).trim());
    }
    else if (line.startsWith("F:")) {
      const parts = line.slice(2).split(",");
      parts.forEach(part => {
        const [type, form] = part.split(":").map(s => s.trim());
        if (type && form) current.inflections.push({ type, form });
      });
    }
    else if (line.startsWith("N:")) {
      current.notes = line.slice(2).trim();
    }
    else if (line.startsWith("S:")) {
      const v = line.slice(2).trim();
      if (v) current.synonyms = v.split(",").map(s => s.trim());
    }
    else if (line.startsWith("A:")) {
      const v = line.slice(2).trim();
      if (v) current.antonyms = v.split(",").map(s => s.trim());
    }
    else if (line.startsWith("T:")) {
      const v = line.slice(2).trim();
      if (v) current.tags = v.split(",").map(s => s.trim());
    }
  });

  return {
    createdAt,
    headword,
    ipa,
    pos,
    senses
  };
}


// ==========================================================
//  表示処理（折り畳み対応）
// ==========================================================

let WORDS = [];

function displayAll() {
  const result = document.getElementById("result");
  result.innerHTML = "";
  WORDS.forEach(renderEntry);
}

function renderEntry(w) {
  const result = document.getElementById("result");

  let sensesHtml = "";

  w.senses.forEach((s, i) => {
    const number = i + 1;

    const infHtml = s.inflections.length
      ? `<table class="infl">
           <tr><th>種類</th><th>形</th></tr>
           ${s.inflections.map(f => `<tr><td>${f.type}</td><td>${f.form}</td></tr>`).join("")}
         </table>`
      : "-";

    const inner = `
      <div class="sense-block">
        <p class="htext">訳語</p>
        ${s.translations.map(t => `<p>${t}</p>`).join("")}

        <p class="htext">語義</p>
        ${s.comments.map(c => `<p>${c}</p>`).join("")}

        <p class="htext">例文</p>
        ${s.examples.map(e => `<p>${e}</p>`).join("")}

        <p class="htext">変化形</p>
        ${infHtml}

        <p><b>備考:</b> ${s.notes || "-"}</p>
        <p><b>類義語:</b> ${s.synonyms.join(" ") || "-"}</p>
        <p><b>対義語:</b> ${s.antonyms.join(" ") || "-"}</p>
        <p><b>タグ:</b> ${s.tags.join(" ") || "-"}</p>
      </div>
    `;

    if (i === 0) {
      // 最初の意味は展開状態
      sensesHtml += `
        <div class="sense">
          <h3>${number}. 基本義</h3>
          ${inner}
        </div>
      `;
    } else {
      sensesHtml += `
        <details class="sense">
          <summary>${number}. ${number}</summary>
          ${inner}
        </details>
      `;
    }
  });

  result.innerHTML += `
    <div class="entry">
      <div class="head">
        <h2>${w.headword}</h2>
        <div>${w.ipa}</div>
        <div class="pos">${w.pos}</div>
        <p><b>作成日：</b>${w.createdAt}</p>
      </div>

      ${sensesHtml}
    </div>
  `;
}


// ==========================================================
//  検索
// ==========================================================

function searchWord() {
  const q = document.getElementById("search").value.trim().toLowerCase();
  const result = document.getElementById("result");
  result.innerHTML = "";

  if (q === "") {
    displayAll();
    return;
  }

  const matches = WORDS.filter(w =>
    w.headword.toLowerCase().includes(q) ||
    w.senses.some(s => s.translations.some(t => t.includes(q)))
  );

  matches.forEach(renderEntry);
}


// ==========================================================
//  辞書読み込み
// ==========================================================

function loadDictionaryFromText(text) {
  WORDS = parseDictionaryText(text);
  displayAll();
}

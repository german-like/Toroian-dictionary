// ==========================================================
//  パーサー（IPAは一行のみ対応）
// ==========================================================

function parseDictionaryText(text) {
  const entries = text
    .split(/^-{3,}$/m)
    .map(b => b.trim())
    .filter(b => b.length > 0);

  return entries.map(parseEntryBlock);
}

function parseEntryBlock(block) {
  const lines = block.split("\n").map(l => l.trim());

  let createdAt = "";
  let headword = "";
  let ipa = "";                 // ← 単一文字列
  let pos = "";
  let translations = [];
  let comments = [];
  let examples = [];
  let inflections = [];
  let notes = "";
  let synonyms = [];
  let antonyms = [];
  let tags = [];

  lines.forEach(line => {
    if (!line) return;

    if (line.startsWith("@")) {
      createdAt = line.slice(1).trim();
    }
    else if (line.startsWith("#")) {
      const m = line.match(/^#(.+?)\s*\[(.+?)\]/);
      if (m) {
        headword = m[1].trim();
        pos = m[2].trim();
      } else {
        headword = line.slice(1).trim();
      }
    }
    else if (line.startsWith("-")) {
      translations.push(line.slice(1).trim());
    }
    else if (line.startsWith(">")) {
      ipa = line.slice(1).trim();        // ← これだけ！
    }
    else if (line.startsWith("C:")) {
      comments.push(line.slice(2).trim());
    }
    else if (line.startsWith("E:")) {
      examples.push(line.slice(2).trim());
    }
    else if (line.startsWith("F:")) {
      const parts = line.slice(2).split(",");
      parts.forEach(part => {
        const [type, form] = part.split(":").map(s => s.trim());
        if (type && form) inflections.push({ type, form });
      });
    }
    else if (line.startsWith("N:")) {
      notes = line.slice(2).trim();
    }
    else if (line.startsWith("S:")) {
      const v = line.slice(2).trim();
      if (v) synonyms = v.split(",").map(s => s.trim());
    }
    else if (line.startsWith("A:")) {
      const v = line.slice(2).trim();
      if (v) antonyms = v.split(",").map(s => s.trim());
    }
    else if (line.startsWith("T:")) {
      const v = line.slice(2).trim();
      if (v) tags = v.split(",").map(s => s.trim());
    }
  });

  return {
    createdAt,
    headword,
    ipa,
    pos,
    translations,
    comments,
    examples,
    inflections,
    notes,
    synonyms,
    antonyms,
    tags
  };
}

// ==========================================================
//  表示処理
// ==========================================================

let WORDS = [];

function displayAll() {
  const result = document.getElementById("result");
  result.innerHTML = "";
  WORDS.forEach(renderEntry);
}

function renderEntry(w) {
  const result = document.getElementById("result");

  const infHtml = w.inflections.length
    ? `<table class="infl">
         <tr><th>種類</th><th>形</th></tr>
         ${w.inflections.map(f => `<tr><td>${f.type}</td><td>${f.form}</td></tr>`).join("")}
       </table>`
    : "-";

  result.innerHTML += `
    <div class="word-card">
      <div class="head">
        <h2>${w.headword}</h2>
        <div class="ipa">${w.ipa}</div>      <!-- IPA 出力はここ -->
        <div class="pos">${w.pos}</div>
        <p><b>作成日：</b>${w.createdAt}</p>
      </div>

      <div class="bottom">
        <p class="htext">訳語</p>
        <div>${w.translations.map(t => `<p>${t}</p>`).join("") || "-"}</div>

        <p class="htext">語義</p>
        <div>${w.comments.map(c => `<p>${c}</p>`).join("") || "-"}</div>

        <p class="htext">例文</p>
        <div>${w.examples.map(e => `<p>${e}</p>`).join("") || "-"}</div>

        <p class="htext">変化形</p>
        <div>${infHtml}</div>

        <p><b>備考：</b>${w.notes || "-"}</p>
        <p><b>類義語：</b>${w.synonyms.join(" ") || "-"}</p>
        <p><b>対義語：</b>${w.antonyms.join(" ") || "-"}</p>
        <p><b>タグ：</b>${w.tags.join(" ") || "-"}</p>
      </div>
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
    w.translations.some(t => t.toLowerCase().includes(q))
  );

  matches.forEach(renderEntry);
}

// ==========================================================
//  読み込み
// ==========================================================

function loadDictionaryFromText(text) {
  WORDS = parseDictionaryText(text);
  displayAll();
}

// ==========================================================
//  パーサー（== 区切りの複数意味ブロック対応）
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

    // ---- ここから意味ブロック ----
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

    // 最初の意味ブロックが自動生成される
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

    // ---- Sense の内部パーツ ----
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

  let sensesHtml = "";
  w.senses.forEach((s, i) => {
    const infHtml = s.inflections.length
      ? `<table class="infl">
           <tr><th>種類</th><th>形</th></tr>
           ${s.inflections.map(f => `<tr><td>${f.type}</td><td>${f.form}</td></tr>`).join("")}
         </table>`
      : "-";

    const translationsHtml = s.translations.length
      ? `<ul>${s.translations.map(t => `<li>${t}</li>`).join("")}</ul>`
      : "-";

    const commentsHtml = s.comments.length
      ? `<ul>${s.comments.map(c => `<li>${c}</li>`).join("")}</ul>`
      : "-";

    const examplesHtml = s.examples.length
      ? `<ul>${s.examples.map(e => `<li>${e}</li>`).join("")}</ul>`
      : "-";

    const synonymsText = s.synonyms.length ? s.synonyms.join(", ") : "-";
    const antonymsText = s.antonyms.length ? s.antonyms.join(", ") : "-";
    const tagsText = s.tags.length ? s.tags.join(", ") : "-";

    sensesHtml += `
      <div class="sense-card">
        <h3>意味 ${i + 1}</h3>
        <p><b>訳語:</b> ${translationsHtml}</p>
        <p><b>語義:</b> ${commentsHtml}</p>
        <p><b>例文:</b> ${examplesHtml}</p>
        <p><b>変化形:</b> ${infHtml}</p>
        <p><b>備考:</b> ${s.notes || "-"}</p>
        <p><b>類義語:</b> ${synonymsText}</p>
        <p><b>対義語:</b> ${antonymsText}</p>
        <p><b>タグ:</b> ${tagsText}</p>
      </div>
    `;
  });

  result.innerHTML += `
    <div class="word-card">
      <div class="head">
        <h2>${w.headword}</h2>
        <div class="ipa">${w.ipa}</div>
        <div class="pos">${w.pos}</div>
        <p><b>作成日:</b> ${w.createdAt}</p>
      </div>
      <div class="bottom">
        ${sensesHtml}
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
    w.senses.some(s =>
      s.translations.some(t => t.toLowerCase().includes(q)) ||
      s.comments.some(c => c.toLowerCase().includes(q)) ||
      s.examples.some(e => e.toLowerCase().includes(q)) ||
      s.synonyms.some(syn => syn.toLowerCase().includes(q)) ||
      s.antonyms.some(a => a.toLowerCase().includes(q)) ||
      s.tags.some(t => t.toLowerCase().includes(q))
    )
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

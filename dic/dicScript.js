// データ保存（メモリ上）
let ENTRIES = [];

/* --------------------------------------
   ① 独自フォーマットをパース
--------------------------------------- */
function parseEntry(text) {
  const lines = text.split("\n").map(l => l.trim()).filter(l => l !== "");

  const entry = {
    date: "",
    headword: "",
    pos: "",
    description: "",
    comment: "",
    example: "",
    translation: "",
    inflections: [],
    note: "",
    synonyms: [],
    antonyms: [],
    tags: []
  };

  lines.forEach(line => {
    if (line.startsWith("@")) {
      entry.date = line.slice(1).trim();
    }
    else if (line.startsWith("#")) {
      const m = line.match(/^#(.+?)\s*\[(.+?)\]/);
      if (m) {
        entry.headword = m[1].trim();
        entry.pos = m[2].trim();
      } else {
        entry.headword = line.slice(1);
      }
    }
    else if (line.startsWith("-")) {
      entry.description = line.slice(1).trim();
    }
    else if (line.startsWith("C:")) entry.comment = line.slice(2).trim();
    else if (line.startsWith("E:")) entry.example = line.slice(2).trim();
    else if (line.startsWith("T:")) entry.translation = line.slice(2).trim();
    else if (line.startsWith("N:")) entry.note = line.slice(2).trim();
    else if (line.startsWith("S:")) {
      const v = line.slice(2).trim();
      entry.synonyms = v ? v.split(",").map(s => s.trim()) : [];
    }
    else if (line.startsWith("A:")) {
      const v = line.slice(2).trim();
      entry.antonyms = v ? v.split(",").map(s => s.trim()) : [];
    }
    else if (line.startsWith("T:")) {
      const v = line.slice(2).trim();
      entry.tags = v ? v.split(",").map(s => s.trim()) : [];
    }
    else if (line.startsWith("F:")) {
      const raw = line.slice(2).trim();
      raw.split(",").forEach(pair => {
        const [type, form] = pair.split(":");
        if (type && form) {
          entry.inflections.push({
            type: type.trim(),
            form: form.trim()
          });
        }
      });
    }
  });

  return entry;
}

/* --------------------------------------
   ② エントリ追加
--------------------------------------- */
function addEntry() {
  const text = document.getElementById("entryInput").value.trim();
  if (!text) return;

  const entry = parseEntry(text);
  if (!entry.headword) {
    alert("見出し語（#word）が必要です！");
    return;
  }

  ENTRIES.push(entry);
  document.getElementById("entryInput").value = "";
  updateEntryList();
  alert("追加しました！");
}

/* --------------------------------------
   ③ 一覧更新
--------------------------------------- */
function updateEntryList(list = ENTRIES) {
  const box = document.getElementById("entryList");
  box.innerHTML = "";

  list.forEach((e, index) => {
    const div = document.createElement("div");
    div.className = "entry-item";
    div.textContent = `${e.headword} ${e.pos ? "["+e.pos+"]" : ""}`;
    div.onclick = () => renderEntry(e);
    box.appendChild(div);
  });
}

/* --------------------------------------
   ④ 検索
--------------------------------------- */
function searchEntries() {
  const q = document.getElementById("searchBox").value.trim().toLowerCase();
  if (!q) {
    updateEntryList();
    return;
  }

  const filtered = ENTRIES.filter(e =>
    e.headword.toLowerCase().includes(q)
  );

  updateEntryList(filtered);
}

/* --------------------------------------
   ⑤ 表示（空欄項目は非表示）
--------------------------------------- */
function renderEntry(entry) {
  const result = document.getElementById("result");
  const p = [];

  if (entry.date) p.push(`<p><b>作成日：</b> ${entry.date}</p>`);

  if (entry.headword) {
    const pos = entry.pos ? `<small>[${entry.pos}]</small>` : "";
    p.push(`<h2>${entry.headword} ${pos}</h2>`);
  }

  if (entry.description) p.push(`<p><b>意味：</b> ${entry.description}</p>`);
  if (entry.comment) p.push(`<p>${entry.comment}</p>`);
  if (entry.translation) p.push(`<p><b>訳：</b> ${entry.translation}</p>`);
  if (entry.example) p.push(`<p><b>例文：</b> ${entry.example}</p>`);
  if (entry.note) p.push(`<p><b>備考：</b> ${entry.note}</p>`);

  if (entry.inflections.length > 0) {
    const rows = entry.inflections
      .map(f => `<tr><td>${f.type}</td><td>${f.form}</td></tr>`)
      .join("");

    p.push(`
      <b>活用：</b>
      <table>${rows}</table>
    `);
  }

  if (entry.synonyms.length > 0)
    p.push(`<p><b>類義語：</b> ${entry.synonyms.join(", ")}</p>`);

  if (entry.antonyms.length > 0)
    p.push(`<p><b>対義語：</b> ${entry.antonyms.join(", ")}</p>`);

  if (entry.tags.length > 0)
    p.push(`<p><b>タグ：</b> ${entry.tags.join(", ")}</p>`);

  result.innerHTML = `<div class="word-card">${p.join("\n")}</div>`;
          }

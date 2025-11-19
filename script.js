function searchWord() {
  const q = document.getElementById("search").value.trim().toLowerCase();
  const resultArea = document.getElementById("result");
  resultArea.innerHTML = "";

  if (q === "") {
    listAllWords();
    return;
  }

  const matches = WORDS.filter(w =>
    w.word.toLowerCase().includes(q)
  );

  if (matches.length === 0) {
    resultArea.innerHTML = "<p>単語が見つかりません。</p>";
    return;
  }

  displayWords(matches);
}

function listAllWords() {
  displayWords(WORDS);
}

function displayWords(wordArray) {
  const resultArea = document.getElementById("result");
  resultArea.innerHTML = "";

  wordArray.forEach(w => {
    const ipa = `<p class="stat_a"><b>発音（IPA）：</b> ${w.pronunciation?.ipa ?? "なし"}</p>`;
    const classInfo = `<p class="stat_a"><b>品詞：</b> ${w.class?.pos ?? "?"}</p>`;

    const meaningsHtml = w.meanings
      .map(m => `
        <div style="margin-bottom:10px;">
          <p><b>意味：</b> ${m.gloss}</p>
          <p>${m.description}</p>
          <p><b>例文：</b> ${m.example.sentence}</p>
          <p><i>${m.example.translation}</i></p>
        </div>
      `).join("");

    const conjugations = w.conjugations
  ? `<table border="1" style="border-collapse: collapse; margin-bottom:10px;">
      <tr>
        <th style="padding:4px 8px; background-color:#5a7078; color:#fff;">形態</th>
        <th style="padding:4px 8px; background-color:#5a7078; color:#fff;">変化形</th>
      </tr>
      ${Object.entries(w.conjugations)
        .map(([form, value]) => `
          <tr>
            <td style="padding:4px 8px; background-color:#d5e0e0;">${form}</td>
            <td style="padding:4px 8px; background-color:#d5e0e0;">${value}</td>
          </tr>
        `)
        .join("")}
    </table>`
  : "";

    const synonyms = w.synonyms?.length ? w.synonyms.join(", ") : "なし";
    const antonyms = w.antonyms?.length ? w.antonyms.join(", ") : "なし";
    const tags = w.tags?.length
      ? w.tags.map(t => `<span style="border:1px solid #999;padding:2px 6px;margin-right:4px;border-radius:6px;">${t}</span>`).join("")
      : "-";

    const updatedAt = w.updatedAt ?? "-";

    resultArea.innerHTML += `
      <div class="word-card">
        <h2>${w.word}</h2>${ipa}${classInfo}
        <div><h3>意味</h3>${meaningsHtml}</div>
        <div><h3>変化形</h3>${conjugations}</div>
        <div><b>類義語：</b> ${synonyms}</div>
        <div><b>対義語：</b> ${antonyms}</div>
        <div><b>タグ：</b> ${tags}</div>
        <div><b>最終更新：</b> ${updatedAt}</div>
      </div>
    `;
  });
}

window.onload = listAllWords;

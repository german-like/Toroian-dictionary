function listAllWords() {
  const resultArea = document.getElementById("result");
  resultArea.innerHTML = "";

  WORDS.forEach(w => {
    const pronunciations = `
      <p><b>発音（IPA）：</b> ${w.pronunciation?.ipa ?? "なし"}</p>
      <p><b>ローマナイズ：</b> ${w.pronunciation?.romanized ?? "なし"}</p>
      ${
        w.pronunciation?.audio
          ? `<audio controls src="${w.pronunciation.audio}"></audio>`
          : ""
      }
    `;

    const classInfo = `
      <p><b>品詞：</b> ${w.class?.pos ?? "?"}</p>
      <p><b>分類：</b> ${w.class?.subclass ?? "-"}</p>
    `;

    const meaningsHtml = w.meanings
      .map(m => {
        return `
          <div style="margin-bottom:10px;">
            <p><b>意味：</b> ${m.gloss}</p>
            <p>${m.description}</p>
            <p><b>例文：</b> ${m.example.sentence}</p>
            <p><i>${m.example.translation}</i></p>
          </div>
        `;
      })
      .join("");

    const synonyms = w.synonyms?.length ? w.synonyms.join(", ") : "なし";
    const antonyms = w.antonyms?.length ? w.antonyms.join(", ") : "なし";

    const tags = w.tags?.length
      ? w.tags.map(t => `<span style="border:1px solid #999;padding:2px 6px;margin-right:4px;border-radius:6px;">${t}</span>`).join("")
      : "-";

    resultArea.innerHTML += `
      <div class="word-card">
        <h2>${w.word}</h2>
        ${pronunciations}
        ${classInfo}
        <h3>意味</h3>
        ${meaningsHtml}
        <p><b>類義語：</b> ${synonyms}</p>
        <p><b>対義語：</b> ${antonyms}</p>
        <p><b>タグ：</b> ${tags}</p>
        <p><b>備考：</b> ${w.notes ?? "-"}</p>
        <p><b>最終更新：</b> ${w.updatedAt ?? "-"}</p>
      </div>
    `;
  });
}

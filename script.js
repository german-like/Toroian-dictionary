function searchWord() {
  const q = document.getElementById("search").value.trim().toLowerCase();
  const resultArea = document.getElementById("result");
  resultArea.innerHTML = "";

  const matches = WORDS.filter(w => w.word.toLowerCase().includes(q));

  if (matches.length === 0) {
    resultArea.innerHTML = "<p>単語が見つかりません。</p>";
    return;
  }

  matches.forEach(w => {
    resultArea.innerHTML += `
      <div class="word-card">
        <h2>${w.word}</h2>
        <p><b>意味：</b>${w.meaning}</p>
        <p><b>品詞：</b>${w.pos}</p>
        <p><b>例文：</b>${w.example}</p>
      </div>
    `;
  });
}

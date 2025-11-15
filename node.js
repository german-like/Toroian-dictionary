let data = null;

fetch("data.json")
  .then(res => res.json())
  .then(json => {
    data = json;
    render();
  });

function render() {
  const container = document.getElementById("dictionary");
  container.innerHTML = "";

  data.entry.forEach(e => {
    const entryDiv = document.createElement("div");
    entryDiv.classList.add("entry");

    entryDiv.innerHTML = `
      <div class="headword">${e.headword}<span class="pronunciation">[${e.pronunciation}]</span></div>
      <div class="part-of-speech">${e.part_of_speech}</div>
    `;

    e.definitions.forEach(d => {
      const defDiv = document.createElement("div");
      defDiv.classList.add("definition");

      defDiv.innerHTML += `<strong>訳語:</strong> ${d.definition}<br>`;
      defDiv.innerHTML += `<strong>語義:</strong> ${d.sense}`;

      if (d.examples.length > 0) {
        const ex = document.createElement("div");
        ex.classList.add("examples");
        ex.innerHTML = `<strong>例:</strong> ${d.examples.join(", ")}`;
        defDiv.appendChild(ex);
      }

      entryDiv.appendChild(defDiv);
    });

    const conjugationDiv = document.createElement("div");
    conjugationDiv.classList.add("conjugation");
    conjugationDiv.innerHTML = `<strong>活用:</strong> ${JSON.stringify(e.conjugation.forms)}`;
    entryDiv.appendChild(conjugationDiv);

    const relatedDiv = document.createElement("div");
    relatedDiv.classList.add("related-words");
    relatedDiv.innerHTML =
      `<strong>関連語:</strong> 同義語(${e.related_words.synonyms.join(", ")}), ` +
      `反意語(${e.related_words.antonyms.join(", ")}), ` +
      `派生語(${e.related_words.derived.join(", ")})`;
    entryDiv.appendChild(relatedDiv);

    if (e.tags.length > 0) {
      const tagsDiv = document.createElement("div");
      tagsDiv.classList.add("tags");
      tagsDiv.innerHTML = `<strong>タグ:</strong> ${e.tags.join(", ")}`;
      entryDiv.appendChild(tagsDiv);
    }

    container.appendChild(entryDiv);
  });
}

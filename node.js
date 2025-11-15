        // サンプルJSON
        import jsonFile from './data.json' assert { type: 'json' };

        const data = jsonFile;

        const container = document.getElementById("dictionary");

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
                defDiv.innerHTML = `<strong>訳語:</strong> ${d.definition}`;
                defDiv.innerHTML = `<strong>語義:</strong> ${d.sense}`;
                if (d.examples.length > 0) {
                    const examplesDiv = document.createElement("div");
                    examplesDiv.classList.add("examples");
                    examplesDiv.innerHTML = `<strong>例:</strong> ${d.examples.join(", ")}`;
                    defDiv.appendChild(examplesDiv);
                }
                entryDiv.appendChild(defDiv);
            });

            // 活用
            const conjugationDiv = document.createElement("div");
            conjugationDiv.classList.add("conjugation");
            conjugationDiv.innerHTML = `<strong>活用:</strong> ${JSON.stringify(e.conjugation.forms)}`;
            entryDiv.appendChild(conjugationDiv);

            // 関連語
            const relatedDiv = document.createElement("div");
            relatedDiv.classList.add("related-words");
            relatedDiv.innerHTML = `<strong>関連語:</strong> 同義語(${e.related_words.synonyms.join(", ")}), 反意語(${e.related_words.antonyms.join(", ")}), 派生語(${e.related_words.derived.join(", ")})`;
            entryDiv.appendChild(relatedDiv);

            // タグ
            if (e.tags.length > 0) {
                const tagsDiv = document.createElement("div");
                tagsDiv.classList.add("tags");
                tagsDiv.innerHTML = `<strong>タグ:</strong> ${e.tags.join(", ")}`;
                entryDiv.appendChild(tagsDiv);
            }

            container.appendChild(entryDiv);
        });

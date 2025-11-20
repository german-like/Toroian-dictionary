import * as fs from "fs";

function parseTDW(filePath: string): WordEntry[] {
  const lines = fs.readFileSync(filePath, "utf-8").split(/\r?\n/);
  const entries: WordEntry[] = [];
  let entry: WordEntry | null = null;
  let summaryMode = false;

  for (const lineRaw of lines) {
    const line = lineRaw.trim();
    if (!line) continue;

    if (line.startsWith("*")) {
      entry = {
        spelling: line.slice(1),
        coinedDate: "",
        summary: "",
        translations: [],
        meanings: [],
        examples: [],
        notes: [],
        inflections: [],
        relatedWords: []
      };
      entries.push(entry);
    } else if (!entry) {
      continue; // 先頭に*がない行は無視
    } else if (line.startsWith("#")) {
      entry.coinedDate = line.slice(1);
    } else if (line.startsWith("!JA")) {
      summaryMode = true;
      entry.summary = line.slice(3).trim();
    } else if (line === "!") {
      summaryMode = false;
    } else if (summaryMode) {
      entry.summary += " " + line;
    } else if (line.startsWith(">")) {
      const [textPart, posPart] = line.slice(1).split("[");
      const pos = posPart?.replace("]", "").split(",").map(p => p.trim()) || [];
      entry.translations.push({ text: textPart.trim(), pos });
    } else if (line.startsWith("M-")) {
      entry.meanings.push(line.slice(2).trim());
    } else if (line.startsWith("E-")) {
      entry.examples.push(line.slice(2).trim());
    } else if (line.startsWith("N-")) {
      entry.notes.push(line.slice(2).trim());
    } else if (line.startsWith("F-")) {
      const [form, word] = line.slice(2).split(":");
      entry.inflections.push({ form: form.trim(), word: word.trim() });
    } else if (line.startsWith("+")) {
      const [word, type] = line.slice(1).split("[");
      entry.relatedWords.push({ word: word.trim(), type: type.replace("]", "").trim() });
    }
  }

  return entries;
}

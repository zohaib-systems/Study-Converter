// Rule-based bullet notes generator
function tokenize(text) {
  return text.match(/\b\w+\b/g) || [];
}

function getNouns(text) {
  // Simple noun detection: words after 'the', 'a', 'an', or capitalized words
  const words = tokenize(text);
  const nouns = new Set();
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (/^[A-Z][a-z]+$/.test(w) && w.length > 2) nouns.add(w);
    if (["the","a","an"].includes(words[i-1]?.toLowerCase())) nouns.add(w);
  }
  return Array.from(nouns);
}

export function generateNotes(text) {
  const sentences = text.match(/[^.!?\n]+[.!?\n]+/g) || [text];
  const keywords = getNouns(text);
  const notes = [];
  keywords.forEach(keyword => {
    const related = sentences.filter(s => s.includes(keyword));
    if (related.length) {
      notes.push({
        heading: keyword,
        points: related.map(s => s.trim())
      });
    }
  });
  return notes;
}

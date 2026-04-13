// Rule-based quiz generator
const distractorList = [
  "process", "system", "object", "element", "concept", "method", "function", "variable", "structure", "model", "theory", "principle", "term", "definition", "example"
];

function tokenize(text) {
  return text.match(/\b\w+\b/g) || [];
}

function getNouns(text) {
  // Simple noun detection: capitalized words or after 'the', 'a', 'an'
  const words = tokenize(text);
  const nouns = new Set();
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (/^[A-Z][a-z]+$/.test(w) && w.length > 2) nouns.add(w);
    if (["the","a","an"].includes(words[i-1]?.toLowerCase())) nouns.add(w);
  }
  return Array.from(nouns);
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateQuiz(text, numQuestions = 5) {
  const sentences = text.match(/[^.!?\n]+[.!?\n]+/g) || [text];
  const nouns = getNouns(text);
  const questions = [];
  let used = new Set();
  for (let s of sentences) {
    let found = nouns.find(n => s.includes(n) && !used.has(n));
    if (found) {
      used.add(found);
      const blanked = s.replace(found, "_____ ");
      // Distractors: pick 3 from distractorList or nouns
      let distractors = shuffle([
        ...distractorList.filter(d => d !== found),
        ...nouns.filter(n => n !== found)
      ]).slice(0, 3);
      const options = shuffle([found, ...distractors]);
      questions.push({
        question: blanked.trim(),
        options,
        answer: found
      });
      if (questions.length >= numQuestions) break;
    }
  }
  return questions;
}

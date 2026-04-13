// Rule-based extractive summarizer
const stopwords = new Set([
  "the","is","in","at","of","a","and","to","it","for","on","with","as","by","an","be","this","that","from","or","are","was","but","not","have","has","had","were","which","will","would","can","could","should","may","might","do","does","did","so","if","than","then","about","into","more","most","such","no","nor","too","very","also","just","any","all","each","other","some","own","same","over","after","before","between","both","few","because","while","during","where","when","how","what","who","whom","whose","why","these","those","he","she","they","we","you","i","me","him","her","them","us","my","your","his","their","our","its"
]);

function tokenize(text) {
  return text.match(/\b\w+\b/g) || [];
}

export function summarizeText(text, numSentences = 4) {
  const sentences = text.match(/[^.!?\n]+[.!?\n]+/g) || [text];
  const wordFreq = {};
  const words = tokenize(text.toLowerCase());
  words.forEach(word => {
    if (!stopwords.has(word)) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });
  const sentenceScores = sentences.map(sentence => {
    const sentenceWords = tokenize(sentence.toLowerCase());
    let score = 0;
    sentenceWords.forEach(word => {
      if (wordFreq[word]) score += wordFreq[word];
    });
    return score;
  });
  // Get top N sentences
  const topIndexes = sentenceScores
    .map((score, idx) => [score, idx])
    .sort((a, b) => b[0] - a[0])
    .slice(0, numSentences)
    .map(pair => pair[1])
    .sort((a, b) => a - b);
  return topIndexes.map(idx => sentences[idx].trim()).join(" ");
}

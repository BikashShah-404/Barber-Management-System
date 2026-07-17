/**
 * Cosine similarity for simple text search ranking.
 */
const tokenize = (text = '') =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

const vectorize = (tokens, vocab) => {
  const vec = new Array(vocab.length).fill(0);
  tokens.forEach((t) => {
    const i = vocab.indexOf(t);
    if (i >= 0) vec[i] += 1;
  });
  return vec;
};

const cosineSimilarity = (a, b) => {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (!na || !nb) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
};

const rankByCosine = (query, documents) => {
  const qTokens = tokenize(query);
  if (!qTokens.length) return documents.map((d, i) => ({ index: i, score: 0 }));

  return documents
    .map((doc, index) => {
      const dTokens = tokenize(doc);
      const vocab = [...new Set([...qTokens, ...dTokens])];
      const score = cosineSimilarity(vectorize(qTokens, vocab), vectorize(dTokens, vocab));
      return { index, score };
    })
    .sort((a, b) => b.score - a.score);
};

module.exports = { rankByCosine, cosineSimilarity, tokenize };

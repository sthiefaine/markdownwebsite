export function boldFirstLetters(
  text: string,
  boldLength: number = 4
): string {
  const markdownRegex =
    /(\*\*[^*]+\*\*|==[^=]+==|~~[^~]+~~|`[^`]+`|>[^\n]+|\[.*?\]\(.*?\)|!\[.*?\]\(.*?\)|_[^_]+_)/g;

  // Expression pour détecter les caractères spéciaux ou ponctuations avant un mot
  const punctuationRegex = /^([«"»_\(\[{]+)(.+)$/;

  // détecter les lignes comme "===" ou "---"
  const specialLineRegex = /^([=-])\1*$/;

  const paragraphs = text.split(/\n\s*\n/);

  // Transformer chaque paragraphe ou bloc
  const transformedParagraphs = paragraphs.map((paragraph) => {
    const lines = paragraph.split("\n"); // Traiter chaque ligne individuellement

    const transformedLines = lines.map((line) => {
      if (specialLineRegex.test(line)) {
        // Ne pas modifier les lignes spéciales (comme === ou ---)
        return line;
      }

      // Diviser la ligne en segments Markdown ou texte brut
      const segments = line.split(markdownRegex);

      const transformedSegments = segments.map((segment) => {
        if (markdownRegex.test(segment)) {
          return segment;
        }

        const words = segment.split(/\s+/);

        // Appliquer la mise en gras aux mots
        const transformedWords = words.map((word) => {

          if (word.startsWith("_»")) {
            return word;
          }

          const match = word.match(punctuationRegex);

          if (match) {
            // Si un mot commence par une ponctuation ou un caractère spécial
            const punctuation = match[1];
            const remainingWord = match[2];

            if (remainingWord.length <= boldLength) {
              return `${punctuation}**${remainingWord}**`;
            }

            const boldPart = remainingWord.slice(0, boldLength);
            const rest = remainingWord.slice(boldLength);
            return `${punctuation}**${boldPart}**${rest}`;
          }

          if (word.length <= boldLength) {
            return `**${word}**`;
          }
          const boldPart = word.slice(0, boldLength);
          const rest = word.slice(boldLength);
          return `**${boldPart}**${rest}`;
        });

        return transformedWords.join(" ");
      });

      return transformedSegments.join("");
    });

    return transformedLines.join("\n");
  });

  return transformedParagraphs.join("\n\n");
}

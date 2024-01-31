class XMLParseError extends Error {
}
class ValidationError extends Error {
}
class FileSizeError extends Error {
}
class TokenCountError extends Error {
    /**
     *
     * @param {number} tokenCount
     */
    constructor(tokenCount) {
        if (tokenCount === 0) {
            super("No tokens found.");
        }
        else {
            super(`${tokenCount} tokens found in the file. Should be ` +
                `${Constants.MAXTOKENS} or fewer.`);
        }
    }
}
class SentenceCountError extends Error {
    /**
     *
     * @param {number} sentenceCount
     */
    constructor(sentenceCount) {
        if (sentenceCount === 0) {
            super("No tokens found");
        }
        else {
            super(`${sentenceCount} tokens found. Should be ` +
                `${Constants.MAXSENTENCES} or fewer.`);
        }
    }
}
class TokensPerSentenceError extends Error {
    /**
     *
     * @param {number} tokenCount
     * @param {string} sentenceId
     */
    constructor(tokenCount, sentenceId) {
        super(`Sentence ${sentenceId} has too many tokens (${tokenCount}). ` +
            `Should be ` +
            `${Constants.MAXTOKENSPERSENTENCE} or fewer.`);
    }
}
/**
 * For when a given HTML element cannot be found
 * in the document
 */
class NoElementError extends Error {
    /**
     *
     * @param {string} elementIDOrSelector
     */
    constructor(elementIDOrSelector) {
        super(`Could not find element ${elementIDOrSelector}`);
    }
}

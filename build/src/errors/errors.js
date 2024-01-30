class XMLParseError extends Error {
}
class ValidationError extends Error {
}
class FileSizeError extends Error {
}
class TokenCountError extends Error {
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

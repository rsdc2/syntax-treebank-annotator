/**
 * Validates an Arethusa file

 */
class ArethusaValidator {
    #doc;
    /**
     *
     * @param {ArethusaDoc} arethusa
     */
    constructor(arethusa) {
        this.#doc = arethusa;
    }
    /**
     * Validates the Arethusa file
     * @param {ArethusaDoc} arethusa
     * @returns {boolean} returns false if not valid
     */
    static validate(arethusa) {
        try {
            return ArethusaValidator.assertValid(arethusa);
        }
        catch (e) {
            if (e instanceof ValidationError) {
                return false;
            }
            throw e;
        }
    }
    /**
     * Validates the Arethusa file
     * @returns {boolean} true if valid, false if invalid
     */
    validate() {
        return ArethusaValidator.validate(this.#doc);
    }
    /**
     * Validates an Arethusa file
     * @param {ArethusaDoc} arethusa
     * @returns {boolean} true if valid, raises ValidationError if invalid
     */
    static assertValid(arethusa) {
        // Check that has a <treebank/> element
        if (arethusa.node.nodeName !== "treebank") {
            const message = "The file has no <treebank/> element";
            throw new ValidationError(message);
        }
        // Check that there are some tokens in the file
        if (arethusa.tokens.length === 0) {
            const message = "The file has no tokens";
            throw new TokenCountError(0);
        }
        // Check that not too many tokens
        if (arethusa.tokens.length > Constants.MAXTOKENS) {
            throw new TokenCountError(arethusa.tokens.length);
        }
        // Check that not too many sentences
        if (arethusa.sentences.length > Constants.MAXSENTENCES) {
            throw new SentenceCountError(arethusa.sentences.length);
        }
        // Check that no sentence has more than 
        // the maximum number of tokens per sentence
        arethusa.sentences.forEach((sentence) => {
            if (sentence.tokens.length > Constants.MAXTOKENSPERSENTENCE) {
                throw new TokensPerSentenceError(sentence.tokens.length, sentence._id.fromMaybe("?"));
            }
        });
        return true;
    }
    /**
     * Validates the Arethusa file
     * @returns {boolean} true if valid, raises ValidationError if invalid
     */
    assertValid() {
        return ArethusaValidator.assertValid(this.#doc);
    }
}

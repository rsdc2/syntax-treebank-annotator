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
        if (arethusa.node.nodeName !== "treebank") {
            const message = "The file has no <treebank/> element";
            throw new ValidationError(message);
        }
        if (arethusa.tokens.length === 0) {
            const message = "The file has no tokens";
            throw new TokenCountError(message);
        }
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

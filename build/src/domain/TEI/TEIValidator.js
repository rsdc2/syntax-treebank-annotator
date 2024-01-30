/**
 * Validates an Arethusa file

 */
class TEIValidator {
    #doc;
    /**
     *
     * @param {EpiDoc} epidoc
     */
    constructor(epidoc) {
        this.#doc = epidoc;
    }
    /**
     * Validates the Arethusa file
     * @param {EpiDoc} epidoc
     * @returns {boolean} returns false if not valid
     */
    static validate(epidoc) {
        try {
            return TEIValidator.assertValid(epidoc);
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
        return TEIValidator.validate(this.#doc);
    }
    /**
     * Validates an Arethusa file
     * @param {EpiDoc} epidoc
     * @returns {boolean} true if valid, raises ValidationError if invalid
     */
    static assertValid(epidoc) {
        if (epidoc.node.nodeName !== "TEI") {
            const message = "The file has no <TEI/> element";
            throw new ValidationError(message);
        }
        return true;
    }
    /**
     * Validates the Arethusa file
     * @returns {boolean} true if valid, raises ValidationError if invalid
     */
    assertValid() {
        return TEIValidator.assertValid(this.#doc);
    }
}

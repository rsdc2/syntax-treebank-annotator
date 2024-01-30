class ErrorHandler {
    /**
     *
     * @param {Error} e
     * @returns {boolean}
     */
    static handle(e) {
        const outputArethusaDiv = ArethusaDiv.control_;
        if (e instanceof XMLParseError) {
            outputArethusaDiv.replaceChildren(e.message);
        }
        else if (e instanceof ValidationError) {
            outputArethusaDiv.replaceChildren(e.message);
        }
        else if (e instanceof TokenCountError) {
            outputArethusaDiv.replaceChildren(e.message);
        }
        else {
            throw e;
        }
        return false;
    }
}

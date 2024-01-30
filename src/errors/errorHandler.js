class ErrorHandler {

    /**
     * 
     * @param {Error} e 
     * @returns {boolean}
     */
    static handle (e) {

        const outputArethusaDiv = ArethusaDiv.control_

        if (e instanceof XMLParseError) {
            outputArethusaDiv.replaceChildren(e.message)
        }
        else if (e instanceof ValidationError) {
            outputArethusaDiv.replaceChildren(e.message)                
        } 
        else if (e instanceof TokenCountError) {
            outputArethusaDiv.replaceChildren(e.message)           
        } 
        else {
            throw e
        }

        return false

    }

    /**
     * 
     * @param {Array.<typeof Error>} errors 
     * @param {Error} e
     * @returns {boolean} 
     */
    static handleSpecific (errors, e) {
        const outputArethusaDiv = ArethusaDiv.control_

        errors.forEach(
            (error) => {
                if (e instanceof error) {
                    outputArethusaDiv.replaceChildren(e.message)           
                }
            }
        )
        return false
    }


}
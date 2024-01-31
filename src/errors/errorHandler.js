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
     * If error is included in errors, prints the 
     * error message to the Arethusa output <div/> 
     * element. Otherwise throws the error.
     * @param {Array.<object>} errors 
     * @param {Error} e
     * @returns {boolean} false, i.e. an error has been generated
     */
    static printErrorMsgSpecific (errors, e) {
        const outputArethusaDiv = ArethusaDiv.control_

        let found = false

        errors.forEach(
            (error) => {
                if (e instanceof error) {
                    outputArethusaDiv.replaceChildren(e.message)      
                    found = true     
                }
            }
        )

        if (!found) {
            throw e
        }
        return false
    }


}
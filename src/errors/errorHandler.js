class ErrorHandler {

    /**
     * 
     * @param {Error} e 
     */
    static handle (e) {

        const outputArethusaDiv = ArethusaDiv.control._value
        
        if (outputArethusaDiv == null) {
            throw new Error ("No output Arethusa <div> element")
        }

        if (e instanceof XMLParseError) {
            outputArethusaDiv.replaceChildren(e.message)
        }

        else if (e instanceof ValidationError) {
            outputArethusaDiv.replaceChildren(e.message)                
        } 

        else {
            throw e
        }

    }

}
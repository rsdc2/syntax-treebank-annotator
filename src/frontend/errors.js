class FileError extends Error {

    /**
     * 
     * @param {string} msg 
     */
    constructor(msg) {
        
        const msg_ = "FileError: " + msg
        super(msg_)
    }

}
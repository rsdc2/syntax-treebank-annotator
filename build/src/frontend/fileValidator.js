class FileValidator {
    /**
     *
     * @param {File} file
     * @param {string} ext
     */
    static assertCorrectExt(file, ext) {
        const fileExt = "." + file.name.split(".").reverse()[0];
        if (fileExt == null) {
            throw new FileError("No file extension present");
        }
        if (fileExt !== ext) {
            throw new FileError(`Required file extension ${ext} does not ` +
                `match actual file extension ${fileExt}`);
        }
    }
}

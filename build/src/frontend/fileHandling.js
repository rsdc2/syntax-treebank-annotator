// For the approach
// cf. https://github.com/papyrs/markdown-plugin/blob/main/src/plugin/utils/save.utils.ts (MIT license)
// For an explanation, see also https://itnext.io/export-to-the-file-system-save-as-fallback-in-typescript-6561eba853cb
// The approach is implemented here in a functional pattern
var FileHandling;
(function (FileHandling) {
    FileHandling.download = (filename) => (fileContent) => {
        const url = MaybeT.of(fileContent)
            .fmap(Str.blobify)
            .fmap(HTML.URL.createObjectURL);
        const setUrl = url.fmap(HTML.Elem.setAttr("href"));
        HTML.Elem
            .create('a')
            .applyFmap(setUrl)
            .fmap(HTML.Elem.setAttr("download")(`${filename}.xml`))
            .fmap(HTML.Elem.click)
            .fmap(HTML.Elem.remove);
        url.fmap(HTML.URL.revokeObjectURL);
    };
    /**
     *
     * @param ext file extension including '.'
     * @returns
     */
    FileHandling.loadFromDialog = (ext) => (callback) => {
        const onchangeFunc = FileInput.onchange(callback, ext);
        const setOnChangeFunc = HTML.Elem.setOnChangeFunc(onchangeFunc);
        HTML.Elem
            .create("input")
            .fmapErr("Error", HTML.Elem.setAttr("type")("file"))
            .fmapErr("Error", HTML.Elem.setAttr("accept")(ext))
            .fmap(setOnChangeFunc)
            .fmapErr("Error", HTML.Elem.click)
            .fmap(HTML.Elem.remove);
    };
    let TextFile;
    (function (TextFile) {
        TextFile.process = (processString) => (encoding, ext) => (file) => {
            FileValidator.assertCorrectExt(file, ext);
            const reader = new FileReader();
            reader.readAsText(file, encoding);
            reader.onload = (e) => {
                const fileContent = e.target?.result;
                // TODO handle array buffer
                processString(fileContent);
            };
        };
    })(TextFile = FileHandling.TextFile || (FileHandling.TextFile = {}));
    let FR;
    (function (FR) {
        FR.result = (fr) => {
            return MaybeT.of(fr.result);
        };
    })(FR = FileHandling.FR || (FileHandling.FR = {}));
    let FileInput;
    (function (FileInput) {
        FileInput.files = (elem) => {
            return MaybeT.of(elem.files);
        };
        /**
         * This is what happens when the file has been selected
         * and loaded with the dialog
         * @param callback
         * @param ext File extension, including initial '.'
         * @returns
         */
        FileInput.onchange = (callback, ext) => (e) => {
            const file = MaybeT.of(e.target)
                .bind(FileInput.files)
                .fmap(Arr.fromIterable)
                .bind(Arr.head);
            try {
                if (file.value?.size !== undefined && file.value.size < Constants.MAXFILESIZE * 1000) {
                    file.fmap(TextFile.process(callback)('UTF-8', ext));
                }
                else {
                    throw new FileSizeError(`File is too large. ` +
                        `Files must be smaller than ` +
                        `${Constants.MAXFILESIZE}KB`);
                }
            }
            catch (error) {
                return ErrorHandler.printErrorMsgSpecific([
                    FileSizeError,
                    FileError
                ], error);
            }
        };
    })(FileInput = FileHandling.FileInput || (FileHandling.FileInput = {}));
})(FileHandling || (FileHandling = {}));

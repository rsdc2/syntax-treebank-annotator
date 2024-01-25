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
    FileHandling.loadFromDialog = (fileFormat) => (callback) => {
        const onchangeFunc = FileInput.onchange(callback);
        const setOnChangeFunc = HTML.Elem.setOnChangeFunc(onchangeFunc);
        HTML.Elem
            .create('input')
            .fmapErr("Error", HTML.Elem.setAttr('type')('file'))
            .fmapErr("Error", HTML.Elem.setAttr('accept')(fileFormat))
            .fmap(setOnChangeFunc)
            .fmapErr("Error", HTML.Elem.click)
            .fmap(HTML.Elem.remove);
    };
    let TextFile;
    (function (TextFile) {
        TextFile.process = (f) => (encoding) => (blob) => {
            const reader = new FileReader();
            reader.readAsText(blob, encoding);
            reader.onload = (e) => {
                const fileContent = MaybeT.of(e.target)
                    .bind(FR.result);
                // TODO handle array buffer
                fileContent.applyFmap(f);
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
        FileInput.onchange = (callback) => (e) => {
            const file = MaybeT.of(e.target)
                .bind(FileInput.files)
                .fmap(Arr.fromIterable)
                .bind(Arr.head);
            try {
                if (file.value?.size !== undefined && file.value.size < 50000) {
                    file.fmap(TextFile.process(callback)('UTF-8'));
                }
                else {
                    throw new FileSizeError("File is too large. Files must be below 50KB");
                }
            }
            catch (error) {
                if (error instanceof FileSizeError) {
                    const outputArethusaDiv = ArethusaDiv.control._value;
                    if (outputArethusaDiv != null) {
                        outputArethusaDiv.replaceChildren("ERROR: " + error.message);
                    }
                    else {
                        throw new Error("Missing output div element");
                    }
                }
                else {
                    throw error;
                }
            }
        };
    })(FileInput = FileHandling.FileInput || (FileHandling.FileInput = {}));
})(FileHandling || (FileHandling = {}));

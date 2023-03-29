var FileHandling;
(function (FileHandling) {
    FileHandling.download = (s) => {
        const url = MaybeT.of(s)
            .fmap(Str.blobify)
            .fmap(HTML.URL.createObjectURL);
        const setUrl = url.fmap(HTML.Elem.setAttr("href"));
        MaybeT.of(document.createElement('a'))
            .fmap(HTML.Elem.setAttr("style")("display: none"))
            .applyFmap(setUrl)
            .fmap(HTML.Elem.setAttr("download")('arethusa.xml'))
            .fmap(HTML.Elem.click);
        url.fmap(HTML.URL.revokeObjectURL);
    };
    FileHandling.loadFromDialog = (fileFormats) => (callback) => {
        const fileInput = document
            .createElement('input');
        fileInput.type = "file";
        fileInput.accept = fileFormats;
        fileInput.onchange = InputElem.onchange(callback);
        fileInput.click();
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
    let InputElem;
    (function (InputElem) {
        InputElem.files = (elem) => {
            return MaybeT.of(elem.files);
        };
        InputElem.onchange = (callback) => (e) => {
            MaybeT.of(e.target)
                .bind(InputElem.files)
                .fmap(Arr.fromIterable)
                .bind(Arr.head)
                .fmap(TextFile.process(callback)('UTF-8'));
        };
    })(InputElem = FileHandling.InputElem || (FileHandling.InputElem = {}));
})(FileHandling || (FileHandling = {}));

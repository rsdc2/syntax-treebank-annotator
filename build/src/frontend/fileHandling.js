var FileHandling;
(function (FileHandling) {
    FileHandling.loadFromDialog = (callback) => {
        const fileInput = document.createElement('input');
        fileInput.type = "file";
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

var FileHandling;
(function (FileHandling) {
    const saveFile = () => {
    };
    const files = (elem) => {
        return MaybeT.of(elem.files);
    };
    const fileInputChange = (e) => {
        MaybeT.of(e.target)
            .bind(files)
            .fmap(Arr.fromIterable)
            .bind(Arr.head)
            .fmap(processTextFile(Frontend.processArethusa)('UTF-8'));
    };
    FileHandling.loadFile = () => {
        const fileInput = document.createElement('input');
        fileInput.type = "file";
        fileInput.onchange = fileInputChange;
        fileInput.click();
    };
    const processTextFile = (f) => (encoding) => (blob) => {
        const reader = new FileReader();
        reader.readAsText(blob, encoding);
        reader.onload = (e) => {
            const target = e.target;
            const fileContent = MaybeT.of(target === null || target === void 0 ? void 0 : target.result);
            fileContent.fmap(f);
        };
    };
})(FileHandling || (FileHandling = {}));

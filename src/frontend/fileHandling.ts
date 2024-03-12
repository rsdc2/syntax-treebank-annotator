// For the approach
// cf. https://github.com/papyrs/markdown-plugin/blob/main/src/plugin/utils/save.utils.ts (MIT license)
// For an explanation, see also https://itnext.io/export-to-the-file-system-save-as-fallback-in-typescript-6561eba853cb
// The approach is implemented here in a functional pattern

namespace FileHandling {

    export const download =
        (filename: string) =>
            (fileContent: string) => {
                const url = MaybeT.of(fileContent)
                    .fmap(Str.blobify)
                    .fmap(HTML.URL.createObjectURL)

                const setUrl = url.fmap(HTML.Elem.setAttr("href"))

                HTML.Elem
                    .create('a')
                    .applyFmap(setUrl)
                    .fmap(HTML.Elem.setAttr("download")(`${filename}.xml`))
                    .fmap(HTML.Elem.click)
                    .fmap(HTML.Elem.remove)

                url.fmap(HTML.URL.revokeObjectURL);
            }

    /**
     * 
     * @param ext file extension including '.'
     * @returns 
     */
    export const loadFromDialog =
        (ext: string) =>
            (callback: (a: string) => any) => {
                const onchangeFunc = FileInput.onchange(callback, ext)
                const setOnChangeFunc = HTML.Elem.setOnChangeFunc(onchangeFunc)

                HTML.Elem
                    .create("input")
                    .fmapErr("Error", HTML.Elem.setAttr("type")("file"))
                    .fmapErr("Error", HTML.Elem.setAttr("accept")(ext))
                    .fmap(setOnChangeFunc)
                    .fmapErr("Error", HTML.Elem.click)
                    .fmap(HTML.Elem.remove)
            }

    export namespace TextFile {
        export const process =
            (processString: (a: string) => any) =>
                (encoding: string, ext: string) =>
                    (file: File) => {
                        FileValidator.assertCorrectExt(file, ext)
                        const reader = new FileReader();
                        reader.readAsText(file, encoding);

                        reader.onload = (e: ProgressEvent<FileReader>) => {
                            const fileContent = e.target?.result as string;

                            // TODO handle array buffer
                            processString(fileContent)
                        }
                    }

    }

    export namespace FR {
        export const result = (fr: FileReader) => {
            return MaybeT.of(fr.result)
        }
    }

    export namespace FileInput {
        export const files = (elem: HTMLInputElement) => {
            return MaybeT.of(elem.files);
        }

        /**
         * This is what happens when the file has been selected
         * and loaded with the dialog
         * @param callback 
         * @param ext File extension, including initial '.'
         * @returns 
         */
        export const onchange = (callback: (a: string) => any, ext: string) => (e: Event) => {
            const file = MaybeT.of(e.target as HTMLInputElement | null)
                .bind(FileInput.files)
                .fmap(Arr.fromIterable)
                .bind(Arr.head)

            try {
                if (file.value?.size !== undefined && file.value.size < Constants.MAXFILESIZE * 1000) {
                    file.fmap(TextFile.process(callback)('UTF-8', ext))
                } else {
                    throw new FileSizeError(
                        `File is too large. ` +
                        `Files must be smaller than ` +
                        `${Constants.MAXFILESIZE}KB`
                    )
                }
            } catch (error) {
                return ErrorHandler.printErrorMsgSpecific([
                    FileSizeError,
                    FileError
                ], error
                )
            }

        }

    }


}

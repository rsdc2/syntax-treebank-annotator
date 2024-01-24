// For the approach
// cf. https://github.com/papyrs/markdown-plugin/blob/main/src/plugin/utils/save.utils.ts (MIT license)
// For an explanation, see also https://itnext.io/export-to-the-file-system-save-as-fallback-in-typescript-6561eba853cb
// The approach is implemented here in a functional pattern

namespace FileHandling {

    export const download = 
        (filename: string) =>
        (fileContent: string) => 
    {
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

    export const loadFromDialog = 
        (fileFormat:string) =>
        (callback: Maybe<(a: string) => any>) => 
    {
        const onchangeFunc = FileInput.onchange(callback)
        const setOnChangeFunc = HTML.Elem.setOnChangeFunc(onchangeFunc)

        HTML.Elem
            .create('input')
            .fmapErr("Error", HTML.Elem.setAttr('type')('file'))
            .fmapErr("Error", HTML.Elem.setAttr('accept')(fileFormat))
            .fmap(setOnChangeFunc)
            .fmapErr("Error", HTML.Elem.click)
            .fmap(HTML.Elem.remove)
    }

    export namespace TextFile {
        export const process = 
            (f: Maybe<(a: string) => any>) => 
            (encoding: string) => 
            (blob: Blob) =>  
        
        {
            const reader = new FileReader();
            reader.readAsText(blob, encoding);
    
            reader.onload = (e: ProgressEvent<FileReader>) => {
                const fileContent = MaybeT.of(e.target)
                    .bind(FR.result);
    
                // TODO handle array buffer
                fileContent.applyFmap(f)
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

        export const onchange = (callback: Maybe<(a: string) => any>) => (e: Event) => {
            const file = MaybeT.of(e.target as HTMLInputElement | null)
                .bind(FileInput.files)
                .fmap(Arr.fromIterable)
                .bind(Arr.head)
            
            if (file.value?.size !== undefined && file.value.size < 100000) {
                file.fmap(TextFile.process (callback) ('UTF-8'))
            } else {
                console.log('File too large')
            }
        }
        
    }


}

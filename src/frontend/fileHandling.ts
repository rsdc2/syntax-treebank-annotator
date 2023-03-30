namespace FileHandling {

    export const download = (s: string) => {
        const url = MaybeT.of(s)
            .fmap(Str.blobify)
            .fmap(HTML.URL.createObjectURL)

        const setUrl = url.fmap(HTML.Elem.setAttr("href"))

        HTML.Elem
            .create('a')
            .fmap(HTML.Elem.setAttr("style")("display: none"))
            .applyFmap(setUrl)
            .fmap(HTML.Elem.setAttr("download")('arethusa.xml'))
            .fmap(HTML.Elem.click)
      
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
            MaybeT.of(e.target as HTMLInputElement | null)
                .bind(FileInput.files)
                .fmap(Arr.fromIterable)
                .bind(Arr.head)
                .fmap(TextFile.process (callback) ('UTF-8'))
        }
        
    }


}
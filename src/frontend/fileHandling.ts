namespace FileHandling {
    
    export const loadFromDialog = 
        (fileFormats:string) =>
        (callback: Maybe<(a: string) => any>) => 
    {
        const fileInput = document
            .createElement('input') as HTMLInputElement;
        fileInput.type = "file";
        fileInput.accept = fileFormats;
        fileInput.onchange = InputElem.onchange(callback);        
        fileInput.click();
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

    export namespace InputElem {
        export const files = (elem: HTMLInputElement) => {
            return MaybeT.of(elem.files);
        }

        export const onchange = (callback: Maybe<(a: string) => any>) => (e: Event) => {
            MaybeT.of(e.target as HTMLInputElement | null)
                .bind(InputElem.files)
                .fmap(Arr.fromIterable)
                .bind(Arr.head)
                .fmap(TextFile.process (callback) ('UTF-8'))
        }
        
    }


}
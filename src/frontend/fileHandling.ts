namespace FileHandling {

    const saveFile = () => {
        
    }
    
    const files = (elem: HTMLInputElement) => {
        return MaybeT.of(elem.files);
    }

    const fileInputChange = (e: Event) => {
        MaybeT.of(e.target as HTMLInputElement | null)
            .bind(files)
            .fmap(Arr.fromIterable)
            .bind(Arr.head)
            .fmap(processTextFile(Frontend.processArethusa)('UTF-8'))
    }

    export const loadFile = () => {
        const fileInput = document.createElement('input') as HTMLInputElement;
        fileInput.type = "file";
        fileInput.onchange = fileInputChange;        
        fileInput.click();
    }

    const processTextFile = (f: (a: string) => any) => (encoding: string) => (blob: Blob) =>  {
        const reader = new FileReader();
        reader.readAsText(blob, encoding);

        reader.onload = (e: ProgressEvent<FileReader>) => {
            const fileContent = MaybeT.of(e.target)
                .bind(FR.result);
            fileContent.fmap(f)
        }        
    }

    export namespace FR {
        export const result = (fr: FileReader) => {
            return MaybeT.of(fr.result)
        }    
    }


}
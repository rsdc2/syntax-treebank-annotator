interface ITreebank {
    direction: TextDir,
    format: FileFormat,
    formalism: Formalism,
    xmlLang: XMLLang,
    textId: string,
    annotator: string,
    sentences: ITreeState[]
}

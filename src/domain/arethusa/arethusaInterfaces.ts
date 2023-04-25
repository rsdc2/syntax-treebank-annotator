
interface IArethusaToken {
    form: string,
    relation: string,
    head: string,
    secdeps: string
}

interface IArethusaWord extends IArethusaToken{
    lemma: string,
    postag: string,
}

interface IArtificial extends IArethusaToken {
    artificial: string,
    insertion_id: string
}

interface ArethusaSentenceable extends Nodeable {
    sentences: Tokenable[]
}

interface IMorph {
    form: string,
    lemma: string,
    postag: string,
    relation: string,
    head: string,
    secdeps: string
}

interface IArtificial extends IMorph {
    artificial: string,
    insertion_id: string
}

interface ArethusaSentenceable extends Nodeable {
    sentences: Wordable[]
}
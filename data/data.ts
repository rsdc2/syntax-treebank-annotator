const treebank: ITreebank = {
    direction: TextDir.LTR,
    format: FileFormat.ALDT,
    textId: "isic000001",
    formalism: Formalism.AGDT,
    xmlLang: XMLLang.GRC,
    annotator: "Robert Crellin",
    sentences: [
        {   _clickState: ClickState.of
                (Nothing.of()) 
                (ElementType.Unknown)
                (ClickType.Unknown),
            _sentence_id: "1",
            _state_id: 0,
            _nodes: [],
            _tokens: [
                {
                    form: "Dis", 
                    id: 1,
                    headId: 0,
                    lemma: "Deus",
                    postag: "n-p---mb-",
                    relation: AGLDTRel.NONE,
                    secondaryDeps: [
                        SecondaryDep.ofTokenIds (2) (1) (AGLDTRel.ADV)
                    ],
                    type: TreeTokenType.NonRoot
                },
                {
                    form: "Manibus", 
                    id: 2,
                    headId: 1,
                    lemma: "manes",
                    postag: "n-p---fb-",
                    relation: AGLDTRel.APOS,
                    secondaryDeps: [
                        SecondaryDep.ofTokenIds (1) (2) (AGLDTRel.PRED), 
                    ],
                    type: TreeTokenType.NonRoot
                },
                {
                    form: "Zethi", 
                    id: 3,
                    headId: 4,
                    lemma: "Zethi",
                    postag: "p-s---mn-",
                    relation: AGLDTRel.SUB,
                    secondaryDeps: [],
                    type: TreeTokenType.NonRoot
                },
                {
                    form: "vixit", 
                    id: 4,
                    headId: 0,
                    lemma: "vivo",
                    postag: "v3sria---",
                    relation: AGLDTRel.PRED,
                    secondaryDeps: [],
                    type: TreeTokenType.NonRoot
                },
                {
                    form: "annis", 
                    id: 5,
                    headId: 4,
                    lemma: "vivo",
                    postag: "v3sria---",
                    relation: AGLDTRel.ATR,
                    secondaryDeps: [],
                    type: TreeTokenType.NonRoot
                },
                {
                    form: "VI", 
                    id: 6,
                    headId: 5,
                    lemma: "VI",
                    postag: "u--------",
                    relation: AGLDTRel.ATR,
                    secondaryDeps: [],
                    type: TreeTokenType.NonRoot
                }
            ]
        }
    ]
}

const treebank2: ITreebank = {
    direction: TextDir.LTR,
    format: FileFormat.ALDT,
    textId: "isic000001",
    formalism: Formalism.AGDT,
    xmlLang: XMLLang.GRC,
    annotator: "Robert Crellin",
    sentences: [
        {   _clickState: ClickState.of
                (Nothing.of()) 
                (ElementType.Unknown)
                (ClickType.Unknown),
            _state_id: 0,
            _sentence_id: "1",
            _nodes: [],
            _tokens: [
                {
                    form: "Dis", 
                    id: 3,
                    headId: 0,
                    lemma: "Deus",
                    postag: "n-p---mb-",
                    relation: AGLDTRel.NONE,
                    secondaryDeps: [
                        SecondaryDep.ofTokenIds (4) (3) (AGLDTRel.ADV)
                    ],
                    type: TreeTokenType.NonRoot
                },
                {
                    form: "Manibus", 
                    id: 4,
                    headId: 3,
                    lemma: "manes",
                    postag: "n-p---fb-",
                    relation: AGLDTRel.APOS,
                    secondaryDeps: [
                        SecondaryDep.ofTokenIds (3) (4) (AGLDTRel.PRED), 
                    ],
                    type: TreeTokenType.NonRoot
                },
                {
                    form: "Zethi", 
                    id: 5,
                    headId: 6,
                    lemma: "Zethi",
                    postag: "p-s---mn-",
                    relation: AGLDTRel.SUB,
                    secondaryDeps: [],
                    type: TreeTokenType.NonRoot
                },
                {
                    form: "vixit", 
                    id: 6,
                    headId: 0,
                    lemma: "vivo",
                    postag: "v3sria---",
                    relation: AGLDTRel.PRED,
                    secondaryDeps: [],
                    type: TreeTokenType.NonRoot
                },
                {
                    form: "annis", 
                    id: 7,
                    headId: 6,
                    lemma: "vivo",
                    postag: "v3sria---",
                    relation: AGLDTRel.ATR,
                    secondaryDeps: [],
                    type: TreeTokenType.NonRoot
                },
                {
                    form: "VI", 
                    id: 8,
                    headId: 7,
                    lemma: "VI",
                    postag: "u--------",
                    relation: AGLDTRel.ATR,
                    secondaryDeps: [],
                    type: TreeTokenType.NonRoot
                }
            ]
        }
    ]
}


const treebank3: ITreebank = {
    direction: TextDir.LTR,
    format: FileFormat.ALDT,
    textId: "isic000001",
    formalism: Formalism.AGDT,
    xmlLang: XMLLang.GRC,
    annotator: "Robert Crellin",
    sentences: [
        {   _clickState: ClickState.of
                (Nothing.of()) 
                (ElementType.Unknown)
                (ClickType.Unknown),
            _state_id: 0,
            _sentence_id: "1",
            _nodes: [],
            _tokens: [
                {
                    form: "Dis", 
                    id: 3,
                    headId: 0,
                    lemma: "Deus",
                    postag: "n-p---mb-",
                    relation: AGLDTRel.NONE,
                    secondaryDeps: [
                        SecondaryDep.ofTokenIds (4) (3) (AGLDTRel.ADV)
                    ],
                    type: TreeTokenType.NonRoot
                },
                {
                    form: "Manibus", 
                    id: 4,
                    headId: 3,
                    lemma: "manes",
                    postag: "n-p---fb-",
                    relation: AGLDTRel.APOS,
                    secondaryDeps: [
                        SecondaryDep.ofTokenIds (3) (4) (AGLDTRel.PRED), 
                    ],
                    type: TreeTokenType.NonRoot
                },
                {
                    form: "Zethi", 
                    id: 5,
                    headId: 6,
                    lemma: "Zethi",
                    postag: "p-s---mn-",
                    relation: AGLDTRel.SUB,
                    secondaryDeps: [],
                    type: TreeTokenType.NonRoot
                },
                {
                    form: "vixit", 
                    id: 6,
                    headId: 0,
                    lemma: "vivo",
                    postag: "v3sria---",
                    relation: AGLDTRel.PRED,
                    secondaryDeps: [],
                    type: TreeTokenType.NonRoot
                },
                {
                    form: "annis", 
                    id: 7,
                    headId: 6,
                    lemma: "vivo",
                    postag: "v3sria---",
                    relation: AGLDTRel.ATR,
                    secondaryDeps: [],
                    type: TreeTokenType.NonRoot
                },
                {
                    form: "VI", 
                    id: 8,
                    headId: 7,
                    lemma: "VI",
                    postag: "u--------",
                    relation: AGLDTRel.ATR,
                    secondaryDeps: [],
                    type: TreeTokenType.NonRoot
                }
            ]
        }
    ]
}

const sentence = treebank.sentences[0]
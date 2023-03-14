const XMLTagRegExps = {
    atomic: /\<[\_a-zA-Z][a-zA-Z\-\_0-9\.\s\=\"]*?\/\>/g,
    opening: /\<[\_a-zA-Z][a-zA-Z\-\_0-9\.\s\=\"]*?\>/g,
    closing: /\<\/[\_a-zA-Z][a-zA-Z\-\_0-9\.\s\=\"]*?\>/g,
    tagWithNameGroup: /<\/?([a-zA-Z][a-zA-Z\_]+?)(?:\s.+)?\/?>/g
}

const XMLGenericTagRegExps = {
    atomicWithName: String.raw`\<{name}(\s.+?)?\/\>`,
    openingWithName: String.raw`<{name}(\s.*?)?>`,
    closingWithName: String.raw`\<\/{name}(\s.+?)?\>`
}

enum XMLTag {
    atomic = "<.../>",
    opening = "<...>",
    closing = "</...>"
}

const XMLTagFragRegExps = {
    nonAtomicTagCloser: /(?<!\/)\>/g, // >
    openingAtomicOrNonAtomicTagOpener: /\<(?!\/)/g,  // <
    nonAtomicClosingTagOpener: /\<\//g,  // </
    nonAtomicClosingTag: /\<\/.+?\>/g,  // </...>
    atomicCloser: /\/\>/g, // />
}

enum XMLTagFrag {
    nonAtomicTagCloser = "nonAtomicTagCloser",
    openingAtomicOrNonAtomicTagOpener = "openingAtomicOrNonAtomicTagOpener",
    nonAtomicClosingTagOpener = "nonAtomicClosingTagOpener",
    nonAtomicClosingTag = "nonAtomicClosingTag",
    atomicCloser = "atomicClosingTagCloser",
}

const XMLTagFragAlias = {
    ">": "nonAtomicTagCloser", // >
    "<": "openingAtomicOrNonAtomicTagOpener",  // <
    "</": "nonAtomicClosingTagOpener",  // </
    "</...>": "nonAtomicClosingTag",  // </...>
    "/>": "atomicCloser", // />
}

const cursorTagPositionToAlias = {
    insideOpeningTag: ["<", "/>"],
    insideClosingTag: ["</", ">"],
    insideAtomicTag: ["<", "/>"]
}


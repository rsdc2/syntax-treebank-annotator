const XMLTagRegExps = {
    atomic: /\<[\_a-zA-Z][a-zA-Z\-\_0-9\.\s\=\"]*?\/\>/g,
    opening: /\<[\_a-zA-Z][a-zA-Z\-\_0-9\.\s\=\"]*?\>/g,
    closing: /\<\/[\_a-zA-Z][a-zA-Z\-\_0-9\.\s\=\"]*?\>/g,
    tagWithNameGroup: /<\/?([a-zA-Z][a-zA-Z\_]+?)(?:\s.+)?\/?>/g
};
const XMLGenericTagRegExps = {
    atomicWithName: String.raw `\<{name}(\s.+?)?\/\>`,
    openingWithName: String.raw `<{name}(\s.*?)?>`,
    closingWithName: String.raw `\<\/{name}(\s.+?)?\>`
};
var XMLTag;
(function (XMLTag) {
    XMLTag["atomic"] = "<.../>";
    XMLTag["opening"] = "<...>";
    XMLTag["closing"] = "</...>";
})(XMLTag || (XMLTag = {}));
const XMLTagFragRegExps = {
    nonAtomicTagCloser: /(?<!\/)\>/g,
    openingAtomicOrNonAtomicTagOpener: /\<(?!\/)/g,
    nonAtomicClosingTagOpener: /\<\//g,
    nonAtomicClosingTag: /\<\/.+?\>/g,
    atomicCloser: /\/\>/g, // />
};
var XMLTagFrag;
(function (XMLTagFrag) {
    XMLTagFrag["nonAtomicTagCloser"] = "nonAtomicTagCloser";
    XMLTagFrag["openingAtomicOrNonAtomicTagOpener"] = "openingAtomicOrNonAtomicTagOpener";
    XMLTagFrag["nonAtomicClosingTagOpener"] = "nonAtomicClosingTagOpener";
    XMLTagFrag["nonAtomicClosingTag"] = "nonAtomicClosingTag";
    XMLTagFrag["atomicCloser"] = "atomicClosingTagCloser";
})(XMLTagFrag || (XMLTagFrag = {}));
const XMLTagFragAlias = {
    ">": "nonAtomicTagCloser",
    "<": "openingAtomicOrNonAtomicTagOpener",
    "</": "nonAtomicClosingTagOpener",
    "</...>": "nonAtomicClosingTag",
    "/>": "atomicCloser", // />
};
const cursorTagPositionToAlias = {
    insideOpeningTag: ["<", "/>"],
    insideClosingTag: ["</", ">"],
    insideAtomicTag: ["<", "/>"]
};

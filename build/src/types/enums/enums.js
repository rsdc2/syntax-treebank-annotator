var ArrayFunc;
(function (ArrayFunc) {
    ArrayFunc["Push"] = "push";
    ArrayFunc["Unshift"] = "unshift";
})(ArrayFunc || (ArrayFunc = {}));
var TextDir;
(function (TextDir) {
    TextDir["LTR"] = "ltr";
    TextDir["RTL"] = "rtl";
})(TextDir || (TextDir = {}));
var FileFormat;
(function (FileFormat) {
    FileFormat["ALDT"] = "aldt";
    FileFormat["PROIEL"] = "proiel";
})(FileFormat || (FileFormat = {}));
var Formalism;
(function (Formalism) {
    Formalism["AGDT"] = "agdt";
    Formalism["PROIEL"] = "proiel";
    Formalism["UD"] = "ud";
})(Formalism || (Formalism = {}));
var AGLDTRel;
(function (AGLDTRel) {
    AGLDTRel["NONE"] = "none";
    AGLDTRel["APOS"] = "apos";
    AGLDTRel["SUB"] = "sub";
    AGLDTRel["PRED"] = "pred";
    AGLDTRel["ADV"] = "adv";
    AGLDTRel["ATR"] = "atr";
})(AGLDTRel || (AGLDTRel = {}));
var XMLLang;
(function (XMLLang) {
    XMLLang["GRC"] = "grc";
    XMLLang["LAT"] = "lat";
})(XMLLang || (XMLLang = {}));
var NodeType;
(function (NodeType) {
    NodeType["Root"] = "root";
    NodeType["Leaf"] = "leaf";
    NodeType["Branch"] = "branch";
    NodeType["NonRoot"] = "non-root";
    NodeType["None"] = "none";
})(NodeType || (NodeType = {}));
var TokenType;
(function (TokenType) {
    TokenType["Root"] = "root";
    TokenType["NonRoot"] = "non-root";
})(TokenType || (TokenType = {}));
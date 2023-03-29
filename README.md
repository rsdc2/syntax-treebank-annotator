# Syntax Treebank Annotator (α, currently in development)

The source code for the Syntax Treebank Annotator is written in [TypeScript](https://www.typescriptlang.org/) and transpiled to JavaScript (ECMAScript 2019).

## Online access

The Treebank Annotator can be run by following this link:

[https://rsdc2.github.io/syntax-treebank-annotator/](https://rsdc2.github.io/syntax-treebank-annotator/)

## Run on local machine

Download files and open ```index.html``` in a browser.

## Build

``` bash
# Install dev dependencies
npm install

# Transpile from TS to JS
npx tsc
```

## Attributions

The syntax treebank annotator was written in [TypeScript](https://www.typescriptlang.org/) and uses the library [D3.js](https://d3js.org/) for representation of the trees (graphs).

The software for the Syntax Treebank Annotator was written by Robert Crellin as part of the Crossreads project at the Faculty of Classics, University of Oxford, and is licensed under the MIT license. This project has received funding from the European Research Council (ERC) under the European Union’s Horizon 2020 research and innovation programme (grant agreement No 885040, “Crossreads”).

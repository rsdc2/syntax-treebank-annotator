# Syntax Treebank Annotator (α, currently in development)

The source code for the Syntax Treebank Annotator is written in [TypeScript](https://www.typescriptlang.org/) and transpiled to JavaScript (ECMAScript 2019).

The annotator provides a UI for annotating dependency treebanks. 
It has been designed for use, in the first instance, 
with the [I.Sicily](http://sicily.classics.ox.ac.uk/) corpus, 
although it can be applied to texts in any language.

## Getting started

### Online access

The Treebank Annotator can be run by following this link:

[https://rsdc2.github.io/syntax-treebank-annotator/](https://rsdc2.github.io/syntax-treebank-annotator/)

### Run locally

Download or clone the repository and open ```index.html``` in a browser.

### Build

``` bash
# Install dev dependencies
npm install

# Transpile from TS to JS
npx tsc
```

## Relationship to other annotators

The annotator is designed to be compatible with 
[Arethusa](https://www.perseids.org/tools/arethusa/app/#/), 
currently the annotator of choice for those working 
on ancient Greek and Latin texts.

The annotator has similar aims to Arethusa. 
However, it differs in the following ways, and 
is therefore somewhat complementary:


### No server
Whereas Arethusa has a backend, 
this annotator runs entirely in the browser. 
The advantage of this is that it's easy to
get up and running.
The disadvantage is that there are currently
no backend services, allowing for 
e.g. collaboration.


### Agnostic as to dependency framework
There are several depdency grammars out there.
Arethusa is designed for use with the
[Ancient Greek and Latin dependency Treebank (AGLDT)](http://perseusdl.github.io/treebank_data/).
The annotator is agnostic as to
dependency grammar: 
you are free to use whichever schema you wish (e.g. PROIEL, Universal Dependencies)
or you can make up your own.


### Secondary dependencies
AGLDT does not allow for the annotation of secondary dependencies.
However, this is possible both in 
[PROIEL](http://dev.syntacticus.org/annotation-guide/#introduction) dependencies and in
[Universal Dependencies](https://universaldependencies.org/u/overview/enhanced-syntax.html).
Accordingly, you may wish to make use of this.

**To create a secondary dependency in this annotator,**
**simply right click on the nodes you wish to connect,**
**rather than left click.** 


### Only syntax
Arethusa allows you to annotate morphology as well
as syntax. 
Currently the annotator only allows for the annotation 
of syntax 
(although it should preserve any morphology annotation).


## Acknowledgements

The syntax treebank annotator was written in [TypeScript](https://www.typescriptlang.org/) and uses the library [D3.js](https://d3js.org/) for representation of the trees (graphs). Dev dependencies are the D3 types provided by [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/d3). The XML file format is designed to be the same as that used by [Arethusa](https://www.perseids.org/tools/arethusa/app/#/).

The software for the Syntax Treebank Annotator was written by Robert Crellin as part of the Crossreads project at the Faculty of Classics, University of Oxford, and is licensed under the MIT license. This project has received funding from the European Research Council (ERC) under the European Union’s Horizon 2020 research and innovation programme (grant agreement No 885040, “Crossreads”).

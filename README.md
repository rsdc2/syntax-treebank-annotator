# Syntax Treebank Annotator (α, under active development)

The source code for the Syntax Treebank Annotator is written in a combination of JavaScript and [TypeScript](https://www.typescriptlang.org/), transpiled to JavaScript (ECMAScript 2022).

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

### Run from a local server

Although it isn't necessary, you can also serve the website locally.
To do this, from the repository directory:

- Install dependency ([```http-server```](https://www.npmjs.com/package/http-server)):

```
npm install
```

- Run the server locally:

```
npx http-server
```

- Open localhost according to the message provided by ```http-server```:

```
http://localhost:8080/
```


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

### No backend server needed
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

### TEI EpiDoc import
The annotator can import tokens directly from [TEI EpiDoc](https://epidoc.stoa.org/gl/latest/)
texts, provided that tokens are enclosed in 
```<w>``` or ```<name>``` tags. 

## Other points to note

### Token IDs

The annotator expects:
- Each token in the treebank to have a unique ID,
- Token IDs to be sequential integers starting at 1 (with the first token).

On load, the annotator will assign IDs to each token meeting these criteria.
Dependencies (primary and secondary) should be preserved in this process,
provided that at least within each sentence each token has a unique ID.

### Artificial tokens

It is possible to add artificial tokens using the annotator. 
By default, these are given the text '0'. At present, the form cannot be 
changed within the annotator, but can of course be changed by manually
editing the XML.

At present the annotator does not read the ```@insertion_id``` attribute
in an Arethusa XML file; the insertion position is simply the linear order
in the XML file.

### Sentence, token and filesize limits

At present the annotator is only able to handle files with:

- a maximum total of 2000 sentences
- a maximum total of 800 tokens
- a maximum of 270 tokens per sentence
- a maximum filesize of 50KB

## Dependencies
The syntax treebank annotator was written in [TypeScript](https://www.typescriptlang.org/) ([Apache 2.0](https://github.com/microsoft/TypeScript/blob/main/LICENSE.txt)) and uses:

- the library [D3.js](https://d3js.org/) ([ISC](https://github.com/d3/d3/blob/main/LICENSE)) for representation of the trees (graphs). 

- [```http-server```](https://www.npmjs.com/package/http-server) (MIT, see LICENSES folder) to serve locally.

Dev dependencies are the D3 types provided by:
- [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/d3) ([MIT](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/LICENSE)). 

The licenses for these projects are located in the `LICENSES` directory.


## Acknowledgements

The XML file format is designed to be compatible with that used by [Arethusa](https://www.perseids.org/tools/arethusa/app/#/).

The software for the Syntax Treebank Annotator was written by Robert Crellin as part of the Crossreads project at the Faculty of Classics, University of Oxford, and is licensed under the MIT license. This project has received funding from the European Research Council (ERC) under the European Union’s Horizon 2020 research and innovation programme (grant agreement No 885040, “Crossreads”).

Sample texts from I.Sicily are either directly form, or derived from, the [I.Sicily corpus](https://github.com/ISicily/ISicily), which are made available under the [CC-BY-4.0 licence](https://creativecommons.org/licenses/by/4.0/).

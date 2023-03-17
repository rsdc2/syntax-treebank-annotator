// General margin value so that trees don't touch the canvas border.
var treeMargin = 15;
var rootText = "[ROOT]";
const treeTemplate = '\
<svg class="full-height full-width">\
  <g transform="translate(' + treeMargin + ',' + treeMargin + ')/>\
</svg>\
';
const tokenHtml = '\
<span token="token"\
  style="white-space: nowrap"\
  class="no-transition"\
  colorize="STYLE"\
  click="true"\
  hover="true">TEXT</span>\
';
const edgeLabelTemplate = '\
  <span\
   graph-edge-label="graph-edge-label"\
   ng-class="selectionClass()"\
   class="ng-animate"\
   value-watch\
   target="obj"\
   property="label"\
   empty-val="---"/>\
  ';
function rootTokenHtml(rootId = 0, sentenceId = 0) {
    return '<span root-token root-id="' + rootId + '" sentence-id="' + sentenceId + '">' +
        rootText + '</span>';
}

// Element references

var $search = $('#search input')
var $results = $('#results')
var $furnitureItemTemplate = $('#furniture-item-template')

var $details = $('#details')
var $detailsCloseButton = $('#close-button')
var $preview = $('a-entity[io3d-furniture]')
var $furnitureId = $('#furniture-id')
var $furnitureName = $('#furniture-name')
var $codeSnippet = $('#code-snippet')
var $exampleTitle = $('#example-title')
var $exampleHtml = $('#example-html')
var $codepenData = $('#codepen-data')

function search () {
  // some user feedback
  $results.text('Searching...')
  // start search ...
  io3d.furniture
    .search($search.val())
    // ... and update view when ready
    .then(updateSearchResultsView)
    // ... or catch errors
    .catch(function(error){
      console.error(error)
      $results.html('Sorry, something went wrong:<br><br>'+JSON.stringify(error, null, 2))
    })
}

function updateSearchResultsView (results) {
  // 0 results: show message & exit
  if (!results.length) return $results.text('Woah, no furniture found that matches your criteria')
  // reset preview
  $results.empty()
  // for every item in result...
  results.forEach(function (item) {
    // create an item element group
    var $item = $furnitureItemTemplate.contents().clone().appendTo($results)
    $item.find('.image').css({ 'background-image': 'url("https://storage.3d.io'+item.indexImage+'")' })
    $item.find('.name').text(item.name)
    $item.find('.manufacturer').text(item.manufacturer)
    $item.on('click', function() {
      updateDetailsView(item)
    })
  })
}

function updateDetailsView (item) {
  $details.show()
  // update 3d preview
  $preview.attr('io3d-furniture', 'id:'+item.id)
  $furnitureId.text(item.id)
  $furnitureName.text(item.name)
  // update code snippet
  $codeSnippet.html( $codeSnippet.html().replace(/id:([^"<]+)/gmi, 'id:'+item.id) )
  // update example html code for jsfiddle
  $exampleHtml.html( $exampleHtml.html().replace(/id:([^"<]+)/gmi, 'id:'+item.id) )
  // update data for codepen
  $codepenData.val( JSON.stringify({ title: $exampleTitle.val(), html: $exampleHtml.val() }))
}

// Event handlers

$search.on('input', debounce(1000, false, search))
$detailsCloseButton.on('click', function(){
  $details.hide()
})

// initialize

search()

// Helpers

function debounce(wait, immediate, func) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};
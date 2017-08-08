// Element references

var $search = $('#search input')
var $results = $('#results')
var $furnitureItemTemplate = $('#furniture-item-template')

var $intro = $('#intro')
var $details = $('#details')
var $detailsBackButton = $('#back-button')
var $preview = $('a-entity[io3d-furniture]')
var $previewLoadingOverlay = $('#preview-loading-overlay')
var $furnitureId = $('#furniture-id')
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
      updateDetailsView(item.id)
    })
  })
}

function updateDetailsView (furnitureId) {
  if (!furnitureId) return
  $previewLoadingOverlay.show()
  $details.show()
  $details.css({ 'z-index': 30 })
  // update furniture ID in a-frame scene
  $preview[0].removeEventListener('model-loaded', hideLoadingScreen)
  $preview.attr('io3d-furniture', 'id:'+furnitureId)
  // update id in detail view
  $furnitureId.val(furnitureId)
  $preview[0].addEventListener('model-loaded', hideLoadingScreen)
  // update code snippet
  $codeSnippet.html( $codeSnippet.html().replace(/id:([^"<]+)/gmi, 'id:'+furnitureId) )
  // update example html code for jsfiddle
  $exampleHtml.html( $exampleHtml.html().replace(/id:([^"<]+)/gmi, 'id:'+furnitureId) )
  // update data for codepen
  $codepenData.val( JSON.stringify({ title: $exampleTitle.val(), html: $exampleHtml.val() }))
  // updates hashtag
  window.location.hash = 'furnitureId='+furnitureId
}

function hideLoadingScreen () {
  $previewLoadingOverlay.hide()
}

// Event handlers

$search.on('input', debounce(1000, false, search))
$detailsBackButton.on('click', function(){
  $details.css({ 'z-index': 0 })
})
$furnitureId.on('click', function () {
  $furnitureId.select()
})

// initialize

updateDetailsView(getFurnitureIdFromUrl())
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

function getFurnitureIdFromUrl() {
  var hash = window.location.hash
  // furnitureId=
  return hash && hash !== '' && hash !== '#' ? hash.substring(13) : undefined
}
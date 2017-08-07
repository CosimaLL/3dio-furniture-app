// Element references

var $search = $('#search input')
var $results = $('#results')
var $furnitureItemTemplate = $('#furniture-item-template')

var $preview = $('a-entity[io3d-furniture]')//[0].components['io3d-furniture']
var $furnitureId = $('#furniture-id')
var $furnitureName = $('#furniture-name')
var $codeSnippet = $('#code-snippet')
var $jsfiddleHtml = $('#jsfiddle-html')


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
  // update 3d preview
  $preview.attr('io3d-furniture', 'id:'+item.id)
  $furnitureId.text(item.id)
  $furnitureName.text(item.name)
  // update code snippet
  $codeSnippet.html( $codeSnippet.html().replace(/id:([^"<]+)/gmi, 'id:'+item.id) )
  // update example html code for jsfiddle
  $jsfiddleHtml.html( $jsfiddleHtml.html().replace(/id:([^"<]+)/gmi, 'id:'+item.id) )
}



// Event handlers

$search.on('input', debounce(1000, false, search))

search()


//resultsContainer.addEventListener('click', function (evt) {
//  var productContainer = Array.from(evt.path).find(function (item) {
//    return item.className == 'product'
//  })
//
//  if(!productContainer) {
//    sidebar.classList.remove('menu-active')
//    return
//  }
//
//  var productId = productContainer.dataset.productId,
//      productName = productContainer.dataset.productName
//
//  idContainer.textContent = productId
//  nameContainer.textContent = productName
//
//  aframeEntity.data.id = productId
//  aframeEntity.update()
//
//  snippet.textContent = `<a-scene>\n\t<a-entity io3d-furniture="id:${productId}"></a-entity>\n</a-scene>`
//  Prism.highlightElement(snippet)
//
//  $exampleSnippet.val( $exampleSnippet.val().replace('[[productId]]', productId) )
//  fiddleTitle.value = `3d.io "${productName} in A-Frame"`
//  fiddleDesc.value = `Displays the 3d.io furniture piece "${productName}" in an A-Frame scene`
//
//  sidebar.classList.add('menu-active')
//})
//
//document.getElementById('back').addEventListener('click', function() {
//  sidebar.classList.remove('menu-active')
//})


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
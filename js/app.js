// Element references

var searchBar = document.querySelector('#search input')
var resultsContainer = document.querySelector('#results')
var furnitureItemTemplate = document.querySelector('template')

var intro = document.querySelector('#intro')
var details = document.querySelector('#details')
var detailsBackButton = document.querySelector('#back-button')
var preview = document.querySelector('a-entity[io3d-furniture]')
var previewLoadingOverlay = document.querySelector('#preview-loading-overlay')
var furnitureId = document.querySelector('#furniture-id')
var codeSnippet = document.querySelector('#code-snippet')
var exampleTitle = document.querySelector('#example-title')
var exampleHtml = document.querySelector('#example-html')
var codepenData = document.querySelector('#codepen-data')

function search () {
  // some user feedback
  results.textContent = 'Searching...'
  // start search ...
  io3d.furniture
    .search(searchBar.value)
    // ... and update view when ready
    .then(updateSearchResultsView)
    // ... or catch errors
    .catch(function(error){
      console.error(error)
      results.textContent = 'Sorry, something went wrong:\n\n' + JSON.stringify(error, null, 2)
    })
}

function updateSearchResultsView (results) {
  // 0 results: show message & exit
  if (!results.length) return resultsContainer.textContent = 'Woah, no furniture found that matches your criteria'
  // reset preview
  resultsContainer.textContent = ''
  // for every item in result...
  results.forEach(function (furniture) {
    // create an item element group
    var item = document.importNode(furnitureItemTemplate.content, true)
    item.querySelector('.image').style.backgroundImage = `url(https://storage.3d.io${furniture.indexImage})`
    item.querySelector('.name').textContent = furniture.name
    item.querySelector('.manufacturer').textContent = furniture.manufacturer
    item.children[0].dataset.id = furniture.id
    resultsContainer.appendChild(item)
  })
}

function updateDetailsView (furnitureId) {
  if (!furnitureId) return
  previewLoadingOverlay.style.display = 'block'

  details.style.display = 'block'
  details.style.zIndex = 30 

  // update furniture ID in a-frame scene
  preview.removeEventListener('model-loaded', hideLoadingScreen)
  preview.setAttribute('io3d-furniture', 'id:'+furnitureId)
  // update id in detail view
  furnitureId.value = furnitureId
  preview.addEventListener('model-loaded', hideLoadingScreen)
  // update code snippet
  codeSnippet.innerHTML = codeSnippet.innerHTML.replace(/id:([^"<]+)/gmi, 'id:'+furnitureId)
  // update example html code for jsfiddle
  exampleHtml.innerHTML =  exampleHtml.innerHTML.replace(/id:([^"<]+)/gmi, 'id:'+furnitureId)
  // update data for codepen
  codepenData.value = JSON.stringify({ title: exampleTitle.value, html: exampleHtml.value })
  // updates hashtag
  window.location.hash = 'furnitureId='+furnitureId
}

function hideLoadingScreen () {
  previewLoadingOverlay.style.display = 'none'
}

// Event handlers

searchBar.addEventListener('input', debounce(1000, false, search))
detailsBackButton.addEventListener('click', function () {
  details.style.zIndex = 0
})
furnitureId.addEventListener('click', furnitureId.select)
results.addEventListener('click', function (evt) {
  evt.path.forEach(function (elem) {
    if(elem.dataset && elem.dataset.id) {
      console.log('boom!', elem.dataset.id)
      updateDetailsView(elem.dataset.id)
    }
  })
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
  return (hash && hash !== '' && hash !== '#') ? hash.substring(13) : undefined
}
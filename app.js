// Element references

var searchBar = document.querySelector('#search input')
var resultsContainer = document.querySelector('#results')
var furnitureItemTemplate = document.querySelector('template')

var intro = document.querySelector('#intro')
var details = document.querySelector('#details')
var detailsBackButton = document.querySelector('#back-button')
var preview = document.querySelector('a-entity[io3d-furniture]')
var previewLoadingOverlay = document.querySelector('#preview-loading-overlay')
var furnitureIdField = document.querySelector('#furniture-id')
var codeSnippetAframe = document.querySelector('#code-snippet-aframe')
var codeSnippetThree = document.querySelector('#code-snippet-three')
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
    item.querySelector('.image').src = furniture.indexImage
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
  furnitureIdField.value = furnitureId
  preview.addEventListener('model-loaded', hideLoadingScreen)
  // update code snippets
  codeSnippetAframe.innerHTML = codeSnippetAframe.innerHTML.replace(/id:([^"'<]+)/gmi, 'id:'+furnitureId)
  codeSnippetThree.innerHTML = codeSnippetThree.innerHTML.replace(/'([^']+)'/gmi, '\'' + furnitureId + '\'')
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

furnitureIdField.addEventListener('click', furnitureIdField.select)

results.addEventListener('click', function (evt) {
  if(evt.path || evt.composedPath) {
    if(evt.composedPath) evt.path = evt.composedPath()

      evt.path.forEach(function (elem) {
      if(elem.dataset && elem.dataset.id) {
        updateDetailsView(elem.dataset.id)
      }
    })
  } else {
    var elem = findDatasetInParents(evt.target, 'id', 5)
    if(elem && elem.dataset && elem.dataset.id) updateDetailsView(elem.dataset.id)
  }
})

// initialize

tabify('.tab-box')
updateDetailsView(getFurnitureIdFromUrl())
search()

// Helpers

function findDatasetInParents(elem, item, depth) {
  if (depth === 0) return false

  console.log('checking elem', elem, elem.parentNode, elem.dataset, depth)

  if(elem.dataset && elem.dataset[item]) return elem
  else return findDatasetInParents(elem.parentNode, item, --depth)
}

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

function tabify(containerSelector) {
  var root = document.querySelector(containerSelector)
  var tabs = Array.from(root.querySelectorAll('.tab'))
  var tabLinks = Array.from(root.querySelectorAll('li[data-tab]'))
  tabLinks.forEach((link) => link.addEventListener('click', (evt) => {
    tabs.forEach((tab) => tab.classList.remove('active'))
    document.getElementById(evt.target.dataset.tab).classList.add('active')
    tabLinks.forEach((link) => link.classList.remove('active'))
    evt.target.classList.toggle('active')
  }))
}
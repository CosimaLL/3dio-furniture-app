// Helpers

function debounce(func, wait, immediate) {
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

// Element references

var search = document.querySelector('input')
var tpl = document.querySelector('template').content
var resultsContainer = document.getElementById('results')
var sidebar = document.querySelector('aside')
var aframeEntity = document.querySelector('a-entity[io3d-furniture]').components['io3d-furniture']
var snippet = document.querySelector('code')
var idContainer = document.getElementById('product-id')
var nameContainer = document.getElementById('product-name')
var fiddle = document.querySelector('textarea')
var fiddleTitle = document.querySelector('input[name="title"]')
var fiddleDesc = document.querySelector('input[name="description"]')

var FIDDLE_SNIPPET = `
<script src="https://aframe.io/releases/0.6.1/aframe.min.js"></script>
<script src="https://3d.io/releases/3dio-js/1.x.x-beta/3dio.min.js"></script>
<script src="https://cdn.rawgit.com/tizzle/aframe-orbit-controls-component/v0.1.12/dist/aframe-orbit-controls-component.min.js"></script>

<a-scene>
  <a-entity id="furniture" io3d-furniture="id:[[productId]]" position="0 0 -3"></a-entity>
  <a-sky color="#ececec"></a-sky>
  <a-entity camera position="0 1.6 0" orbit-controls="target:#furniture; autoRotate: true"></a-entity>
</a-scene>`

// Event handlers

var apiErrorCount = 0;

search.addEventListener('input', debounce(function searchFurniture() {
  resultsContainer.textContent = 'Searching...'
  IO3D.utils.services.call('Product.search', {
    searchQuery: {
      query: `isPublished:true ${search.value}*`
    },
    limit: 50
  }).then(function (results) {
    apiErrorCount = 0
    resultsContainer.innerHTML = ''
    if(results.length === 0) {
      resultsContainer.textContent = 'Woah, no furniture found that matches your criteria'
      return
    }
    results.forEach((product) => {
      var item = document.importNode(tpl, true)
      item.querySelector('img').src = `https://storage.3d.io${product.preview}`
      item.querySelector('.product-name').textContent = product.productDisplayName
      item.querySelector('.product-manufacturer').textContent = product.manufacturer
      item.children[0].dataset.productId = product.productResourceId
      item.children[0].dataset.productName = product.productDisplayName
      resultsContainer.appendChild(item)
    })
  }).catch(function (err) {
    console.error('Error fetching furniture:', err)
    if(++apiErrorCount < 3) {
      searchFurniture()
    } else {
      resultsContainer.textContent = 'Whoops, that did not work, please try another query.'
    }
  })
}, 500))

resultsContainer.addEventListener('click', function (evt) {
  var productContainer = Array.from(evt.path).find(function (item) {
    return item.className == 'product'
  })

  if(!productContainer) {
    sidebar.classList.remove('menu-active')
    return
  }

  var productId = productContainer.dataset.productId,
      productName = productContainer.dataset.productName

  idContainer.textContent = productId
  nameContainer.textContent = productName

  aframeEntity.data.id = productId
  aframeEntity.update()

  snippet.textContent = `<a-scene>\n\t<a-entity io3d-furniture="id:${productId}"></a-entity>\n</a-scene>`
  Prism.highlightElement(snippet)

  fiddle.value = FIDDLE_SNIPPET.replace('[[productId]]', productId)
  fiddleTitle.value = `3d.io "${productName} in A-Frame"`
  fiddleDesc.value = `Displays the 3d.io furniture piece "${productName}" in an A-Frame scene`

  sidebar.classList.add('menu-active')
})

document.getElementById('back').addEventListener('click', function() {
  sidebar.classList.remove('menu-active')
})
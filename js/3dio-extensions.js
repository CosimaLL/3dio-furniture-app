// extend io3d.js library until "io3d.furniture.search" is ready

io3d.furniture = io3d.furniture || {}

io3d.furniture.search = function searchFurniture (query, options) {
  // API
  options = options || {}
  var limitResults = options.limitResults || 50
  // internals
  var apiErrorCount = 0
  // call API
  function callApi () {
    return io3d.utils.services.call('Product.search', {
      searchQuery: {query: 'isPublished:true ' + query},
      limit: limitResults
    }).then(function onSuccess (rawResults) {
      apiErrorCount = 0
      // remap properties
      var results = []
      rawResults.forEach(function(rawItem){
        results.push({
          // main info
          id: rawItem.productResourceId,
          name: rawItem.productDisplayName,
          description: rawItem.description,
          manufacturer: rawItem.manufacturer,
          designer: rawItem.designer,
          indexImage: rawItem.preview,
          images: rawItem.images,
          url: rawItem.link,
          year: rawItem.year,
          // grouping
          collectionIds: rawItem.tags,
          tags: rawItem.tags,
          styles: rawItem.styles,
          categories: rawItem.categories,
          colours: rawItem.colours,
          // geometry
          boundingBox: rawItem.boundingBox,
          boundingPoints: rawItem.boundingPoints,
          // data info
          created: rawItem.createdAt,
          updated: rawItem.updatedAt
        })
      })
      return results
    }, function onReject (err) {
      console.error('Error fetching furniture:', err)
      // try again 3 times
      return ++apiErrorCount < 3 ? callApi() : Promise.reject('Whoops, that did not work, please try another query.')
    })
  }
  // expose
  return callApi()
}
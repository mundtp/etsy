
var id = location.hash.slice(7)

var qs = function(input) {
	return document.querySelector(input)
}

var ListingsCollection = Backbone.Collection.extend({
	url: 'https://openapi.etsy.com/v2/listings/active.js',
	_key: 'aavnvygu0h5r52qes74x9zvo',
	parse: function(rawJSON) {
	
		return rawJSON.results
	}
})
var ListingsView = Backbone.View.extend({
	el: qs('#container'),
	events: {
		"click .snippet": "_handleClick"
	},

	initialize: function(coll) {		
		var thisView = this

		this.coll = coll
		var boundRender = this._render.bind(thisView)		
		this.coll.on('sync',boundRender)
	},

	_handleClick: function(e) {
		var articleDiv = e.target
		window.articleDiv = articleDiv
		location.hash = 'detail/' + articleDiv.getAttribute('data-id')
	},

	_render: function() {
		var docsArray = this.coll.models
		var htmlString = ''
		for (var i = 0; i < docsArray.length; i ++) {
			var articleMod = docsArray[i]
			htmlString += '<div data-id="' + articleMod.get('listing_id') + '" class="snippet">' 
			htmlString += articleMod.get('title').substr(0,35)
			htmlString += '<img class="collectionImg" src="'+ articleMod.get('Images')[0].url_fullxfull +' ">'
			htmlString += '<p>Price: $' + articleMod.get('price') + '</p>'
			htmlString += '</div>'
		}
		this.el.innerHTML = htmlString
	}
})

var DetailView = Backbone.View.extend({
	el: qs('#container'),

	initialize: function(model){
		this.model = model
		console.log(model)
		var boundRender = this._render.bind(this)
		this.model.on('sync', boundRender)

	},
	_render: function (){
		var listing = this.model
		var htmlString = ''
		htmlString += '<div class="listing">'
		htmlString += '<h1>' + listing.get('title') + '</h1>'
		htmlString += '<img src="'+ listing.get('Images')[0].url_fullxfull +' ">'
		htmlString += '<p>Price: $' + listing.get('price') + '</p>'
		htmlString += '<p>' + listing.get('description') + '</p>'
		htmlString += '</div>'
		this.el.innerHTML = htmlString
	}
})

var ListingsRouter = Backbone.Router.extend({
	routes: {
		"detail/:id": "doDetailView",
		"search/:query": "doItemSearch",
		"home": "showHomePage",
		"*catchall": "redirect"
	},

	doItemSearch: function(searchTerm) {
	
		var searchCollection = new ListingsCollection()
		searchCollection.fetch({
			dataType: 'jsonp',
			data: {
				api_key: searchCollection._key,
				tags: searchTerm,
				processData: true,
				includes: "Images,Shop",
			}
		})
		new ListingsView(searchCollection)
	},

	doDetailView: function(id) {
		var ListingsModel = Backbone.Model.extend({
			url: 'https://openapi.etsy.com/v2/listings/' + id + '.js',
			_key: 'aavnvygu0h5r52qes74x9zvo',
				parse: function(rawJSON) {
				return rawJSON.results[0]
				}
		})

		var listingsModel = new ListingsModel
		listingsModel.fetch({
			dataType: 'jsonp',
			data: {
				includes: "Images,Shop",
				api_key: listingsModel._key,
				processData: true,
			}
		})
		new DetailView(listingsModel)
	},

	redirect: function() {
		location.hash = "home"
	},

	showHomePage: function() {
		var homeCollection = new ListingsCollection()

		homeCollection.fetch({
			dataType: 'jsonp',
			data: {
				api_key: homeCollection._key,				
				processData: true,
				includes: "Images,Shop",
			}
		})
		
		new ListingsView(homeCollection)
	},

	initialize: function() {
		Backbone.history.start()
	}
})


qs('input').addEventListener('keydown',function(e) {
	if (e.keyCode === 13) {
		location.hash = "search/" + e.target.value
		e.target.value = ''
	}
})

new ListingsRouter()

// ==========================================================================
// Project:   SproutCore Handlebar Views
// Copyright: ©2011 Strobe Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals TemplateTests */

var set = SC.set, setPath = SC.setPath;

TemplateTests = {};

module("SC.HandlebarsCollectionView");

test("passing a block to the collection helper sets it as the template for example views", function() {
  TemplateTests.CollectionTestView = SC.CollectionView.extend({
    tagName: 'ul',
    content: ['foo', 'bar', 'baz']
  });

  var view = SC.View.create({
    template: SC.Handlebars.compile('{{#collection "TemplateTests.CollectionTestView"}} <aside></aside> {{/collection}}')
  });

  view.createElement();
  equals(view.$('aside').length, 3, 'one aside element is created for each content item');
});

test("a block passed to a collection helper defaults to the content property of the context", function() {
  TemplateTests.CollectionTestView = SC.CollectionView.extend({
    tagName: 'ul',
    content: ['foo', 'bar', 'baz']
  });

  var view = SC.View.create({
    template: SC.Handlebars.compile('{{#collection "TemplateTests.CollectionTestView"}} <aside>{{content}}</aside> {{/collection}}')
  });

  view.createElement();

  equals(view.$('li:has(aside:contains("foo")) + li:has(aside:contains("bar")) + li:has(aside:contains("baz"))').length, 1, 'one aside element is created for each content item');
});

test("a block passed to a collection helper defaults to the view", function() {
  TemplateTests.CollectionTestView = SC.CollectionView.extend({
    tagName: 'ul',
    content: ['foo', 'bar', 'baz']
  });

  var view = SC.View.create({
    template: SC.Handlebars.compile('{{#collection "TemplateTests.CollectionTestView"}} <aside>{{content}}</aside> {{/collection}}')
  });

  view.createElement();
  equals(view.$('li:has(aside:contains("foo")) + li:has(aside:contains("bar")) + li:has(aside:contains("baz"))').length, 1, 'precond - one aside element is created for each content item');

  SC.run(function() {
    set(view.childViews[0], 'content', []);
  });
  equals(view.$('aside').length, 0, "all list item views should be removed from DOM");
});

test("should include an id attribute if id is set in the options hash", function() {
  var view = SC.View.create({
    template: SC.Handlebars.compile('{{#collection "TemplateTests.CollectionTestView" id="baz"}}foo{{/collection}}')
  });

  view.createElement();
  equals(view.$('ul#baz').length, 1, "adds an id attribute");
});

test("should give its item views the class specified by itemClass", function() {
  TemplateTests.itemClassTestCollectionView = SC.CollectionView.extend({
    tagName: 'ul',
    content: ['foo', 'bar', 'baz']
  });
  var view = SC.View.create({
    template: SC.Handlebars.compile('{{#collection "TemplateTests.itemClassTestCollectionView" itemClass="baz"}}foo{{/collection}}')
  });

  view.createElement();
  equals(view.$('ul li.baz').length, 3, "adds class attribute");
});

test("should give its item views the classBinding specified by itemClassBinding", function() {
  TemplateTests.itemClassBindingTestCollectionView = SC.CollectionView.extend({
    tagName: 'ul',
    content: [SC.Object.create({ isBaz: false }), SC.Object.create({ isBaz: true }), SC.Object.create({ isBaz: true })]
  });

  var view = SC.View.create({
    template: SC.Handlebars.compile('{{#collection "TemplateTests.itemClassBindingTestCollectionView" itemClassBinding="content.isBaz"}}foo{{/collection}}')
  });

  view.createElement();
  equals(view.$('ul li.is-baz').length, 2, "adds class on initial rendering");

  SC.run(function() {
    setPath(view.childViews[0], 'content.0.isBaz', true);
  });

  equals(view.$('ul li.is-baz').length, 3, "adds class when property changes");

  SC.run(function() {
    setPath(view.childViews[0], 'content.0.isBaz', false);
  });

  equals(view.$('ul li.is-baz').length, 2, "removes class when property changes");
});

test("should work inside a bound {{#if}}", function() {
  var testData = [SC.Object.create({ isBaz: false }), SC.Object.create({ isBaz: true }), SC.Object.create({ isBaz: true })];
  TemplateTests.ifTestCollectionView = SC.CollectionView.extend({
    tagName: 'ul',
    content: testData
  });

  var view = SC.View.create({
    template: SC.Handlebars.compile('{{#if shouldDisplay}}{{#collection "TemplateTests.ifTestCollectionView"}}{{content.isBaz}}{{/collection}}{{/if}}'),
    shouldDisplay: true
  });

  view.createElement();
  equals(view.$('ul li').length, 3, "renders collection when conditional is true");

  SC.run(function() { set(view, 'shouldDisplay', NO); });
  equals(view.$('ul li').length, 0, "removes collection when conditional changes to false");

  SC.run(function() { set(view, 'shouldDisplay', YES); });
  equals(view.$('ul li').length, 3, "collection renders when conditional changes to true");
});

test("should pass content as context when using {{#each}} helper", function() {
  var view = SC.View.create({
    template: SC.Handlebars.compile('{{#each releases}}Mac OS X {{version}}: {{name}} {{/each}}'),

    releases: [ { version: '10.7',
                  name: 'Lion' },
                { version: '10.6',
                  name: 'Snow Leopard' },
                { version: '10.5',
                  name: 'Leopard' } ]
  });

  SC.run(function() { view.createElement(); });

  equals(view.$().text(), "Mac OS X 10.7: Lion Mac OS X 10.6: Snow Leopard Mac OS X 10.5: Leopard ", "prints each item in sequence");
});

test("should re-render when the content object changes", function() {
  TemplateTests.RerenderTest = SC.CollectionView.extend({
    tagName: 'ul',
    content: []
  });

  var view = SC.View.create({
    template: SC.Handlebars.compile('{{#collection TemplateTests.RerenderTest}}{{content}}{{/collection}}')
  });

  view.createElement();

  SC.run(function() {
    set(view.childViews[0], 'content', ['bing', 'bat', 'bang']);
  });

  SC.run(function() {
    set(view.childViews[0], 'content', ['ramalamadingdong']);
  });

  equals(view.$('li').length, 1, "rerenders with correct number of items");
  equals(view.$('li:eq(0)').text(), "ramalamadingdong");

});

test("tagName works in the #collection helper", function() {
  TemplateTests.RerenderTest = SC.CollectionView.extend({
    content: ['foo', 'bar']
  });

  var view = SC.View.create({
    template: SC.Handlebars.compile('{{#collection TemplateTests.RerenderTest tagName="ol"}}{{content}}{{/collection}}')
  });

  view.createElement();

  equals(view.$('ol').length, 1, "renders the correct tag name");
  equals(view.$('li').length, 2, "rerenders with correct number of items");

  SC.run(function() {
    set(view.childViews[0], 'content', ['bing', 'bat', 'bang']);
  });

  equals(view.$('li').length, 3, "rerenders with correct number of items");
  equals(view.$('li:eq(0)').text(), "bing");
});


define([
  'core/js/adapt',
  'core/js/views/componentView',
  'core/js/models/itemsComponentModel'
], function (Adapt, ComponentView, ItemsComponentModel) {

  var Tabs = ComponentView.extend({

    events: {
      'click .js-tabs-nav-item-btn-click': 'onTabItemClicked'
    },

    preRender: function () {
      this.checkIfResetOnRevisit();

      this.model.resetActiveItems();

      this.listenTo(this.model.get('_children'), {
        'change:_isActive': this.onItemsActiveChange,
        'change:_isVisited': this.onItemsVisitedChange
      });
    },

    postRender: function () {
      this.setReadyStatus();
      this.setLayout();
      this.listenTo(Adapt, 'device:resize', this.setLayout);

      this.model.setActiveItem(0);
      this.createAccessibleTabs();

      if (this.model.get('_setCompletionOn') === 'inview') {
        this.setupInviewCompletion();
      }
    },

    createAccessibleTabs: function () {
      const tabs = this.$('[role="tab"]');
      const tabList = this.$('[role="tablist"]');

      let tabFocus = 0;
      tabList.on("keydown", e => {
        // Move right
        if (e.keyCode === 39 || e.keyCode === 37) {
          tabs[tabFocus].setAttribute("tabindex", -1);
          if (e.keyCode === 39) {
            tabFocus++;
            // If we're at the end, go to the start
            if (tabFocus >= tabs.length) {
              tabFocus = 0;
            }
            // Move left
          } else if (e.keyCode === 37) {
            tabFocus--;
            // If we're at the start, move to the end
            if (tabFocus < 0) {
              tabFocus = tabs.length - 1;
            }
          }

          tabs[tabFocus].setAttribute("tabindex", 0);
          tabs[tabFocus].focus();
        }
      });
    },

    checkIfResetOnRevisit: function () {
      var isResetOnRevisit = this.model.get('_isResetOnRevisit');

      // If reset is enabled set defaults
      if (isResetOnRevisit) {
        this.model.reset(isResetOnRevisit);
      }
    },

    setLayout: function () {
      this.$el.removeClass('is-horizontal-layout is-vertical-layout');
      if (Adapt.device.screenSize === 'large') {
        var tabLayout = this.model.get('_tabLayout');
        this.$el.addClass('is-' + tabLayout + '-layout');
        if (tabLayout === 'vertical') {
          this.setTabLayoutVertical();
          return;
        }
        this.setTabLayoutHorizontal();
        return;
      }

      this.$el.addClass('is-horizontal-layout');
      this.setTabLayoutVertical();
    },

    setTabLayoutHorizontal: function () {
      var itemsLength = this.model.get('_items').length;
      var itemWidth = 100 / itemsLength;

      this.$('.tabs__nav-item-btn').css({
        width: itemWidth + '%'
      });
    },

    setTabLayoutVertical: function () {
      this.$('.tabs__nav-item-btn').css({
        width: 100 + '%'
      });
    },

    onTabItemClicked: function (e) {
      if (e && e.preventDefault) e.preventDefault();

      this.model.setActiveItem($(e.currentTarget).data('index'));
    },

    onItemsActiveChange: function (item, isActive) {
      var dataFilter = '[data-index="' + item.get('_index') + '"]';

      var $tabButton = this.$('.js-tabs-nav-item-btn-click').filter(dataFilter);
      var $tabPanel = this.$('.tabs__content-item').filter(dataFilter);

      $tabButton.toggleClass('is-selected', isActive).attr('aria-selected', isActive);
      $tabPanel.toggleClass('is-active', isActive);

      this.$('.js-tabs-nav-item-btn-click').attr('tabindex', -1);
      $tabButton.attr('tabindex', 0);

      this.$('.tabs__content-item').attr("hidden", true);
      $tabPanel.attr("hidden", false);

      if (isActive) {
        // $tabPanel.a11y_focus();
        item.toggleVisited(true);
      }
    },

    onItemsVisitedChange: function (item, isVisited) {
      if (!isVisited) return;

      var ariaLabel = item.get('tabTitle') + '. ' + this.model.get('_globals')._accessibility._ariaLabels.visited;
      var $tabButton = this.$('.js-tabs-nav-item-btn-click').filter('[data-index="' + item.get('_index') + '"]');
      $tabButton.addClass('is-visited').attr('aria-label', ariaLabel);
    },

  }, {
    template: 'tabs'
  });

  return Adapt.register('tabs', {
    model: ItemsComponentModel,
    view: Tabs
  });
});
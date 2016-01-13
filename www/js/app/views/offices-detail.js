/* global define, $, _ */
define([
    'backbone',
    'collections/offices',
    'views/page',
    'text!templates/offices/detail.html',
    'text!templates/offices/detail-item.html'
], function (
    Backbone,
    // коллекции
    Offices,
    // генерация и шаблоны страниц
    PageView,
    detailPage,
    template
) {
    'use strict';

    var Detail = Backbone.View.extend({
        className: 'page__content',
        template: _.template(template),
        render: function () {
            var data = this.model.toJSON();

            this.$el.html( this.template( data ) );
            return this;
        }
    });

    var detail = {};
    return function (params) {
        var id = params.id || false,
            callback = params.callback || $.noop;

        if (!id) {
            callback('Не известный идентификатор офиса');
            return this;
        }

        var office = Offices.get(id);
        if (!office) {
            callback('Офис не найден');
            return this;
        }

        if (!detail[id]) {
            var pageParams, page;

            pageParams = {
                html: detailPage,
                Navbar: {
                    title: office.get('name')
                },
                Page: {
                    init: function () {
                        this.$content = this.$('.page-content');
                    },
                    render: function () {
                        var view = new Detail({model: office});
                        this.$content.html( view.render().el );
                        return this;
                    }
                },
                Toolbar: {
                    events: {
                        'click .button': 'showOfficeOnMap'
                    },
                    showOfficeOnMap: function () {
                        Backbone.Events.trigger('map', office);
                    },
                    show: false
                }
            };
            // если у объекта есть координаты по покажем кнопку "на карте"
            if (office.get('coords')) {
                pageParams.Toolbar.show = true;
            }

            page = new PageView(pageParams);
            detail[id] = page.init();
        }

        return callback(null, detail[id]);
    };
});

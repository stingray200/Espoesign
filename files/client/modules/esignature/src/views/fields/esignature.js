/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM - Open Source CRM application.
 * Copyright (C) 2014-2018 Yuri Kuznetsov, Taras Machyshyn, Oleksiy Avramenko
 * Website: http://www.espocrm.com
 *
 * EspoCRM is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * EspoCRM is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with EspoCRM. If not, see http://www.gnu.org/licenses/.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/
/** @preserve
jSignature v2 "${buildDate}" "${commitID}"
Copyright (c) 2012 Willow Systems Corp http://willow-systems.com
Copyright (c) 2010 Brinley Ang http://www.unbolt.net
MIT License <http://www.opensource.org/licenses/mit-license.php>
*/

Espo.define('esignature:views/fields/esignature', 'views/fields/base', function (Dep) {

    return Dep.extend({
        
        // custom templates
        detailTemplate: 'esignature:fields/esignature/detail',
        editTemplate: 'esignature:fields/esignature/edit',
        listTemplate: 'esignature:fields/esignature/list',

        // custom properties
        blankCanvassCode: '',
        
        // custom methods        
        init: function () { // overrides "init" function from base.js
            if (this.events) {
                this.events = _.clone(this.events);
            } else {
                this.events = {};
            }
            this.defs = this.options.defs || {};
            this.name = this.options.name || this.defs.name;
            this.params = this.options.params || this.defs.params || {};
            this.fieldType = this.model.getFieldParam(this.name, 'type') || this.type;
            this.getFieldManager().getParamList(this.type).forEach(function (d) {
                var name = d.name;
                if (!(name in this.params)) {
                    this.params[name] = this.model.getFieldParam(this.name, name);
                    if (typeof this.params[name] === 'undefined') {
                        this.params[name] = null;
                    }
                }
            }, this);
            var additionaParamList = ['inlineEditDisabled'];
            additionaParamList.forEach(function (item) {
                this.params[item] = this.model.getFieldParam(this.name, item) || null;
            }, this);
            this.mode = this.options.mode || this.mode;
            this.tooltip = this.options.tooltip || this.params.tooltip || this.model.getFieldParam(this.name, 'tooltip');
            this.disabledLocked = this.options.disabledLocked || false;
            this.disabled = this.disabledLocked || this.options.disabled || this.disabled;
            // signature fields can only be seen in detail mode
            this.setMode('detail');
            this.on('invalid', function () {
                var $cell = this.getCellElement();
                $cell.addClass('has-error');
                this.$el.one('click', function () {
                    $cell.removeClass('has-error');
                });
                this.once('render', function () {
                    $cell.removeClass('has-error');
                });
            }, this);
            if ((this.isDetailMode() || this.isEditMode()) && this.tooltip) {
                this.initTooltip();
            }
            // signature fields can only be edited inline
            this.listenToOnce(this, 'after:render', this.initInlineEsignatureEdit, this);            
            this.attributeList = this.getAttributeList();
            this.listenTo(this.model, 'change', function (model, options) {
                if (this.isRendered() || this.isBeingRendered()) {
                    if (options.ui) {
                        return;
                    }
                    var changed = false;
                    this.attributeList.forEach(function (attribute) {
                        if (model.hasChanged(attribute)) {
                            changed = true;
                        }
                    });
                    if (changed) {
                        this.reRender();
                    }
                }
            }.bind(this));
            this.listenTo(this, 'change', function () {
                var attributes = this.fetch();
                this.model.set(attributes, {ui: true});
            });
        },
        
        data: function () { // overrides "data" function from base.js
            // Get parent's properly formatted data (includes label, name, etc.)
            var data = Dep.prototype.data.call(this);
            
            // Add only our custom properties
            var imageSource = this.getValueForDisplay();
            data.imageSource = imageSource;
            data.value = this.getValueForDisplay();
            
            // signature fields can not be edited manually, force detail mode
            if(this.mode !== "detail") {
                this.setMode("detail");
            }
            
            return data;
        },

        initInlineEsignatureEdit: function () { // custom function equivalent to "initInlineEdit" at base.js   
            var cellElement = this.getCellElement();
            
            // Ensure we have a jQuery object - wrap if necessary
            var $cell = cellElement && cellElement.jquery ? cellElement : $(cellElement);
            
            var $editLink = $(
                '<button type="button" class="pull-right inline-edit-link hidden" aria-label="Edit" style="background-color:unset;border:unset;">' +
                    '<span class="fas fa-pencil-alt fa-sm"></span>' +
                '</button>'
            );
            
            if ($cell.length === 0 || typeof(this.model.get(this.name)) === 'undefined') {
                this.listenToOnce(this, 'after:render', this.initInlineEsignatureEdit, this);
                return;
            }
            
            // if the signature field already has a value do not add the inline edit link and set the field as readonly
            if(this.model.get(this.name)) {
                this.readOnly = true;
                return;                
            }
            
            // after the element has been rendered, add the hidden pencil icon link
            $cell.prepend($editLink);
            
            $editLink.on('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                // when clicked, call the custom signature field inline edit function
                this.inlineEsignatureEdit(); 
            }.bind(this));
            
            $cell.on('mouseenter', function (e) {
                e.stopPropagation();
                if (this.disabled || this.readOnly || this._isInlineEditMode) {
                    return;
                }
                if (this.mode === 'detail') {
                    $editLink.removeClass('hidden');
                }
            }.bind(this)).on('mouseleave', function (e) {
                e.stopPropagation();
                if (this.mode === 'detail') {
                    $editLink.addClass('hidden');
                }
            }.bind(this));
        },

        inlineEsignatureEdit: function() {
            this._isInlineEditMode = true;
            
            this.createView('fullscreenSignature', 'esignature:views/fullscreen-signature', {
                fieldName: this.name,
                fieldLabel: this.translate(this.name, 'fields', this.model.entityType) || 'Signature'
            }, (view) => {
                view.render();
                
                this.listenToOnce(view, 'signature-saved', (signatureData) => {
                    this.saveSignature(signatureData);
                });
                
                this.listenToOnce(view, 'close', () => {
                    this._isInlineEditMode = false;
                    this.clearView('fullscreenSignature');
                });
            }).catch((err) => {
                this._isInlineEditMode = false;
                console.error('Error loading fullscreen signature view:', err);
                this.notify('Error loading signature interface. Please try again.', 'error');
            });
        },
        
        inlineEditClose: function () { // substitutes same function at base.js
            this.trigger('inline-edit-off');
            this._isInlineEditMode = false;
            this.once('after:render', function () {
                // remove the inline edit links
                this.removeInlineEditLinks(); // function inherited from base.js
            }, this);
            // re-renders the entity in detail mode
            this.reRender(true);
        },
        
        saveSignature: function(signatureData) {
            var d = new Date();
            var timestamp = eSignatureISODateString(d);
            
            var translatedLabel = this.getLanguage().translate('electronicallySignedOn', 'messages', 'Global') || 
                                  this.getLanguage().translate('Electronically Signed On', 'labels', 'Global') ||
                                  'Electronically Signed On';
            
            var imageSource = '<img src="' + signatureData + '" style="max-width:300px;height:auto;"/>' +
                            '<div style="margin-top:-0.5em;font-size:1em;font-style:italic;">' +
                            translatedLabel + ' ' + timestamp +
                            '</div>';

            this.notify('Saving...');
            var self = this;
            var model = this.model;
            var data = model.attributes;
            data[this.name] = imageSource;
            
            this.model.save(data, {
                success: function () {
                    self.trigger('after:save');
                    model.trigger('after:save');
                    self.notify('Saved', 'success');
                    self.readOnly = true;
                    self.inlineEditClose();
                },
                error: function () {
                    Espo.Ui.error("Error saving signature");
                    self.notify('Error occurred', 'error');
                },
                patch: true
            });
        }
         
    });
});

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

Espo.define('esignature:views/modals/signature', 'views/modal', function (Dep) {

    return Dep.extend({

        className: 'dialog dialog-record esignature-fullscreen-modal',
        
        template: 'esignature:modals/signature',
        
        backdrop: true,

        setup: function () {
            this.headerText = 'Sign: ' + (this.options.fieldLabel || 'Signature');
            
            this.buttonList = [
                {
                    name: 'save',
                    label: 'Save',
                    style: 'primary',
                },
                {
                    name: 'cancel',
                    label: 'Cancel',
                }
            ];
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);
            
            var $canvas = this.$el.find('.signature-canvas');
            
            this.$sigDiv = $canvas.jSignature({
                UndoButton: true,
                color: 'rgb(5, 1, 135)',
                lineWidth: 2,
                width: '100%',
                height: 450
            });
            
            this.blankCanvassCode = this.$sigDiv.jSignature('getData');
        },

        actionSave: function () {
            const strokes = this.$sigDiv.jSignature('getData', 'native');
            
            if (!strokes.length) {
                Espo.Ui.error('Please provide a signature before saving');
                return;
            }
            
            var signatureData = this.$sigDiv.jSignature('getData');
            this.trigger('signature-saved', signatureData);
            this.close();
        },

        actionCancel: function () {
            this.close();
        }
    });
});

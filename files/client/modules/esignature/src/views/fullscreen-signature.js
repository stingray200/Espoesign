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

Espo.define('esignature:views/fullscreen-signature', 'view', function (Dep) {

    return Dep.extend({

        template: 'esignature:fullscreen-signature',
        
        events: {
            'click [data-action="save"]': function() {
                this.actionSave();
            },
            'click [data-action="cancel"]': function() {
                this.actionCancel();
            }
        },

        data: function() {
            return {
                fieldLabel: this.options.fieldLabel || 'Signature',
                isLandscape: this.isLandscape(),
                isMobile: this.isMobile()
            };
        },

        setup: function() {
            this.fieldName = this.options.fieldName;
            this.fieldLabel = this.options.fieldLabel;
            
            $(window).on('orientationchange.sig resize.sig', () => {
                this.reRender();
            });
            
            this.escapeHandler = (e) => {
                if (e.key === 'Escape') {
                    this.actionCancel();
                }
            };
            $(document).on('keydown.sig', this.escapeHandler);
        },

        afterRender: function() {
            Dep.prototype.afterRender.call(this);
            
            this.enterFullscreen();
            
            if (this.isLandscape() || !this.isMobile()) {
                this.initializeCanvas();
            }
        },

        initializeCanvas: function() {
            var $canvas = this.$el.find('.fullscreen-signature-canvas');
            
            if ($canvas.length === 0) return;
            
            var HEADER_FOOTER_HEIGHT = 200;
            var canvasHeight = window.innerHeight - HEADER_FOOTER_HEIGHT;
            
            this.$sigDiv = $canvas.jSignature({
                UndoButton: true,
                color: 'rgb(5, 1, 135)',
                lineWidth: 3,
                width: '100%',
                height: canvasHeight
            });
            
            this.blankCanvasCode = this.$sigDiv.jSignature('getData');
            
            this.$sigDiv.on('change', () => {
                const strokes = this.$sigDiv.jSignature('getData', 'native');
                if (strokes && strokes.length > 0) {
                    this.$el.find('[data-action="save"]').removeClass('hidden');
                }
            });
        },

        enterFullscreen: function() {
            var elem = this.$el[0];
            var fullscreenPromise = null;
            
            if (elem.requestFullscreen) {
                fullscreenPromise = elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) {
                fullscreenPromise = elem.webkitRequestFullscreen();
            } else if (elem.mozRequestFullScreen) {
                fullscreenPromise = elem.mozRequestFullScreen();
            } else if (elem.msRequestFullscreen) {
                fullscreenPromise = elem.msRequestFullscreen();
            }
            
            if (fullscreenPromise && fullscreenPromise.catch) {
                fullscreenPromise.catch((err) => {
                    console.warn('Fullscreen request failed:', err);
                    Espo.Ui.warning('Fullscreen mode not available. Continuing in normal mode.');
                });
            }
            
            if (screen.orientation && screen.orientation.lock) {
                screen.orientation.lock('landscape').catch(() => {});
            }
        },

        exitFullscreen: function() {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            
            if (screen.orientation && screen.orientation.unlock) {
                screen.orientation.unlock();
            }
        },

        actionSave: function() {
            if (!this.$sigDiv) return;
            
            const strokes = this.$sigDiv.jSignature('getData', 'native');
            
            if (!strokes || strokes.length === 0) {
                Espo.Ui.error('Please provide a signature before saving');
                return;
            }
            
            var signatureData = this.$sigDiv.jSignature('getData');
            this.trigger('signature-saved', signatureData);
            this.close();
        },

        actionCancel: function() {
            this.close();
        },

        close: function() {
            this.exitFullscreen();
            $(document).off('keydown.sig');
            $(window).off('.sig');
            this.trigger('close');
            this.remove();
        },

        isLandscape: function() {
            return window.innerWidth > window.innerHeight;
        },

        isMobile: function() {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                   (window.innerWidth <= 768);
        }
    });
});

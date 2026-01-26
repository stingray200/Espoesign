<div class="fullscreen-signature-container">
    <div class="fullscreen-signature-header">
        <h2>{{fieldLabel}}</h2>
        <button class="btn btn-danger btn-lg fullscreen-cancel-btn" data-action="cancel">
            <span class="fas fa-times"></span> CANCEL
        </button>
    </div>
    
    {{#if isMobile}}
        {{#unless isLandscape}}
            <div class="rotate-device-message">
                <div class="rotate-icon">
                    <span class="fas fa-mobile-alt fa-4x"></span>
                    <span class="fas fa-sync-alt fa-2x"></span>
                </div>
                <h3>Please Rotate Your Device</h3>
                <p>Turn your device to landscape mode for the best signing experience</p>
            </div>
        {{/unless}}
    {{/if}}
    
    {{#if isLandscape}}
        <div class="fullscreen-signature-content">
            <div class="signature-instructions-mini">
                <span class="fas fa-info-circle"></span> Sign in the box below
            </div>
            
            <div class="fullscreen-canvas-wrapper">
                <div class="fullscreen-signature-canvas"></div>
            </div>
            
            <div class="fullscreen-signature-footer">
                <button class="btn btn-success btn-lg fullscreen-done-btn hidden" data-action="save">
                    <span class="fas fa-check"></span> DONE - SAVE SIGNATURE
                </button>
            </div>
        </div>
    {{else}}
        {{#unless isMobile}}
            <div class="fullscreen-signature-content">
                <div class="signature-instructions-mini">
                    <span class="fas fa-info-circle"></span> Sign in the box below
                </div>
                
                <div class="fullscreen-canvas-wrapper">
                    <div class="fullscreen-signature-canvas"></div>
                </div>
                
                <div class="fullscreen-signature-footer">
                    <button class="btn btn-success btn-lg fullscreen-done-btn hidden" data-action="save">
                        <span class="fas fa-check"></span> DONE - SAVE SIGNATURE
                    </button>
                </div>
            </div>
        {{/unless}}
    {{/if}}
</div>

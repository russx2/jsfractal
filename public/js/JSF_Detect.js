
var JSF_Detect = new Class({
    
    /**
     * Constructor
     * 
     * Determines the capabilities of the browser with regards to methods required
     * for JSF.
     * 
     * Sets properties that can be queried statically.
     * 
     * @return void
     */
    initialize: function() {

        var elm_canvas = new Element('canvas') || null;
        var elm_canvas_ctx = elm_canvas ? elm_canvas.getContext('2d') : {};

        // optimum - canvas has getImageData method
        JSF_Detect.HAS_PIXEL_MANIPULATION = elm_canvas_ctx.getImageData ? true : false;
        
        // second best - browser supports data urls (apart from IE, which we don't support
        // anyway, are there any?)
        JSF_Detect.HAS_DATA_URLS = true;
    }
    
});

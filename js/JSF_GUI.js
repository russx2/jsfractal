
/**
 * Events fired:
 * 
 *     * onSettingsChange(obj_settings)
 *       Fired when the user changes the settings form
 *     
 *     * onReset
 *       Fired when the user attempts to start a new fractal from scratch
 */
var JSF_GUI = new Class({
	
    Implements: [Options, Events, Chain],
    
    // reference to history object
	obj_history: null,
    
    // caching of necessary properties
    str_history_id: null,
    str_canvas_id: null,
 
    // default settings
    options: {
        
        // settings form
        str_settings_form_id: 'jsf_settings',
        str_settings_size: { id: 'jsf_settings_size', initial: 'medium' },
        str_settings_quality: { id: 'jsf_settings_quality', initial: 'medium' },
        str_settings_colours: { id: 'jsf_settings_colours', initial: 'fire' },
        str_settings_submit: { id: 'jsf_settings_submit_update' },
        str_settings_reset: { id: 'jsf_settings_submit_reset' },
        
        // rendering element
        str_rendering_id: 'rendering',
        str_rendering_status_id: 'rendering_status',
        
        // help text/areas
        str_help_link_id: 'help_link',
        str_help_area_id: 'footer',
        str_render_time_id: 'render_time'
    },
 
	/**
	 * Constructor
	 * 
	 * @param obj obj_history     JSF_History object
	 * @param str str_canvas_id   ID of the canvas element to use
	 * @param str str_history_id  ID of the history element to use
	 * @param str obj_options     Additional override options (optional)
	 * @return void
	 */
	initialize: function(obj_history, str_canvas_id, str_history_id, obj_options) {
		
        // save for internal use
		this.obj_history = obj_history;
        this.str_history_id = str_history_id;
        this.str_canvas_id = str_canvas_id;
        
        // override any default settings options
        if(obj_options) {
            this.setOptions(obj_options);
        }
        
        // set defaults in settings form
        $(this.options.str_settings_size.id).getElement('option[value=' + this.options.str_settings_size.initial +']').set('selected', true);
        $(this.options.str_settings_quality.id).getElement('option[value=' + this.options.str_settings_quality.initial +']').set('selected', true);
        $(this.options.str_settings_colours.id).getElement('option[value=' + this.options.str_settings_colours.initial +']').set('selected', true);
        
        // hook ourselves into the fractal settings form
        $(this.options.str_settings_submit.id).addEvent('click', this._event_settings_change.bindWithEvent(this));
        $(this.options.str_settings_reset.id).addEvent('click', this._event_settings_reset.bindWithEvent(this));
        
        // link help link to help area
        $(this.options.str_help_link_id).addEvent('click', this.scroll_to_help.bind(this));
	},
    
    /**
     * Shows the "rendering" message area
     * 
     * @param boo boo  True to show, false to hide
     * @return void
     */
    show_rendering: function(boo) {
        
        $(this.options.str_rendering_id).setStyle('display', boo ? 'block' : 'none');
        
        // clear the status percentage regardless of whether we're showing or hiding
        $(this.options.str_rendering_status_id).set('html', '');
    },
    
    /**
     * Updates the rendering message area with the percentage completed
     * 
     * @param int int_percentage  Percentage complete
     * @return void
     */
    update_loading: function(int_percentage) {
        
        $(this.options.str_rendering_status_id).set('html', int_percentage + '%');
    },
    
    /**
     * Called when we receive input from the settings form. Extracts the options
     * and fires an event for listeners to act on.
     * 
     * @param obj obj_event     The event object 
     * @event onSettingsChange  Fires this event, passing the extracted options
     * @return void
     */
    _event_settings_change: function(obj_event) {
        
        // prevent the event from propogating
        obj_event.stop();
        
        // extract settings
        var obj_settings = {
            size: $(this.options.str_settings_size.id).get('value'),
            quality: $(this.options.str_settings_quality.id).get('value'),
            colours: $(this.options.str_settings_colours.id).get('value')
        };
        
        this.fireEvent('onSettingsChange', obj_settings);
    },
    
    /**
     * Called when we receive input from the settings form intended to reset the
     * fractal.
     * 
     * @param obj obj_event     The event object 
     * @event onReset           Fires this event
     * @return void
     */
    _event_settings_reset: function(obj_event) {
        
        // prevent the event from propogating
        obj_event.stop();
        
        this.fireEvent('onReset');
    },
    
    /**
     * Scrolls the window to the help area
     * 
     * @return void
     */
    scroll_to_help: function() {
        
        (new Fx.Scroll(document.window)).toElement(this.options.str_help_area_id);
    },
    
    /**
     * Updates the rendering time element with a new value
     * 
     * @param str str_time  String to set
     * @return void
     */
    show_render_time: function(str_time) {
        $(this.options.str_render_time_id).set('html', str_time);  
    },
	
    /**
     * Performs a "zoom" animation from the passed history index to the coordinates passed.
     * Fakes the zoom in the sense that it merely crops and enlarges the current fractal
     * image until only the destination remains.
     * 
     * @param int int_history_idx       ID of the fractal history to perform the zoom on
     * @param obj obj_selection_coords  Coordinates to zoom to (canvas based)
     * @param fun fun_callback          Function to callback once completed
     * @return void
     */
	zoom_preview: function(int_history_idx, obj_selection_coords, fun_callback) {
		
        var elm_canvas = $(this.str_canvas_id);
        var int_screen_width = elm_canvas.getProperty('width');
        var int_screen_height = elm_canvas.getProperty('height');
        
        // retrieve the image and coordinates we're zooming into from the history
        var obj_history = this.obj_history.get(int_history_idx);
        var elm_canvas_history = obj_history.elm_canvas;
        
        // history canvas may not be the same size as the current "screen" size
        var int_history_width = elm_canvas_history.width;
        var int_history_height = elm_canvas_history.height;
        
        // calculate how many iterations the animation should take (the deeper the zoom the more
        // iterations in order to maintain consistent animation timing)
        var int_travel = (int_screen_width - (obj_selection_coords.x[1] - obj_selection_coords.x[0]));
        var int_iterations = (int_travel / (int_screen_width / 40)).round();
        
        // pre-calculate some necessary values for the zoom animation method
        var obj_zoom_values = {
            
            // calculate the bounding rectangle for the area we're zooming into
            left: obj_selection_coords.x[0],
            right: int_history_width - obj_selection_coords.x[1],
            top: obj_selection_coords.y[0],
            bottom: int_history_height - obj_selection_coords.y[1],
            
            // target canvas dimensions
            screen_width: int_screen_width,
            screen_height: int_screen_height,
            
            // history canvas dimensions
            history_width: int_history_width,
            history_height: int_history_height,
            
            // selection coordinates
            selection: obj_selection_coords,
            
            // number of frames required for the zoom animation
            iterations: int_iterations
        };

        // execute the zoom
        this._zoom_preview(elm_canvas_history, $(this.str_canvas_id).getContext('2d'), obj_zoom_values, fun_callback, 0);
	},
    
    /**
     * Worker method for the zoom_preview method. Repeated calls itself, zooming in a little more each time.
     * 
     * @param elm elm_canvas        Canvas element to render to
     * @param obj obj_canvas_ctx    Canvas graphics context to render to
     * @param obj obj_zoom_values   Constructed in zoom_preview method: pre-calculated values for the zoom
     * @param fun fun_callback      Callback method to call once completed
     * @param int i                 The current iteration of the zoom we're drawing
     * 
     * @return void
     */
    _zoom_preview: function(elm_canvas, obj_canvas_ctx, obj_zoom_values, fun_callback, i) {
        
        var int_history_width = obj_zoom_values.history_width;
        var int_history_height = obj_zoom_values.history_height;
        
        var int_screen_width = obj_zoom_values.screen_width;
        var int_screen_height = obj_zoom_values.screen_height;
        
        var int_iterations = obj_zoom_values.iterations;
        
        if(i == int_iterations) {
            
            // fire completion callback
            return fun_callback ? fun_callback() : null;
        }

        var flt_x0 = (i * (obj_zoom_values.left / int_iterations));
        var flt_y0 = (i * (obj_zoom_values.top / int_iterations));
        var flt_x1 = int_history_width - ((obj_zoom_values.right / int_iterations) * i);
        var flt_y1 = int_history_height - ((obj_zoom_values.bottom / int_iterations) * i);

        obj_canvas_ctx.drawImage(elm_canvas, flt_x0, flt_y0, flt_x1 - flt_x0, flt_y1 - flt_y0, 0, 0, int_screen_width, int_screen_height);
    
        this._zoom_preview.delay(5, this, [elm_canvas, obj_canvas_ctx, obj_zoom_values, fun_callback, i + 1]);
    },
    
    /**
     * Plays the entire history sequence of fractals one after the other. Sets up a callChain to repeatedly
     * call zoom_preview() until complete.
     * 
     * @param fun fun_callback  Method to callback once complete
     * 
     * @return void
     */
    play: function(fun_callback) {
        
        var fun_callchain_bind = this.callChain.bind(this);
        
        var fun_active_history = function(i) {
            this.obj_history.set_active(i);
            this.callChain();
        };
        
        // iterate through each history item except the last
        for(var i = 0, ilen = this.obj_history.count() - 1; i < ilen; i++) {
            
            var obj_history = this.obj_history.get(i); //arr_history[i];
            var obj_history_next = this.obj_history.get(i + 1);
            
            // add chain to: highlight currently animated history thumbnail, call next chain, perform animation
            this.chain(
                fun_active_history.bind(this, i),
                this.zoom_preview.bind(this, [i, obj_history_next.obj_selection_coords, fun_callchain_bind])
            );
        }
        
        // highlight the final item and fire the callback
        this.chain(
            fun_active_history.bind(this, i),
            fun_callback
        );
 
        // execute the chain
        this.callChain();
    
    }
});




/**
 * Events fired:
 * 
 *     * onSettingsChange(obj_settings)
 *       Fired when the user changes the settings form
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
        
        // rendering element
        str_rendering_id: 'rendering',
        str_rendering_status_id: 'rendering_status'
    },
 
	
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
        $(this.options.str_settings_form_id).addEvent('submit', this._event_settings_change.bindWithEvent(this));
	},
    
    show_rendering: function(boo) {
        $(this.options.str_rendering_id).setStyle('display', boo ? 'block' : 'none');
        
        // clear the status percentage regardless of whether we're showing or hiding
        $(this.options.str_rendering_status_id).set('html', '');
    },
    
    update_loading: function(int_percentage) {
        $(this.options.str_rendering_status_id).set('html', int_percentage + '%');
    },
    
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
	
	zoom_preview: function(int_history_idx, obj_selection_coords, fun_callback) {
		
        var elm_canvas = $(this.str_canvas_id);
        var int_screen_width = elm_canvas.getProperty('width');
        var int_screen_height = elm_canvas.getProperty('height');
        
        // retrieve the image and coordinates we're zooming into from the history
        var obj_history = this.obj_history.get(int_history_idx);
        var elm_canvas = obj_history.elm_canvas;
        
        // calculate how many iterations the animation should take (the deeper the zoom the more
        // iterations in order to maintain consistent animation timing)
        var int_travel = (int_screen_width - (obj_selection_coords.x[1] - obj_selection_coords.x[0]));
        var int_iterations = (int_travel / (int_screen_width / 40)).round();
        
        // pre-calculate some necessary values for the zoom animation method
        var obj_zoom_values = {
            
            // calculate the bounding rectangle for the area we're zooming into
            left: obj_selection_coords.x[0],
            right: int_screen_width - obj_selection_coords.x[1],
            top: obj_selection_coords.y[0],
            bottom: int_screen_height - obj_selection_coords.y[1],
            
            // canvas dimensions
            screen_width: int_screen_width,
            screen_height: int_screen_height,
            
            // selection coordinates
            selection: obj_selection_coords,
            
            // number of frames required for the zoom animation
            iterations: int_iterations
        };

        // execute the zoom
        this._zoom_preview(elm_canvas, $(this.str_canvas_id).getContext('2d'), obj_zoom_values, fun_callback, 0);
	},
    
    _zoom_preview: function(elm_canvas, obj_canvas_ctx, obj_zoom_values, fun_callback, i) {
        
        var int_screen_width = obj_zoom_values.screen_width;
        var int_screen_height = obj_zoom_values.screen_height;
        var int_iterations = obj_zoom_values.iterations;
        
        if(i == int_iterations) {
            
            // fire completion callback
            return fun_callback ? fun_callback() : null;
        }

        var flt_x0 = (i * (obj_zoom_values.left / int_iterations));
        var flt_y0 = (i * (obj_zoom_values.top / int_iterations));
        var flt_x1 = int_screen_width - ((obj_zoom_values.right / int_iterations) * i);
        var flt_y1 = int_screen_height - ((obj_zoom_values.bottom / int_iterations) * i);

        obj_canvas_ctx.drawImage(elm_canvas, flt_x0, flt_y0, flt_x1 - flt_x0, flt_y1 - flt_y0, 0, 0, int_screen_width, int_screen_height);
    
        this._zoom_preview.delay(5, this, [elm_canvas, obj_canvas_ctx, obj_zoom_values, fun_callback, i + 1]);
    },
    
    __play: function(fun_callback) {
        
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



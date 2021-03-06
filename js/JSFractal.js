
var JSFractal = new Class({
	
    str_canvas_container_id: null,
	str_canvas_id: null,
	
    // component classes
	obj_renderer: null,
	obj_selector: null,
    obj_history: null,
	obj_gui: null,
    
    // stores the most recently selected canvas coordinates
    obj_canvas_coords: null,
    
    // settings values
    obj_settings: {
    
        plane_coords_initial: {
            x: [-2.1, 0.9],
            y: [-1.5, 1.5]
        },
        
        size: {
            small: { width: 152, height: 152 },
            medium: { width: 300, height: 300 },
            large: { width: 500, height: 500 }
        },
        
        quality: {
            low: { iterations: 100 },
            medium: { iterations: 200 },
            high: { iterations: 500 },
            ultra: { iterations: 1000 }
        }
    },
    
    // current coordinates on the fractal plane
	obj_plane_coords: null,
    
    // set during animations etc. in order to prevent GUI manipulation
    boo_locked: false,
	
    /**
     * Constructor
     * 
     * This is the entry point into JSFractal. Sets up the entire app.
     * 
     * @param str str_canvas_container_id  ID of the canvas container
     * @param str str_canvas_id            ID of the canvas element itself
     * @param str str_history_id           ID of the history element
     * 
     * @return void
     */
	initialize: function(str_canvas_container_id, str_canvas_id, str_history_id) {
		
        this.str_canvas_container_id = str_canvas_container_id;
		this.str_canvas_id = str_canvas_id;
        
        // for non-firebug users (we only use console.info)
        if(!console) {
            console = {};
            console.info = function(){};
        }

		// initialise the components
        var obj_detect = new JSF_Detect();
		var obj_renderer = new JSF_Renderer(str_canvas_id, this.obj_settings.quality.medium.iterations);
        var obj_selector = new JSF_Selector(str_canvas_container_id);
        var obj_history = new JSF_History(str_canvas_id, str_history_id);
        var obj_gui = new JSF_GUI(obj_history, str_canvas_id, str_history_id);
        
        // store references
        this.obj_renderer = obj_renderer;
        this.obj_selector = obj_selector;
        this.obj_gui = obj_gui;
        this.obj_history = obj_history;
        
        // listen to component events
		obj_renderer.addEvent('onRenderComplete', this._event_render_complete.bind(this));
        obj_renderer.addEvent('onRenderComplete', this.obj_gui.show_rendering.bind(this.obj_gui, false));
        obj_renderer.addEvent('onRenderStart', this.obj_gui.show_rendering.bind(this.obj_gui, true));
        obj_renderer.addEvent('onRenderPause', this.obj_gui.update_loading.bind(this.obj_gui));
        
		obj_selector.addEvent('onSelection', this._event_selection.bind(this));
        obj_history.addEvent('onHistorySelect', this._event_go_history.bind(this));
        
        obj_gui.addEvent('onSettingsChange', this._change_settings.bind(this));
        obj_gui.addEvent('onReset', this._reset.bind(this));
        
        // set initial default plane coordinates
        this.obj_plane_coords = this.obj_settings.plane_coords_initial;
        
        // are coordinates being passed in the url hash? if so, override defaults
        if(window.location.hash) {
            
            var arr_coordinates = window.location.hash.replace(/#/, '').split('|');
            
            if(arr_coordinates.length == 8) {
                
                // override coords
                this.obj_plane_coords = {
                    x: [arr_coordinates[0].toFloat(), arr_coordinates[2].toFloat()],
                    y: [arr_coordinates[1].toFloat(), arr_coordinates[3].toFloat()]
                };
                
                this.obj_canvas_coords = {
                    x: [arr_coordinates[4].toFloat(), arr_coordinates[6].toFloat()],
                    y: [arr_coordinates[5].toFloat(), arr_coordinates[7].toFloat()]
                };
            }
        }
        
		// render initial top level fractal (with default settings)
        this._change_settings({
            size: 'medium',
            quality: 'medium',
            colours: 'fire'
        });
        
        // TODO: move the control of this functionality to the GUI class
        $('play').addEvent('click', this.__play.bind(this));
	},
    
    /**
     * Takes in the passed settings and notifies/updates components of the change
     * (e.g. changed canvas size, colour scheme or quality level).
     * 
     * @param obj obj_settings  The new settings to apply
     * 
     * @return void
     */
    _change_settings: function(obj_settings) {
        
        if(this._is_locked()) {
            return;
        }
        
        // lock gui
        this._lock(true);
        
        // remove last item from history (we're replacing it)
        this.obj_history.delete_from_active();
        
        // extract parameters from lookup
        var obj_params_quality = this.obj_settings.quality[obj_settings.quality];
        var obj_params_size = this.obj_settings.size[obj_settings.size];
        
        // set the canvas size (width/height)
        this._create_canvas(obj_params_size.width, obj_params_size.height);
        
        // set renderer iterations
        this.obj_renderer.set_iterations(obj_params_quality.iterations);
        
        // build new colour palette
        this.obj_renderer.build_colour_palette();

        // re-render current fractal
        this.obj_renderer.render(this.obj_plane_coords);
    },
    
    /**
     * Removes the current canvas element for the fractal (if it exists) and replaces
     * with a new one at the requested size
     * 
     * @param int int_width   New width (px)
     * @param int int_height  New height (px)
     */
    _create_canvas: function(int_width, int_height) {
        
        // remove any existing canvas elements
        $(this.str_canvas_container_id).getElements('canvas').dispose();
        
        // set new dimensions for the container
        $(this.str_canvas_container_id).setStyles({width: int_width, height: int_height});
        
        // create new canvas element and insert into the container
        var elm_canvas = new Element('canvas', {
            width: int_width,
            height: int_height,
            id: this.str_canvas_id
        });
        
        // default canvas to black
        var elm_canvas_ctx = elm_canvas.getContext('2d');
        elm_canvas_ctx.fillStyle = 'black';
        elm_canvas_ctx.fillRect(0, 0, int_width, int_height);
        
        // add to the dom
        elm_canvas.inject(this.str_canvas_container_id);
    },
    
    /**
     * Resets the application (simply updates the window.location field to ourselves,
     * ensuring to remove the hash property first - otherwise we'd re-render the current
     * fractal!
     * 
     * @return void
     */
    _reset: function() {
        
        if(this._is_locked()) {
            return;
        }
      
        if(window.confirm('Start a new fractal with default settings?')) {
            
            // effectively refresh the page, ensuring the hash isn't present in the url
            window.location = window.location.pathname;
        }  
    },
	
    /**
     * Renders the fractal of the requested selection coords. The actual fractal plane
     * based coordinates are calculated as a function of the current fractal's coordinates
     * and the passed canvas-based selection coords.
     * 
     * Prior to rendering we "lock" ourselves so we can ignore any events/requests during
     * the rendering.
     * 
     * @param obj obj_selection_coords  Selection coordinates to render
     * 
     * @return void
     */
	render: function(obj_selection_coords) {

        this._lock(true);

        // calculate plane coords from the (canvas based) selection coords
        var obj_plane_coords = JSF_Util.canvas_coords_to_fractal(this.str_canvas_id, this.obj_plane_coords, obj_selection_coords);

    	// store new coordinates
		this.obj_plane_coords = obj_plane_coords;
        this.obj_canvas_coords = obj_selection_coords;

		// render
		this.obj_renderer.render(obj_plane_coords);
	},
    
    /**
     * Called once the rendering has completed. Unlocks ourself.
     * 
     * @param int int_duration  Time the render took (ms)
     * 
     * @return void
     */
    _event_render_complete: function(int_duration) { 
  
        // add this newly rendered fractal to the history
        this.obj_history.add(this.obj_plane_coords, this.obj_canvas_coords);
        
        // update url coordinates
        this.update_url_coordinates();
        
        // remove event locks
        this._lock(false);
 
        // show rendering time
        console.info('Render complete in: ' + int_duration + 'ms');
        this.obj_gui.show_render_time(int_duration);
    },
	
    /**
     * Called when a user makes a selection.
     * 
     * Initiates the zoom -> render -> add to history sequence
     * 
     * @param obj obj_selection_coords  Coordinates (canvas based) of the selection
     */
	_event_selection: function(obj_selection_coords) {
        
        if(this._is_locked()) {
            return;
        }

        this._lock(true);
                
        // remove any history after this item
        this.obj_history.delete_after_active();

		// show the preview and render
		this.obj_gui.zoom_preview(this.obj_history.get_active(), obj_selection_coords, this.render.bind(this, obj_selection_coords));
	},

    /**
     * Called when a user selects a history item to view. Switches the current fractal
     * to the version selected and sets as the active history element.
     * 
     * @param int int_history_idx  The index of the history element selected
     * 
     * @return void
     */
    _event_go_history: function(int_history_idx) {

        if(this._is_locked()) {
            return;
        }

        var obj_history = this.obj_history.get(int_history_idx);

        // flag the item as active
        this.obj_history.set_active(int_history_idx);

        var int_width = $(this.str_canvas_id).getProperty('width');
        var int_height = $(this.str_canvas_id).getProperty('height');

        // draw history item to the canvas
        $(this.str_canvas_id).getContext('2d').drawImage(obj_history.elm_canvas, 0, 0, int_width, int_height);
        
        // update current coordinates
        this.obj_plane_coords = obj_history.obj_plane_coords;
        
        // update url coordinates
        this.update_url_coordinates();
    },
    
    /**
     * Initiates a "playback" of the timeline (zooming through all history elements).
     * 
     * TODO: Move this to the GUI class.
     * 
     * @return void
     */
    __play: function() {
        
        if(this._is_locked()) {
            return true;
        }
        
        // we can't proceed if there's no history to play
        if(this.obj_history.count() <= 1) {
            return;
        }
        
        this._lock(true);
        
        this.obj_gui.play(this.show_current.bind(this));
    },
    
    /**
     * Shows the latest (current) fractal generated (that is, the last fractal
     * added to the history).
     * 
     * @return void
     */
    show_current: function() {
        
        // retrieve canvas from the history
        var obj_history = this.obj_history.get_last();
        
        // update associated fractal coordinates
        this.obj_plane_coords = obj_history.obj_plane_coords;
        
        // draw to display
        $(this.str_canvas_id).getContext('2d').drawImage(obj_history.elm_canvas, 0, 0);
        
        // set active
        this.obj_history.set_active(this.obj_history.count() - 1);
        
        // update url coordinates
        this.update_url_coordinates();
        
        this._lock(false);
    },
    
    /**
     * Updates the fractal coordinates stored in the #hash part of the URL to the
     * current coordinates.
     * 
     * Means a user can bookmark a fractal.
     * 
     * @return void
     */
    update_url_coordinates: function() {
        
        var obj_plane_coords = this.obj_plane_coords;
        var obj_canvas_coords = this.obj_canvas_coords;
        
        // if no canvas coords exist yet, it means this is the initial fractal.
        // in this case, don't bother storing the URL coords since it's the
        // default anyway
        if(!obj_canvas_coords) {
            return;
        }
        
        // construct url hash parameter
        var str_hash = obj_plane_coords.x[0] + '|' + 
                       obj_plane_coords.y[0] + '|' + 
                       obj_plane_coords.x[1] + '|' + 
                       obj_plane_coords.y[1] + '|' +
                       obj_canvas_coords.x[0] + '|' + 
                       obj_canvas_coords.y[0] + '|' + 
                       obj_canvas_coords.x[1] + '|' + 
                       obj_canvas_coords.y[1];
    
        // store in the hash
        window.location.hash = str_hash;
    },
    
    /**
     * Set or unset the internal lock variable. This is used to avoid acting
     * on events etc. whilst we are rendering or performing some other volatile
     * operation.
     * 
     * @param boo boo  True to lock, false to unlock
     * @return void
     */
    _lock: function(boo) {
        this.boo_locked = boo;
        
        if(boo) {
            $(document.body).addClass('locked');
        }
        else {
            $(document.body).removeClass('locked');
        }
    },
    
    /**
     * Allows us to test whether the lock is active or not.
     * 
     * @return True if locked, false otherwise
     */
    _is_locked: function() {
        return this.boo_locked;
    }

});

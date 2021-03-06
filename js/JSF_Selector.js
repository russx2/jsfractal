/**
 * Events fired:
 * 
 *     * onSelection
 *       Fired when the user completes a selection (passes the selected coordinates as the argument)
 */
var JSF_Selector = new Class({
	
	Implements: Events,
	
    str_container_id: null,
	elm_selection: null,

	obj_drag: null,
    
    // this is pre-calculate to take into accout items such as border and padding which
    // artificially increase reported widths and offsets in calculations.
    //
    // Note: we assume all properties are symmetrical on each of the 4 sides
    int_container_border: 0,

	/**
	 * Constructor
	 * 
	 * Sets up the selection element and behaviour.
	 * 
	 * @param str str_container_id  ID of the container element to bind our selector element to
	 * 
	 * @return void
	 */
	initialize: function(str_container_id) {

		// store container coordinates
        this.str_container_id = str_container_id;
        
		// create selection element and add to the dom
		this.elm_selection = new Element('div');
		this.elm_selection.inject($(str_container_id), 'top');
        
        // calculate the border offset of the container
        this.int_container_border += $(str_container_id).getStyle('border-left').toInt();
        this.int_container_border += $(str_container_id).getStyle('padding-left').toInt();
        
		// set initial state
		this.reset();
		
		this.elm_selection.addEvent('mousedown', this._event_start.bind(this));
        $(str_container_id).addEvent('mouseup', this._event_complete_check.bind(this));
        $(str_container_id).addEvent('dblclick', function() { console.info('cool!')});
		
		// setup dragging functionality
		this.obj_drag = new Drag(this.elm_selection, {
			
			modifiers: { 
                x: 'width', 
                y: 'height' 
            },
            
			onDrag: this._event_drag.bindWithEvent(this),
			onComplete: this._event_complete.bindWithEvent(this)
		});    
	},
	
    /**
     * Resets the selector element to its "listening" state (covering the container
     * area, invisible and waiting for a click).
     * 
     * @return void
     */
	reset: function() {

        // hide the selection area from view but allow it to still be
        // the top clickable layer
		this.elm_selection.setStyles({
            
			position: 'absolute',
            
            // stretch over entire canvas area
			top: 0,
			left: 0,
            bottom: 0,
            right: 0,
            
            // width and height should be auto whilst we're waiting for the
            // click to activate
            width: 'auto',
            height: 'auto',

            // hide selection area from view
            border: 0,
            background: 'transparent',
            
            // should be the top most element within the fracal container
            zIndex: 999
		});
	},
	
    /**
     * Called once the user initiates a click-drag behaviour. Sets up the selection
     * element and limits the selection area to the container boundary.
     * 
     * @param obj obj_event  Event object
     * 
     * @return void
     */
	_event_start: function(obj_event) {

        var obj_container_coords = $(this.str_container_id).getCoordinates();

        // calculate where the click is relative to the container
    	var int_x = obj_event.client.x - obj_container_coords.left;
    	var int_y = obj_event.client.y - obj_container_coords.top + 8 + $(window).getScroll().y;
        
    	// move the selection element to where the user clicked
    	this.elm_selection.setStyles({
    		left: int_x,
    		top: int_y,
    		width: 0,
    		height: 0,
            right: 'auto',
            bottom: 'auto',
    		border: '1px dashed black',
            background: 'white',
            opacity: 0.3
    	});
    	
    	// calculate the limits for this selection based on the starting location
    	// and boundaries of the container
    	this.obj_drag.options.limit = {
    		x: [0, (obj_container_coords.width - (2 * this.int_container_border)) - int_x],
    		y: [0, (obj_container_coords.height - (2 * this.int_container_border)) - int_y]
    	};
    },
	
    /**
     * Called every time the user drags the selection element. Ensures an aspect ratio
     * of 1:1 is maintained.
     * 
     * @param obj obj_event  Event object
     * 
     * @return void
     */
	_event_drag: function(obj_event) {

		var elm = this.elm_selection;
		var obj_elm_coords = elm.getCoordinates();
		
		// check aspect ratio (modifying conflicting property if necessary)
    	if(obj_elm_coords.width > obj_elm_coords.height) {
        	elm.setStyle('width', obj_elm_coords.height);
    	}
        else if(obj_elm_coords.height > obj_elm_coords.width) {
            elm.setStyle('height', obj_elm_coords.width);
        }
	},
	
    /**
     * Called once the user has completed the click-drag event. Calculates
     * the selected coordinates relative to the container and fires an event
     * for listeners to handle.
     * 
     * @param obj obj_event  Event object
     * 
     * @event onSelection  Passes the selected coordinates as the argument
     * 
     * @return void
     */
	_event_complete: function(obj_event) {
				
		var obj_coords = this.elm_selection.getCoordinates();
		var obj_container_coords = $(this.str_container_id).getCoordinates();
		
        var int_x0 = obj_coords.left - obj_container_coords.left;
        var int_x1 = obj_coords.right - obj_container_coords.left;
        var int_y0 = obj_coords.top - obj_container_coords.top;
        var int_y1 = obj_coords.bottom - obj_container_coords.top;
        
		// ensure coordinates are a perfect square and adjust as necessary
        var int_width = int_x1 - int_x0;
        var int_height = int_y1 - int_y0;
        
        if(int_width > int_height) {
            int_x1 -= (int_width - int_height);
        }
        else if(int_height > int_width) {
            int_y1 -= (int_height - int_width);
        }
        
        // reset selection element and stop the drag event
        this.reset();

		this.fireEvent('onSelection', { 
			x: [int_x0, int_x1],
			y: [int_y0, int_y1]
		});
	},
    
    /**
     * Checks if the user has just clicked and not enlarged the selection. We need to do this so we can reset the
     * selection area since the MooTools Drag class doesn't seem to fire the onComplete event if no selection
     * is made.
     * 
     * Basically, this is a hack.
     * 
     * @return void
     */
    _event_complete_check: function() {
        
        if(this.elm_selection.getStyle('width').toInt() == 0 && this.elm_selection.getStyle('height').toInt() == 0) {
            this.obj_drag.stop();
            this.reset();
        }
    }
	
});
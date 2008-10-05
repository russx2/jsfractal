
var JSF_Selector = new Class({
	
	Implements: Events,
	
	elm_selection: null,
	obj_container_coords: null,
	obj_drag: null,
	
	initialize: function(str_container_id) {

		// store container coordinates
		this.obj_container_coords = $(str_container_id).getCoordinates();

		// create selection element and add to the dom
		this.elm_selection = new Element('div');
		this.elm_selection.inject($(str_container_id).getParent(), 'after');
		
		// set initial state
		this.reset();
		
		this.elm_selection.addEvent('mousedown', this._event_start.bind(this));
		
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
	
	reset: function() {
		
		var obj_container_coords = this.obj_container_coords;
		
        // hide the selection area from view but allow it to still be
        // the top clickable layer
		this.elm_selection.setStyles({
			position: 'absolute',
			top: obj_container_coords.top,
			left: obj_container_coords.left,
			width: obj_container_coords.width - 1,
			height: obj_container_coords.height - 1,
            border: 0,
            background: 'transparent'
		});
	},
	
	_event_start: function(obj_event) {

    	var int_x = obj_event.page.x;
    	var int_y = obj_event.page.y;
    	
    	// move the selection element to where the user clicked
    	this.elm_selection.setStyles({
    		left: int_x,
    		top: int_y,
    		width: 0,
    		height: 0,
    		border: '1px dashed red',
            background: 'white',
            opacity: 0.3
    	});
    	
    	// calculate the limits for this selection based on the starting location
    	// and boundaries of the container
    	var obj_container_coords = this.obj_container_coords;
    	
    	this.obj_drag.options.limit = {
    		x: [0, obj_container_coords.right - 1 - int_x],
    		y: [0, obj_container_coords.bottom - 1 - int_y]
    	};
    },
	
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
	
	_event_complete: function(obj_event) {
				
		var obj_coords = this.elm_selection.getCoordinates();
		var obj_container_coords = this.obj_container_coords;
		
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
        
		this.fireEvent('onSelection', { 
			x: [int_x0, int_x1],
			y: [int_y0, int_y1]
		});
		
        console.info('x = ' + (int_x1 - int_x0) + ', y = ' + (int_y1 - int_y0));

		this.reset();
	}
	
});

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
		this.elm_selection.inject(str_container_id, 'after');
		
		// set initial state
		this.reset();
		
		this.elm_selection.addEvent('mousedown', this._event_start.bind(this));
		
		// setup dragging functionality
		this.obj_drag = new Drag(this.elm_selection, {
			
			modifiers: { x: 'width', y: 'height' },
	
			onDrag: this._event_drag.bindWithEvent(this),
			
			onComplete: this._event_complete.bindWithEvent(this)
		});    
	},
	
	reset: function() {
		
		var obj_container_coords = this.obj_container_coords;
		
		this.elm_selection.setStyles({
			position: 'absolute',
			top: obj_container_coords.top,
			left: obj_container_coords.left,
			width: obj_container_coords.width - 1,
			height: obj_container_coords.height - 1,
			border: 0
		});
	},
	
	_event_start: function(obj_event) {

    	var int_x = obj_event.page.x;
    	var int_y = obj_event.page.y;
    	
    	// move the selection element to where the mouse was pressed
    	this.elm_selection.setStyles({
    		left: int_x,
    		top: int_y,
    		width: 0,
    		height: 0,
    		border: '1px solid blue'
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
		
		//
		// TODO: Ensure coordinates are a perfect square and adjust as necessary
		//
		
		this.fireEvent('onSelection', { 
			x: [obj_coords.left - obj_container_coords.left, obj_coords.right - obj_container_coords.left],
			y: [obj_coords.top - obj_container_coords.top, obj_coords.bottom - obj_container_coords.top]
		});
		
		this.reset();
	}
	
});
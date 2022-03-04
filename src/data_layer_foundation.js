// Author: Johannes Goetze
// Repository: https://github.com/jgoetze/dl_foundation
    
class DataLayerFoundation {
    static debug = false;
    static event_prefix = "dlf.";
    static viewport_element_selector = "[id], [data-dlf-id], form, header, main, footer";
    static click_element_selector    = "button, a, input, [id], [data-dlf-id]";
    static input_element_selector    = "input, select, textarea";
    static form_element_selector     = "form";

    constructor() {
        this.bound      = false;
        this.event_list = {};
    }

    // Creates a unique lookup key for an event
    static getEventKey(object, event) {
        return object.dataset.dlfObjectID + "//" + event;
    }

    // Generates trigger event label
    static getEventLabel(object, event) {
        let name =
            object.dataset['dlfName'] ||
            object.dataset['dlfId'] ||
            object.getAttribute('name') ||
            object.getAttribute('id') ||
            object.tagName;
        let event_string = event.split(/(?=[A-Z])/).join(" ");

        return (name + " " + event_string).toLowerCase();
    }

    // Push an event to the data layer
    static pushEvent(event, eventData = {}) {
        let data = Object.assign(eventData, {
            'event': DataLayerFoundation.event_prefix + event
        });

        window.dataLayer.push(data);

        if (DataLayerFoundation.debug) {
            console.log("DLF", "pushEvent", data);
        }
    }

    // Bind to the Events
    // until this function is called, no active tracking happens
    bind() {
        if (!window.IntersectionObserver) return;
        if (this.bound) return;

        let dlf = this;

        //////////////////////////////////////////////////////////
        // Init DataLayer ////////////////////////////////////////
        //////////////////////////////////////////////////////////
        window.dataLayer = window.dataLayer || [];


        //////////////////////////////////////////////////////////
        // Bind Viewport Tracking ////////////////////////////////
        //////////////////////////////////////////////////////////

        let viewport_objects_to_watch = document.querySelectorAll(DataLayerFoundation.viewport_element_selector);
        let observer = new IntersectionObserver(function(entries) {
            entries.forEach(function (observation) {
                let object = observation.target;

                // object is intersecting
                if (observation.isIntersecting) {
                    dlf.createEvent(object, 'enteredViewport');
                }
                // object is not intersecting ANYMORE
                else if (dlf.hasEventHappened(object, 'enteredViewport')) {
                    dlf.createEvent(object, 'leftViewport');
                }
            });
        });

        viewport_objects_to_watch.forEach(function(object, index) {
            object.dataset.dlfObjectID = "dlf-" + index;
            observer.observe(object);
        });


        //////////////////////////////////////////////////////////
        // Bind Click Tracking ///////////////////////////////////
        //////////////////////////////////////////////////////////

        let click_objects_to_watch = document.querySelectorAll(DataLayerFoundation.click_element_selector);
        click_objects_to_watch.forEach(function(object) {
            object.addEventListener("click", function() {
                dlf.createEvent(object, 'receivedClick', false);
            });
        });


        //////////////////////////////////////////////////////////
        // Bind Input Tracking ///////////////////////////////////
        //////////////////////////////////////////////////////////

        let input_objects_to_watch = document.querySelectorAll(DataLayerFoundation.input_element_selector);
        input_objects_to_watch.forEach(function(object) {
            object.addEventListener("input", function() {
                dlf.createEvent(object, 'receivedInput', false);
            });
        });


        //////////////////////////////////////////////////////////
        // Bind Form Tracking ////////////////////////////////////
        //////////////////////////////////////////////////////////

        let forms_to_watch = document.querySelectorAll(DataLayerFoundation.form_element_selector);
        forms_to_watch.forEach(function(form) {
            form.addEventListener("submit", function() {
                dlf.createEvent(form, 'receivedSubmit');
            });
        });


        this.bound = true
    }

    // Checks event log and creates a new event if needed
    createEvent(object, event, single = true) {
        if (single && this.hasEventHappened(object, event)) return;

        this.addEventHappening(object, event);
        DataLayerFoundation.pushEvent(event, {
            triggerTagName: object.tagName,
            triggerId: object.dataset['dlfId'] || object.getAttribute('id'),
            triggerName: object.dataset['dlfName'] || object.getAttribute('name'),
            triggerEvent: DataLayerFoundation.getEventLabel(object, event)
        });
    }

    // Adds event happening to event log
    addEventHappening(object, event) {
        this.event_list[DataLayerFoundation.getEventKey(object, event)] = true;
    }

    // Checks event log for event happening
    hasEventHappened(object, event) {
        return this.event_list[DataLayerFoundation.getEventKey(object, event)] === true;
    }
}

// Basic initialization
DataLayerFoundation.debug = false;
window.data_layer_foundation = new DataLayerFoundation();
window.data_layer_foundation.bind();
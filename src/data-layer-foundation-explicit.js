// Author: Johannes Goetze
// Repository: https://github.com/jgoetze/dl_foundation

// Available attributes:
// "data-dlfe-entered-viewport"
// "data-dlfe-left-viewport"
// "data-dlfe-received-click"
// "data-dlfe-received-double-click"
// "data-dlfe-received-input"
// "data-dlfe-received-submit"
// "data-dlfe-scrolled-thru"
//
// Usage:
// <div data-dlfe-entered-viewport="this_node_name">
// creates an DL Event like: "this_node_name entered viewport"
// <div data-dlfe-entered-viewport="this_node_name,another_node_name">
// creates an DL Event like: "this_node_name entered viewport"
// creates an DL Event like: "another_node_name entered viewport"
// <div data-dlfe-scrolled-thru="third_node_name">
// creates an DL Event like: "third_node_name scrolled thru (80)"

class DataLayerFoundationExplicit {
    static debug = false;
    static event_prefix = "dlfe.";
    static scroll_steps = [0, 20, 40, 60, 80, 100];

    constructor() {
        this.bound = false;
        window.dataLayer = window.dataLayer || [];
    }

    // Bind to the Events
    // until this function is called, no active tracking happens
    bind() {
        if (this.bound) return;

        if (window.IntersectionObserver) {
            this.bindEnteredViewport();
            this.bindLeftViewport();
        }
        this.bindReceivedClick();
        this.bindReceivedDoubleClick();
        this.bindReceivedInput();
        this.bindReceivedSubmit();
        this.bindScrolledThru();

        this.bound = true
    }

    bindEnteredViewport() {
        let dlfe = this;
        let viewport_objects_to_watch = document.querySelectorAll("[data-dlfe-entered-viewport]");

        let observer = new IntersectionObserver(function(entries) {
            entries.forEach(function (observation) {
                if (observation.isIntersecting) {
                    dlfe.createEvent(observation.target.dataset.dlfeEnteredViewport, 'enteredViewport');
                }
            });
        }, {
            threshold: 0.25
        });

        viewport_objects_to_watch.forEach(function(object, index) {
            observer.observe(object);
        });
    }

    bindLeftViewport() {
        let dlfe = this;
        let viewport_objects_to_watch = document.querySelectorAll("[data-dlfe-left-viewport]");

        let observer = new IntersectionObserver(function(entries) {
            entries.forEach(function (observation) {
                if (observation.isIntersecting) {
                    observation.target.dataset.__dlfeWasInViewport = "1";
                } else {
                    if (observation.target.dataset.__dlfeWasInViewport == "1") {
                        observation.target.dataset.__dlfeWasInViewport = "0";
                        dlfe.createEvent(observation.target.dataset.dlfeLeftViewport, 'leftViewport');
                    }
                }
            });
        }, {
            threshold: 0.25
        });

        viewport_objects_to_watch.forEach(function(object, index) {
            observer.observe(object);
        });
    }

    bindReceivedClick() {
        let dlfe = this;
        let click_objects_to_watch = document.querySelectorAll("[data-dlfe-received-click]");
        click_objects_to_watch.forEach(function(object) {
            object.addEventListener("click", function() {
                dlfe.createEvent(object.dataset.dlfeReceivedClick, 'receivedClick');
            });
        });
    }

    bindReceivedDoubleClick() {
        let dlfe = this;
        let click_objects_to_watch = document.querySelectorAll("[data-dlfe-received-double-click]");
        click_objects_to_watch.forEach(function(object) {
            object.addEventListener("dblclick", function() {
                dlfe.createEvent(object.dataset.dlfeReceivedDoubleClick, 'receivedDoubleClick');
            });
        });
    }

    bindReceivedInput() {
        let dlfe = this;
        let input_objects_to_watch = document.querySelectorAll("[data-dlfe-received-input]");
        input_objects_to_watch.forEach(function(object) {
            object.addEventListener("input", function() {
                dlfe.createEvent(object.dataset.dlfeReceivedInput, 'receivedInput');
            });
        });
    }

    bindReceivedSubmit() {
        let dlfe = this;
        let forms_to_watch = document.querySelectorAll("[data-dlfe-received-submit]");
        forms_to_watch.forEach(function(form) {
            form.addEventListener("submit", function() {
                dlfe.createEvent(form.dataset.dlfeReceivedSubmit, 'receivedSubmit');
            });
        });
    }

    bindScrolledThru() {
        let dlfe = this;
        let viewport_objects_to_watch = document.querySelectorAll("[data-dlfe-scrolled-thru]");

        viewport_objects_to_watch.forEach(function(object, index) {
            object.dataset.__scroll_steps = "-1";

            const handler = function() {
                let object_start = object.offsetTop
                let object_height = object.offsetHeight;
                let object_end = object_start + object_height;
                let current_top = window.scrollY;
                let current_bottom = current_top + window.innerHeight;

                if (object_start > current_bottom) return; // below current screen
                if (object_end < current_top) return; // above current screen

                let delta_top = current_bottom - object_start;
                let percentage = 100.0 / object_height * delta_top;

                DataLayerFoundationExplicit.scroll_steps.some((scroll_step) => {
                    if (percentage >= scroll_step) {
                        let recent_scroll_steps = parseInt(object.dataset.__scroll_steps);

                        if (scroll_step > recent_scroll_steps) {
                            object.dataset.__scroll_steps = scroll_step.toString();
                            dlfe.createEvent(object.dataset.dlfeScrolledThru, 'scrolledThru', {
                                scrollPercentage: scroll_step
                            });
                            return true;
                        } else {
                            return false;
                        }
                    }
                })
            };

            window.addEventListener('scroll', handler);
            window.addEventListener('resize', handler);
            handler();
        });
    }

    // Checks event log and creates a new event if needed
    createEvent(identifiers, event, params = {}) {
        identifiers.split(",").forEach((identifier) => {
            let event_object = {
                event: DataLayerFoundationExplicit.event_prefix + event,
                dlfeProps: Object.assign({},
                    params,
                    {
                        nodeIdentifier: identifier,
                        interactionType: event
                    }
                )
            }

            window.dataLayer.push(event_object);

            if (DataLayerFoundationExplicit.debug) {
                console.log(
                    "DLFE",
                    "pushEvent",
                    '"' + identifier + " " + event + '"',
                    event_object,
                    params
                );
            }
        });
    }
}

// Basic initialization
DataLayerFoundationExplicit.debug = false;
window.data_layer_foundation_explicit = new DataLayerFoundationExplicit();
window.data_layer_foundation_explicit.bind();
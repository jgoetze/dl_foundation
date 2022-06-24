# DataLayer Foundation

**dl_foundation** is a small event listener, tracking basic web events like **clicks**, **views** and **inputs**.

It uses basic HTML markup and triggers, which does not require any template adjustments.

## Important DOM Nodes

Events are tracked for common HTML nodes like **header**, **main** and others (see full list below).
Also nodes with an **ID** will be observed. This means you need to have a well structured HTML
document, containing relevant tags as well as IDs on important elements like CTA buttons.

## Settings

You can adjust some behavior, using static settings.

* **DataLayerFoundation.debug = true;** enables debug output to js console. 
* **DataLayerFoundation.event_whitelist = [];** allows to set published events

## Events Tracked

There are 3 main events tracked. Those are **view related events** like entering and leaving the viewport,
**clicking** on elements as well as **form interaction**.

Events are prefixed with a adjustable value. Default is "dlf.".

Therefor the following default events exist:

* **dlf.receivedInput** (called on any value change)
* **dlf.receivedSubmit** (called on valid form submit)
* **dlf.receivedClick** (called on a click)
* **dlf.enteredViewport** (called when an element enters the viewport)
* **dlf.leftViewport** (called when an element leaves the viewport)

**NOTE:** Except of the click event, all other events are currently only triggered once per 
element and event.

## Event Data

The events always contain the same data, if it available for a node:

* **triggerTagName** (the tag name of the element e.g. FORM)
* **triggerId** (the ID of the node)
* **triggerName** (the name attribute of the node)
* **triggerEvent** (the label of the event)

NOTE: Some of the auto generated event data can be overwritten with data attributes:

* **data-dlf-id** overwrite **triggerId**
* **data-dlf-name** overwrite **triggerName**

## Selectors

Here is the list of selectors the listeners work on:

* **Viewport Events:** "[id], [data-dlf-id], form, header, main, footer"
* **Click Events:** "button, a, input, [id], [data-dlf-id]"
* **Input Events:+* "input, select, textarea"
* **Form Events:** "form"
# DataLayer Foundation

**dl_foundation** is a small event listener, tracking basic web events like **clicks**, **views** and **inputs**.

It uses basic HTML markup and triggers, which does not require any template adjustments.

## Important DOM Nodes

Events are tracked for common HTML nodes like **header**, **main** and others (see full list below).
Also nodes with an **ID** will be observed. This means you need to have a well structured HTML
document, containing relevant tags as well as IDs on important elements like CTA buttons.

## Events Tracked

There are 3 main events tracked. Those are **view related events** like entering and leaving the viewport,
**clicking** on elements as well as **form interaction**.

Events are prefixed with a adjustable value. Default is "dlf.".

Therefor the following default events exist:

* **dlf.receivedInput** (called on any value change)
* **dlf.receivedSubmit** (called on valid form submit)
* **dlf.clicked** (called on a click)
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

## Selectors

Here is the list of selectors the listeners work on:

* **Viewport Events:** "[id], form, header, main, footer"
* **Click Events:** "button, a, input, [id]"
* **Form Events:** "form"
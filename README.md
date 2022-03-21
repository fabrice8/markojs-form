@MarkoJS Form Handler
==================================================

Form Component Handler Library for [MarkoJS]. This library simplify how to handle the flow within a [MarkoJS] form component by handling all input fields **events**, **auto-fill**, **auto-saving**, **auto-completition**, **validation** and the **form submission** by binding to the `this` of the component. Enough talking, let get to the facts.

[![npm version][npm-badge]][npm]
[![dependency status][dep-badge]][dep-status]
[![Rate on Openbase](https://badges.openbase.com/js/rating/markojs-form.svg)](https://openbase.com/js/markojs-form?utm_source=embedded&utm_medium=badge&utm_campaign=rate-badge)

[MarkoJS]: https://www.npmjs.org/package/markojs-form
[npm]: https://www.npmjs.org/package/markojs-form
[npm-badge]: https://img.shields.io/npm/v/markojs-form.svg?style=flat-square
[dep-status]: https://david-dm.org/fabrice8/markojs-form
[dep-badge]: https://img.shields.io/david/fabrice8/markojs-form.svg?style=flat-square


## Installation

Install using npm

```shell
$ npm install markojs-form
```
Install using yarn

```shell
$ yarn add markojs-form
```

## Usage

Create new instance of the FormHandler Object Class.

```javascript
const FormHandler = require('markojs-form');

// or 

import FormHandler from 'markojs-form';

static const options = {
    key: 'form-id',
    autosave: true,
    crosscheck: true
}

static const fhandler = new FormHandler( options );

// or inside a class method

class {
    onCreate(){
        // ...
        this.fhandler = new FormHandler( options )
    }
}
```

**Important**: Avoid using form-handler instance globally.

## Options

All options are optional

* **key**: `String` Same as the component tag key of the form being handled: Eg. `<form key="form-id">...</form>`
* **autosave**: `Boolean` Define whether to auto-save input values when the user is filling the form. Very useful especially in SPA case when the user manually or accidentally refresh the page, the inputs will stay filled with the saved values. Default `false`
* **crosscheck**: `Boolean` When submit form event is detected by **FormHandler**, it run a final validation cross-check through all inputs that require validation in the form before submitting it. Default: `false`


## Methods

### `bind(this, [formObject])`

Bind the form handler to the component. `formObject` is a object passed to the handler as the initial form fields & values: It's optional

```javascript

class {
    onCreate(){
        this.state = {
            // ...
        }

        fhandler.bind(this)
    }
}
```

When this is done, the handler add `form` & `formError` fields to the component state: Eg. `this.state.form`. Those contain respectively the form data and the error status of the form validation.

Also, couple of methods are automatically bind to the component's class, to listen and handle events that occured when interacting with the form.

- ``__onInput`` Method handler for input event
- ``__onChange`` Method handler for input change event
- ``__onSelect`` Method handler for select input change event
- ``__onChecked`` Method handler for checkbox and radio input events

All these methods assigned approprietly to the various form tags, empowers the **FormHandler** to collect and update the data and errors state of the form component.

**Example**

When filling the input form below, **FormHandler** automatically update `this.state.form.name` at every input & change events, allowing the component state to be updated.

```marko
<input type="text"
        name="name"
        value=state.form.name
        on-input("__onInput")
        on-change("__onChange")>
```

**Note**: You can still assign your own method listener to handle inputs yourself. All is up to you.


### `unbind(this)`

Unbind the form handler to the component.


### `set(name, value)`

Manually set a value to a form input.

```javascript
class {
    // ...
    onMount(){
        fhandler.set('fullname', 'John Dupont')
    }
}
```

### `fill(values)`

Beside `Set()` method which can only set one field at a time, `fill()` method get an object of multiple fields & values to add manually to the form.

```javascript
class {
    // ...
    onInput(){
        fhandler.fill({ status: 'healty', age: 79, gender: 'female' })
    }
}
```

### `error(name, [status])`

Manually define the status of error of a given input. `status` can be a simple boolean: `true` meaning there's an error and `false` to cancel error. `status` can also be a string text message describing the error: Very usefull to display dynamic error messages to the user.

```marko
class {
    // ...
    onSubmit(){
        fhandler.error('age', 'This field is required')
    }
    onDestry(){
        // Cancel the error
        fhandler.error('age', false)
    }
}

<div>
    <input type="number"
            name="age"
            value=state.form.age
            on-change("__onChange")>
    <!-- Dislay error message -->
    <if( state.formError.age )>
        <p>${state.formError.age || 'Your custom error'}</p>
    </if>
</div>
```

### `reset()`

Set the form back to its initial state. This method is automatilly call when the form get submited. It's also **recommanded** to call it when the form component `onDestroy` event occurs: Proper clean up

```javascript
class {
    onCreate(){
        const initialForm = { username: 'gremdol', email: 'my@email.com' }

        fhandler.bind(this, initialForm)
    }
    onDestroy(){
        // Reset the form.
        fhandler.reset()
    }
}
```

### `alert(message, status)`

Display general alert of the form component

```marko
class {
    onSubmit(){
        fhandler.alert('Unexpected Error Occured! Try again', 'warning')
    }
}

<FormAlert alert=state.alert/>
```

## Form Validation

**FormHandler** has couple of in-build validation rules that you can use.
- `required`: Specify that the input field is required
- `url`: Check whether the input value is a valid URL
- `domain`: Check whether the input value is a valid Domain/Hostname
- `email`: Check whether the input value is a valid email address
- `phone`: Check whether the input value is a valid phone number
- `fullname`: Check whether the input value is a valid user fullname
- `password`: check and return password by strengh
- `number`: Input value must be a valid number
- `boolean`: Input value must be True or False
- `array`: Check whether the input value is an Array: Usually set manually
- `object`: Check whether the input value is an Object: Usually set manually
- `lowercase`: Input value must be only a lowercase string
- `uppercase`: Input value must be onlye an uppercase string
- `length`: Specify the required length of the input value
- `minLength`: Specify the minimun length of the input value
- `maxLength`: Specify the maximum length of the input value


### `define(rule)`

Define your own custom validation rules or overwrite in-build rules. There are 2 ways to define a validation rules: 
statically using `static or $` or inside the component's class methods or right into the template:

**Examples**

```marko
class {
    onCreate(){
        fhandler.define([{ name: 'custom1', regexp: '/\.+/' }, { name: 'custom2', regexp: '/\w+/' }])
    }
}

<div>
    <!-- Use inbuild rules -->
    <input type="email"
            name="email"
            value=state.form.email
            validate="email"
            on-change("__onChange")>
            
    <!-- Use an already defined custom rules -->
    <input type="text"
            name="name"
            value=state.form.name
            validate="custom1"
            on-change("__onChange")>
            
    <!-- Define and assign custom rules right way -->
    <input type="text"
            name="orderId"
            value=state.form.orderId
            validate=fhandler.define([{ name: 'orderId', regexp: '/PT-(\b+{4,})-00/' }])
            on-change("__onChange")>
</div>
```

### `validate(rule, value)`

Manually validate a form field.

```javascript
class {
    // ... 

    onCustomHandler( value ){
        const isValid = fhandler.validate( 'email', value )

        // ...
    }
}
```


## Events

**FormHandler** instanciate [EventEmitter][] Object. Here a couple of events triggered by the form handler: 

* `bind`: When **FormHandler** get bind to the component
* `unbind`: When **FormHandler** get unbind to the component
* `input`: New form input
* `error`: When an error occured
* `fill`: When `fill()` method get called
* `autosave`: When new auto-save record occured
* `reset`: When form get reset

### `on(event, fn)`

Register an event listener

### `off(event, fn)`

Remove an event listener

### `removeListeners()`

Remove all event listeners


Voilà!


Feedback & Contribution
-------

You know the say: No one is whole alone! So, feedbacks and the smallest contributions you can think of are all welcome. Kindly report any encounted [Issues here][] and I'll be glad to work on it right away. Thank you.


License
-------

This software is free to use under the MIT license. See the [LICENSE file][] for license text and copyright information.


[LICENSE file]: https://github.com/fabrice8/markojs-form/blob/master/LICENSE
[Issues here]: https://github.com/fabrice8/markojs-form/issues
[EventEmitter]: https://www.npmjs.com/package/EventEmitter
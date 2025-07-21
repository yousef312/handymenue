# Eye.js
Fasten your production and unleash the power of `eye`, manipulate DOM elements with ease while keeping your code organized and well readable.

yeap that's me! [@yousef_neji](https://github.com/yousef312)

## How to?
Import first

```JavaScript
// commonjs
var eye = require('eye');

// ESM
import eye from "eye";
```

Selecting an element
```JavaScript
// div id="bar"
let bar = eye("div#bar");
// span class="list-item"
let listItem = eye("span.list-item");

// all elements with class ".fools"
let fools = eye(".fools",{ all: true });
fools.forEach(littleFool=>{
    littleFool.style.backgroundColor = "purple";
})
```

Creating elements
```JavaScript
let baron = eye("div",{ 
        text: "leave",
        parent: bar,
        class: "btn button_dark", // also accepts array for multiple class setting at once or string concatenation of them with spaces between
        data: { // setting dataset values
            index: 12,
            function: "exit"
        }
    },{ 
        backgroundColor: "red", 
        color: "white"
    })
```

Extra functionalities
```JavaScript
// the most amazing functionalities is that u can chain calls
baron
    .hide() // display: none
    .show(customStyle); // display: inline-block or custom style

baron
    .refer("name","yousef neji"), // more powerfull than dataset, using WeakMaps!
    .unrefer("name"); // deleting a key

baron.attr("contentEditable","true"); // manipulating atributes
baron.attr("style",false); // `false` will remove the attribute `style`
baron.data("index"); // setting or getting dataset values

baron.on("click",cb); // events handling
baron.click(cb); // triggering or handling events

baron.child(0); // getting child number 0

baron.refresh(); // special function that automate getting data from server and displaying it
```

## `~Models~`

 - **description**: models used to create elements similar to react components except easier to manager, you can create basic blueprint using `eye("model:youModelName", blueprint)`, later on, you use the returned constructor over and over when ever the need calls!
 - **how it works**:
   - include the "model:\_model_name\_".
   - define your `blueprint`:
     - a `blueprint` is an object containing nested objects that defines each component of your model,
     - a `blueprint` element is formed by 
     
        [`tagname`.`classname1`.`classname2`: `_index - default_value`], 

        where `_index`(must contain the `_`) represent a datacell to display data later, and `default_value` will be set if no data passed.
 - **Usuage**:
 ```javascript
 let failMessage = eye("model:FailMessage", {
    "div.head": {
        "div.title: _title - Big Fancy Title": {},
        "div.close": {}
    },
    "div.body": {
        "p.message: _message - no message": {},
        "div.details: _details - no details": {},
        "div.actions": {
            "button.ok: _ok - OK": {},
            "button.cancel: _cancel - Cancel": {}
        }
    }
})

// do ajax stuff
fetch()
.then()
.catch((e)=>{
    // create a new instance
    let error = failMessage({
        parent: document.body // append using parent attribute
        _title: "Backend error - " + e.name,
        _message: e.message,

        // try to avoid using this attribute unless 
        // you want to mess up with your model
        // text: "some text",
        // html: "some html",
    });
    // or append later 
    error.appendTo(document.body);
    // you may pre-create the error in earlier stage! before the fetch()
    // and refresh it content using .refresh function
    error.refresh({
        _title: "Backend error - " + e.name,
        _message: e.message
    })
    // refresh also accepts an attribute `default`(set true by default)
    // which adjut whether to update all datacells of the model
    // or only update the one passed through the function
    // EXAMPLE:
    error.refresh({
        _title: "Other Error - " + e.name
    })
    // this will update _title to the new value and also update 
    // the other datacells like `_message` `_details` ...
    // but since they're not passed they will display the default values
    // from the constructor up at the top!
    // `_message` => no message
    // `_details` => no details
    // ...
    // unless you passed (default: false)
    error.refresh({
        _title: "Other error - " + e.name,
        default: true
    })
    // in this case only _title will be changed!
})
 ```


## Copyrights
Reserved under MIT license

# Jmenu.js
Quick nice fancy menues for your little app!

yeap that's me! [@yousef_neji](https://github.com/yousef312)

## CHANGELOG

Check changelog for more informations
[check](/changelog)

## What does we offer?

- easy step to create, deploy and manipulate your contextmenu
- a lot of possiblity to design and manage your contextmenu the way you want
- an event system for more control
- official buttons types.

and soon(still working on)

- the menu direction: you can choose the direction of the menu for both english, arabic contextmenu.
- more default themes and more..

## Installation

```shell
npm install jmenu
```

## Usage

Our library uses css, we included a `style.css` file in the test folder, make sure to link it in your project!

```javascript
// load the library
const Jmenu = require("jmenu");
import Jmenu from "jmenu";

/*
 * Define your menu template
 */
var template = [
  {
    label: "File", //the button label(text to display over the button)
    func: function () {
      // a function to excute when clicking the button
      console.log("opening file explorer");
    },
    icon: "img/icon.png", // a path to an image to play it as a button icon
  },
  {
    label: "Big Icons",
    type: "check-box", // the type of button there is a bunch of types we will be dicussing later
    func: function (selected) {
      if (!selected) {
        var icons = document.getElementsByClassName(".icons");
        icons.style.width = "100px";
        icons.style.height = "100px";
      } else {
        //for check-box buttons there is two function to excute: one when check the button and an other function when uncheck the button
        var icons = document.getElementsByClassName(".icons");
        icons.style.width = "50px";
        icons.style.height = "50px";
      }
    },
  },
  {
    label: "exit",
    func: function () {
      window.close();
    },
  },
];
// some properties of your menu
var props = {
  id: "jmenu_", // set an id to the menu
  spacing: 30, // define spacing in fron and back of the buttons
  bars: 5, // define some space in top and bottom of menu
  target: menuLauncher, // a html element responsible for the popup of the menu, `window` object by default or a selector string
  action: "contextmenu", // the event responsible for the popup of the menu, `contextmenu` by default
  alignToTarget: true | "left" | "right", // you can fix the menu placement next to the target button
  alignToOffset: 2, // this will shift/offset the menu position with certain pixels, when using alignToTarget
  ....
  //....
};

// the creation
var menu = new Jmenu(template, props);

```

 - You can modify elements on the fly by

```javascript

// hide a button
menu.hideButton(index);

// show it back again
menu.showButton(index);

// enable button working
menu.enableButton(index);

// disable button working
menu.disableButton(index);

// modify button props
menu.setButtonProp(index, prop, value);
menu.setButtonProp(0, "label", "New Label");
menu.setButtonProp(0, "icon", "url(./img/icon1.png)");
menu.setButtonProp(0, "accelerator", "Ctrl+shift+c");
menu.setButtonProp(0, "value", 20); // for sliders
menu.setButtonProp(0, "definition", "..... new definition of dishwasher"); // for definitions

```

 - You can also listen to event by
```javascript

menu.on("open",function(ev){
  ev.which // the clicked element
  ev.menu // access the menu from here
})

menu.on("close", function(ev){
  // close event
})

// or trigger certain event 
menu.trigger("open");
```

### Buttons Types

**Except normal button we also offer a special buttons which are:**

<span style="color: orange">check-box</span>:

```javascript
 {
    label : ['Check','Uncheck'], // will be switched when checked
    type : 'check-box',
    func : function(checked){
      if(checked) console.log('choosen!');
      else console.log('not choosen!');
    },
    icon : 'img/checkIcon.png'// a path to an image to use as the checking icon
 }
```

Works the same as normal check-box elements, executing the `func` callback eachtime passing the state of the check-box, whether checked or not.

<span style="color:orange">radio-button</span>:

```javascript
 {
    label : 'Small Size',
    type : 'radio-button',
    name : 't-shirt',
    func : function(){
      console.log("you've selected small size t-shirt");
    },
    icon : 'img/radioIcon.png'// a path to an image to use as the radio icon
 },
 {

    label : 'Big Size',
    type : 'radio-button',
    name : 't-shirt',
    func : function(){
      console.log("you've selected big size t-shirt");
    },
    icon : 'img/radioIcon.png'// a path to an image to use as the radio icon
 }
```

Similar to html radio inputs, `name` is required!

<span style="color:orange">data-set</span>(futuristic!):

```javascript
 {
    label : 'enter your name',
    type : 'data-set',
    allowed : 'a',
    func : function(e){
      console.log(`your name is ${e.data}`);
    }
 }
```

Allows you to get user data, using a small input! the `allowed` attribute controls the type of data allowed(abvioulsy) as follow:

- 'a' : only accept characeters
- 1 : only accept numbers
- "\*" (default) : accept everything

<span style="color:orange">defintion</span>:

```javascript
{
  label : 'blender',
  type : 'definition',
  def : 'a blender is this machine that mix, and cut foods together'
}
```

Usefull for writing app, so you can hint user about some new words! their definitions.

<span  style="color:orange">submenu:</span>

```javascript
{
  label : 'Check for more',
  type : 'submenu',
  submenu : [
    {
      label : '...',
      func : function(){...}
    },
    {
      ..
    },..
  ]
}
```

Attach a submenu to the button.

<span style="color:orange">slider</span>:

```javascript
{
  label : 'volume',
  type : 'slider',
  range : [0,100],
  step : 2,
  default : 100,
  format : '_value_%'
}
```

Sliders are useful for quick changing values like volume, zoom, grid cells. Displays a counter with increase and decrease buttons on the button

- range : the range in which that slider slip between [min,max]
- step : decrease/increase by ..
- default : the default value of the slider
- format : a string used to format the displayed Slider result

<span style="color:orange">art-show</span>(futuristic):

```javascript
{
  label : 'Check image'
  type : 'art-show',
  src : 'img/sourceOfTheImage.png' //the source of the image to show
}
```

Art show is small preview for an image on the fly!

- src : the source of the image to display

<span style="color: orange">separator</span>:

```javascript
 {
    type : 'separator',
    label : ['Check','Uncheck'], // optionally add some text under
 }
```

Separate the menu by a line, can optional include some text to define section like display!

### Other properties

- accelerator : a combination of keys that once performed the button `func` execute. Uses qway.js library.
- icon : displays an icon on the button.

## License

[MIT](https://choosealicense.com/licenses/mit/)

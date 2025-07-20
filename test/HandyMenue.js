import qway from "./qway/";
import eye from "eyeejs";

// will be set to empty functions
const hmNoop = () => { };
let btnsCounter = 0;
// preparing the Qway functionalities

const templates = {
  separator: eye("model:separator", {
    "span: _label": {},
  }),
  normal: eye("model:handyMenuItem", {
    div: {},
    div: {
      "div: _label": {},
      "div: _accelerator": {},
    },
    div: {},
  }),
};

class JButton {

  #state = true;

  /**
   * @param {Jmenu} menu 
   * @param {buttonDef} btnDef 
   */
  constructor(menu, btnDef) {

    /**
     * Reference to the menu holding this button
     * @type {Jmenu}
     */
    this.menu = menu;

    /**
     * Actual button element
     * @type {import("eyeejs").EyeElement}
     */
    this.button = null;

    /**
     * Button's label or displayed text
     * @type {string}
     */
    this.label = btnDef.label || `New Button ${++btnsCounter}`;

    /**
     * Callback to be executed when buttons is clicked
     * @type {function}
     */
    this.func = btnDef.func;

    /**
     * Buttons type
     * @type {"button" | "separator" | "check-box" | "radio-button" | "slider" | "submenu" | "definition"}
     */
    this.type = btnDef.type;

    /**
     * Optional icon source to display on the button
     * @type {string}
     */
    this.icon = btnDef.icon;

    /**
     * Accelerator is a shortcut to execute the button function
     * @type {string}
     */
    this.accelerator = btnDef.accelerator || null;

    /**
     * Holds the entire definition of this button
     * @type {buttonDef}
     */
    this.properties = btnDef;

    this.#create();
  }


  #create() {
    // getting some variables
    const spacing = this.menu.props.spacing;
    let _this = this;

    if (this.type == "separator") {
      // creating a separator button
      this.button = templates.separator({
        parent: this.menu.elm,
        _label: this.label,
      });
    } else {
      // creating other type of buttons
      let btn = this.button = templates.normal({
        parent: this.menu.elm,
        _label: this.label,
        _accelerator: this.accelerator,
      })

      // we will be using this parts later
      head = btn.child(0);
      body = btn.child(1);
      tail = btn.child(2);

      // buttons have some spacing in front 
      let fSpace = Array.isArray(spacing) ? spacing[0] : spacing,
        lSpace = Array.isArray(spacing) ? spacing[1] : spacing;

      // applying some style
      head
        .css("width", `${fSpace}px`)
        .css("backgroundImage", icon ? `url(${icon})` : "");
      tail.css("width", `${lSpace}px`);

      let bodyLabel = body.child(0);
      let bodyAccel = body.child(1);
      let submenuElm = null;

      // preparing some variables
      // those calls will be attached 
      // if needed
      let onclick = null,
        onmouseenter = null,
        onmouseleave = null,
        onwheel = null;
      // depending on the type
      switch (this.type) {
        case "button":
          ///////////////////////////////////// BUTTON
          // onclick => execute callback
          onclick = function (e) {
            if (!(func(_this, e) === false))
              _this.menu.close();
          }
          break;
        case "check-box":
          ///////////////////////////////////// CHECKBOX
          label = Array.isArray(this.label) ? this.label : [this.label, this.label];
          bodyLabel.text(label[0]);
          checkBoxMark = eye("div", { class: "handy-check-box-mark" });

          // defining a variable
          this.selected = false;

          onclick = function () {
            // toggling check box
            if (_this.selected === true) {
              _this.selected = false;
              checkBoxMark.remove();
              body.child(0).text(label[0]);
            } else {
              _this.selected = true;
              head.append(checkBoxMark);
              body.child(0).text(label[1]);
            }
            if (!(_this.func(_this.selected, _this) === false))
              _this.menu.close();
          }
          break;
        case "radio-button":
          ///////////////////////////////////// RADIOBUTTON
          if (!this.properties.name)
            throw new Error(
              "HandyeMenue Error:\n Radio boxes buttons definition must contain name attribute!"
            );
          if (!this.menu.radios[this.properties.name]) {
            this.menu.radios[this.properties.name] = {
              ball: eye("div", { class: "handy-radio-button-mark" }),
            };
            head.append(this.menu.radios[this.properties.name].ball);
          }

          if (this.properties.default === true) head.append(this.menu.radios[this.properties.name].ball);
          onclick = function () {
            let call = _this.radios[_this.properties.name];
            if (call.ball) head.append(call.ball);
            if (!(_this.func(_this.label, _this) === false))
              _this.menu.close();
          }
          break;
        case "definition":
          ///////////////////////////////////// DEFINITION
          let defBloc = eye("<div>", {
            class: "handy-definition-box",
            parent: document.body,
            html: this.properties.def,
          }, { display: "none" });

          bodyAccel.text("definition");

          // mousenter => show definition
          mouseenter = function () {
            let b = this.getBoundingClientRect();
            let x = b.left + b.width + 5,
              y = b.top;
            if (window.innerWidth - (b.left + b.width) < 200) x = b.left - 205;

            defBloc
              .css("left", `${x}px`)
              .css("top", `${y}px`)
              .css("display", "inline-block");
          };

          // mouseleave => hide definition
          mouseleave = () => defBloc.css("display", "none");


          break;
        case "slider":
          ///////////////////////////////////// SLIDER
          btn.class("+handy-slider");
          bodyAccel.class("+handy-slider-btns");
          let decrease = eye("div", {
            class: "handy-slider-btn",
            parent: bodyAccel,
          });
          let show = eye("div", {
            class: "handy-slider-show",
            parent: bodyAccel,
          });
          let increase = eye("div", {
            class: "handy-slider-btn",
            parent: bodyAccel,
          });

          // the plus and minus icons
          let minus = eye("div", { class: "handy-minus", parent: decrease });
          let incrs = eye("div", { class: "handy-plus1", parent: increase });
          let decrs = eye("div", { class: "handy-plus2", parent: increase });

          show.data("value", this.properties.default || this.properties.range[0]);
          show.text(this.properties.format.replace("_value_", show.data("value")));

          // actual work
          decrease.click(function () {
            if(!_this.#state) return;
            show.data("value", Math.max(show.data("value") - step, this.properties.range[0]));
            show.text(this.properties.format.replace("_value_", show.data("value")));
            _this.func(show.data("value"), _this);
          });
          increase.click(function () {
            if(!_this.#state) return;
            show.data("value", Math.min(show.data("value") + step, this.properties.range[1]));
            show.text(this.properties.format.replace("_value_", show.data("value")));
            _this.func(show.data("value"), _this);
          });

          // can control with wheel?
          if (this.properties.wheel === true)
            onwheel = function (e) {
              e.preventDefault();
              if (e.deltaY >= 0) decrease.click();
              else increase.click();
            }
          break;
        case "submenu":
          ///////////////////////////////////// SUBMENU
          bodyAccel.class("+handy-menu-item-arrow");
          submenuElm = handy(this.properties.submenu, {
            action: "none", // pass anything so no event is assigned
            parent: this,
            stickto: btn,
          });
          this.submenus.push(submenuElm);

          // mouseenter => open submenu
          onmouseenter = function () {
            this.tm = setTimeout(function () {
              let p = tail.getBoundingClientRect();
              // lock current menu
              submenuElm.popup({ x: p.left + p.width - 3, y: p.top });
            }, 500);
          }

          // mouseleave => stop timer
          onmouseleave = function () {
            if (this.tm) clearTimeout(this.tm);
          };
          break;
      }

      // attaching events
      if (typeof onclick == "function") btn.click((e) => { if (_this.#state) onclick(e) });
      if (typeof onmouseenter == "function") btn.mouseenter(onmouseenter);
      if (typeof onmouseleave == "function") btn.mouseleave(onmouseleave);
      if (typeof onwheel == "function") btn.on("wheel", onwheel);

      // general events
      btn.mouseenter(function () {
        // closing any opened tree
        for (let i = 0; i < _this.menu.submenus.length; i++) {
          _this.menu.submenus[i].close();
        }
      })

    }
  }


  /**
   * Enable button
   */
  enable() {
    this.#state = true;

    this.button.removeAttribute("style");
  }

  /**
   * Disable button
   */
  disable() {
    this.#state = false;
    this.button.css("background-color", "transparent")
      .css("color", "gray")
      .css("pointer-action", "none")
      .css("cursor", "default");
  }

}

/**
 * @typedef {Object} buttonDef
 * @property {string} label text to be displayed on the button
 * @property {string} type possible types `button`(def) `separator` `radio` `check` `img` `input`
 * @property {(buttonDef)=>} func callback to be executed when button clicked
 * @property {string} name obliged for radio element, to maintain the relation between
 * @property {string} allowed specify the allowed values within a dataset button
 * @property {string} def definition text of a `definition` button
 * @property {string} accelerator command or combo that perform the same task as the button `ctrl+v` `ctrl+shift+h`...
 * @property {Array<number,number>} range Defines a `slider` value range [5,150], [80,120], [0,50]..
 * @property {number} step the value used when stepping a `slider`, for each click the value increase or decrease by `step`
 * @property {string} format a way to display the value on button, a string that must contain _value_ that will be replaced by the actual value
 * @property {boolean} wheel whether or not to include wheel action for `slider`s
 * @property {string} src the source of a `img-preview` button
 * @property {boolean} default set as radio element default value
 * @property {Array<buttonDef>} submenu a submenu element for that button
 * @property {boolean} disabled whether or not button is disabled by default
 * @property {string} icon optionally set an icon for the button
 */

/**
 * @typedef {Object} menuProperties
 * @property {HTMLElement} target the target element that supposed to launch the menu
 * @property {string} action the action that will trigger menu appearance
 * @property {number|Array<number>} bars makes some spaces inside the menu in top and bottom
 * @property {string} id possible ID to set the menu
 * @property {number|Array<number>} spacing defines the buttons spacing, indenting and revindenting
 * @property {Object} stickto Optionally set menu to appear next to an element `stickto.elm` or `stickto` directly
 * @property {HTMLElement} stickto.elm the element to stick to
 * @property {string} stickto.pos possibly takes `after` `before` `under` `above`
 * @property {number} stickto.closerBy offsetting the menu closer to the stickto.elm by certain value
 */

let namelssCounter = 0;

/**
 * Creates and handle context menu with ease
 * @author Yousef Neji
 * @param {Array<buttonDef>} def
 */
function Jmenu(def) {
  /**
   * Defintion object
   * @type {Array<buttonDef>}
   */
  this.def = def;

  /**
   * Properties of the menu
   * @type {menuProperties}
   */
  this.props = {};

  /**
   * Flag determines whether menu is opened or not
   * @type {boolean}
   */
  this.on = false;

  /**
   * Actual html menu element
   * @type {HTMLDivElement}
   */
  this.elm = null;

  /**
   * Target is the element that supposed to launch/popup the menu
   * @type {HTMLElement}
   */
  this.target = window;

  /**
   * Reference to the radio elements used
   */
  this.radios = {};

  /**
   * Reference to the submenus elements used
   * @type {Array<Jmenu>}
   */
  this.submenus = [];

  /**
   * Values auto detected to configure the menu, please don't modify it otherwise menu we appear as expected
   */
  this.computed = {
    menuHeight: 0,
    menuWidth: 0,
    parent: null,
  };

  /**
   * Used to prevent user interactions while menu opened
   * @type {import("eyeejs").EyeElement}
   */
  this.untouchable = null;
}

Jmenu.prototype = {
  /**
   * Initiation phase
   * @param {menuProperties} props
   */
  init: function (props) {
    if (!props) props = {};
    let {
      target = window,
      action = "contextmenu",
      bars = 5,
      spacing = 30,
      parent = null,
      stickto = null,
    } = props,
      _this = this;

    this.target = target ?? window;
    this.computed.parent = parent;
    this.props = {
      target,
      action,
      bars,
      spacing,
      stickto,
    };

    if (parent) this.untouchable = parent.untouchable;
    else {
      this.untouchable = eye("div", {
        class: "handy-untouchable",
        parent: document.body,
      });
      this.untouchable.mousedown(function () {
        _this.close();
      });
    }

    this.create();
    this.bindEvents();
    this.compute();
  },
  /**
   * Bind different events
   */
  bindEvents: function () {
    let actions = (this.props.action ?? "contextmenu").split(" ");
    let _this = this;

    actions.forEach((action) => {
      _this.target.addEventListener(action, function (e) {
        e.preventDefault();
        _this.popup({ x: e.clientX, y: e.clientY });
      });
    });
  },
  /**
   * Create the menu
   */
  create: function () {
    let elm = eye("div", {
      class: ["handy-menu", "unselect"],
      parent: document.body,
    }),
      _this = this;
    this.elm = elm;

    // include some bar spacings
    let topBar = 0,
      botBar = 0;
    if (typeof this.props.bars == "number") topBar = botBar = this.props.bars;
    else if (Array.isArray(this.props.bars)) {
      topBar = this.props.bars[0];
      botBar = this.props.bars[1];
    }
    elm.css("padding-top", topBar + "px");
    elm.css("padding-bottom", botBar + "px");

    // hide by default
    this.elm.css("display", "none");

    // creating buttons
    this.def.forEach((button) => {
      _this.addButton(button);
    });
  },
  /**
   * Add new button to the menu
   * @param {buttonDef} button
   */
  addButton: function (button) {
    let btn = new JButton(this, button);
    // let type = (button.type = button.type ?? "button"),
    //   label = (button.label = button.label ?? ""),
    //   func = (button.func = button.func ?? hmNoop),
    //   accelerator = (button.accelerator = button.accelerator ?? ""),
    //   name = (button.name = button.name ?? ""),
    //   deflt = (button.default = button.default ?? null),
    //   submenu = (button.submenu = button.submenu ?? null),
    //   range = (button.range = button.range ?? [0, 100]),
    //   step = (button.step = button.step ?? 1),
    //   format = (button.format = button.format ?? "_value_"),
    //   icon = (button.icon = button.icon ?? null),
    //   disabled = (button.disabled = button.disabled ?? false),
    //   definition = (button.def = button.def ?? ""),
    //   _this = this,
    //   spacing = this.props.spacing,
    //   wheel = this.props.wheel ?? true,
    //   head = null,
    //   body = null,
    //   tail = null,
    //   checkBoxMark = null,
    //   elm = null;

    // // attaching some accelerators
    // if (accelerator)
    //   qway.bind(accelerator, function () {
    //     elm.click();
    //   });

    // if (type === "separator") {
    //   // separators have special designs
    //   templates.separator({
    //     parent: this.elm,
    //     _label: label,
    //   });
    // } else {
    //   elm = templates.normal({
    //     parent: this.elm,
    //     _label: label,
    //     _accelerator: accelerator,
    //   });
    //   elm.data("definition", button);
    //   // for other buttons they are generally made of some parts
    //   let fSpace = Array.isArray(spacing) ? spacing[0] : spacing,
    //     lSpace = Array.isArray(spacing) ? spacing[1] : spacing;

    //   head = elm.child(0);
    //   body = elm.child(1);
    //   tail = elm.child(2);

    //   // applying some style
    //   head
    //     .css("width", `${fSpace}px`)
    //     .css("backgroundImage", icon ? `url(${icon})` : "");
    //   tail.css("width", `${lSpace}px`);

    //   let bodyLabel = body.child(0);
    //   let bodyAccel = body.child(1);
    //   let submenuElm = null;

    //   // special button configurations

    //   /////////////////// sub menu configurations

    //   if (disabled === true) {
    //     elm.css("background-color", "transparent");
    //     elm.css("color", "gray");
    //     elm.css("pointer-action", "none");
    //     elm.css("cursor", "default");
    //   }
    // }

  },
  /**
   *
   * @param {Object} pos the position in which to popup in
   * @param {number} pos.x x coordination
   * @param {number} pos.y y coordination
   */
  popup: function (pos) {
    let { x, y } = pos;
    let stickto = this.props.stickto;

    if (
      stickto != null &&
      (stickto instanceof HTMLElement || stickto.elm instanceof HTMLElement)
    ) {
      // perform stick display
      let { pos = "after", closerBy = 2 } = stickto;
      let box = (
        stickto instanceof HTMLElement ? stickto : stickto.elm
      ).getBoundingClientRect();

      // some adjustments
      if (
        pos === "after" &&
        box.left + box.width + this.computed.menuWidth > window.innerWidth
      )
        pos = "before";

      // apply position
      if (pos === "after") {
        x = box.left + box.width + 2 - closerBy;
        y = box.top;
      } else if (pos === "before") {
        x = box.left - this.computed.menuWidth - 2 + closerBy;
        y = box.top;
      } else if (pos == "under") {
        x = box.left;
        y = box.top;
      }
    } else {
      // if no stick option then perform normal position calculations
      if (y + this.computed.menuHeight > window.innerHeight - 20)
        y = window.innerHeight - (20 + this.computed.menuHeight);

      if (x + this.computed.menuWidth > window.innerWidth - 20)
        x = window.innerWidth - (20 + this.computed.menuWidth);
    }

    // finally apply style
    this.elm.css("left", x + "px");
    this.elm.css("top", y + "px");
    this.elm.css("position", "fixed");
    this.elm.css("display", "inline-block");
    this.untouchable.show("inline-block");
  },
  /**
   * Close the menu
   * @param {boolean} closeAllMenu
   * @returns
   */
  close: function (closeAllMenu) {
    if (closeAllMenu && this.computed.parent)
      return this.computed.parent.close(true); // this will start closing the total menu

    if (this.submenus.length != 0) {
      this.submenus.forEach((submenu) => submenu.close());
    }
    this.elm.css("display", "none");
    if (!this.computed.parent) this.untouchable.hide();
  },
  /**
   * Perform some computation tasks registering some values
   * @method HandyeMenue#compute
   */
  compute: function () {
    // perform some need calculations

    // away from the screen
    this.elm.css("left", -9999);
    this.elm.css("position", "fixed");
    this.elm.css("display", "inline-block");

    let declaration = this.elm.getBoundingClientRect();
    this.computed.menuHeight = declaration.height;
    this.computed.menuWidth = declaration.width;

    this.elm.css("display", "none");
  },
  /**
   * Hide the button at the give index
   * @param {number} index
   */
  hideButton: function (index) {
    if (this.elm.child(index)) this.elm.child(index).hide();
  },
  /**
   * Show the button at the give index
   * @param {number} index
   */
  showButton: function (index) {
    if (this.elm.child(index)) this.elm.child(index).show();
  },
  /**
   * Toggle button activation
   * @param {number} index
   * @param {boolean} force
   */
  toggleButton: function (index, force) {
    if (this.elm.child(index)) {
      let button = this.elm.child(index);
      if (typeof force != "boolean") {
        force = !(button.data("definition").disabled == true);
      }

      if (force === true) {
        button.data("definition").disabled = true;
        button.css("background-color", "transparent");
        button.css("color", "gray");
        button.css("pointer-action", "none");
        button.css("cursor", "default");
      } else {
        button.data("definition").disabled = false;
        button.removeAttribute("style");
      }
    }
  },
};

/**
 * Create a new context menu
 * @param {Array<buttonDef>} def
 * @param {menuProperties} props
 * @returns {Jmenu}
 */
function handy(def, props) {
  if (!def) throw new Error("Menu definiton must be provided!");
  let menu = new Jmenu(def);
  menu.init(props);

  return menu;
}

// the css file must be included
console.warn(
  "Don't forget to link the css file bundled with the library to get full functional menus!"
);

export default handy;

import Qway from "qway";
import eye from "eyeejs";

// will be set to empty functions
const hmNoop = () => {};
// preparing the Qway functionalities
let keys = new Qway();

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
function HandyMenue(def) {
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
   * @type {Array<HandyMenue>}
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

HandyMenue.prototype = {
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
    let type = (button.type = button.type ?? "button"),
      label = (button.label = button.label ?? ""),
      func = (button.func = button.func ?? hmNoop),
      accelerator = (button.accelerator = button.accelerator ?? ""),
      name = (button.name = button.name ?? ""),
      deflt = (button.default = button.default ?? null),
      submenu = (button.submenu = button.submenu ?? null),
      range = (button.range = button.range ?? [0, 100]),
      step = (button.step = button.step ?? 1),
      format = (button.format = button.format ?? "_value_"),
      icon = (button.icon = button.icon ?? null),
      disabled = (button.disabled = button.disabled ?? false),
      definition = (button.def = button.def ?? ""),

      _this = this,
      spacing = this.props.spacing,
      wheel = this.props.wheel ?? true,
      head = null,
      body = null,
      tail = null,
      checkBoxMark = null;
    let elm = eye("div", { class: "handy-menu-item", parent: this.elm });
    elm.refer("definition", button);

    // attaching some accelerators
    if (accelerator)
      keys.bind(accelerator, function () {
        elm.click();
      });

    if (type === "separator") {
      // separators have special designs
      elm.class("+separator");
      elm.text(label);
    } else {
      // for other buttons they are generally made of some parts
      let fSpace = Array.isArray(spacing) ? spacing[0] : spacing,
        lSpace = Array.isArray(spacing) ? spacing[1] : spacing;

      head = eye(
        "div",
        { parent: elm },
        { width: `${fSpace}px`, backgroundImage: icon ? `url(${icon})` : "" }
      );
      body = eye("div", { parent: elm });
      tail = eye("div", { parent: elm }, { width: `${lSpace}px` });

      let bodyLabel = eye("div", { parent: body, text: label });
      let bodyAccel = eye("div", { parent: body, text: accelerator });
      let submenuElm = null;

      // special button configurations

      /////////////////// sub menu configurations
      if (type === "submenu") {
        bodyAccel.class("+handy-menu-item-arrow");
        submenuElm = handy(submenu, {
          action: "none", // pass anything so no event is assigned
          parent: this,
          stickto: elm,
        });
        this.submenus.push(submenuElm);

        elm.mouseleave(function () {
          if (this.tm) clearTimeout(this.tm);
        });
      }

      elm.mouseenter(function () {
        // closing any opened tree
        for (let i = 0; i < _this.submenus.length; i++) {
          _this.submenus[i].close();
        }
        if (type === "submenu") {
          this.tm = setTimeout(function () {
            let p = tail.getBoundingClientRect();
            // lock current menu
            submenuElm.popup({ x: p.left + p.width - 3, y: p.top });
          }, 500);
        }
      });

      /////////////////// CHECK-BOX configurations
      if (type === "check-box") {
        label = Array.isArray(label) ? label : [label, label];
        bodyLabel.text(label[0]);
        checkBoxMark = eye("div", { class: "handy-check-box-mark" });
      }

      /////////////////// RADIO-BUTTON configurations
      if (type === "radio-button") {
        if (!name)
          throw new Error(
            "HandyeMenue Error:\n Radio boxes buttons definition must contain name attribute!"
          );
        if (!this.radios[name]) {
          this.radios[name] = {
            ball: eye("div", { class: "handy-radio-button-mark" }),
          };
          head.append(this.radios[name].ball);
        }

        if (deflt === true) head.append(this.radios[name].ball);
      }

      /////////////////// DEFINITION configurations
      if (type === "definition") {
        let defBloc = eye(
          "div",
          { class: "handy-definition-box", parent: document.body, html: definition },
          { display: "none" }
        );
        bodyAccel.text("definition");
        elm.mouseenter(function () {
          let b = this.getBoundingClientRect();
          let x = b.left + b.width + 5,
            y = b.top;
          if (window.innerWidth - (b.left + b.width) < 200) x = b.left - 205;

          defBloc
            .css("left", `${x}px`)
            .css("top", `${y}px`)
            .css("display", "inline-block");
        });
        elm.mouseleave(function () {
          defBloc.css("display", "none");
        });
      }

      if (disabled === true) {
        elm.css("background-color", "transparent");
        elm.css("color", "gray");
        elm.css("pointer-action", "none");
        elm.css("cursor", "default");
      }

      if (type === "slider") {
        // creating the slider UI
        elm.class("+handy-slider");
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

        show.refer("value", deflt || range[0]);
        show.text(format.replace("_value_", show.refer("value")));

        // actual work
        decrease.click(function () {
          show.refer("value", Math.max(show.refer("value") - step, range[0]));
          show.text(format.replace("_value_", show.refer("value")));
          func(show.refer("value"), button, elm);
        });
        increase.click(function () {
          show.refer("value", Math.min(show.refer("value") + step, range[1]));
          show.text(format.replace("_value_", show.refer("value")));
          func(show.refer("value"), button, elm);
        });

        if (wheel === true) {
          elm.on("wheel", function (e) {
            e.preventDefault();
            if (e.deltaY >= 0) decrease.click();
            else increase.click();
          });
        }
      }
    }

    if (type === "submenu") {
      // creating a whole new menu
    } else {
      elm.click(function (e) {
        let close = true;

        let { type, disabled } = this.refer("definition");

        if (disabled === true || ["slider", "separator"].indexOf(type) != -1)
          return;
        if (type == "button") close = func(elm, button, e);
        else if (type == "check-box") {
          // toggling check box
          if (this.selected === true) {
            this.selected = false;
            checkBoxMark.remove();
            body.child(0).text(label[0]);
          } else {
            this.selected = true;
            head.append(checkBoxMark);
            body.child(0).text(label[1]);
          }
          close = func(this.selected, elm, button);
        } else if (type == "radio-button") {
          let call = _this.radios[name];
          if (call.ball) head.append(call.ball);
          close = func(label, elm, button);
        }
        if (!(close === false)) _this.close(true);
      });
    }
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
        force = !(button.refer("definition").disabled == true);
      }

      if (force === true) {
        button.refer("definition").disabled = true;
        button.css("background-color", "transparent");
        button.css("color", "gray");
        button.css("pointer-action", "none");
        button.css("cursor", "default");
      } else {
        button.refer("definition").disabled = false;
        button.removeAttribute("style");
      }
    }
  },
};

/**
 * Create a new context menu
 * @param {Array<buttonDef>} def
 * @param {menuProperties} props
 * @returns {HandyMenue}
 */
function handy(def, props) {
  if (!def) throw new Error("Menu definiton must be provided!");
  let menu = new HandyMenue(def);
  menu.init(props);

  return menu;
}

// the css file must be included
console.warn(
  "Don't forget to link the css file bundled with the library to get full functional menus!"
);

export default handy;

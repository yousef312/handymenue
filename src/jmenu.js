import eye from "eyeejs";

// will be set to empty functions
const hmNoop = () => { };
let btnsCounter = 0;
// preparing the Qway functionalities

const templates = {
  separator: eye("model:jmenu-menu-item separator", {
    "<span>: _label": {},
  }),
  normal: eye("model:jmenu-menu-item", {
    "<div>.p1": {},
    "<div>.p2": {
      "<div>: _label": {},
      "<div>: _accelerator": {},
    },
    "<div>.p3": {},
  }),
};

class JmenuEvent extends CustomEvent {

  #menu = null;
  #which = null;

  /**
   * @param {"open" | "close"} type 
   * @param {Jmenu} menu 
   * @param {HTMLElement} target 
   */
  constructor(type, menu, target) {
    super(type, {
      bubbles: false,
      cancelable: false,
    });

    this.#menu = menu;
    this.#which = target;
  }

  get menu() {
    return this.#menu;
  }

  get which() {
    return this.#which;
  }
}

/**
 * Single button object to be used inside the Jmenu
 */
class JButton {

  #state = true;
  value = null;

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
    this.func = btnDef.func || hmNoop;

    /**
     * Buttons type
     * @type {"button" | "separator" | "check-box" | "radio-button" | "slider" | "submenu" | "definition"}
     */
    this.type = btnDef.type || "button";

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

    /**
     * Holds custom buttons and elements that differ between buttons types
     */
    this.runtime = {}

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
      let head = btn.child(0);
      let body = btn.child(1);
      let tail = btn.child(2);

      // buttons have some spacing in front 
      let fSpace = Array.isArray(spacing) ? spacing[0] : spacing,
        lSpace = Array.isArray(spacing) ? spacing[1] : spacing;

      // applying some style
      head
        .css("width", `${fSpace}px`)
        .css("backgroundImage", this.icon ? `url(${this.icon})` : "");
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
            if (!(_this.func(_this, e) === false))
              _this.menu.close(true);
          }
          break;
        case "check-box":
          ///////////////////////////////////// CHECKBOX
          let label = Array.isArray(this.label) ? this.label : [this.label, this.label];
          bodyLabel.text(label[0]);
          let checkBoxMark = eye("<div>", { class: "jmenu-check-box-mark" });
          this.runtime["checkBoxMark"] = checkBoxMark;

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
              "[JmenuJS] Error:\n Radio boxes buttons definition must contain name attribute!"
            );
          if (!this.menu.radios[this.properties.name]) {
            this.menu.radios[this.properties.name] = {
              ball: eye("<div>", { class: "jmenu-radio-button-mark" }),
            };
            head.append(this.menu.radios[this.properties.name].ball);
          }

          if (this.properties.default === true) head.append(this.menu.radios[this.properties.name].ball);
          onclick = function () {
            let call = _this.menu.radios[_this.properties.name];
            if (call.ball) head.append(call.ball);
            if (!(_this.func(_this.label, _this) === false))
              _this.menu.close();
          }
          break;
        case "definition":
          ///////////////////////////////////// DEFINITION
          let defBloc = eye("<div>", {
            class: "jmenu-definition-box",
            parent: document.body,
            html: this.properties.def,
          }, { display: "none" });
          this.runtime["defBloc"] = defBloc;

          bodyAccel.text("definition");

          // mousenter => show definition
          onmouseenter = function () {
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
          onmouseleave = () => defBloc.css("display", "none");


          break;
        case "slider":
          ///////////////////////////////////// SLIDER
          let format = this.properties.format = this.properties.format || "_value_";
          let step = this.properties.step = this.properties.step || 1;
          let range = this.properties.range = this.properties.range || [0, 100];
          btn.class("+jmenu-slider");
          bodyAccel.class("+jmenu-slider-btns");
          let decrease = eye("<div>", {
            class: "jmenu-slider-btn",
          });
          bodyAccel.append(decrease)
          let show = eye("<div>", {
            class: "jmenu-slider-show",
          });
          bodyAccel.append(show)
          let increase = eye("<div>", {
            class: "jmenu-slider-btn",
          });
          bodyAccel.append(increase)

          // the plus and minus icons
          let minus = eye("<div>", { class: "jmenu-minus", parent: decrease });
          let incrs = eye("<div>", { class: "jmenu-plus1", parent: increase });
          let decrs = eye("<div>", { class: "jmenu-plus2", parent: increase });

          this.value = this.properties.default || range[0];
          show.text(format.replace("_value_", this.value));

          // actual work
          decrease.click(function () {
            if (!_this.#state) return;
            _this.value = Math.max(_this.value - step, range[0]);
            show.text(format.replace("_value_", _this.value));
            _this.func(_this.value, _this);
          });
          increase.click(function () {
            if (!_this.#state) return;
            _this.value = Math.min(_this.value + step, range[1]);
            show.text(format.replace("_value_", _this.value));
            _this.func(_this.value, _this);
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
          bodyAccel.class("+jmenu-menu-item-arrow");
          submenuElm = new Jmenu(this.properties.submenu, {
            action: "none", // pass anything so no event is assigned
            parent: this.menu,
            alignToTarget: "left",
            alignToOffset: 2,
          });
          this.menu.submenus.push(submenuElm);

          // mouseenter => open submenu
          onmouseenter = function () {
            this.tm = setTimeout(function () {
              let p = tail.compute();
              // lock current menu
              submenuElm.popup({ x: p.left + p.width - 3, y: p.top }, btn.raw);
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


      if (this.properties.disabled) this.disable();
    }
  }

  /**
   * Set/Get the value of a slider button, respecting range property.
   * @param {number} v
   */
  setValue(v) {
    if (this.type == "slider" && typeof v == "number") {
      this.value = v < this.properties.range[0] ? this.properties.range[0] : v > this.properties.range[1] ? this.properties.range[1] : v;
      this.button.child(1).child(1).child(1).text(this.properties.format.replace("_value_", this.value))
    }
  }

  /**
   * Enable button
   */
  enable() {
    this.#state = true;

    this.button.attr("style", false);
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
 * @property {boolean | "left" | "right"} alignToTarget align menu with the target
 * @property {number} alignToOffset offset alignment by specific value
 * 
 * 
 */

/**
 * Creates and handle context menu with ease
 * @author Yousef Neji
 */
class Jmenu {

  /**
   * Defintion object
   * @type {Array<buttonDef>}
   */
  def = null;

  /**
   * Properties of the menu
   * @type {menuProperties}
   */
  props = {};

  /**
   * Actual html menu element
   * @type {HTMLDivElement}
   */
  elm = null;

  /**
   * Target is the element that supposed to launch/popup the menu
   * @type {HTMLElement}
   */
  target = window;

  /**
   * List of buttons forming this menu
   * @type {Array<JButton>}
   */
  #buttons = [];

  /**
   * Current target that poped up this menu
   * @type {HTMLElement}
   */
  #currentTarget = null;

  /**
   * Reference to the radio elements used
   */
  radios = {};

  /**
   * Reference to the submenus elements used
   * @type {Array<Jmenu>}
   */
  submenus = [];

  /**
   * Values auto detected to configure the menu, please don't modify it otherwise menu we appear as expected
   */
  computed = {
    menuHeight: 0,
    menuWidth: 0,
    parent: null,
  };

  /**
   * Used to prevent user interactions while menu opened
   * @type {import("eyeejs").EyeElement}
   */
  untouchable = null;


  #events = {};

  /**
   * @param {Array<buttonDef>} def
   * @param {menuProperties} props
   */
  constructor(def, props) {

    this.def = def;

    if (!props) props = {};
    let {
      target = window,
      action = "contextmenu",
      bars = 5,
      spacing = 30,
      parent = null,
      alignToTarget = null,
      alignToOffset = 0,
    } = props,
      _this = this;

    this.target = target ?? window;
    this.computed.parent = parent;
    this.props = {
      target,
      action,
      bars,
      spacing,
      alignToTarget,
      alignToOffset,
    };

    if (parent) this.untouchable = parent.untouchable;
    else {
      this.untouchable = eye("<div>", {
        class: "jmenu-untouchable",
        parent: document.body,
      });
      this.untouchable.mousedown(function () {
        _this.close();
      });
    }

    this.create();
    this.bindEvents();
    this.#compute();
  }

  /**
   * Which html element 'cause the menu to popup
   */
  get which() {
    return this.#currentTarget
  }

  /**
   * Bind different events
   */
  bindEvents() {
    let actions = (this.props.action ?? "contextmenu").split(" ");
    let _this = this;

    actions.forEach((action) => {
      if (typeof _this.target == "string")
        window.addEventListener(action, function (e) {
          if (e.target.closest(_this.target)) {
            e.preventDefault();
            _this.popup({ x: e.clientX, y: e.clientY }, e.target);
          }
        })
      else _this.target.addEventListener(action, function (e) {
        e.preventDefault();
        _this.popup({ x: e.clientX, y: e.clientY }, e.target);
      });
    });
  }

  /**
   * Create the menu
   */
  create() {
    let elm = eye("<div>", {
      class: ["jmenu-menu", "unselect"],
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
  }

  /**
   * Add new button to the menu
   * @param {buttonDef} button
   */
  addButton(button) {
    let btn = new JButton(this, button);
    this.#buttons.push(btn);
  }

  get buttons() {
    return this.#buttons;
  }

  /**
   *
   * @param {Object} pos the position in which to popup in
   * @param {number} pos.x x coordination
   * @param {number} pos.y y coordination
   * @param {HTMLElement} [target] the element that 'causing the popup if any
   */
  popup(pos, target) {
    let { x, y } = pos;
    let alignment = this.props.alignToTarget;
    this.#currentTarget = target;

    if ([true, "left", "right"].includes(alignment)) {
      // perform stick display
      let closerBy = this.props.alignToOffset;
      let box = target.getBoundingClientRect();

      // adjust so the menu stays inside screen
      if (
        [true, "left"].includes(alignment) &&
        box.left + box.width + this.computed.menuWidth > window.innerWidth
      ) alignment = "right";
      else if (
        alignment == "right" &&
        box.left - this.computed.menuWidth < 0
      ) alignment = "left";

      // apply X position
      if (alignment === "left" || alignment === true)
        x = box.left + box.width + 2 - closerBy;
      else if (alignment === "right")
        x = box.left - this.computed.menuWidth - 2 + closerBy;

      // adjust Y position
      if (box.top + this.computed.menuHeight > window.innerHeight)
        y = box.top + box.height - this.computed.menuHeight;
      else y = box.top;


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
    if (this.untouchable) this.untouchable.show("inline-block");
    this.trigger('open', new JmenuEvent("open", this, target));
  }

  /**
   * Close the menu
   * @param {boolean} closeAllMenu
   * @returns
   */
  close(closeAllMenu) {
    if (closeAllMenu && this.computed.parent)
      return this.computed.parent.close(true); // this will start closing the total menu

    if (this.submenus.length != 0) {
      this.submenus.forEach((submenu) => submenu.close());
    }
    this.elm.css("display", "none");
    if (!this.computed.parent) this.untouchable.hide();

    this.trigger('close', new JmenuEvent("close", this, window));
  }

  /**
   * Perform some computation tasks registering some values
   */
  #compute() {
    // perform some need calculations

    // away from the screen
    this.elm.css("left", -9999);
    this.elm.css("position", "fixed");
    this.elm.css("display", "inline-block");

    let declaration = this.elm.compute();
    this.computed.menuHeight = declaration.height;
    this.computed.menuWidth = declaration.width;

    this.elm.css("display", "none");
  }

  /**
   * Hide the button at the give index
   * @param {number} index
   */
  hideButton(index) {
    if (this.#buttons[index]) this.#buttons[index].button.hide();
  }

  /**
   * Show the button at the give index
   * @param {number} index
   */
  showButton(index) {
    if (this.#buttons[index]) this.#buttons[index].button.show("flex");
  }

  /**
   * Enable button at the given index
   * @param {number} index 
   */
  enableButton(index) {
    if (this.#buttons[index]) this.#buttons[index].enable();
  }

  /**
   * Disable button at the given index
   * @param {number} index 
   */
  disableButton(index) {
    if (this.#buttons[index]) this.#buttons[index].disable();
  }

  /**
   * Modify a button property value
   * @param {number} index 
   * @param {"label" | "value" | "icon" | "accelerator" | "definition"} prop 
   * @param {*} value 
   */
  setButtonProp(index, prop, value) {
    if (this.buttons[index]) {
      let btn = this.buttons[index];
      switch (prop) {
        case "label":
          btn.label = value;
          btn.button.refresh({
            default: false,
            _label: value
          });
          break;
        case "value":
          btn.setValue(value);
          break;
        case "icon":
          if (btn.type != "separator")
            btn.button.child(0).css('backgroundImage', value);
          break;
        case "accelerator":
          if (!["slider","separator","definition"].includes(btn.type))
            btn.button.refresh({
              default: false,
              _accelerator: value
            })
          break;
        case "definition":
          if (btn.type == "definition")
            btn.runtime["defBloc"].html(btn.properties.def = value);
      }

    }
  }

  /**
   * Attach an event listener to certain event
   * @param {"open" | "close"} ev 
   * @param {(jev: JmenuEvent)=>void} cb 
   */
  on(ev, cb) {
    if (!Array.isArray(this.#events[ev])) this.#events[ev] = [];

    this.#events[ev].push(cb);
  }

  /**
   * Remove an attached event listener
   * @param {string} ev 
   * @param {function} cb 
   */
  off(ev, cb) {
    if (Array.isArray(this.#events[ev])) {
      let i = this.#events[ev].findIndex(cbl => cb === cbl);
      if (i != -1)
        this.#events[ev].splice(i, 1);
    }
  }

  /**
   * Trigger an event handler
   * @param {string} ev 
   * @param  {...any} args 
   */
  trigger(ev, ...args) {
    let _this = this;
    if (Array.isArray(this.#events[ev]))
      this.#events[ev].forEach(cb => cb.call(_this, ...args));
  }
}

// the css file must be included
console.warn(
  "[JmenuJS] Don't forget to link the css file bundled with the library to get full functional menus!"
);

export default Jmenu;

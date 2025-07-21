/**
 * @typedef {Object} AttrMap
 * @property {HTMLDivElement} parent - append newly created element to a parent
 * @property {Array<String>|String} class - class or array of classes to set
 * @property {String} id - set element ID
 * @property {Object} data - dataset values to set
 * @property {String} text - set element text
 * @property {String} html - set element html
 */

/**
 * Returns the associated class event of that event
 * example: for click event it returns new MouseEvent("click")
 * @param {string} ev 
 */
function getEvent(type, options = {}) {
  switch (type) {
    // Mouse Events
    case 'click':
    case 'dblclick':
    case 'mousedown':
    case 'mouseup':
    case 'mousemove':
    case 'mouseenter':
    case 'mouseleave':
    case 'mouseover':
    case 'mouseout':
      return new MouseEvent(type, options);

    // Pointer Events
    case 'pointerdown':
    case 'pointerup':
    case 'pointermove':
    case 'pointerenter':
    case 'pointerleave':
    case 'pointerover':
    case 'pointerout':
      return new PointerEvent(type, options);

    // Keyboard Events
    case 'keydown':
    case 'keyup':
    case 'keypress':
      return new KeyboardEvent(type, options);

    // Focus Events
    case 'focus':
    case 'blur':
    case 'focusin':
    case 'focusout':
      return new FocusEvent(type, options);

    // Input & Form Events
    case 'input':
    case 'change':
    case 'submit':
    case 'reset':
      return new Event(type, options);

    // Wheel
    case 'wheel':
      return new WheelEvent(type, options);

    // Clipboard
    case 'copy':
    case 'cut':
    case 'paste':
      return new ClipboardEvent(type, options);

    // UI
    case 'scroll':
    case 'resize':
      return new UIEvent(type, options);

    // Default: fallback to generic Event
    default:
      return new CustomEvent(type, options);
  }
}

/**
 * @typedef {EyeElement & {
 *  refresh: (attrs: AttrMap) => ModelEyeElement
 * }} ModelEyeElement eye element definition for model elements
 */

const events = [
  // Mouse Events
  "click",
  "dblclick",
  "mousedown",
  "mouseup",
  "mousemove",
  "mouseenter",
  "mouseleave",
  "mouseover",
  "mouseout",
  "contextmenu",

  // Keyboard Events
  "keydown",
  "keypress", // Deprecated
  "keyup",

  // Focus Events
  "focus",
  "blur",
  "focusin",
  "focusout",

  // Form Events
  "submit",
  "change",
  "input",
  "reset",
  "select",

  // Touch Events (for mobile)
  "touchstart",
  "touchend",
  "touchmove",
  "touchcancel",

  // Pointer Events
  "pointerdown",
  "pointerup",
  "pointermove",
  "pointerenter",
  "pointerleave",
  "pointercancel",

  // Drag and Drop Events
  "dragstart",
  "dragend",
  "dragenter",
  "dragover",
  "dragleave",
  "drop",

  // Window/Document Events
  "resize",
  "scroll",
  "load",
  "beforeunload",
  "unload",

  // Media Events
  "play",
  "pause",
  "ended",
  "volumechange",
  "timeupdate",

  // Clipboard Events
  "copy",
  "cut",
  "paste",

  // Animation and Transition Events
  "animationstart",
  "animationend",
  "animationiteration",
  "transitionstart",
  "transitionend",

  // Mutation Events
  "DOMSubtreeModified",
  "DOMNodeInserted",
  "DOMNodeRemoved",

  // Other Events
  "error",
  "hashchange",
  "popstate",
];

const htmlElements = [
  // Metadata
  "<base>",
  "<head>",
  "<link>",
  "<meta>",
  "<style>",
  "<title>",

  // Sections
  "<body>",
  "<address>",
  "<article>",
  "<aside>",
  "<footer>",
  "<header>",
  "<h1>",
  "<h2>",
  "<h3>",
  "<h4>",
  "<h5>",
  "<h6>",
  "<main>",
  "<nav>",
  "<section>",

  // Text content
  "<blockquote>",
  "<dd>",
  "<div>",
  "<dl>",
  "<dt>",
  "<figcaption>",
  "<figure>",
  "<hr>",
  "<li>",
  "<ol>",
  "<p>",
  "<pre>",
  "<ul>",

  // Inline text semantics
  "<a>",
  "<abbr>",
  "<b>",
  "<bdi>",
  "<bdo>",
  "<br>",
  "<cite>",
  "<code>",
  "<data>",
  "<dfn>",
  "<em>",
  "<i>",
  "<kbd>",
  "<mark>",
  "<q>",
  "<rp>",
  "<rt>",
  "<ruby>",
  "<s>",
  "<samp>",
  "<small>",
  "<span>",
  "<strong>",
  "<sub>",
  "<sup>",
  "<time>",
  "<u>",
  "<var>",
  "<wbr>",

  // Image and multimedia
  "<area>",
  "<audio>",
  "<img>",
  "<map>",
  "<track>",
  "<video>",

  // Embedded content
  "<embed>",
  "<iframe>",
  "<object>",
  "<picture>",
  "<portal>",
  "<source>",

  // Scripting
  "<canvas>",
  "<noscript>",
  "<script>",

  // Demarcating edits
  "<del>",
  "<ins>",

  // Table content
  "<caption>",
  "<col>",
  "<colgroup>",
  "<table>",
  "<tbody>",
  "<td>",
  "<tfoot>",
  "<th>",
  "<thead>",
  "<tr>",

  // Forms
  "<button>",
  "<datalist>",
  "<fieldset>",
  "<form>",
  "<input>",
  "<label>",
  "<legend>",
  "<meter>",
  "<optgroup>",
  "<option>",
  "<output>",
  "<progress>",
  "<select>",
  "<textarea>",

  // Interactive elements
  "<details>",
  "<dialog>",
  "<summary>",

  // Web components / scripting base
  "<slot>",
  "<template>",
];

function flat(word) {
  let n = "";
  for (let i = 0; i < word.length; i++) {
    const t = word[i];
    if (t === t.toUpperCase() && t !== t.toLowerCase()) n += "-" + t;
    else n += t;
  }
  return n.toLowerCase();
}

const localdata = new WeakMap();

/**
 * cmcl stands for Create Model Children Layers, recursively creates model layers one by one
 * @param {EyeElement} parent
 * @param {Object} layer
 * @returns {Array<{name: string,set: (parent: EyeElement, value: String) =>}>}
 */
function cmcl(parent, layer) {
  let obj = [];
  for (const key in layer) {
    const subcontent = layer[key];
    const [def, _set] = key.split(":");
    const [tagName, ...cls] = def.split(".");
    let [_set_name = null, _set_default = null] = (_set || "")
      .split("-")
      .map((a) => a.trim());

    let elm = eye(tagName.trim(), {
      class: cls,
      parent,
      data: _set ? { value: _set_name } : undefined,
    });

    if (_set && _set_name) {
      obj.push({
        name: _set_name,
        set(parent, value) {
          let elm = parent.find(`[data-value="${_set_name}"]`);
          elm.textContent = value ?? _set_default;
        }
      });
    }

    // recursive
    if (
      subcontent &&
      typeof subcontent === "object" &&
      !(subcontent instanceof Array)
    )
      obj = obj.concat(cmcl(elm, subcontent));
  }
  return obj;
}

let delegationEvents = ["click", "submit", "input", "change", "keydown", "keyup", "keypress", "focusin", "focusout", "mouseover", "mouseout"];
let normalSetterGetter = (action, v, elm) => v;

/**
 * Eye wrapper offers a subset of functions that ease DOM minipulation! Power of JQuery with 
 * some a modern design and a bunch of new functions.
 * @author Yousef Neji
 */
class EyeElement {
  /**
   * Raw html element
   * @type {HTMLElement}
   */
  #raw = null;

  /**
   * Used to store delegated events listeners
   * @type {Map<String,Set<{callback, target: string}>>}
   */
  #dlgListeners = new Map();

  /**
   * Custom way or modifier that redefine the way you set/get
   * this element `textContent` or `value`:
   * - access this feature from `.redefine` method.
   */
  #customSet = {
    value: normalSetterGetter,
    text: normalSetterGetter
  };

  /**
   * Called internally to initiate the main EyeElement functionalities
   * @method EyeElement#init
   * @param {string|HTMLElement} selector
   * @param {AttrMap} attrs
   * @param {Object} css
   * @returns {EyeElement}
   */
  constructor(selector, attrs, css) {
    let _this = this;
    if (selector instanceof HTMLElement) {
      this.#raw = selector;
    } else if (htmlElements.includes(selector)) {
      // creating a new element
      this.#raw = document.createElement(selector.substring(1, selector.length - 1));
    } else {
      // selecting
      let s = selector.slice(-1) === "!";
      this.#raw = document.querySelectorAll(s ? selector.slice(0, -1) : selector);

      if (this.#raw.length == 0) return null; // we stop everything here
      if (this.length == 1 || s) this.#raw = this.#raw.item(0);
    }

    /**
     * Handler used to integrate delegation concept/algorithme
     * @param {Event} e 
     */
    function handler(e) {
      let name = e.type,
        listeners = _this.#dlgListeners,
        _etarget = e.target,
        me = this; // refers to the element being listening to the event

      if (listeners.has(name)) {
        let cbs = listeners.get(name);
        cbs?.forEach(({ callback, target }) => {
          if (_etarget.closest(target)) {
            // we hitting the target
            callback(e, me);
          }
        });
      }
    }

    this.each((elm, idx) => {
      let parentElm = null;
      if (attrs)
        for (const key in attrs) {
          const value = attrs[key];
          if (key == "class")
            elm.classList.add.apply(
              elm.classList,
              (value instanceof Array ? value : value.split(" ")).filter(a => a != "")
            );
          else if (key == "text") elm.textContent = value;
          else if (key == "html") elm.innerHTML = value;
          else if (key == "data") for (const k in value) elm.dataset[k] = value[k];
          else if (key == "parent") parentElm = value;
          else if (key in elm) elm[key] = value;
          else if (key[0] != "_") elm.setAttribute(key, elm); // we must ignore _ started keys 'cause they are used by models
        }
      if (css)
        for (const key in css)
          if (key.indexOf("-") != -1) elm.style[key] = css[key];
          else elm.style[flat(key)] = css[key];
      if (parentElm instanceof EyeElement || parentElm instanceof HTMLElement) parentElm.append(elm);

      // creating the delegation handling model
      delegationEvents.forEach(ev => {
        elm.addEventListener(ev, handler);
      });
    });

    // creating/initiating events functions
    events.forEach(ev => {
      _this[ev] = function (cb) {
        if (cb) {
          if (typeof cb == "function") _this.on(ev, cb);
        } else _this.trigger(ev);

        return _this;
      };
    });


    return this;
  }

  /**
   * Length of current selection
   * @type {Number}
   */
  get length() {
    return this.#raw instanceof NodeList ? this.#raw.length : 1;
  }

  /**
   * Raw html element
   * @type {HTMLElement}
   */
  get raw(){
    return this.#raw;
  }

  /**
   * Run(loop) through selected NodeList, or run a single call for one single element
   * @method EyeElement#each
   * @param {(elm: EyeElement, index: number, current: EyeElement)=>} cb 
   * @returns {EyeElement}
   */
  each(cb) {
    (this.#raw instanceof NodeList ? [...this.#raw.entries()] : [[0, this.#raw]]).forEach(([idx, elm]) => {
      cb(elm, idx, this);
    });
    return this;
  }
  /**
   * Set or get element html
   * @method EyeElement#html
   * @param {string} [html]
   * @returns {EyeElement|string}
   */
  html(html) {
    let out = undefined;
    this.each((elm, idx) => {
      if (html === undefined) return out = elm.innerHTML;// getting the first one and exiting
      elm.innerHTML = html;
    });
    return out != undefined ? out : this;
  }
  /**
   * Set or get element text
   * @method EyeElement#text
   * @param {string} [text]
   * @returns {EyeElement|string}
   */
  text(text) {
    let out = undefined;
    this.each((elm, idx) => {
      if (text === undefined) return out = this.#customSet.text("get", elm.textContent, elm);
      elm.textContent = this.#customSet.text("set", text, elm);
    });
    return out != undefined ? out : this;
  }
  /**
   * Set or get element's data values
   * @method EyeElement#data
   * @param {string} key
   * @param {*} [value]
   * @returns {EyeElement|string}
   */
  data(key, value) {
    if (!localdata.has(this)) localdata.set(this, {});
    if (key) {
      if (value != undefined) localdata.get(this)[key] = value;
      else return localdata.get(this)[key];
    }
    return this;
  }

  /**
   * Set or get an attribute value
   * @method EyeElement#attr
   * @param {string} name
   * @param {*} [value]
   * @returns {EyeElement|string}
   */
  attr(name, value) {
    let out = "";
    this.each((elm, idx) => {
      if (name.indexOf("data-") === 0) {
        let [key, val] = name.split("-").map((a) => a.trim());
        // modify data
        if (value == undefined) return out = elm.dataset[val];
        elm.dataset[val] = value;
      } else {
        if (name in elm) {
          if (value == undefined) return out = elm[name];
          elm[name] = value;
        } else if (name[0] != "_") {
          if (value == undefined) return out = elm.getAttribute(name)
          elm.setAttribute(name, value);
        }
      }
    });
    return out ? out : this;
  }
  /**
   * Super fancy class function that allows to modify class with different methods in one
   * @method EyeElement#class
   * @param {string} actions
   * @returns {EyeElement|string}
   */
  class(actions) {
    let out = undefined;
    this.each((elm, idx) => {
      if (typeof actions === "number") return out = elm.classList.item(actions);

      actions.split(" ").forEach((action) => {
        if (action[0] == "-") {
          elm.classList.remove(action.substring(1, action.length));
        } else if (action[0] == "%") {
          elm.classList.toggle(action.substring(1, action.length));
        } else if (action[0] == "?") {
          out = elm.classList.contains(action.substring(1, action.length));
        } else if (action.indexOf("/") != -1) {
          [v1, v2] = action.split("/");
          elm.classList.replace(v1, v2);
        } else {
          elm.classList.add(action.substring(1, action.length));
        }
      });
      if (out) return;
    });

    return out != undefined ? out : this;
  }
  /**
   * Show/display the element
   * @method EyeElement#show
   * @param {string} cls
   * @returns {EyeElement}
   */
  show(cls) {
    this.each((elm, idx) => {
      elm.style.display = cls ?? "inline-block";
    });
    return this;
  }
  /**
   * Hide the element
   * @method EyeElement#hide
   * @param {boolean} opacity whether to hide by making invisible?
   * @returns {EyeElement}
   */
  hide(opacity) {
    this.each((elm, idx) => {
      if (opacity) elm.style.opacity = 0;
      else elm.style.display = "none";
    });
    return this;
  }
  /**
   * Append one or more elements to the current element
   * @method EyeElement#append
   * @param {HTMLElement|Array<Node|EyeElement>} elm
   * @param {"next" | "after" | "previous" | "before"} [pos] [optional]
   * @returns {EyeElement}
   */
  append(elm, pos) {
    let nodes = [];
    (Array.isArray(elm) ? elm : [elm]).forEach(item => {
      if (item instanceof EyeElement) nodes.push(item.#raw);
      else if (item instanceof HTMLElement) nodes.push(item);
    });
    if (this.#raw instanceof NodeList) {
      console.warn(`[EyeJS] beware while using .append with multi selected elements`);
      this.#raw.forEach((itm, idx) => {
        if (!nodes[idx]) return;
        itm.append(nodes[idx]);
      });
      return this;
    }
    if (!pos) this.#raw.append(...nodes);
    else
      switch (pos) {
        case "next":
        case "after":
          this.#raw.after(...nodes);
          break;
        case "previous":
        case "before":
          this.#raw.before(...nodes);
          break;
      }
    return this;
  }
  /**
   * Insert element after this one
   * @method EyeElement#after
   * @param {EyeElement|HTMLElement} elm 
   * @returns {EyeElement}
   */
  after(elm) {
    (this.#raw instanceof NodeList ? this.#raw.item(0) : this.#raw).after(elm);
    return this;
  }
  /**
   * Insert element before this one
   * @method EyeElement#before
   * @param {EyeElement|HTMLElement} elm 
   * @returns {EyeElement}
   */
  before(elm) {
    (this.#raw instanceof NodeList ? this.#raw.item(0) : this.#raw).before(elm);
    return this;
  }
  /**
   * Replace current element with the new element, or multiple elements with multiple selected elements
   * @method EyeElement#replaceWith
   * @param {...HTMLElement|EyeElement} elms
   * @param {string} [pos] [optional]
   * @returns {EyeElement}
   */
  replaceWith(...elms) {
    let nodes = [];
    (Array.isArray(elms) ? elms : [elms]).forEach(item => {
      if (item instanceof EyeElement) nodes.push(item.#raw);
      else if (item instanceof HTMLElement) nodes.push(item);
    });
    if (this.#raw instanceof NodeList) {
      [...this.#raw.entries()].forEach(([idx, elm]) => {
        if (!nodes[idx]) return;
        elm.replaceWith(nodes[idx]);
      });
    } else {
      this.#raw.replaceWith(...nodes);
    }
    return this;
  }
  /**
   * Get current element parent or append it to one
   * @method EyeElement#parent
   * @param {HTMLElement|EyeElement} par
   * @returns {EyeElement}
   */
  parent(par) {
    if (par) {
      if (!(par instanceof HTMLElement) && !(par instanceof EyeElement))
        throw new Error(
          "[EyeJS] Unable to append current element to parent because it's not HTMLElement"
        );
      this.each((elm, idx) => {
        par.append(elm);
      });
      return this;
    }
    return eye(this.#raw instanceof NodeList ? this.#raw.item(0).parentElement : this.#raw.parentElement);
  }
  /**
   * Returns whether current node is the same/equal(depending on `check`) as the passed node or not
   * @method EyeElement#is
   * @param {HTMLElement|EyeElement} node
   * @param {"connected" | "same" | "equal"} [check] check type `same`, `equal`
   * @returns {boolean}
   */
  is(node, check) {
    node = node instanceof EyeElement ? node.#raw : node;
    if (this.#raw instanceof NodeList) {
      console.warn(`[EyeJS] .is is not functional with multi selected elements`);
      return this;
    }
    if (node === "connected") return this.#raw.isConnected;
    switch (check) {
      case "same":
        return this.#raw.isSameNode(node);
      case "equal":
        return this.#raw.isEqualNode(node);
      default:
        console.error(
          `[EyeJS] Unknown check "${check}", possible values are ["same","equal","connected"]`
        );
        return false;
    }
  }
  /**
   * Set or get a css attribute
   * @method EyeElement#css
   * @param {string} attr
   * @param {string|number} [value]
   * @returns {EyeElement|string}
   */
  css(attr, value) {
    if (attr) {
      let out = undefined;
      attr = flat(attr);
      this.each((elm, idx) => {
        if (value === undefined) return out = elm.style[attr];
        elm.style[attr] = value;
      });
      return out != undefined ? out : this;
    } else return console.error(`[EyeJS] mission argument "attr" in function .css`);
  }
  /**
   * Remove current element
   * @method EyeElement#remove
   * @returns {EyeElement}
   */
  remove() {
    this.each((elm, idx) => {
      elm.remove();
    });
    return this;
  }
  /**
   * @overload
   * @param {string} ev
   * @param {function} cb
   */
  /**
   * @overload
   * @param {string} ev
   * @param {string} trg optionally define a target element for the event
   * @param {function} cb
   *
   */
  /**
   * Attach an listener/handler to specific event or events
   * @method EyeElement#on
   * @param {string} ev may contain multiple events separated by " "(space)
   * @param {string|function} arg2 
   * @param {function} [arg3]
   * @returns {EyeElement|void}
   */
  on(ev, arg2, arg3) {
    ev = ev.split(" ");
    let target = typeof arg2 === "string" ? arg2 : null;
    let cb = typeof arg2 === "function" ? arg2 : arg3;
    let _this = this;
    if (typeof cb !== "function")
      return console.error(
        "[EyeJS] .on method is missing the actuall callback `cb` or not of type function"
      );

    let elms = (this.#raw instanceof NodeList ? [...this.#raw.entries()] : [[0, this.#raw]]);

    let outsider = null;
    ev.forEach(evt => {
      if (target) {
        if (!delegationEvents.includes(evt))
          return outsider = evt; // outsider events 

        if (!_this.#dlgListeners.has(evt))
          _this.#dlgListeners.set(evt, new Set());
        _this.#dlgListeners.get(evt).add({ callback: cb, target });
      } else {
        elms.forEach(([idx, elm]) => {
          elm.addEventListener(evt, cb);
        });
      }
    });

    if (outsider !== null)
      return console.error(`[EyeJS] trying to use delegation for an inappropriate event "${outsider}"`);

    return this;
  }
  /**
   * Remove event listener of a specific event
   * @method EyeElement#off
   * @param {string} ev 
   * @param {function} cb 
   * @returns {EyeElement|void}
   */
  off(ev, cb) {
    let _this = this,
      listeners = _this.#dlgListeners;
    if (typeof cb != "function")
      return console.error(
        "[EyeJS] .off method is missing the actuall callback `cb` or not of type function"
      );
    ev = ev.split(" ");

    this.each((elm, idx) => {
      ev.forEach(evt => elm.removeEventListener(evt, cb));
    });
    // now delegated events
    ev.forEach(evt => {
      if (listeners.has(evt)) {
        let set = listeners.get(evt);
        for (const item of set) {
          if (cb === item.callback) {
            // found it & remove it
            set.delete(item);
          }
        }
      }
    });
  }
  /**
   * Trigger specific event for this element
   * @method EyeElement#trigger
   * @param {string} ev 
   * @returns {EyeElement}
   */
  trigger(ev) {
    this.each((elm, idx) => {
      elm.dispatchEvent(getEvent(ev));
    });
    return this;
  }
  /**
   * Find one or multiple child elements by `selector`
   * @method EyeElement#find
   * @param {string} selector  
   */
  find(selector) {
    let found = [];
    this.each((elm, idx) => {
      elm.querySelectorAll(selector).forEach(res => found.push(res));
    });
    return found.length == 1 ? found[0] : found;
  }
  /**
   * Returns a clone of current selected element/s
   * @method EyeElement#clone
   * @param {HTMLElement} [parent] optionally append new clone to a parent
   * @returns {Array<EyeElement>|EyeElement}
   */
  clone(parent) {
    if (this.#raw instanceof NodeList) {
      let list = [];
      this.#raw.forEach(nd => {
        list.push(nd.cloneNode(true));
      });
      if (parent instanceof HTMLElement || parent instanceof EyeElement) list.forEach(el => parent.append(el));
      return list;
    } else {
      let clone = this.#raw.cloneNode(true);
      if (parent instanceof HTMLElement || parent instanceof EyeElement) parent.append(clone);
      return clone;
    }
  }
  /**
   * Compute DOMRect or style declaration of current element
   * @method EyeElement#compute
   * @param {"bounds" | "style"} type 
   * @returns {DOMRect|CSSStyleDeclaration}
   */
  compute(type) {
    type = type || "bounds";
    if (type === "bounds")
      return (this.#raw instanceof NodeList ? this.#raw.item(0) : this.#raw).getBoundingClientRect();
    else if (type == "style")
      return getComputedStyle(this.#raw instanceof NodeList ? this.#raw.item(0) : this.#raw)
    console.error(`[EyeJS] unkown type "${type}" in function .compute, possible values are "bounds" "style"`);
  }
  /**
   * Activate/disactive different pointer features such as PointerLock, pointerCapture...
   * @method EyeElement#pointer
   * @param {"capture" | "lock"} action 
   * @param {boolean} status 
   * @param {string} [pid]  
   * @returns {EyeElement}
   */
  pointer(action, status, pid) {
    this.each((elm, idx) => {
      if (action === "capture") {
        if (status === true) elm.setPointerCapture(pid);
        else elm.releasePointerCapture(pid);
      } else if (action === "lock") {
        if (status === true) elm.requestPointerLock();
        else document.exitPointerLock();
      }
    });
    return this;
  }
  /**
   * Select a child of this element
   * @method EyeElement#child
   * @param {number} index 
   * @returns {EyeElement|null}
   */
  child(index) {
    let it = (this.#raw instanceof NodeList ? this.#raw.item(0) : this.#raw);
    if (index === undefined) return it.children.length;
    if (it.children[index]) return eye(it.children[index]);
    return null;
  }
  /**
   * Set/get the value of the current element
   * @method EyeElement#val
   * @param {*} value 
   * @returns 
   */
  val(value) {
    if (value != undefined) (this.#raw instanceof NodeList ? [...this.#raw.entries()] : [[0, this.#raw]]).forEach(([idx, a]) => a.value = this.#customSet.value("set", value, a));
    else {
      let it = (this.#raw instanceof NodeList ? this.#raw.item(0) : this.#raw);
      return this.#customSet.value("get", it.value, it);
    }
    return this;
  }
  /**
   * Serialize this element to send it over network, returns 3 formats `json`, `url` & `fd`(formData) 
   * @method EyeElement#serialize
   * @param {{inputs: Array<string>}} opts
   * @returns {{json: Object, url: String, fd: FormData}}
   */
  serialize(opts) {
    opts = opts || {};
    let {
      inputs = ["input", "textarea", "select"],
    } = opts;
    if (this.#raw instanceof HTMLElement) {
      let out = {
        json: {},
        url: "",
        fd: new FormData()
      };
      this.#raw.querySelectorAll(inputs.join(','))
        .forEach((inp, i) => {
          let name = inp.name || inp.dataset.name;
          let value = inp.value || inp.textContent;
          if (typeof opts[name] === "function") value = opts[name](inp);

          if (inp.type == "file")
            inp.files.forEach(file => {
              out.fd.append(name, file);
            });
          else {
            out.json[name] = value;
            out.fd.append(name, value);
          }
        });

      out.url = new URLSearchParams(out.json).toString();
      return out;
    } else console.warn(`[EyeJS] this is a multi selection, it's not serializable!`);
  }
  /**
   * Redefine the way `.text` or `.val` set or get data to and from this element.
   * @method EyeElement#redefine
   * @param {"text" | "value"} type 
   * @param {(action: "set" | "get", value: *, elm: EyeElement) => *} process 
   * @returns {EyeElement}
   */
  redefine(type, process) {
    if (["text", "value"].includes(type) && typeof process == "function")
      this.#customSet[type] = process;
    return this;
  }
  /**
   * Animate current object 
   * @method EyeElement#animate
   * @param {Array<Keyframe>} keyframes 
   * @param {KeyframeAnimationOptions} opts 
   * @returns {Array<Animation>|Animation}
   */
  animate(keyframes, opts) {
    /**
     * @type {Array<Animation>}
     */
    let anmts = [];
    opts.duration = opts.duration || 1000;
    this.each((elm, i) => {
      anmts.push(elm.#raw.animate(keyframes, opts));
    });
    return anmts.length == 1 ? anmts[0] : anmts;
  }
}
/**
 * Creates or select nodes using css selectors, offering a pack of useful functions to use around your code!
 * @param {String} tag
 * @param {AttrMap} attrs
 * @param {Object} css CSS styles to be applied to the element.
 * @returns {EyeElement}
 */
function eye(tag, attrs, css) {
  if (typeof tag === "string" && tag.indexOf("model:") === 0 || tag === "model") {
    if (!attrs) return console.error("[EyeJS] Model creation requires parameter 'attr' as prototype, none delivered!");

    tag = tag.split(":");
    let cls = ["eye-model"];
    if (tag[1])
      cls = cls.concat(tag[1].split(" ").filter(a => a != ""));
    // creating a model
    let model = eye("<div>", {
      class: cls.join(" "),
    });

    let sets = cmcl(model, attrs);

    /**
     * @param {string} attrs
     * @returns {ModelEyeElement}
     */
    return (attrs) => {
      let copy = eye(model.clone(attrs?.parent));
      // define & attach the refresh function
      copy.refresh = function (attrs = {}) {
        let def = attrs.default === false ? false : true;
        sets.forEach((item) => {
          if (def === true || (!def && attrs.hasOwnProperty(item.name)))
            item.set(copy, attrs[item.name]);
        });
        return this;
      };
      return copy.refresh(attrs);
    };
  } else return new EyeElement(tag, attrs, css);
}


// gloablly exposed
window.eye = eye;

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
    this.runtime = {};

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
      });

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
          };
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
          };
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
          };
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
          bodyAccel.append(decrease);
          let show = eye("<div>", {
            class: "jmenu-slider-show",
          });
          bodyAccel.append(show);
          let increase = eye("<div>", {
            class: "jmenu-slider-btn",
          });
          bodyAccel.append(increase);

          // the plus and minus icons
          eye("<div>", { class: "jmenu-minus", parent: decrease });
          eye("<div>", { class: "jmenu-plus1", parent: increase });
          eye("<div>", { class: "jmenu-plus2", parent: increase });

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
            };
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
          };

          // mouseleave => stop timer
          onmouseleave = function () {
            if (this.tm) clearTimeout(this.tm);
          };
          break;
      }

      // attaching events
      if (typeof onclick == "function") btn.click((e) => { if (_this.#state) onclick(e); });
      if (typeof onmouseenter == "function") btn.mouseenter(onmouseenter);
      if (typeof onmouseleave == "function") btn.mouseleave(onmouseleave);
      if (typeof onwheel == "function") btn.on("wheel", onwheel);

      // general events
      btn.mouseenter(function () {
        // closing any opened tree
        for (let i = 0; i < _this.menu.submenus.length; i++) {
          _this.menu.submenus[i].close();
        }
      });


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
      this.button.child(1).child(1).child(1).text(this.properties.format.replace("_value_", this.value));
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
        });
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
            });
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

export { Jmenu as default };
//# sourceMappingURL=jmenu.esm.js.map

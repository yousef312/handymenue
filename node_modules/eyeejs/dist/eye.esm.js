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

export { eye as default };
//# sourceMappingURL=eye.esm.js.map

/**
 * Qway.js 3.0.0
 *
 * Copyright 2018, yousef neji
 * Licensed under the MIT license.
 */
/**
 * @tutorial introduction
 * there is so many types of shortcut we offer:
 *  - `shortcut` : ordinary known one
 *  - `combo` : used mostly in games like cheat code a string you must tap very quickly and once
 * you fully tap a function that going to execute at the end resulting in a completed mission
 * or something like that
 *  - `holdAction` : occurs when you hold a key for a duration resulting in a function that execute
 * at the end.
 *
 * the syntax to bind each type deffers like so:
 *  to bind a normal shortcut you must pass a string constraint a keys list seperated by a `+` sign
 *  to bind a combo you must pass a string of keys list seperated by `,` comma
 *  to bind a holdAction you pass a string in this form ` (key) => (duration) `. the spaces added only for clarity also the parenthese
 *  the syntax of a hold action constrained out of a key then `=>` then the duration of holding in milliseconds.
 *
 *
 * Should not that not all shortcut will be allowed some shortcut could be used by default in the used browser
 * all thought the system will try to block this default one but some of them may still work like ctrl+t which open
 * new tab and other ones.
 *
 *
 * Tricks:
 * here is a simple trick, what to do if I just want to stop a default keybinding like (ctrl+r) that does
 * the window reload, you can simply assing to this shortcut a enmpty callback like that `qway.bind('ctrl+r')` you don't really
 * have to pass a callback as a qway empty optimal generated callback will be there for you.
 */

// fixed bug in version 2.0.0
// the library stop all my other callbacks to ceratin event such as mousedown event
// mouse up event
// and window blur event

// for major support those steps must be implimented
if ([].findIndex === undefined) {
  Array.prototype["findIndex"] = function (callback) {
    var res = -1;
    for (let i = 0; i < this.length; i++) {
      const element = this[i];
      out = callback(element, i, this);
      if (out === true) {
        res = i;
        break;
      }
    }

    return res;
  };
}

/**
 * Interface allows to handle setting up shortcut and combo keys for you app game or even
 * website very easily.
 * @author Yousef Neji
 * @param {boolean} duplicates default false, whether more then one callback for the same
 * shortcut allowed or not!
 */
function Qway(duplicates = false) {
  var _this = this;

  /**
   * Holds the defined shortcuts list, to add new shortcut use `bind`.
   * @type {Array}
   */
  this.shortcutslist = [];

  /**
   * Holds the defined combo list, to new combo use `bind`.
   * @type {Array}
   */
  this.combo = [];

  /**
   * Holds the callback to be executing when pressing certain key for a given duration
   * @type {Array}
   */
  this.holdingActions = [];

  /**
   * Flag determine whether assinging more then one callback to the same shortcut
   * is allowed or not
   * @type {boolean}
   */
  this.duplicates = duplicates;

  /**
   * Holds the different allowed keys to form the sortcut
   * @type {Array}
   */
  this.KEYS = [
    "command" /*For Mac OS*/,
    "ctrl",
    "shift",
    "alt",
    "altGraph",
    "capslock",
    "tab",
    "backspace",
    "enter",
    "meta",
    "space",
    "escape",
    "pageup",
    "pagedown",
    "home",
    "insert",
    "delete",
    "end",
    "arrowup",
    "arrowdown",
    "arrowleft",
    "arrowright",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "0",
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
    "*",
    "f1",
    "f2",
    "f3",
    "f4",
    "f5",
    "f6",
    "f7",
    "f8",
    "f9",
    "f10",
    "f11",
  ];

  /**
   * Get or set shortcut activation state
   * @type {boolean}
   */
  this.shortcutActivated = true;

  /**
   * Get or set combo activation state
   * @type {boolean}
   */
  this.comboActivated = true;

  /**
   * Flag determine whether the user currently in interactive mode or not,
   * must not get changed!
   * @readonly
   * @type {boolean}
   */
  this.intercativeMode = false;

  /**
   * Used in the interactive mode to hold the shortcut that going to be builded
   * @type {Array<Array>}
   */
  this.toBuild = [[], []];

  /**
   * QEF or Qway Escape Function is the rescue function when ever a shortcut was created without it callback.
   * @readonly
   * @type {function}
   */
  this.QEF = function () {};

  /**
   * Holds the keys states whether they are pressed or not.
   * @readonly
   */
  this.keysuite = {};

  // packing up
  window.addEventListener("keydown", function (e) {
    _this.handleKeydown.call(_this, e);
  });
  window.addEventListener("keyup", function (e) {
    _this.handleKeyup.call(_this, e);
  });
  window.addEventListener("blur", function () {
    _this.blur.call(_this);
  });
}

Qway.prototype = {
  /**
   * Approve binding the user created shortcut in interactive mode.
   * @method Qway#applyReplace
   * @returns {string} the shortcut that currently was approved.
   */
  approve: function () {
    if (this.toBuild[0].length === 0) return;

    var shortcut = this.toBuild[0].join("+");
    var callback = this.toBuild[1][1];

    this.bind(shortcut, callback);

    this.toBuild = [[], []];
    return shortcut;
  },
  /**
   * Approve replacing the given `callback` shortcut by the user defined one.
   * @method Qway#approveToReplace
   * @returns {boolean} true if replacing went well or false otherwise.
   */
  approveToReplace: function () {
    if (this.toBuild[0].length === 0) return;

    var shortcut = this.toBuild[0];
    var callback = this.toBuild[1][1];

    var obj = this.shortcutslist.find(
      (a) => a.callback.toString() === callback.toString()
    );
    let exist = this.check(shortcut.join("+")) !== -1;

    if (obj !== undefined && !exist) {
      this.unbind(obj.shortcut.join("+"), obj.callback);
      var res = this.bind(shortcut.join("+"), this.toBuild[1][1]);

      this.toBuild = [[], []];
      this.intercativeMode = false;
      return res === false ? res : shortcut;
    }
    this.toBuild = [[], []];
    this.intercativeMode = false;
    return false;
  },
  /**
   * Abort the interactive process emptying the system from the temporary saved
   * user interaction data(shortcut), invoked internally by the system.
   * @method Qway#abort
   */
  abort: function () {
    this.intercativeMode = false;
    this.toBuild = [[], []];
  },
  /**
   * Reset the progress of the combo with the given string and callback.
   * @method Qway#resetCombo
   * @param {string} combo
   * @param {function} callback (optional)
   */
  resetCombo: function (combo, callback) {
    combo = this.supervise(combo).join(",");

    var index = this.combo.findIndex(
      (a) =>
        a.combo.join(",") === combo &&
        (callback === undefined ||
          (callback !== undefined &&
            a.callback.toString() === callback.toString()))
    );

    if (index !== -1) {
      this.combo[index].progress = "";
      this.combo[index].done = false;
      return true;
    }
    return false;
  },
  /**
   * Toggle the activation state of a combo with the given string and callback
   * @method Qway#toggleCombo
   * @param {string} combo
   * @param {function} callback (optional)
   * @param {boolean} state (optional) if you want to force true or false
   * @returns {boolean} true if toggling went well or false otherwise
   */
  toggleCombo: function (combo, callback, state) {
    combo = this.supervise(combo).join(",");

    var index = this.combo.findIndex(
      (a) =>
        a.combo.join(",") === combo &&
        (callback === undefined ||
          (callback !== undefined &&
            a.callback.toString() === callback.toString()))
    );

    if (index !== -1) {
      if (typeof state === "boolean") {
        this.combo[index].active = state;
      } else {
        this.combo[index].active = !this.combo[index].active;
      }

      return true;
    }
    return false;
  },
  /**
   * Toggle the activation state of a shortcut with the given string and callback
   * @method Qway#toggleCombo
   * @param {string} combo
   * @param {function} callback (optional)
   * @param {boolean} state (optional) if you want to force true or false
   * @returns {boolean} true if toggling went well or false otherwise
   */
  toggleShortcut: function (shortcut, callback, state) {
    shortcut = this.supervise(shortcut).join("+");

    var index = this.shortcutslist.findIndex(
      (a) =>
        a.shortcut.join("+") === shortcut &&
        (callback === undefined ||
          (callback !== undefined &&
            callback.toString() === a.callback.toString()))
    );

    if (index !== -1) {
      if (typeof state === "boolean") {
        this.shortcutslist[index].active = state;
      } else {
        this.shortcutslist[index].active = !this.shortcutslist[index].active;
      }

      return true;
    }
    return false;
  },
  /**
   * Replace the shortcut of the given callback to new one
   * @method Qway#replace
   * @param {function} callback
   * @param {string} shortcut
   * @returns {boolean}  true if shortcut replaced successfully or false otherwise
   */
  replace: function (callback, shortcut) {
    var index = this.shortcutslist.find(
      (a) =>
        a.callback !== undefined &&
        a.callback.toString() === callback.toString()
    );

    if (index !== undefined) {
      this.unbind(index.shortcut.join("+"), index.callback);
      return this.bind(shortcut, callback);
    }
    return false;
  },
  /**
   * Interactivly getting the shortcut through the user clicks, this is usefull when
   * designing the settings of your app, allowing the user to set up his own shortcut.
   * @method Qway#getFromUser
   * @param {number} shortcutLength the shortcut accepeted key count
   * @param {function} callback
   * @param {function} func1 this function will be excuted each time the user press or release
   * a key while in creating the shortcut, it helps keep supervising the events!
   */
  getFromUser: function (shortcutLength, callback, func1) {
    this.intercativeMode = true;
    this.toBuild[1].push(shortcutLength, callback, func1);
  },
  /**
   * Stop the interactive mode, getting the shortcut from the user
   * @method Qway#stopGettingFromUser
   */
  stopGettingFromUser: function () {
    this.intercativeMode = false;
    this.toBuild = [[], []];
  },
  /**
   * Invoked internally to cancel a shortcut
   * @method Qway#handleKeyup
   * @param {KeyboardEvent} e
   */
  handleKeyup: function (e) {
    var key = e.key.toLowerCase();
    key = key === " " ? "space" : key.trim();
    key = key === "control" ? "ctrl" : key;
    this.keysuite[key] = false;

    if (this.intercativeMode === false) {
      if (this.shortcutslist.length !== 0) {
        if (this.shortcutActivated === false) return;

        this.shortcutslist.forEach((item) => {
          if (item.shortcut.indexOf(key) !== -1) {
            var start = item.shortcut.indexOf(key);

            for (let i = start; i < item.shortcut.length; i++) {
              item.progress[i] = false;
            }
          }
        });

        if (this.holdingActions.length !== 0) {
          this.holdingActions.forEach((item) => {
            if (item.key === key && item.timeout !== null) {
              clearTimeout(item.timeout);
              item.timeout = null;
            }
          });
        }
      }

      if (this.combo.length !== 0 && this.comboActivated === true) {
        // this is a figure for the content of the combo arrau to help visualize
        // what happenings
        //var obj = {
        //    progress : '',
        //    combo : combo,
        //    callback : callback,
        //    timing : timing,
        //    timeout : null,
        //    active : true
        //}

        this.combo.forEach((item, j) => {
          if (
            item.combo.indexOf(key) !== -1 &&
            !item.done &&
            item.active === true
          ) {
            e.preventDefault();

            // first we increase the progress by the new `key`
            item.progress += key;

            // we clear the old execution timeout
            if (item.timeout !== null) {
              clearTimeout(item.timeout);
            }

            if (item.progress === item.combo.join("")) {
              // means we get the right string
              item.done = true;
            }

            // now we execute the function
            item.callback(item);

            if (!item.done) {
              item.timeout = setTimeout(function () {
                item.progress = "";
                item.callback(item);
              }, item.timing);
            }
          }
        });
      }
    } else {
      // the interactive mode

      var index = this.toBuild[0].findIndex((a) => a === key);
      if (index !== -1) {
        e.preventDefault();
        this.toBuild[0].splice(index, 1);
        this.toBuild[1][2](this.toBuild[0]);
      }
    }
  },
  /**
   * Invoked internally by the library while performing the shortcut
   * @method Qway#handleKeydown
   * @param {KeyboardEvent} e
   */
  handleKeydown: function (e) {
    var key = e.key.toLowerCase();
    key = key === " " ? "space" : key.trim();
    key = key === "control" ? "ctrl" : key;
    this.keysuite[key] = true;

    if (this.intercativeMode === false) {
      if (this.shortcutslist.length !== 0 && this.shortcutActivated === true) {
        this.shortcutslist.forEach((item) => {
          if (item.active === false) return;

          if (item.shortcut[0] === "*") {
            e.preventDefault();
            item.progress[0] = true;
          } else if (
            item.progress.indexOf(true) !== -1 &&
            item.shortcut[item.progress.lastIndexOf(true) + 1] == "*"
          ) {
            e.preventDefault();
            item.progress[item.progress.lastIndexOf(true) + 1] = true;
          }

          //otherwise
          if (item.shortcut.indexOf(key) !== -1) {
            e.preventDefault();
            if (
              item.progress[item.shortcut.indexOf(key) - 1] === true ||
              item.progress[item.shortcut.indexOf(key) - 1] === undefined
            ) {
              item.progress[item.shortcut.indexOf(key)] = true;
            }
          }

          if (item.progress[item.progress.length - 1] === true) {
            e.preventDefault();
            item.progress[item.progress.length - 1] = false;
            item.callback();
          }
        });
      }

      if (this.holdingActions.length !== 0 && this.shortcutActivated === true) {
        for (let i = 0; i < this.holdingActions.length; i++) {
          const element = this.holdingActions[i];

          if (key === element.key && element.timeout === null) {
            e.preventDefault();
            this.holdingActions[i].timeout = setTimeout(
              element.callback,
              element.duration
            );
          }
        }
      }
    } else if (this.intercativeMode === true) {
      // first we check if key is already in the shortcut or not
      var alreadyThere = this.toBuild[0].findIndex((a) => a === key);
      if (alreadyThere === -1) {
        e.preventDefault();
        // now we need to handle creating the shortcut through the user clicks
        this.toBuild[0].push(key);
        this.toBuild[1][2](this.toBuild[0]);

        if (this.toBuild[0].length === this.toBuild[1][0]) {
          // means if shortcut length is enough
          // then stop enlarging it and record it
          this.intercativeMode = false;
          this.toBuild[1][2](this.toBuild[0], true);
        }
      }
    }
  },
  /**
   * Bind new short cut with a callback, mainly use comma seperated list of keys to create a combo or
   * seperated with `+` sign for ordinary shortcut.
   * @method Qway#bind
   * @param {string} shortcut the shortcut to bind
   * @param {function} callback the callback to be excuted when shortcut performed, if none was passed then a default callback will be assigned
   * @param {number} timing optional parameter defined the minimum time between key presses
   * so the shortcut is performed!(only for combos)
   */
  bind: function (shortcut = "ctrl+q", callback, timing = 500) {
    //do the check
    if (typeof shortcut !== "string") {
      console.warn("Qway warn you:\nthe given shortcut not string!");
      return;
    }
    callback = typeof callback !== "function" ? this.QEF : callback;
    timing = typeof timing !== "number" ? 500 : timing;

    //take apart the shortcut and anlyse it
    if (this.KEYS.indexOf(shortcut) !== -1) {
      // means the shortcut is constrained out of one single key
      var obj = {
        shortcut: [shortcut],
        progress: [false],
        callback: callback,
        active: true,
      };
      var index = this.check(shortcut);
      if (index === -1 || this.duplicates) {
        this.shortcutslist.push(obj);
        return true;
      }
      return false;
    } else if (shortcut.indexOf("+") !== -1) {
      var shortcuti = this.supervise(shortcut);
      if (shortcut !== false) {
        var obj = {
          shortcut: shortcuti,
          progress: new Array(shortcuti.length).fill(
            false,
            0,
            shortcuti.length
          ),
          callback: callback,
          active: true,
        };

        var index = this.check(shortcuti.join("+"));
        if (index === -1 || this.duplicates) {
          this.shortcutslist.push(obj);
          return true;
        }
        return false;
      }
      return false;
    } else if (shortcut.indexOf(",") !== -1) {
      var combo = this.supervise(shortcut);

      if (combo !== false) {
        var obj = {
          progress: "",
          combo: combo,
          done: false,
          callback: callback,
          timing: timing,
          timeout: null,
          active: true,
        };
        var index = this.check(combo.join(","));
        if (index === -1 || this.duplicates) {
          this.combo.push(obj);
          return true;
        }
        return false;
      }
      return false;
    } else if (shortcut.indexOf("=>") !== -1) {
      var shortcuti = this.supervise(shortcut);

      if (shortcut !== false) {
        var obj = {
          key: shortcuti[0],
          duration: shortcuti[1],
          callback: callback,
          timeout: null,
        };
        var index = this.check(shortcut);
        if (index === -1 || this.duplicates) {
          this.holdingActions.push(obj);
          return true;
        }
        return false;
      }
      return false;
    } else {
      return false;
    }
  },
  /**
   * Remove the shortcut associated to the given `callback`, do not pass any parameter to empty
   * the whole system callback, shortcuts combo and also hold actions.
   * more options :
   *  - pass `,` as the shortcut and `all` as the callback(or undefined) to delete all the combo
   *  - pass `+` as the shortcut and `all` as the callback(or undefined) to delete all the shortcuts
   *  - pass `=>` as the shortcut and `all` as the callback(or undefined) to delete all the holding actions
   *
   * @method Qway#unbind
   * @param {string} shortcut
   * @param {function} callback
   * @returns {boolean} true if shortcut successfully unbinded or false otherwise
   */
  unbind: function (shortcut, callback) {
    if (shortcut === undefined) {
      // passing undefined will empty the whole system
      // all the defined shortcut holdingActions and combo
      this.shortcutslist = [];
      this.holdingActions = [];
      this.combo = [];
      return;
    }

    var findANDdeleted = false;
    if (this.KEYS.indexOf(shortcut) !== -1) {
      for (let i = this.shortcutslist.length - 1; i > -1; i--) {
        const element = this.shortcutslist[i];

        if (
          ((callback !== undefined &&
            element.callback.toString() === callback.toString()) ||
            callback === undefined) &&
          element.shortcut.join("") === shortcut
        ) {
          this.shortcutslist.splice(i, 1);
          findANDdeleted = true;
        }
      }
    } else if (shortcut.indexOf("+") !== -1) {
      if (callback === "all" || (callback === undefined && shortcut === "+")) {
        this.shortcutslist = [];
        findANDdeleted = true;
      } else {
        shortcut = this.supervise(shortcut).join("+");

        for (let i = this.shortcutslist.length - 1; i > -1; i--) {
          const element = this.shortcutslist[i];

          if (
            element.shortcut.join("+") === shortcut &&
            ((callback !== undefined &&
              element.callback.toString() === callback.toString()) ||
              callback === undefined)
          ) {
            this.shortcutslist.splice(i, 1);
            findANDdeleted = true;
          }
        }
      }
    } else if (shortcut.indexOf(",") !== -1) {
      if (callback === "all" || (callback === undefined && shortcut === ",")) {
        this.combo = [];
        findANDdeleted = true;
      } else {
        shortcut = this.supervise(shortcut).join(",");

        for (let i = this.combo.length - 1; i > -1; i--) {
          const combo = this.combo[i];
          if (
            combo.combo.join(",") === shortcut &&
            ((callback !== undefined &&
              combo.callback.toString() === callback.toString()) ||
              callback === undefined)
          ) {
            this.combo.splice(i, 1);
            findANDdeleted = true;
          }
        }
      }
    } else if (shortcut.indexOf("=>") !== -1) {
      if (callback === "all" || (callback === undefined && shortcut === "=>")) {
        this.holdingActions = [];
        findANDdeleted = true;
      } else {
        shortcut = this.supervise(shortcut);

        for (let i = this.holdingActions.length - 1; i > -1; i--) {
          const action = this.holdingActions[i];

          if (
            action.key === shortcut[0] &&
            action.duration === shortcut[1] &&
            ((callback !== undefined &&
              action.callback.toString() === callback.toString()) ||
              callback === undefined)
          ) {
            this.holdingActions.splice(i, 1);
            findANDdeleted = true;
          }
        }
      }
    }

    return findANDdeleted;
  },
  /**
   * Check whether shortcut/keysmap/holdAction already under use or not!
   * @method Qway#check
   * @param {string} shortcut
   * @returns {number}
   */
  check: function (shortcut) {
    if (shortcut.indexOf("+") !== -1) {
      return this.shortcutslist.findIndex(
        (a) => a !== undefined && a.shortcut.join("+") === shortcut
      );
    } else if (shortcut.indexOf(",") !== -1) {
      return this.combo.findIndex(
        (a) => a !== undefined && a.combo.join(",") === shortcut
      );
    } else if (shortcut.indexOf("=>") !== -1) {
      return this.holdingActions.findIndex(
        (a) => a !== undefined && a.key === shortcut
      );
    } else {
      return this.shortcutslist.findIndex(
        (a) => a !== undefined && a.shortcut[0] === shortcut
      );
    }
  },
  /**
   * Does check a shortcut whether is proper form and can be used or, a proper form shortcut
   * contains only existing system keys, and only one type of seperator so it's type can be identified
   * which could be:
   *  - `shortcut` : if the keys seperator is `+` sign
   *  - `combo` : if the keys seperator is `,`  comma
   *  - `holdAction` : if the keys seperator is `=>` sign
   *
   * also the function does fix the shortcut in some parts!
   * you don't usually invoke this function as it's used internally.
   * @method Qway#supervise
   * @param {string} shortcut
   * @returns {Array} if shortcut fit the terms then it returned in an array otherwise
   * false is returned!
   */
  supervise: function (shortcut) {
    if (
      shortcut.indexOf(",") !== -1 &&
      (shortcut.indexOf("+") !== -1 || shortcut.indexOf("=>") !== -1)
    ) {
      return false;
    }

    if (
      shortcut.indexOf("+") !== -1 &&
      (shortcut.indexOf(",") !== -1 || shortcut.indexOf("=>") !== -1)
    ) {
      return false;
    }

    if (
      shortcut.indexOf("=>") !== -1 &&
      (shortcut.indexOf("+") !== -1 || shortcut.indexOf(",") !== -1)
    ) {
      return false;
    }

    var error = false;

    if (shortcut.indexOf("+") !== -1) {
      shortcut = shortcut.split("+");
      for (let i = 0; i < shortcut.length; i++) {
        if (shortcut[i] === "control") {
          shortcut[i] = "ctrl";
        }

        if (shortcut[i] === " ") {
          shortcut[i] = "space";
        }

        shortcut[i] = shortcut[i].toLowerCase();

        if (this.KEYS.indexOf(shortcut[i]) === -1) {
          error = true;
          break;
        }
      }

      return error ? false : shortcut;
    } else if (shortcut.indexOf(",") !== -1) {
      shortcut = shortcut.split(",");
      var res = [];
      for (let i = 0; i < shortcut.length; i++) {
        var key;

        key = shortcut[i] === " " ? "space" : shortcut[i].trim().toLowerCase();
        key = key === "control" ? "ctrl" : key;

        if (key.indexOf("*") !== -1) {
          key = key.split("*");
          times = parseFloat(key[1]);
          name = key[0].trim();

          if (this.KEYS.indexOf(name) === -1) {
            error = true;
            break;
          }

          for (let j = 0; j < times; j++) {
            res.push(name);
          }
        } else {
          res.push(key);
          if (this.KEYS.indexOf(key) === -1) {
            error = true;
            break;
          }
        }
      }

      return error ? false : res;
    } else if (shortcut.indexOf("=>") !== -1) {
      shortcut = shortcut.split("=>");
      var duration = parseFloat(shortcut[1]);
      var key = shortcut[0];

      key = key === " " ? "space" : key.trim().toLowerCase();
      key = key === "control" ? "ctrl" : key;

      if (this.KEYS.indexOf(key) === -1) {
        return false;
      }

      return this.KEYS.indexOf(key) === -1 ? false : [key, duration];
    } else {
      shortcut = shortcut === " " ? "space" : shortcut.trim().toLowerCase();
      shortcut = shortcut === "control" ? "ctrl" : shortcut;

      return this.KEYS.indexOf(shortcut) === -1
        ? false
        : {
            shortcut: shortcut,
            callback: null,
          };
    }
  },
  /**
   * Returns an object that can be easily saved inside a JSON file, this helps saving
   * the user preferences if you are creating an app!
   *
   * also the function `initiate` suppose to take as parameter the return of this function
   * as to load back the state.
   * @method Qway#pack
   * @returns {object}
   */
  pack: function () {
    return {
      duplicates: this.duplicates,
      shortcut: this.shortcutslist,
      holdingActions: this.holdingActions,
      shortcutActivated: this.shortcutActivated,
      comboActivated: this.comboActivated,
      combo: this.combo,
    };
  },
  /**
   * Load the shortcut list and the combo and all preferences from an object, usually this
   * object is parsed from a JSON file, as to save and load back the state.
   * @method Qway#initiate
   * @param {object} obj
   */
  initiate: function (obj) {
    this.duplicates = obj.duplicates || false;
    this.shortcutslist = obj.shortcut || [];
    this.combo = obj.combo || [];
    this.holdingActions = obj.holdingActions || [];
    this.comboActivated = obj.comboActivated || true;
    this.shortcutActivated = obj.shortcutActivated || true;
  },
  /**
   * Used to handle window blur event, invoked internally by the system
   * @method Qway#blur
   */
  blur: function () {
    for (let i = 0; i < this.shortcutslist.length; i++) {
      this.shortcutslist[i].progress.fill(
        false,
        0,
        this.shortcutslist[i].progress.length
      );
    }
    for (let i = 0; i < this.combo.length; i++) {
      this.combo[i].progress = "";
    }
    for (let i = 0; i < this.holdingActions.length; i++) {
      if (this.holdingActions[i].timeout !== null) {
        clearTimeout(this.holdingActions[i].timeout);
        this.holdingActions[i].timeout = null;
      }
    }

    this.intercativeMode = false;
    this.toBuild = [[], []];
  },
};

// import jcall from "jcall";

/**
 * @typedef {Object} AttrMap
 * @property {HTMLDivElement} parent - append newly created element to a parent
 * @property {Array<String>|String} class - class or array of classes to set
 * @property {String} id - set element ID
 * @property {Object} data - dataset values to set
 * @property {String} text - set element text
 * @property {String} html - set element html
 * @property {{ request: String, data: Object, callback: Function}} refresh - attached a refreshable context
 *
 */

/**
 * @typedef {Object} EyeElement
 * @property {(tag: String, attrs: AttrMap) => EyeElement} eye - The main function to create or select elements.
 * @property {(set_to?: string) => EyeElement} show - Show the element, optional customize the display value, inline-bloc, bloc.... .
 * @property {() => EyeElement} hide - Hide the element.
 * @property {(index: number) => EyeElement} child - Function to get a child element by index.
 * @property {(key: String, value: *) => EyeElement} refer - Set or get a hidden WeakMap attributes
 * @property {(key: String, subfind: number) => EyeElement} unrefer - Remove/unset a WeakMap attributes, optionally `subfind` it if array is set!
 * @property {(event: String, callback: Function) => EyeElement} on - Attach an event listener to `event`
 * @property {(parent: HTMLElement) => EyeElement} appendTo - Append this element to an other
 * @property {(key: String, value: String) => EyeElement|String} attr - Set or get a value of certain attribute
 * @property {(key: String, value: String) => EyeElement|string} css - Modify or get element style
 * @property {(key: string, value: string) => DOMStringMap|string} data - Set or get a dataset value of the attribute
 * @property {(value: String) => EyeElement|string} text - Set or get elements text content
 * @property {(value: String) => EyeElement|string} html - Set or get elements html content
 * @property {Function} [eventName] - Functions for various events (e.g., click, focus, etc.).
 * @property {boolean} isEyeInstance - Flag to check if the element is an Eye instance.
 * @property {(action: String, value: String, opt?: String)=> boolean} class - perform class manipulation
 * @property {*} refresh - under consrtuction
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
  "base",
  "head",
  "link",
  "meta",
  "style",
  "title",

  // Sections
  "body",
  "address",
  "article",
  "aside",
  "footer",
  "header",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "main",
  "nav",
  "section",

  // Text content
  "blockquote",
  "dd",
  "div",
  "dl",
  "dt",
  "figcaption",
  "figure",
  "hr",
  "li",
  "ol",
  "p",
  "pre",
  "ul",

  // Inline text semantics
  "a",
  "abbr",
  "b",
  "bdi",
  "bdo",
  "br",
  "cite",
  "code",
  "data",
  "dfn",
  "em",
  "i",
  "kbd",
  "mark",
  "q",
  "rp",
  "rt",
  "ruby",
  "s",
  "samp",
  "small",
  "span",
  "strong",
  "sub",
  "sup",
  "time",
  "u",
  "var",
  "wbr",

  // Image and multimedia
  "area",
  "audio",
  "img",
  "map",
  "track",
  "video",

  // Embedded content
  "embed",
  "iframe",
  "object",
  "picture",
  "portal",
  "source",

  // Scripting
  "canvas",
  "noscript",
  "script",

  // Demarcating edits
  "del",
  "ins",

  // Table content
  "caption",
  "col",
  "colgroup",
  "table",
  "tbody",
  "td",
  "tfoot",
  "th",
  "thead",
  "tr",

  // Forms
  "button",
  "datalist",
  "fieldset",
  "form",
  "input",
  "label",
  "legend",
  "meter",
  "optgroup",
  "option",
  "output",
  "progress",
  "select",
  "textarea",

  // Interactive elements
  "details",
  "dialog",
  "summary",

  // Web components / scripting base
  "slot",
  "template",
];
const hiddenAttributes = new WeakMap();

function flat(word) {
  let n = "";
  for (let i = 0; i < word.length; i++) {
    const t = word[i];
    if (t === t.toUpperCase() && t !== t.toLowerCase()) n += "-" + t;
    else n += t;
  }
  return n.toLowerCase();
}
/**
 * Creates or select nodes using css selectors, offering a pack of useful functions to use around your code!
 * @param {String} tag
 * @param {AttrMap} attrs
 * @param {*} css CSS styles to be applied to the element.
 * @returns
 */
function eye(tag, attrs, css) {
  if (css instanceof Array) children = css;
  /**
   * @type {EyeElement}
   */
  let elm,
    selectFunc = "querySelector",
    parent = this === undefined || this instanceof Window ? document : this;

  if (tag instanceof HTMLElement) elm = tag;
  else {
    // there is three cases
    if (attrs && attrs.all === true)
      // CASE 1: parent is not docuement & all=true
      selectFunc = "querySelectorAll";
    if (parent == document && htmlElements.indexOf(tag) != -1)
      // CASE 3: parent is document & user input a tag name
      selectFunc = "createElement";

    elm = parent[selectFunc](tag);
  }

  if (elm instanceof NodeList) {
    elm.forEach((nd) => eye(nd));
    // for nodelist there's some other available functions
    return [...elm];
  }

  if (!elm) return null;
  if (elm.isEyeInstance) return elm;

  elm.isEyeInstance = true;
  // adding a very special function
  elm.eye = eye;

  // adding the element itself
  // usuage:
  // item.set("id=menu-item","contentEditable=true","data-index=15",...);
  elm.set = function (value, ...args) {
    args.push(value);
    args.forEach((arg) => {
      if (arg.indexOf("=") != -1) {
        const [key, val] = arg.split("=");
        if (key.indexOf("data-") === 0) {
          this.dataset[flat(key.replace("data-", ""))] = val;
        } else {
          this.setAttribute(key, val);
        }
      } else if (arg.indexOf(":") != -1) {
        const [key, val] = arg.split(":");
        this.style[flat(key)] = val;
      } else this.setAttribute(arg, "");
    });

    return this;
  };

  elm.class = function (actions) {
    let vals = null;
    if (typeof actions === "number") return elm.classList.item(actions);
    
    actions.split(" ").forEach((action) => {
      if (action[0] == "-") {
        elm.classList.remove(action.substring(1, action.length));
      } else if (action[0] == "%") {
        elm.classList.toggle(action.substring(1, action.length));
      } else if (action[0] == "?") {
        vals = elm.classList.contains(action.substring(1, action.length));
      } else if (action.indexOf("/") != -1) {
        [v1, v2] = action.split("/");
        elm.classList.replace(v1, v2);
      } else {
        elm.classList.add(action.substring(1, action.length));
      }
    });

    return vals !== null ? vals : this;
  };

  elm.show = function (set_to) {
    this.style.display = set_to || "";
    return this;
  };

  elm.hide = function () {
    this.style.display = "none";
    return this;
  };

  elm.child = function (index) {
    return this.children[index] ? eye(this.children[index]) : null;
  };

  elm.refer = function (key, value) {
    if (value !== undefined) {
      let attr = hiddenAttributes.get(this);
      if (!attr) {
        attr = {};
        hiddenAttributes.set(this, attr);
      }

      // now a small check
      if (value instanceof Array) {
        // if value is instance of array means we're defining an array property of adding to one
        if (attr[key] instanceof Array) attr[key].push(value[0]);
        else attr[key] = [value[0]];
      } else attr[key] = value;
      return this;
    } else return hiddenAttributes.get(this)?.[key];
  };
  elm.unrefer = function (key, subfind) {
    let attr = hiddenAttributes.get(this);
    if (attr) {
      if (!subfind && typeof key === "string" && attr[key])
        attr[key] = undefined;
      else if (typeof subfind === "function" && attr[key] instanceof Array)
        attr[key].forEach((item, i, arr) => {
          if (subfind(item) === true) {
            arr.splice(i, 1);
            i--;
          }
        });
    }

    return this;
  };

  // re-assinging events handling system
  events.forEach((ev) => {
    var old;
    if (typeof elm[ev] == "function") {
      old = elm[ev];
    }
    elm[ev] = function (cb) {
      if (cb) {
        if (typeof cb == "function") elm.addEventListener(ev, cb);
      } else old.call(elm);
      return this;
    };
  });

  elm.on = function (evs, listener) {
    evs = evs.split(" ");
    for (let j = 0; j < evs.length; j++) elm.addEventListener(evs[j], listener);
    return this;
  };

  elm.appendTo = function (parent) {
    if (parent) parent.append(this);
    return this;
  };

  elm.attr = function (key, value) {
    if (key) {
      if (value){
        if(value === false) this.removeAttribute(key);
        this.setAttribute(key, value);
      } else return this.getAttribute(key);
    }
    return this;
  };

  elm.css = function (key, value) {
    // usuage is wide customizable
    if (key) {
      if (value) elm.style[flat(key)] = value;
      else return this.style[flat(key)];
    }
    return this;
  };

  elm.data = function (key, value) {
    if (key) {
      if (value) this.dataset[key] = value;
      else return this.dataset[key];
    }
    return this.dataset;
  };

  elm.text = function (value) {
    if (value) this.textContent = value;
    else return this.textContent;
    return this;
  };

  elm.html = function (value) {
    if (value) this.innerHTML = value;
    else return this.innerHTML;
    return this;
  };

  // setting attributes & css
  let parentElm = null;
  // let refresh = null;
  if (attrs)
    for (const key in attrs) {
      const value = attrs[key];
      if (key == "class")
        elm.classList.add.apply(
          elm.classList,
          value instanceof Array ? value : [value]
        );
      else if (key == "text") elm.textContent = value;
      else if (key == "html") elm.innerHTML = value;
      else if (key == "data") for (const k in value) elm.dataset[k] = value[k];
      else if (key == "parent") parentElm = value;
      // else if (key == "refresh") refresh = value;
      else if (key in elm) elm[key] = value;
      else elm.setAttribute(key, elm);
    }
  if (css)
    for (const key in css)
      if (key.indexOf("-") != -1) elm.style[key] = css[key];
      else elm.style[flat(key)] = css[key];

  // under construction
  // elm.refresh = function () {
  //   if (refresh) {
  //     const { request, data, callback } = refresh;
  //     if (typeof data === "function") data = data();
  //     jcall(request)
  //       .launch(data)
  //       .then(res => {
  //         callback(undefined, res);
  //       }).catch(e => {
  //         callback(e);
  //       })
  //   }
  // }

  if (parentElm) parentElm.append(elm);
  return elm;
}

// gloablly exposed
window.eye = eye;

// will be set to empty functions
const hmNoop = () => {};
// preparing the Qway functionalities
let keys = new Qway();

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
        eye("div", { class: "handy-minus", parent: decrease });
        eye("div", { class: "handy-plus1", parent: increase });
        eye("div", { class: "handy-plus2", parent: increase });

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

    if (type === "submenu") ; else {
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

export { handy as default };
//# sourceMappingURL=HandyMenue.esm.js.map

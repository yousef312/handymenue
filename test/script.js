import handy from "./HandyMenue.js";

const template = [
  {
    label: "Welcome",
    func: function (e) {
      alert("hello dear user!");
    },
  },
  {
    label: "Reload",
    func: function () {
      let url = window.location;
      window.open(url, "_self");
    },
    accelerator: "Ctrl+R",
  },
  {
    label: "Disabled button",
    disabled: true,
    func: function () {
      alert("disabled button");
    },
  },
  {
    type: "separator",
    label: "Optional text",
  },
  {
    label: "Edit",
    type: "submenu",
    submenu: [
      {
        label: "Copy",
        accelerator: "Ctrl+C",
        func: function () {
          if (window.getSelection())
            if (window.getSelection().toString() != "") {
              copiedData = window.getSelection().toString();
            }
        },
      },
      {
        label: "Cut",
        accelerator: "Ctrl+X",
        func: function () {
          if (window.getSelection())
            if (window.getSelection().toString() != "") {
              copiedData = window.getSelection().toString();
            }
        },
      },
      {
        label: "Paste",
        accelerator: "Ctrl+V",
        func: function () {
          if (copiedData != "") {
            alert('The copied data is:\n"' + copiedData + '"');
          }
        },
      },
      {
        type: "separator",
      },
      {
        label: "Other Tools",
        type: "submenu",
        submenu: [
          {
            label: "Button 1",
          },
          {
            label: "Button 2",
          },
        ],
      },
    ],
  },
  {
    label: ["Coords on", "Coords off"],
    type: "check-box",
    name: "cheki",
    func: function (checked) {
      if (checked === true) {
        let coord = eye(
          "span",
          { id: "coords-show", parent: document.body },
          {
            position: "fixed",
            fontFamily: "monospace",
            borderRadius: "0 5px 5px 5px",
            padding: "3px",
            border: "1px solid black",
          }
        );
        window.addEventListener("mousemove", showcoord);
        function showcoord(e) {
          let x = e.clientX;
          let y = e.clientY;
          if (coord != undefined) {
            coord.css("left", x + 15 + "px");
            coord.css("top", y + 3 + "px");
            coord.text("X:" + x + "   Y:" + y);
            if (x > window.innerWidth - 100) coord.css("left", x - 100 + "px");
            if (y > window.innerHeight - 40) coord.css("top", y - 40 + "px");
          }
        }
      } else {
        let sc = eye("#coords-show");
        if (sc) sc.remove();
      }
    },
    func_off: function () {},
  },
  {
    label: "Save my name",
    type: "data-set",
    allowed: "*", // may take : 'a' or '1' anything else will be ignored
    func: function (e) {
      alert(`hello dear : ${e.data}`);
    },
  },
  {
    label: "Blender",
    type: "definition",
    def: `a blender usually is this machine in the kitchen that handle blending foods together to get a mixage of this foods, 
        a mixage could be juice or juicy foods...
        blender is special because of it's high speed and durability and sharpness of it's blades, 
        having a nice blender in your house will really help you a lot.
        go and buy one!`,
  },
  {
    label: "New page",
    icon: "./icon1.png",
    func: function () {
      console.log("hello");
      window.open();
    },
    accelerator: "Ctrl+P",
  },
  {
    label: "Send Notification",
    func: function () {
      alert(
        "[NOTIFICATION]: \n sent by handymenu..\ncheck more functionalities!"
      );
    },
    accelerator: "Ctrl+i",
  },
  {
    label: "Volume",
    type: "slider",
    range: [0, 100], //default [0,100]
    step: 2, //default is 2
    format: "_value_%",
    default: 50,
    func: function (volume) {
      console.log("setting volume to .. " + volume);
    },
  },
  {
    label: "Small icons",
    type: "radio-button",
    name: "hi",
    func: function () {
      alert("Small icons are choosen:");
    },
  },
  {
    label: "Big icons",
    type: "radio-button",
    name: "hi",
    default: true,
    func: function () {
      alert("Big icons are choosen");
    },
  },
  {
    label: "Find boby",
    func: function () {
      console.log("here is boby!");
    },
    accelerator: "Ctrl+Q",
  },
];

const props = {
  bars: 5,
  spacing: 30,
  id: "HandyMenue",
};

let menu = handy(template, props);

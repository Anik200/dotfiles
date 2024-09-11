import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import App from 'resource:///com/github/Aylur/ags/app.js';
import * as Utils from 'resource:///com/github/Aylur/ags/utils.js';
import Gdk from 'gi://Gdk';

/**
  * @param {number} length
  * @param {number=} start
  * @returns {Array<number>}
  */
export function range(length, start = 1) {
    return Array.from({ length }, (_, i) => i + start);
}

/**
  * @param {(monitor: number) => any} widget
  * @returns {Array<import('types/widgets/window').default>}
  */
export function forMonitors(widget) {
    const n = Gdk.Display.get_default()?.get_n_monitors() || 0;
    // Creates a new array from the array of monitor numbers using the widget as a function for each number
    return range(n, 0).map(widget).flat(1);
}

function ClickSpace(window){
    return Widget.EventBox({
        vexpand: true,
        hexpand: true,
        on_primary_click: () => App.closeWindow(window),
    })
}

// This only works with top right windows right now
// More info https://github.com/Aylur/dotfiles/blob/main/ags/widget/PopupWindow.ts
// Valid layouts: top-right, top-left, top-center
export function CloseOnClickAway(windowName, content, layout) {
    if (layout === "top-right") {
        return Widget.Box({
            children: [
                ClickSpace(windowName),
                Widget.Box({
                    vertical: true,
                    hexpand: false,
                    children: [
                        content,
                        ClickSpace(windowName)
                    ]
                }),
            ],
        })
    }
    else if (layout === "top-center") {
        return Widget.Box({
            children: [
                ClickSpace(windowName),
                Widget.Box({
                    vertical: true,
                    hexpand: false,
                    children: [
                        content,
                        ClickSpace(windowName),
                    ]
                }),
                ClickSpace(windowName),
            ],
        })
    }
    else if (layout === "top-left") {
        return Widget.Box({
            children: [
                Widget.Box({
                    vertical: true,
                    hexpand: false,
                    children: [
                        content,
                        ClickSpace(windowName)
                    ]
                }),
                ClickSpace(windowName),
            ],
        })
    }
    else {
        console.log("Error: Invalid layout for CloseOnClickAway()")
    }
}

export function SecToHourAndMin(seconds){
    var minutesRaw = Math.floor(seconds / 60) 
    var minutes = minutesRaw % 60
    var hours = Math.floor(minutesRaw / 60) 
    return `${hours} hours, and ${minutes} minutes`
}

export function CircleButton(icon, action, params){
    function ActionParsed(){
        print("params: " + params)
        if ( params != null || params != undefined){
            return action(...params)
        }
        else{
            return action()
        }
    }
    return Widget.Button({ 
        class_name: "circle-button",
        vpack: "center",
        vexpand: false,
        hpack: "start",
        hexpand: false,
        on_primary_click: () => ActionParsed(),
        child: Widget.Icon({
            icon: icon,
        }),
    })
}



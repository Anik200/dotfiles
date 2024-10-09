
import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import App from 'resource:///com/github/Aylur/ags/app.js';
import Variable from 'resource:///com/github/Aylur/ags/variable.js';
import Hyprland from 'resource:///com/github/Aylur/ags/service/hyprland.js';
import { locationSearch } from '../Modules/Weather.js'
import icons from '../icons.js';
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import { exec, writeFile, readFile } from 'resource:///com/github/Aylur/ags/utils.js'

import { Options, data } from '../Options/options.js'

const { Gtk } = imports.gi;

const gapsInSpinButton = Widget.SpinButton({
    hpack: "start",
    value: 20,
    range: [0, 100],
    increments: [1, 5],
    onValueChanged: ({ value }) => {
        print(value)
    },
})

const gapsOutSpinButton = Widget.SpinButton({
    hpack: "start",
    range: [0, 100],
    increments: [1, 5],
    onValueChanged: ({ value }) => {
        print(value)
        gapsWorkspacesSlider.value = 900 // This works for setting initial value
    },
})
const gapsWorkspacesSlider = Widget.Slider({
    class_name: "sliders",
    onChange: ({ value }) => print(value),
    //vertical: true,
    hexpand: true,
    //value: 40,
    min: 800,
    max: 1000,
    value: 900,
    setup: (self) => {
        self.value = 900
    }
})

function CreateOptionWidget(type, minValue, maxValue){
    print("type = " + type)
    switch(type){
        case "slider":
            print("Creating slider")
            return Widget.Slider({
                class_name: "sliders",
                onChange: ({ value }) => print(value),
                hexpand: true,
                min: minValue,
                max: maxValue,
                step: 1, // Only works for keybinds?
            })
            break
        case "switch":
            return Widget.Switch({
                class_name: "switch-button",
                hpack: "end",
            })
            break
        case "spin":
            print("Creating spin button")
            return Widget.SpinButton({
                class_name: "spin-button",
                hpack: "end",
                range: [minValue, maxValue],
                increments: [1, 5],
                onValueChanged: ({ value }) => {
                    print(value)
                },
            })
            break
        default:
            print("Invalid CreateOptionWidget() type")
    }
}



export const generalFlowBox = Widget.FlowBox({
    vpack: "start",
    max_children_per_line: 1,
})
//generalFlowBox.add(locationSearch)


// Load in options as widgets
for (let key in Options){
    let opt = Options[key]
    let widget = CreateOptionWidget(opt.type, opt.min, opt.max)
    let label = Widget.Label({
        label: opt.name,
        hpack: "start",
    })

    // Add created widget to option object
    Options[key].widget = widget 

    // Add widget to box
    generalFlowBox.add(Widget.CenterBox({
        class_name: "option-container",
        startWidget: label,
        endWidget: widget,
    }))

    // Set widget with value from json based on type
    if (opt.type === "spin" || opt.type === "slider"){
        Options[key].widget.value = data.options[opt.identifer]
    }
    else if (opt.type === "switch"){
        Options[key].widget.active = data.options[opt.identifer]
    }

    print("Loaded option: " + opt.name)    
}


// Logging
/*
for (let key in Options){
    print(key)
    print(userSettingsJson.options[key])
}
*/

function ApplySettings(){

    // Contents to write to file
    let contents = " \n"

    // Generate option literals
    for (let key in Options){
        print("key = " + key)
        let opt = Options[key]

        // Read in user settings
        //let data = JSON.parse(Utils.readFile(`${App.configDir}/../../.cache/ags/UserSettings.json`))
        let data = userSettingsJson

        print("Before | data.options[key]: " + data.options[key])
        if (opt.type === "spin" || opt.type === "slider"){
            // Update value in settings json cache
            data.options[key] = Options[key].widget.value
            // Get current value from associated widget
            //Options[key].value = Options[key].widget.value  
            contents = contents.concat(opt.before + Options[key].widget.value + opt.after + "\n")
        }
        else if (opt.type === "switch"){
            // Update value in settings json cache
            data.options[key] = Options[key].widget.active
            // Get current value from associated widget
            //Options[key].value = Options[key].widget.active  
            contents = contents.concat(opt.before + Options[key].widget.active + opt.after + "\n")
        }

        print("After | data.options[key]: " + data.options[key])
    
        let dataOut = JSON.stringify(data)
        // Write out user settings
        Utils.writeFileSync(dataOut, `${App.configDir}/../../.cache/ags/UserSettings.json`)
    }
    print("contents = " + contents)

    // Write out new settings file
    Utils.writeFile(contents, `${App.configDir}/../../.cache/hypr/userSettings.conf`)
        .then(file => print('Settings file updated'))
        .catch(err => print(err))

    // Reload hyprland config
    Hyprland.messageAsync(`reload`)
}

export const ApplyButton = () => Widget.Button({
    class_name: "normal-button bg-button",
    vpack: "center",
    hpack: "end",
    on_primary_click: () => ApplySettings(),
    child: Widget.Label("Apply"),
})

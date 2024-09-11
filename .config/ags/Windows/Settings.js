// This can be used to launch window from this file
//#!/usr/bin/env -S ags -b "settings" -c

import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import App from 'resource:///com/github/Aylur/ags/app.js';
import Variable from 'resource:///com/github/Aylur/ags/variable.js';

import { WifiList } from '../Modules/Network.js';

import { VolumeSlider, VolumeMenu, MicrophoneMenu, MicrophoneSlider } from '../Modules/Audio.js';
import { Refresh, BluetoothStatus, BluetoothPanelButton, BluetoothConnectedDevices, BluetoothDevices, BluetoothDevice } from '../Modules/Bluetooth.js';
import icons from '../icons.js';

const { Gtk } = imports.gi;

const Window = Widget.subclass(Gtk.Window, "Window");
const SettingsTab = Variable("General", {})


import { generalFlowBox, ApplyButton } from '../Modules/Settings.js'


// Testing
const colorbutton = Widget.ColorButton({
    onColorSet: ({ rgba: { red, green, blue, alpha } }) => {
        print(`rgba(${red * 255}, ${green * 255}, ${blue * 255}, ${alpha})`)
    },
})
const fontbutton = Widget.FontButton({
    onFontSet: ({ font }) => {
        print(font)
    },
})
const switchButton = Widget.Switch({
    onActivate: ({ active }) => print(active),
})
const togglebutton = Widget.ToggleButton({
    onToggled: ({ active }) => print(active),
})
const spinner = Widget.Spinner()

const tabs = [
    "General",
    "Display",
    "Appearance",
    "Network",
    "Bluetooth",
    "Devices",
    "Sound",
    "About",
]

const Tab = (t) => Widget.Button({
    class_name: "settings-tab-button",
    css: `
        margin-right: 1rem;
    `,
    on_primary_click: (self) =>{
        print(t)
        SettingsTab.value = t
    },
    setup: (self) => {
        // Highlight current tab on startup
        print("t = " + t)
        print("SettingsTab.value = " + SettingsTab.value)
        if (t === SettingsTab.value){
            self.toggleClassName("settings-tab-active", true)
        }
        self.hook(SettingsTab, (self) => {
            self.toggleClassName("settings-tab-active", t === SettingsTab.value)
        }, "changed")
    },
    child: Widget.Label({
        label: t,
    }),

})

const Tabs = () => Widget.Box({
    vertical: true,
    class_name: "tab-container",
    children: tabs.map(Tab)
})


function Container(name, contents){
    return Widget.Box({
        class_name: "padder",
        vertical: true,
        hexpand: true,
        children: [
            Widget.CenterBox({
                startWidget: Widget.Label({
                    label: name,
                    class_name: "header",
                    hpack: "start",
                }),
                endWidget: ApplyButton(),
            }),
            /*
            Widget.Separator({
                class_name: "horizontal-separator",
            }),
            */
            contents,
        ],
    })
}


function SectionHeader(name){ 
    return Widget.Box({
        css: `
            margin-top: 0.6rem;
            margin-bottom: 0.6rem;
        `,
        vertical: true,
        children: [
            Widget.Label({
                class_name: "sub-header",
                hpack: "start",
                label: name,
            }),
            /*
            Widget.Separator({
                class_name: "horizontal-separator",
            }),
            */
        ],
    })
}

const generalContents = Widget.Scrollable({
    hscroll: 'never',
    vscroll: 'always',
    vexpand: true,
    child: generalFlowBox,
})

const testContents = () => Widget.Box({
    vertical: true,
    children: [
        Widget.Label({
            label: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?",
            wrap: true,
        }),
        Widget.Button({
            hpack: "fill",
            class_name: "shadow-button",
            child: Widget.Label("Button"),
        }),
    ]
})

const networkContents = Widget.Box({
    children: [
        WifiList(),
    ]
})

const bluetoothContents = Widget.Box({
    vertical: true,
    children: [
        BluetoothStatus(),
        BluetoothConnectedDevices(),
        BluetoothDevices(),
        BluetoothDevice(),
    ],
})

const soundContents = Widget.Box({
    vertical: true,
    children: [
        SectionHeader("Volume"),
        VolumeMenu(), 
        SectionHeader("Microphone"),
        MicrophoneMenu(),
    ]
})


const TabContainer = () => Widget.Stack({      
    // Tabs
    children: {
        'General': Container("General", generalContents),
        'Display': Container("Display", generalContents),
        'Appearance': Container("Appearance", testContents()),
        'Network': Container("Network", networkContents),
        'Bluetooth': Container("Bluetooth", bluetoothContents),
        'Devices': Container("Devices", testContents()),
        'Sound': Container("Sound", soundContents),
        'About' : Container("About", testContents()),
    },
    transition: "slide_up_down",

    // Select which tab to show
    setup: self => self.hook(SettingsTab, () => {
        self.shown = SettingsTab.value;
    })
})

export const SettingsToggle = Widget.Button({
    class_name: "normal-button",
    on_primary_click: () => {
        App.closeWindow("Settings")
        App.closeWindow("ControlPanel")
        App.openWindow("Settings")   
    },
    child: Widget.Icon({
        size: 20,
        icon: icons.settings,
    })
})

export const Settings = () => Window({
    name: "Settings",
    child: Widget.Box({
        class_name: "normal-window",
        children: [
            Tabs(),
            TabContainer(),
        ],
    }),
    setup: (self) => {
        self.show_all();
        self.visible = false;
        self.on("delete-event", () => {
            App.closeWindow("Settings")
            return true
        })
    },
});


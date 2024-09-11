
//////////////////////////////////////////////////////////////////
// Imports
//////////////////////////////////////////////////////////////////
import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import { exec, execAsync } from 'resource:///com/github/Aylur/ags/utils.js';
import App from 'resource:///com/github/Aylur/ags/app.js';
import Battery from 'resource:///com/github/Aylur/ags/service/battery.js';
import Gtk from 'gi://Gtk'

// Modules
import { brightness } from '../Modules/Display.js';
import { VolumeSlider, VolumeMenu, MicrophoneMenu, MicrophoneSlider } from '../Modules/Audio.js';
import { NetworkBack, WifiSwitch, WifiStatus, CurrentNetwork, wifiButton2x1, RefreshWifi, WifiPanelButton, ssid, WifiIcon, WifiList, AccessPoint} from '../Modules/Network.js';
import { BluetoothBack, bluetoothButton2x1, Refresh, BluetoothStatus, BluetoothPanelButton, BluetoothMenu, BluetoothDevice } from '../Modules/Bluetooth.js';
import { BatteryWidget } from '../Modules/Battery.js';
import { systemStatsBox2x2, GPUWidget } from '../Modules/SystemStats.js';
import { ThemeButton, ThemeMenu } from '../Modules/Theme.js'
import { DisplayButton } from '../Modules/Display.js';
import { PowerProfilesButton } from '../Modules/Power.js';
import { NightLightButton } from '../Modules/NightLight.js';
import { CloseOnClickAway } from '../Common.js';
import { ScreenRecordButton } from '../Modules/ScreenCapture.js';
import { Settings, SettingsToggle } from '../Windows/Settings.js';
import { togglePowerMenu } from '../Modules/Power.js';
import { UserInfo } from '../Modules/User.js';

import { ControlPanelTab, ControlPanelNetworkTab, ControlPanelBluetoothTab } from '../Global.js';
import { opt } from '../Options/options.js';
import icons from '../icons.js';
import { CircleButton } from './../Common.js';

//////////////////////////////////////////////////////////////////
// Constants
//////////////////////////////////////////////////////////////////
const WINDOW_NAME = "ControlPanel"
const GRID_SPACING = 4


//////////////////////////////////////////////////////////////////
// Helper functions
//////////////////////////////////////////////////////////////////

// Make widget a formated button with action on click
export function ControlPanelButton(widget, w, h, action) {
    const button = Widget.Button({
        class_name: "control-panel-button",
        on_clicked: action,
        css: `
            min-width: ${w}rem;
            min-height: ${h}rem;
        `,
        widget,
    })
    return button;
}

// Make widget a formated box
export function ControlPanelBox(widget, w, h) {
    const box = Widget.Box({
        class_name: "control-panel-box",
        css: `
            min-width: ${w}rem;
            min-height: ${h}rem;
        `,
        children: [ widget ],
    })
    return box;
}



const grid = new Gtk.Grid()
// Usage:
//     Grid.attach(columnNum, rowNum, widthNum, heighNum)


//////////////////////////////////////////////////////////////////
// Create control panel widgets to add to the main grid 
//////////////////////////////////////////////////////////////////

// Wireless
const wirelessGrid = new Gtk.Grid()
const wirelessWidget = ControlPanelBox(
    Widget.Box({
        hpack: "center",
        vpack: "center",
        hexpand: true,
        vertical: true,
        children: [
            wifiButton2x1,
            bluetoothButton2x1,
        ],
    }),
    opt.xlarge,
    opt.large,
)

const systemStatsWidget = ControlPanelBox(
    systemStatsBox2x2,
    opt.xlarge,
    opt.large,
)

const buttonGrid = new Gtk.Grid()
buttonGrid.attach(NightLightButton(opt.small, opt.small), 1, 1, 1, 1)
buttonGrid.attach(PowerProfilesButton(opt.small, opt.small), 1, 2, 1, 1)
buttonGrid.attach(ThemeButton(opt.small, opt.small), 2, 1, 1, 1)
buttonGrid.attach(ScreenRecordButton(opt.small, opt.small), 2, 2, 1, 1)

const sliders = Widget.Box({
    class_name: "control-panel-box",
    css: `
        padding: 0.6rem;
    `,
    vertical: true,
    spacing: 8,
    children: [
        brightness(),
        VolumeSlider(),
        MicrophoneSlider(),
    ]
})

const bottom = Widget.CenterBox({
    hexpand: true,
    css: `
        min-height: ${opt.xsmall}rem;
    `,
    class_name: `control-panel-box`,
    startWidget: UserInfo,
    centerWidget: Widget.Label(''),
    endWidget: Widget.Box({
        hpack: "end",
        children: [
            SettingsToggle,
            Widget.Separator({class_name: "vertical-separator"}),
            togglePowerMenu,
        ],
    }),
})

// Row 1
const row1 = new Gtk.Grid()
row1.attach(wirelessWidget, 1, 1, 1, 1)
row1.attach(buttonGrid, 2, 1, 1, 1)

// Row 2
const row2 = new Gtk.Grid()
row2.attach(sliders, 1,2,2,1)

// Row 3
const row3 = new Gtk.Grid()
if (Battery.available){
    row3.attach(BatteryWidget(opt.large, opt.large), 1, 3, 1, 1)
}
else{
    row3.attach(GPUWidget(opt.large, opt.large), 1, 3, 1, 1)
}
row3.attach(systemStatsWidget, 2, 3, 1, 1)

// Row 4
const row4 = new Gtk.Grid()
row4.attach(bottom, 1,4,2,1)





//////////////////////////////////////////////////////////////////
// Setup submenus
//////////////////////////////////////////////////////////////////

/*
const BackButton = (dst = "main") => Widget.Button({
    class_name: `normal-button bg-button`,
    //hexpand: true,
    onClicked: () => {
        ControlPanelTab.setValue(dst)
    },
    child: Widget.Icon({
        icon: icons.back,
    }),
})
*/

const SetTab = (dst) => {
    ControlPanelTab.setValue(dst)
}

const BackButton = (dst = "main", customCallback = null) => {
    if (customCallback == null){
        return CircleButton(icons.back, SetTab, [dst])
    }
    return CircleButton(icons.back, customCallback, [])
}




const mainContainer = () => Widget.Box({
    vertical: true,
    children: [
        row1,
        row2,
        row3,
        row4,
    ],
});

const networkMain = () => Widget.Box({
    vertical: true,
    spacing: 8,
    children: [
        CurrentNetwork(),
        Widget.Box({
            children:[
                Widget.Label({
                    label: "Available networks",
                    vpack: "center",
                    hpack: "start",
                }),
                Widget.Box({
                    hexpand: true,
                    hpack: "end",
                    vpack: "center",
                    children: [
                        RefreshWifi(),
                    ]
                }),
            ]
        }),
        WifiList(),
    ]
})

const networkContainer = () => Widget.Box({
    vertical: true,
    vexpand: false,
    spacing: 8,
    children: [
        Widget.Box({
            spacing: 8,
            children: [
                BackButton("n/a", NetworkBack), 
                WifiStatus(),
            ]
        }),

        Widget.Stack({
            // Tabs
            children: {
                'main': networkMain(),
                'ap': AccessPoint(),
            },
            transition: "slide_left_right",

            // Select which tab to show
            setup: self => self.hook(ControlPanelNetworkTab, () => {
                self.shown = ControlPanelNetworkTab.value;
            })
        })

    ],
})

const volumeContainer = () => Widget.Box({
    vertical: true,
    vexpand: false,
    spacing: 4,
    children: [
        BackButton(),
        VolumeMenu(), 
    ],
})

const microphoneContainer = () => Widget.Box({
    vertical: true,
    vexpand: false,
    children: [
        BackButton(),
        MicrophoneMenu(), 
    ],
})

const BTDevice = () => Widget.Box({
    vertical: true,
    vexpand: false,
    children: [
        BluetoothDevice(),
    ],
})

const bluetoothContainer = () => Widget.Box({
    spacing: 8,
    vertical: true,
    vexpand: false,
    children: [

        Widget.Box({
            spacing: 8,
            children: [
                BackButton("n/a", BluetoothBack), 
                BluetoothStatus(),
            ]
        }),

        Widget.Stack({
            // Tabs
            children: {
                'main': BluetoothMenu(),
                'device': BTDevice(),
            },
            transition: "slide_left_right",

            // Select which tab to show
            setup: self => self.hook(ControlPanelBluetoothTab, () => {
                self.shown = ControlPanelBluetoothTab.value;
            })
        })
    ],
})


const ThemeContainer = () => Widget.Box({
    vertical: true,
    vexpand: false,
    children: [
        Widget.Box({
            spacing: 8,
            children: [
                BackButton(),
                Widget.Label("Appearance"),
            ]
        }),
        ThemeMenu(),
    ],
})

// Container
const stack = Widget.Stack({
    // Tabs
    children: {
        'main': mainContainer(),
        'network': networkContainer(),
        'volume': volumeContainer(),
        'microphone': microphoneContainer(),
        'bluetooth': bluetoothContainer(),
        'theme': ThemeContainer(),
    },
    transition: "slide_left_right",

    // Select which tab to show
    setup: self => self.hook(ControlPanelTab, () => {
        self.shown = ControlPanelTab.value;
    })
})


const content = Widget.Revealer({
    revealChild: false,
    transitionDuration: 150,
    transition: "slide_left",
    setup: self => {
        self.hook(App, (self, windowName, visible) => {
            if (windowName === "ControlPanel"){
                self.revealChild = visible
                ControlPanelTab.setValue("main")
            }
        }, 'window-toggled')
    },
    child: Widget.Box({
        class_name: "toggle-window",
        children: [
            stack,
        ],
    }),
})

export const ControlPanelToggleButton = (monitor) => Widget.Button({
    class_name: 'launcher normal-button',
    on_primary_click: () => execAsync(`ags -t ControlPanel`),
    child: Widget.Label({
        label: ""
    }) 
});

export const ControlPanel = () => Widget.Window({
    name: WINDOW_NAME,
    css: `background-color: unset;`,
    visible: false,
    layer: "overlay",
    keymode: "exclusive",
    //anchor: ["top", "bottom", "right", "left"], // Anchoring on all corners is used to stretch the window across the whole screen 
    anchor: ["top", "left", "right"], // Debug mode
    exclusivity: 'normal',
    child: CloseOnClickAway("ControlPanel", content, "top-right"),
    setup: self =>  self.keybind("Escape", () => App.closeWindow(WINDOW_NAME)),
});



import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import Bluetooth from 'resource:///com/github/Aylur/ags/service/bluetooth.js'
import { exec, execAsync } from 'resource:///com/github/Aylur/ags/utils.js';
import { ControlPanelTab, ControlPanelBluetoothTab } from '../Global.js';
import { CircleButton } from './../Common.js';
import icons from '../icons.js';
import GObject from 'gi://GObject'

// Holds current bluetooth device selected
export const CurrentDevice = Variable({}, {})

var devices = []

export function BluetoothBack(){
    if (ControlPanelBluetoothTab.getValue() == "main"){
        // Go back to main control panel menu
        ControlPanelTab.setValue("main")
    }
    else{
        // Go back to main bluetooth control panel menu
        ControlPanelBluetoothTab.setValue("main")
    } 
}

export const BluetoothIcon = () => Widget.Icon().hook(Bluetooth, self  => {
    self.toggleClassName("dim", !Bluetooth.enabled)
    if(Bluetooth.enabled){
        self.icon = "bluetooth-active-symbolic" //"󰂯"
    }
    else{
        self.icon = "bluetooth-disabled-symbolic" //"󰂲"
    }
})


export function ToggleBluetooth(){
    if(Bluetooth.enabled){
        Bluetooth.enabled = false
    }
    else{
        Bluetooth.enabled = true
    }
}

export const BluetoothButton = () => Widget.Button({
    class_name: "normal-button",
    onPrimaryClick: () => {
        ToggleBluetooth()
    }, 
    child: BluetoothIcon(),
})

export const BluetoothPanelButton = (w, h) => Widget.Box({
    //class_name: "control-panel-button",
    css: `
        min-width: ${w}rem;
        min-height: ${h}rem;
    `,
    children: [
        Widget.Button({
            hexpand: true,
            class_name: "control-panel-sub-button round-left",
            onPrimaryClick: () => {
                ToggleBluetooth()
            }, 
            child: BluetoothIcon(),
        }),
        Widget.Button({
            hexpand: true,
            class_name: "control-panel-sub-button round-right",
            onPrimaryClick: () => {
                ControlPanelBluetoothTab.setValue("device")
            }, 
            child: Widget.Icon({
                icon: "view-more-symbolic",
                size: 24
            }),
        }),
    ],
})

const bluetoothStatus = Widget.Label({
    class_name: "sub-text",
    hpack: "start",
    label: "N/A",
    setup: (self) => {
        self.hook(Bluetooth, (self) => {
            let content = ""
            const connectedDevices = Bluetooth.connectedDevices
            if (!Bluetooth.enabled) {
                content = "Disabled"
            }
            else if (connectedDevices.length > 0) {
                content = connectedDevices.length + " Connected"
            }
            else {
                content = "Disconnected"
            }    
            self.label = content
        }, "changed")
    },
})

export const bluetoothButton2x1 = Widget.Box({
    children: [

        Widget.Button({         
            vpack: "center",
            class_name: "circle-button",
            onClicked: () => ToggleBluetooth(),
            child: BluetoothIcon(),
            setup: (self) => {
                self.hook(Bluetooth, (self) => {
                    self.toggleClassName("circle-button-active", Bluetooth.enabled)
                }, "changed")
            },
        }),
        Widget.Button({
            class_name: "normal-button",
            onClicked: () => ControlPanelTab.setValue("bluetooth"),
            child: Widget.Box({
                vertical: true,
                children: [
                    Widget.Label({
                        label: "Bluetooth",
                        hpack: "start",
                    }),
                    bluetoothStatus,
                ],
            })
        })
    ],
})


function device(d){
    if (d.name == null){
        return null
    }
    return Widget.Button({ 
        class_name: "normal-button bg-",
        onPrimaryClick: () => {
            CurrentDevice.value = d
            ControlPanelBluetoothTab.setValue("device")
        }, 
        child: Widget.CenterBox({
            startWidget: Widget.Label({
                hpack: "start",
                label: d.name
            }),
            endWidget: Widget.Box({
                hpack: "end",
                children: [
                    Widget.Icon({
                        icon: d.iconName + '-symbolic',
                    }),
                ],
            }),
        })
    })
}

export const BluetoothDevices = () => Widget.Box({
    vertical: true,
    hexpand: true,
    spacing: 8,
    children: [
        Widget.Label({
            hpack: "start",
            label: "Devices available",
        }),
        Widget.Scrollable({
            class_name: "container",
            css: `
                min-height: 100px;
            `,
            vexpand: true,
            child: Widget.Box({
                vertical: true,
            }).hook(Bluetooth, self => {
                self.children = Bluetooth.devices
                    .filter((d) => d.connected == false)
                    .map(device)
            })
        })
    ]
}) 


export const BluetoothConnectedDevices = () => Widget.Box({
    vertical: true,
    hexpand: true,
    spacing: 8,
    // Hides this widget if no devices are connected
    visible: Bluetooth.bind("connectedDevices").as(v => {
        if (v.length > 0){
            return true
        }
        return false
    }),
    children: [
        Widget.Label({
            hpack: "start",
            label: "Connected devices",
        }),

        Widget.Box({
            class_name: "container",
            vertical: true,
        }).hook(Bluetooth, self => {
            self.children = Bluetooth.connectedDevices.map(device)
        })
        /*
        Widget.Scrollable({
            class_name: "container",
            css: `
                min-height: 32px;
            `,
            child: Widget.Box({
                vertical: true,
            }).hook(Bluetooth, self => {
                self.children = Bluetooth.connectedDevices.map(device)
            })
        })
        */

    ]
})

export const BluetoothMenu = () => Widget.Box({
    vertical: true,
    spacing: 8,
    children: [
        BluetoothConnectedDevices(),
        BluetoothDevices(),
    ],
})
    
export const BluetoothSwitch = () => Widget.Switch({
    vpack: "center",
    setup: (self) => {
        // Syncs the active property on this switch to the enabled property on the Bluetooth GObject
        self.bind_property("active", Bluetooth, "enabled",  GObject.BindingFlags.BIDIRECTIONAL)
    },
})

export const Refresh = () => Widget.Button({
    class_name: "normal-button bg-button",
    // Scan for bt devices
    on_primary_click: () => execAsync("bluetoothctl --timeout 10 scan on"),
    child: Widget.Icon({
        size: 20,
        icon: icons.refresh,
    }),
})

function ForgetDevice(){
    let device = Bluetooth.getDevice(CurrentDevice.value.address)
    device.paired = false
}


export const BluetoothDevice = () => Widget.Box({
    vertical: true,
    spacing: 8,
    children: [
        Widget.Box({
            css: `margin-top: 2em;`,
            hpack: "center",
            spacing: 8,
            vertical: true,
            children: [
                Widget.Label({
                    class_name: "large-text",
                    hexpand: true,
                    hpack: "start",
                    tooltip_text: "Bluetooth device",
                    label: CurrentDevice.bind().as(d => d.name),
                }),
                Widget.Label({
                    hpack: "start",
                    label: CurrentDevice.bind().as(d => {
                        if (d.paired != null){
                            return "Paired"
                        }
                        return "Unpaired"
                    }),
                }),
            ]
        }),

        //Widget.Separator({class_name: "horizontal-separator"}),
        Widget.Box({
            children: [
                // Connect button
                Widget.Button({
                    hexpand: true,
                    class_name: "normal-button bg-button",
                    onPrimaryClick: () => { 
                        let device = Bluetooth.getDevice(CurrentDevice.value.address)
                        device.setConnection(true)
                        //CurrentDevice.value.setConnection(true)
                    },
                    child: Widget.Label({
                        label: "Connect"
                    })
                }),
                // Forget device
                CircleButton(icons.deleteItem, ForgetDevice, []),
            ],
        })
    ]
})


export const BluetoothStatus = () => Widget.Box({
    hexpand: true,
    spacing: 8,
    children: [
        Widget.Box({
            hpack: "start",
            hexpand: true,
            spacing: 8,
            children: [
                BluetoothIcon(),
                Widget.Label("Bluetooth"),
            ]
        }),
        Widget.Box({
            hpack: "end",
            hexpand: true,
            spacing: 8,
            children: [
                BluetoothSwitch(),
            ]
        }),
    ],
})

import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import Network from 'resource:///com/github/Aylur/ags/service/network.js';
import { ControlPanelTab, ControlPanelNetworkTab } from '../Global.js';
import { execAsync } from 'resource:///com/github/Aylur/ags/utils.js'
import { CircleButton } from './../Common.js';
import GObject from 'gi://GObject'

import icons from '../icons.js';

// Holds current wifi access point selected
const CurrentAP = Variable({}, {})

// Globals
var apPassword = ""

const Refresh = () => {
    print('Scaning for Wi-Fi access points')
    Network.wifi.scan()
}
export const RefreshWifi = () => CircleButton(icons.refresh, Refresh)

// Toggles wifi enabled state
function ToggleWifi(){
    if (Network.wifi.enabled){
        Network.wifi.enabled = false
    }
    else {
        Network.wifi.enabled = true
    }
}

// Return to correct network menu tab
export function NetworkBack(){
    if (ControlPanelNetworkTab.getValue() == "main"){
        // Go back to main control panel menu
        ControlPanelTab.setValue("main")
    }
    else{
        // Go back to main network control panel menu
        ControlPanelNetworkTab.setValue("main")
    }
}

export const WifiIcon = (isConnected, ap, size = 16) => Widget.Icon({
    size: size,
}).hook(Network, self => {

    // If access point
    if (ap != null) {
        self.icon = ap.iconName
    }
    // If cuurently connected network
    else{
        self.icon = Network.wifi.iconName
    } 
})


export const EthernetIconLabel = () => Widget.Box({
    class_name: "icon",
    children:[
        Widget.Label().hook(Network, self => {
            self.class_name = "ethernet-icon"
            var status = Network.wired.internet
            self.toggleClassName('dim', status == "disconnected")
            if (status == "disconnected"){
                self.label = ""
            }
            else {
                self.label = ""
            }
        }),
    ]
})


export const EthernetIcon = () => Widget.Icon({
    class_name: "icon",
    size: 20,
    icon: "network-wired-offline-symbolic"

}).hook(Network, self => {
    var status = Network.wired.internet
    self.toggleClassName('dim', status == "disconnected")
    if (status == "disconnected"){
        self.icon = "network-wired-offline-symbolic"
    }
    else {
        self.icon = "network-wired-symbolic"
    }
})

// Shows ethernet if connected else shows wifi
export const NetworkIndicator = () => Widget.Box({
}).hook(Network, self => {
    let status = Network.wired.internet
    if (status == "connected" ){
        self.children = [ EthernetIcon() ]
    }
    else{
        self.children = [ WifiIcon(true, null) ]
    }

    // Need to show the child since widget are hidden by default 
    // and widget is added after the Button's initlization.
    // This is not needed with the Box as it automatically shows new widgets
    self.child.visible = true
    //self.show_all() // ^
}) 

export const ssid = Widget.Box({
    children:[
        Widget.Label({
            class_name: "sub-text",
            label: Network.wifi.bind("ssid"),
            truncate: "end",
            //maxWidthChars: 8,
        }).hook(Network, label =>{
            if (Network.wifi.internet == "disconnected" || Network.wifi.internet == "connecting"){
                label.label = Network.wifi.internet
            }
            else{
                label.label = Network.wifi.ssid
            }
        })
    ]
})

export const WifiPanelButton = (w, h) => Widget.Button({
    class_name: `control-panel-button`,
    css: `
        min-width: ${w}rem;
        min-height: ${h}rem;
    `,
    hexpand: true,
    onClicked: () => {
        ControlPanelNetworkTab.setValue("main")
        ControlPanelTab.setValue("network")
    },
    child: Widget.Box({
        class_name: "control-panel-button-content",
        children:[
            WifiIcon(true, null),
            ssid,
        ]
    }),
})

// 2 width x 1 height for grid
export const wifiButton2x1 = Widget.Box({
    children: [
        Widget.Button({         
            vpack: "center",
            class_name: "circle-button",
            onClicked: () => ToggleWifi(),
            child: WifiIcon(),
            setup: (self) => {
                self.hook(Network, (self) => {
                    self.toggleClassName("circle-button-active", Network.wifi.enabled)
                }, "changed")
            },
        }),
        Widget.Button({
            class_name: "normal-button",
            onClicked: () => {
                ControlPanelNetworkTab.setValue("main")
                ControlPanelTab.setValue("network")
            },
            child: Widget.Box({
                vertical: true,
                children: [
                    Widget.Label({
                        label: "Wi-Fi",
                        hpack: "start",
                    }),
                    ssid,
                ],
            }),
        }),
    ],
})

export const WifiSecurity = () => Widget.Icon({
    //TODO
    //visibility: 
    icon: "lock-symbolic",
})



const network = (ap) => Widget.Button({ 
    css: `
        margin-right: 0.8em;
    `,
    class_name: "normal-button scrollable-item",
    onPrimaryClick: () => {
        // Set ap point info
        CurrentAP.value = ap 
        // Hide error 
        connectError.visible = false 
        // Set tab
        ControlPanelNetworkTab.setValue("ap")
    }, 
    child: Widget.CenterBox({
        startWidget: Widget.Box({
            hpack: "start",
            spacing: 8,
            children: [
                WifiIcon(false, ap),
                Widget.Label({
                    hpack: "start",
                    label: ap.ssid
                }),
            ],
        }),
        endWidget: Widget.Box({
            hpack: "end",
            children: [
                WifiSecurity(),
            ],
        }),
    })
})

// Current connected network
export const CurrentNetwork = () => Widget.Box({
    visible: Network.wifi.bind("enabled").as(v => {
        print(v)
        if (v){
            return true
        }
        return false
    }),
    vertical: true,
    spacing: 8,
    children: [
        Widget.Label({
            label: "Connected network",
            vpack: "center",
            hpack: "start",
        }),
        Widget.Box({
            vertical: true,
            hexpand: true,
            class_name: "container",
            children: [
                Widget.Button({ 
                    class_name: "normal-button",
                    onPrimaryClick: () => {
                        // Set ap point info
                        CurrentAP.value = Network.wifi
                        // Set tab
                        ControlPanelNetworkTab.setValue("ap")
                    }, 
                    child: Widget.CenterBox({
                        startWidget: Widget.Box({
                            spacing: 8,
                            children: [
                                Widget.Button({         
                                    vpack: "center",
                                    class_name: "circle-button",
                                    child: WifiIcon(),
                                    setup: (self) => {
                                        self.hook(Network, (self) => {
                                            self.toggleClassName("circle-button-active", Network.wifi.enabled)
                                        }, "changed")
                                    },
                                }),
                                Widget.Label({
                                    hpack: "start",
                                    label: Network.wifi.bind("ssid"),
                                }),
                            ]
                        }),
                        endWidget: Widget.Box({
                            hpack: "end",
                            children: [
                                WifiSecurity(),
                            ],
                        }),
                    })
                })
            ]
        })
    ]
})

function ConnectToAP(ssid, password){

    execAsync(`nmcli dev wifi connect ${ssid} password ${password}`)
        //.then(out => print(out))
        .catch(err => {
            print(err)
            connectError.visible = true
        });
}

function DeleteAP(){
    const ssid = CurrentAP.value.ssid
    execAsync(`nmcli connection delete ${ssid}`) 
}

const connectError = Widget.Label({
    css: `color: red;`,
    wrap: true,
    maxWidthChars: 24,
    label: "Connection Failed: Invalid password or network failure"
}).on("realize", self => self.visible = false) // Set label as invisible by default since 
                                               // adding it to a box will automatically make
                                               // it visible even if the property says false for visible


// Password entry
const passwordEntry = Widget.Entry({
    class_name: "app-entry",
    placeholder_text: "Password",
    hexpand: true,
    visibility: false,
    on_accept: (self) => {
        ConnectToAP(CurrentAP.value.ssid, self.text)
        self.text = "" 
    },
    // Set password to use with connect button
    on_change: ({ text }) => {
        connectError.visible = false // Hide error when typing a new password
        apPassword = text
    },
})
const AccessPointStat = ( name, stat ) => Widget.Box({
    children: [
        Widget.Label({
            hexpand: true,
            hpack: "start",
            label: name,
        }),
        Widget.Label({
            hexpand: true,
            hpack: "end",
            label: CurrentAP.bind().as(ap => {
                return ap[stat].toString()
            }),
        }), 
    ]
})

export const AccessPoint = () => Widget.Box({
    vertical: true,
    vexpand: true,
    spacing: 16,
    children: [
        Widget.Box({
            //class_name: "container",
            hpack: "center",
            spacing: 8,
            children: [
                WifiIcon(null, null, 24),
                Widget.Label({
                    class_name: "large-text",
                    hexpand: true,
                    hpack: "start",
                    tooltip_text: "ssid",
                    label: CurrentAP.bind().as(v => {
                        if (v.ssid != null) { return v.ssid.toString()}
                        return "N/A"
                    }),
                }),
            ],
        }),

        passwordEntry,
        connectError, // Only shows if error occurs while connecting

        Widget.Box({
            spacing: 8,
            children: [

                // Connect button
                Widget.Button({
                    class_name: "normal-button bg-button",
                    hexpand: true,
                    onPrimaryClick: () => { 
                        ConnectToAP(CurrentAP.value.ssid, apPassword)
                        passwordEntry.text = ""
                    },
                    child: Widget.Label({
                        label: "Connect"
                    })
                }),

                // Delete connection
                CircleButton(icons.deleteItem, DeleteAP, []),
            ],
        }),

        // Information
        Widget.Box({
            class_name: "container",
            spacing: 8,
            vertical: true,
            children: [
                AccessPointStat("SSID:", "ssid"),
                AccessPointStat("Frequency:", "frequency"),
                AccessPointStat("Strength:", "strength"),
                AccessPointStat("Address", "address"),
            ],
        }),
    ]
})

export const WifiListAvailable = () => Widget.Scrollable({
    css: `
        min-height: 100px;
    `,
    vexpand: true,
    child: Widget.Box({
        vertical: true,
        children: [],
    }).hook(Network, self => {
        self.children = Network.wifi.accessPoints
            .filter((ap) => ap.ssid != Network.wifi.ssid) // Filter out connected ap
            .sort((a, b) => b.strength - a.strength)    // Sort by signal strength (I think lamba functions without {} imply a return)
            .map(network) 
    })
})

// Wifi available networks
export const WifiList = () => Widget.Box({
    vertical: true,
    hexpand: true,
    class_name: "container-side-spacing",
    children: [
        WifiListAvailable(),
    ]
})


export const WifiSwitch = () => Widget.Switch({
    vpack: "center",
    setup: (self) => {
        // Syncs the active property on this switch to the enabled property on the Bluetooth GObject
        self.bind_property("active", Network.wifi, "enabled",  GObject.BindingFlags.BIDIRECTIONAL)
    },
})

export const WifiStatus = () => Widget.Box({
    hexpand: true,
    spacing: 8,
    children: [
        Widget.Box({
            hpack: "start",
            hexpand: true,
            spacing: 8,
            children: [
                WifiIcon(),
                Widget.Label("Wi-Fi"),
            ]
        }),
        Widget.Box({
            hpack: "end",
            hexpand: true,
            spacing: 8,
            children: [
                WifiSwitch(),
            ]
        }),
    ],
})

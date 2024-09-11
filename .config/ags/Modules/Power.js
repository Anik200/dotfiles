import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import { exec, execAsync } from 'resource:///com/github/Aylur/ags/utils.js';
const powerProfiles = await Service.import('powerprofiles')
import icons from '../icons.js'

export const PowerProfilesButton = (w, h) => Widget.Button({
    class_name: `control-panel-button`,
    css: `
        min-width: ${w}rem;
        min-height: ${h}rem;
    `,
    on_clicked: () => {
        // Loop over all available power profiles
        for (let i = 0; i < powerProfiles.profiles.length; i++ ){
            // Find current profile
            if (powerProfiles.profiles[i].Profile === powerProfiles.active_profile){
                // Set current profile to next one in list
                // If not last element in list
                if(i < powerProfiles.profiles.length - 1){
                    powerProfiles.active_profile = powerProfiles.profiles[i + 1].Profile ;
                }
                // If last element in list
                else{
                    powerProfiles.active_profile = powerProfiles.profiles[0].Profile ;
                }
                // Stop searching
                break
            }
        }
    },
    child: Widget.Icon({
        size: 22,
        setup: self => {
            self.hook(powerProfiles, self => {
                if (powerProfiles.active_profile === "performance"){
                    self.icon = "power-profile-performance-symbolic-rtl" 
                    self.css = "color: red;"
                }
                else if (powerProfiles.active_profile === "balanced"){
                    self.icon = "power-profile-balanced-rtl-symbolic" 
                    self.css = "color: orange;"
                }
                else {
                    self.icon = "power-profile-power-saver-rtl-symbolic"
                    self.css = "color: green;"
                }
            })
        }
    })
})


/*
// Power button revealer
const buttonRevealer = Widget.Revealer({
    transitionDuration: 300,
    transition: 'slide_left',
    revealChild: false,
    child: Widget.Box({
        children: [
            Widget.Button({
                class_name: "power-button",
                vpack: "center",
                child: Widget.Icon({icon: "system-shutdown-symbolic", size: 20}),
                on_primary_click: () => execAsync('shutdown now'),
            }),
            Widget.Button({
                class_name: "power-button",
                vpack: "center",
                child: Widget.Icon({icon: "system-hibernate-symbolic", size: 20}),
                on_primary_click: () => execAsync('systemctl hibernate'),
            }),
            Widget.Button({
                class_name: "power-button",
                vpack: "center",
                child: Widget.Icon({icon: "system-suspend-symbolic", size: 20}),
                on_primary_click: () => execAsync('systemctl suspend'),
            }),
            Widget.Button({
                class_name: "power-button",
                vpack: "center",
                child: Widget.Icon({icon: "system-restart-symbolic", size: 20}),
                on_primary_click: () => execAsync('systemctl reboot'),
            }),
            // Spacer
            Widget.Label({label: "|"}),
        ]
    })
})

// Power buttons
export const powerButtons = Widget.Box({
    hpack: "end",
    children: [
        buttonRevealer,
        // Toggle button
        Widget.Button({
            vpack: "center",
            //class_name: "power-button",
            class_name: "normal-button",
            child: Widget.Icon({icon: "system-shutdown-symbolic", size: 20}),
            on_primary_click: () => {
                buttonRevealer.revealChild = !buttonRevealer.revealChild 
            },
        }),
    ]
})
*/

// Creates a power button
function PowerButton(name, icon, cmd){
    return Widget.MenuItem({
        onActivate: () => execAsync(cmd),
        child: Widget.Box({
            children: [
                Widget.Button({
                    vpack: "center",
                    child: Widget.Icon({icon: icon, size: 20}),
                }),
                Widget.Label({
                    hpack: "start",
                    label: " " + name
                }),
            ],
        }),
    })
}


// Popup power men
const powerMenu = Widget.Menu({
    children: [
        // Fix these
        PowerButton("Shutdown", icons.shutdown, "shutdown now"),
        PowerButton("Logout", icons.restart, "hyprctl dispatch exit"),
        PowerButton("Suspend", icons.suspend, "sudo zzz"),
        PowerButton("Lock", icons.hibernate, "hyprlock"),

    ],
})

export const togglePowerMenu = Widget.Button({
    vpack: "center",
    class_name: "normal-button",
    child: Widget.Icon({icon: "system-shutdown-symbolic", size: 20}),
    on_primary_click: (_, event) => {
        powerMenu.popup_at_pointer(event)
    },
})



// Fancy vs Fast Hyprland toggle
/*
export const FancyFastToggle = (w, h) => Widget.Button({
    class_name: `control-panel-button`,
    css: `
        min-width: ${w}rem;
        min-height: ${h}rem;
    `,
    on_clicked: () => {
    },
    child: Widget.Icon({
        size: 22,
        setup: self => {
            self.hook(, self => {
                //starred-symbolic
                //sensors-voltage-symbolic
            })
        }
    })
})
*/

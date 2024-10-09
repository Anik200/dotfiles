
import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import Audio from 'resource:///com/github/Aylur/ags/service/audio.js';
import Gtk from 'gi://Gtk'
import GObj from 'gi://GObject'
import Variable from 'resource:///com/github/Aylur/ags/variable.js';
import { ControlPanelTab } from '../Global.js';

export const VolumeIcon = () => Widget.Box({
    class_name: "icon",
    children:[
        Widget.Overlay({
            pass_through: true,
            //TODO Running a hook on both of these labels might be unnecessary
            child:
                Widget.Label().hook(Audio, self => {
                    self.class_name = "dim"
                    if (Audio.speaker.is_muted){
                        self.label = "婢"
                    }
                    else{
                        self.label = "  "
                    }
                
                }, 'speaker-changed'),

            overlays: [
                Widget.Label({
                    
                }).hook(Audio, self => {
                    if (!Audio.speaker)
                        return;

                    var icon = "vol-err";

                    if (Audio.speaker.is_muted){
                        icon = "" // Only base icon of overlay is displayed
                    }
                    else if(Audio.speaker.volume > 0.75){
                        icon = ""
                    }
                    else if(Audio.speaker.volume > 0.50){
                        icon = ""
                    }
                    else if(Audio.speaker.volume > 0.25){
                        icon = ""
                    }
                    else{
                        icon = ""
                    }

                    self.label = icon;
                }, 'speaker-changed'),
            ]
        })
    ]
})

export const VolumeButton = () => Widget.Button({
    class_name: "normal-button",
    onClicked: () => ControlPanelTab.setValue("volume"),
    child: VolumeIcon(),
})

export const VolumeSlider = () => Widget.Box({
    class_name: 'volume',
    children: [
        VolumeButton(),
        Widget.Slider({
            class_name: "sliders",
            hexpand: true,
            draw_value: false,
            on_change: ({ value }) => Audio.speaker.volume = value,
            setup: self => {
                self.hook(Audio, () => {
                    self.value = Audio.speaker?.volume || 0;
                }, 'speaker-changed')
                self.on("scroll-event", () => true) // Ignore scroll wheel
            }
        }),
    ],
})

import { ComboBoxText } from '../Global.js';
const OutputDevices = () => ComboBoxText({}).on("changed", self => {
    var streamID = self.get_active_id()
    print("streamID:    " + streamID)
    if (streamID == undefined){
        streamID = 1
    }
    Audio.speaker = Audio.getStream(parseInt(streamID))
    print(Audio.getStream(parseInt(streamID)).name)
}).hook(Audio, self => {
    self.remove_all()
    // Set combobox with output devices
    for( let i = 0; i < Audio.speakers.length; i++ ){ 
        let device = Audio.speakers[i]
        self.append(device.id.toString(), device.stream.port)
    }
    self.set_active_id(Audio.speaker.id.toString())
}, "speaker-changed")


function appVolume(app){
    //const level = Variable(app.volume)
    const name = app.name.toLowerCase()
    const iconExists = Utils.lookUpIcon(name)
    var icon
    if (iconExists){
        icon = name
    }
    else {
        icon = app.icon_name
    }
    return Widget.Box({
        tooltip_text: app.name,
        class_name: "normal-button",
        vertical: true,
        css: `
            margin-bottom: 0.5em
        `,
        children: [
            Widget.Slider({
                vertical: true,
                inverted: true,
                class_name: "vertical-slider",
                hexpand: false,
                vexpand: true,
                draw_value: false,
                on_change: ({ value }) => app.volume = value,
                value: app.bind("volume"),
                setup: self => {
                    self.on("scroll-event", () => true) // Ignore scroll wheel
                }
            }),
            Widget.Icon({
                vpack: "center",
                size: 24,
                icon: icon,
            }),
        ]
    })
}

// Mixer
const mixer = () => Widget.Scrollable({
    css: 'min-height: 60px',
    vexpand: true,
    class_name: "container",
    child: Widget.Box({
        children: Audio.bind("apps").as(v => {
            if (v.length < 1){
                print("Nothing playing")
                return [Widget.Label({
                    hexpand: true,
                    class_name: "dim",
                    label: "It's quiet here...",
                    vpack: "center",
                    hpack: "center",
                })]
            }
            return v.map(appVolume)
        }),
    })
})


// Volume menu
export const VolumeMenu = () => Widget.Box({
    vertical: true,
    spacing: 8,
    children: [ 
        Widget.Label({
            css: `margin-bottom: 0.4rem;`,
            label: "Outputs",
            hpack: "start",
        }),
        Widget.Box({
            vertical: true,
            class_name: "container",
            spacing: 8,
            children: [
                OutputDevices(),
                VolumeSlider(),
            ],
        }),

        Widget.Label({
            css: `margin-bottom: 0.4rem;`,
            label: "Mixer",
            hpack: "start",
        }),
        mixer(),
    ],
})


export const MicrophoneIcon = () => Widget.Icon({
    size: 20,
    icon: "audio-input-microphone-high-symbolic",
}).hook(Audio, self => {
    if (Audio.microphone.is_muted){
        self.icon = "audio-input-microphone-muted-symbolic"
    }
    else{
        self.icon = "audio-input-microphone-high-symbolic"
    } 
}, 'microphone-changed')

export const MicrophoneButton = () => Widget.Button({
    class_name: "normal-button",
    onClicked: () => ControlPanelTab.setValue("microphone"),
    child: MicrophoneIcon(),
})


export const MicrophoneSlider = () => Widget.Box({
    class_name: 'microphone',
    children: [
        MicrophoneButton(),
        Widget.Slider({
            class_name: "sliders",
            hexpand: true,
            draw_value: false,
            on_change: ({ value }) => Audio.microphone.volume = value,
            setup: self => self.hook(Audio, () => {
                self.value = Audio.microphone?.volume || 0;
            }, 'microphone-changed'),
        }),
    ],
});


//let ComboBoxText = Widget.subclass(Gtk.ComboBoxText)
const inputDevices = ComboBoxText({
    //class_name: "normal-button",
})
inputDevices.on("changed", self => {
    var streamID = inputDevices.get_active_id()
    if (streamID == undefined){
        streamID = 1
    }
    Audio.microphone = Audio.getStream(parseInt(streamID))
})
inputDevices.hook(Audio, self => {
    self.remove_all()
    // Set combobox with output devices
    for( let i = 0; i < Audio.microphones.length; i++ ){ 
        let device = Audio.microphones[i]
        self.append(device.id.toString(), device.stream.port)
    }
    if (Audio.microphone.id != null){
        inputDevices.set_active_id(Audio.microphone.id.toString())
    }
}, "microphone-changed")

// Volume menu
export const MicrophoneMenu = () => Widget.Box({
    vertical: true,
    class_name: "container",
    children: [ 
        Widget.Label({
            label: "Inputs",
            hpack: "start",
        }),
        inputDevices,
    ],
})

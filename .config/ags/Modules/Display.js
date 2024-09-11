import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import { execAsync } from 'resource:///com/github/Aylur/ags/utils.js'
import Brightness from '../Services/Brightness.js'

export const DisplayButton = (w, h) => Widget.Button({
    class_name: "control-panel-button",
    css: `
        min-width: ${w}rem;
        min-height: ${h}rem;
        font-size: 22px;
    `,
    child: Widget.Icon({
        icon: "preferences-desktop-display-symbolic",
    })
})


export const brightness = () => Widget.Box({
    class_name: 'brightness',
    children: [
        Widget.Button({
            class_name: "normal-button",
            child: Widget.Label({
                class_name: "icon",
                setup: self => self.hook(Brightness, (self, screenValue) => {
                    self.label = ''
                }, 'screen-changed'),
            }), 
        }),
        Widget.Slider({
            hexpand: true,
            min: 0.01, // Set min slightly above 0 zero so the display can't be turned all the way off
            max: 1,
            draw_value: false,
            on_change: self => {
                Brightness.screen_value = self.value
                // For external monitors
                // Very very slow
                //execAsync(`ddcutil --disable-dynamic-sleep --sleep-multiplier 0.1 --noverify setvcp 10 ${self.value * 100}`)

            },
            value: Brightness.bind('screen-value'),
        }),
    ],
});

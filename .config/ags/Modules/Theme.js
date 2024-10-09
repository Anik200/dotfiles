import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import { ControlPanelTab } from '../Global.js';

export const ThemeButton = (w, h) => Widget.Button({
    class_name: "control-panel-button",
    css: `
        min-width: ${w}rem;
        min-height: ${h}rem;
        font-size: 22px;
    `,

    on_primary_click: () => { 
        ControlPanelTab.setValue("theme")
    },
    child: Widget.Icon({
        icon: "org.gnome.Settings-color-symbolic",
    })
})

export const ThemeMenu = () => Widget.Box({
    children: [
        Widget.FileChooserButton({
            onFileSet: ({ uri }) => {
                print(uri)
            },
        })
    ]
})


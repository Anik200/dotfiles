import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import Hyprland from 'resource:///com/github/Aylur/ags/service/hyprland.js';

const dispatch = ws => Hyprland.sendMessage(`dispatch workspace ${ws}`);

export const Workspaces = () => Widget.EventBox({
    onScrollUp: () => dispatch('+1'),
    onScrollDown: () => dispatch('-1'),
    child: Widget.Box({
        children: Array.from({ length: 10 }, (_, i) => i + 1).map(i => Widget.Button({
            class_name: "ws-button",
            attribute: i,
            // Keeps button from expanding to fit its container
            onClicked: () => dispatch(i),
            child: Widget.Box({
                class_name: "ws-indicator",
                // vpack: "start",
                vpack: "center",
                hpack: "center",
                children: [
                    Widget.Label({
                        label: `${i}`,
                        justification: "center",
                    })
                ],
                setup: self => self.hook(Hyprland, () => {
                    // The "?" is used here to return "undefined" if the workspace doesn't exist
                    self.toggleClassName('ws-inactive', (Hyprland.getWorkspace(i)?.windows || 0) === 0);
                    self.toggleClassName('ws-occupied', (Hyprland.getWorkspace(i)?.windows || 0) > 0);
                    self.toggleClassName('ws-active', Hyprland.active.workspace.id === i);
                    self.toggleClassName('ws-large', (Hyprland.getWorkspace(i)?.windows || 0) > 1);
                }),
            }),

        })),
    }),
});

export const SpecialWorkspace = () => Widget.Label({
    label: "test", 
}).hook(Hyprland, self => {
    print(Hyprland.active.workspace.id)
    if (Hyprland.active.workspace.id == -99){
        self.label = "special"
    }
    else {
        self.label = "not"
    }
})


import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import SystemTray from 'resource:///com/github/Aylur/ags/service/systemtray.js';

const isSystrayVisible = Variable(true)

const buttonRevealer = Widget.Revealer({
    transitionDuration: 300,
    transition: 'slide_left',
    revealChild: isSystrayVisible.bind(),
    child: Widget.Box({
        class_name: "systray",
        children: SystemTray.bind('items').transform(items => {
            return items.map(item => Widget.Button({
                class_name: "normal-button",
                child: Widget.Icon().bind('icon', item, 'icon'),
                on_primary_click: (_, event) => item.activate(event),
                on_secondary_click: (_, event) => item.openMenu(event),
                tooltipMarkup: item.bind('tooltip_markup'),
                setup: (self) => {
                    // Trying to fix the hover bug where the css :hover still stays active 
                    // when not hovered
                    self.on("leave-notify-event", () => {
                       self.toggleClassName("normal-button", false) 
                       self.toggleClassName("normal-button", true) 
                    })
                },
            }).hook(SystemTray, self => {
                self.icon = item.icon
            }, "changed"));
        }),
    }),
})

export const SysTray = () => Widget.Box({
    children: [
        buttonRevealer,
        Widget.Button({
            class_name: "normal-button",
            vpack: "center",
            on_primary_click: () => {
                isSystrayVisible.value = !isSystrayVisible.value
            },
            child: Widget.Icon({
                icon: "pan-start-symbolic",
                size: 20,
                // This animation no work 
                css: isSystrayVisible.bind().as(visible => {
                    // Rotate GTK Icon
                    return `
                            -gtk-icon-transform: ${visible ? "rotate(-0.5turn)" : "none"};
                            transition: -gtk-icon-transform 0.5s;
                            `
                }),
            }),
        }),
    ],
})


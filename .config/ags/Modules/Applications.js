import Applications from 'resource:///com/github/Aylur/ags/service/applications.js';
import App from 'resource:///com/github/Aylur/ags/app.js';
import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import Hyprland from 'resource:///com/github/Aylur/ags/service/hyprland.js';

const WINDOW_NAME = 'applauncher';

export const ClientTitle = () => Widget.Label({
    class_name: 'client-title',
    label: Hyprland.active.client.bind('class').as(v => {
        print(v)
        if (v.startsWith("org.") || v.startsWith("com.")){
            let pathList = v.split('.')
            v = pathList[pathList.length - 1]
        }
        if (v.length > 0){
            return v[0].toUpperCase() + v.slice(1)
        }
        return "Desktop"
    }),
});

export const ClientIcon = () => Widget.Icon({
    class_name: 'client-icon',
    }).bind('icon', Hyprland, 'active', p => {
        const icon = Utils.lookUpIcon(p.client.class)

        //icon: Hyprland.active.client.bind("class"),
        if (icon) {
            // icon is the corresponding Gtk.IconInfo
            return p.client.class
            
        }
        else {
            // null if it wasn't found in the current Icon Theme
            // Return place holder icon
            //return "AppImageLauncher" 
            return "video-display-symbolic"
        }
})

export const ToggleScratchpad = () => Widget.Button({
    class_name: "normal-button",
    on_primary_click: () => Hyprland.messageAsync(`dispatch togglespecialworkspace`),
    child: Widget.Icon({
        size: 20,
        icon: "focus-windows-symbolic",
    })
}).hook(Hyprland, self => {
    let specialName = JSON.parse(Hyprland.message("j/monitors"))[0].specialWorkspace.name
    self.toggleClassName("active-button", specialName == "special")
})

// repopulate the box, so the most frequent apps are on top of the list
function repopulate() {
    applications = Applications.query('').map(AppItem);
    list.children = applications;
}

/** @param {import('resource:///com/github/Aylur/ags/service/applications.js').Application} app */
const AppItem = app => Widget.Button({
    class_name: "app-button",
    on_clicked: () => {
        App.closeWindow(WINDOW_NAME);
        app.launch();
    },
    attribute: { app },
    child: Widget.Box({
        children: [
            Widget.Icon({
                icon: app.icon_name || '',
                size: 42,
            }),
            Widget.Label({
                //class_name: 'app-button-label',
                label: app.name,
                xalign: 0,
                vpack: 'center',
                truncate: 'end',
            }),
        ],
    }),
});


// search entry
const entry = Widget.Entry({
    class_name: "app-entry",
    placeholder_text: "Search...",
    hexpand: true,
    css: `margin-bottom: 8px;`,

    // to launch the first item on Enter
    on_accept: (self) => {
        applications = Applications.query(self.text || '');
        if (applications[0]) {
            App.toggleWindow(WINDOW_NAME); //Todo: get name from const
            applications[0].launch();
        }
        repopulate()
        self.text = ""
    },

    // filter out the list
    on_change: ({ text }) => {
        var foundFirst = false
        applications.forEach(item => {
            item.visible = item.attribute.app.match(text);
            if (item.visible == true && foundFirst == false){
                foundFirst = true
            }
        })
    },
});

// Highlight first item when entry is selected
// 'notify::"property"' is a event that gobjects send for each property
// https://gjs-docs.gnome.org/gtk30~3.0/gtk.widget
/*
entry.on('notify::has-focus', ({ hasFocus }) => {
    list.toggleClassName("first-item", hasFocus)
})
*/


// list of application buttons
let applications = Applications.query('').map(AppItem);

// container holding the buttons
const list = Widget.Box({
    vertical: true,
    class_name: "app-list",
    children: applications,
    spacing: 4,
});

// wrap the list in a scrollable
const appScroller = Widget.Scrollable({
    css: `min-height: 400px;`,
    hscroll: 'never',
    child: list,
})



// App searcher and list
export const AppLauncher = (WINDOW_NAME) => Widget.Box({
    //vexpand: true,
    vertical: true,
    children: [
        entry,
        appScroller, 
    ],
    setup: self => self.hook(App, (_, windowName, visible) => {
        if (windowName !== WINDOW_NAME)
            return;

        // when the applauncher shows up
        if (visible) {
            repopulate();
            entry.text = '';
            entry.grab_focus();
        }
    }),
})

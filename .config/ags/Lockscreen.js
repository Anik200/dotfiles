import GtkSessionLock from 'gi://GtkSessionLock'
import Gdk from 'gi://Gdk'
import Gtk from 'gi://Gtk'
import App from 'resource:///com/github/Aylur/ags/app.js';
import Utils from 'resource:///com/github/Aylur/ags/utils.js'
import { Clock, BigClock } from './Modules/DateTime.js'
import { UserIcon, UserName } from './Modules/User.js'

//////////////////////////////////////////////////////////////////////
// Check for support of the `ext-session-lock-v1` protocol
//////////////////////////////////////////////////////////////////////
if (!GtkSessionLock.is_supported()) {
    print("Error: ext-session-lock-v1 is not supported") 
    App.quit()     
}

//////////////////////////////////////////////////////////////////////
// App config
//////////////////////////////////////////////////////////////////////

const scss = `${App.configDir}/Style/style.scss`
const css = `${App.configDir}/Style/style.css`
Utils.exec(`sassc ${scss} ${css}`)
Utils.monitorFile(
    `${App.configDir}/Style/_colors.scss`,
    function() {
        Utils.exec(`sassc ${scss} ${css}`)
        App.resetCss();
        App.applyCss(`${App.configDir}/Style/style.css`);
    },
);

App.config({
    style: css, 
})


//////////////////////////////////////////////////////////////////////
// Globals
//////////////////////////////////////////////////////////////////////

// Holds lock windows for each monitor
let windows = []
let wallpaper = `${App.configDir}/../../.cache/wallpaper` 

//////////////////////////////////////////////////////////////////////
// Functions
//////////////////////////////////////////////////////////////////////

function onLocked(){
    print("Locked")
}

function onFinished(){
    print("Finished")
    //GtkSessionLock.lock_destroy(lock)
    App.quit()     
}

function unlock() {
    lock.unlock_and_destroy()
    // Destory each window
    windows.forEach(w => w.window.destroy())
    // Before exiting your application, 
    // you MUST wait for a Wayland display sync.
    Gdk.Display.get_default().sync()
    // Quit screen locker
    App.quit()
}

function authenticate(entry){ 
    Utils.authenticate(entry.text)
        .then(() => {
            print('authentication sucessful')
            unlock()
        })
        .catch(err => {
            logError(err, 'unsucessful')
            entry.text = ""
        })
}


const passwordEntry = Widget.Entry({
    placeholder_text: 'type here',
    text: '',
    visibility: false,
    onAccept: (self) => {
        authenticate(self)
    },
})

const unlockButton = Widget.Button({
    class_name: "normal-button bg-button",
    on_primary_click: () => {
        authenticate(passwordEntry)
    },
    child: Widget.Label("Unlock"),
})

function createLockWindow(monitor){
    const window = new Gtk.Window({
        // Background image
        child: Widget.Box({
            vertical: true,
            css: `
                background-color: #000000;
                background-image: url("${wallpaper}"); 
                background-position: center;
                background-size: cover;
            `,
            children: [
                // Bar 
                Widget.CenterBox({
                    class_name: "container",
                    center_widget: Clock(),
                }),
                    
                // Content
                Widget.Box({
                    hpack: "center",
                    vpack: "center",
                    vexpand: true,
                    vertical: true,
                    spacing: 12,
                    children: [
                        //BigClock(),
                        UserIcon(8),
                        UserName(1.6),
                        // Password entry
                        Widget.Box({
                            class_name: "toggle-window",
                            children: [
                                passwordEntry,
                                unlockButton,
                            ],
                        }),
                    ]
                })
            ],
        })
    })    
    windows.push({window, monitor})
    return window
}

function lockScreen(){
    const display = Gdk.Display.get_default()
    // For all current monitors
    for (let m = 0; m < display.get_n_monitors(); m++) {
        const monitor = display.get_monitor(m)
        createLockWindow(monitor)
    }
    lock.lock_lock()
    windows.forEach(w => {
        lock.new_surface(w.window, w.monitor)
        w.window.show()
    })

    // For added / removed monitors
    display.connect("monitor-added", (display, monitor) => {
        const window = createLockWindow(monitor)
        lock.new_surface(window, monitor)
        window.show()
    })
    display.connect("monitor-removed", (display, monitor) => {
    })
}


//////////////////////////////////////////////////////////////////////
// Perform lock
//////////////////////////////////////////////////////////////////////

print("Setting up lock")
const lock = GtkSessionLock.prepare_lock()
lock.connect("locked", onLocked)
lock.connect("finished", onFinished)
lockScreen()



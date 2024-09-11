import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import { exec, execAsync } from 'resource:///com/github/Aylur/ags/utils.js';

function isNightLightOn() {
    // Check if wlsunset is running
    // Bash command outputs 0 if yes or 1 if no
    let state = exec('bash -c "pidof wlsunset > /dev/null; echo $?"')
    if (state == "0"){
        return true
    }
    else{
        return false
    }
}


function ToggleNightlight(self){ 
    self.toggleClassName("active-button", !isNightLightOn()) // Toggles active indicator
    execAsync(['bash', '-c', 'pkill wlsunset; if [ $? -ne 0 ]; then wlsunset -T 4010; fi']).catch(logError);
}

export const NightLightButton = (w, h) => Widget.Button({
    class_name: `control-panel-button`,
    css: `
        min-width: ${w}rem;
        min-height: ${h}rem;
    `,
    on_primary_click: (self) => {
        ToggleNightlight(self)
    },
    child: Widget.Icon({
        class_name: "icon",
        icon: `nightlight-symbolic`,
    }),
})


import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import { exec, execAsync } from 'resource:///com/github/Aylur/ags/utils.js';
import icons from '../icons.js';


function isScreenRecordingOn() {
    // Check if wf-recorder is running
    // Bash command outputs 0 if yes or 1 if no
    let state = exec('bash -c "pidof wf-recorder > /dev/null; echo $?"')
    if (state == "0"){
        return true
    }
    else{
        return false
    }
}


export const ScreenRecordButton = (w, h) => Widget.Button({
    class_name: `control-panel-button`,
    css: `
        min-width: ${w}rem;
        min-height: ${h}rem;
    `,
    on_clicked: (self) => {
        // Adjust indicator
        let isRecording = isScreenRecordingOn()
        self.toggleClassName("active-button", !isRecording) // Toggles active indicator
        self.toggleClassName("recording", !isRecording) // Toggles active indicator

        // Starts screen recorder if not running
        // Stops screen recorder if running
        execAsync(['bash', '-c', 'mkdir ~/Screenrecordings; pkill wf-recorder; if [ $? -ne 0 ]; then wf-recorder -f ~/Screenrecordings/recording_"$(date +\'%b-%d-%Y-%I:%M:%S-%P\')".mp4 -g "$(slurp)" --pixel-format yuv420p; fi']).catch(logError);
    },
    child: Widget.Icon({
        size: 22,
        icon: icons.screenRecord,
        setup: self => {
            
        }
    })
})

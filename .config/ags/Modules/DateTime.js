import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import { exec, execAsync } from 'resource:///com/github/Aylur/ags/utils.js';
import Variable from 'resource:///com/github/Aylur/ags/variable.js';

const datetime = Variable(0, {
    poll: [5000, ['bash', '-c', 'date "+%B %e   %l:%M %P"'], out => out],
})

const time = Variable(0, {
    poll: [5000, ['bash', '-c', 'date "+%l:%M %P"'], out => out],
})

export const Clock = () => Widget.Label({
    class_name: 'clock',
    label: datetime.bind(),
});

export const BigClock = () => Widget.Label({
    class_name: 'clock',
    css: `font-size: 4rem`,
    label: time.bind(),
});


// More info https://aylur.github.io/ags-docs/config/subclassing-gtk-widgets/ ?
export const Calendar = Widget.Calendar({ 
    showDayNames: false,
    showHeading: true,
    hpack: "center",
    vpack: "center",
});

export const CalendarContainer = (w, h) => Widget.Box({
    class_name: "control-panel-button",
    css: `
        min-width: ${w}rem;
        min-height: ${h}rem;
    `,
    children: [
        Calendar,
    ],
})

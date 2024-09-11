import Widget from 'resource:///com/github/Aylur/ags/widget.js';

// Import Modules
import { BatteryLabel, BatteryBarButton } from '../Modules/Battery.js';
import { WifiIcon, EthernetIcon, NetworkIndicator } from '../Modules/Network.js';
import { BluetoothIcon } from '../Modules/Bluetooth.js';
import { Workspaces, SpecialWorkspace } from '../Modules/Workspaces.js';
import { LauncherButton } from '../Windows/Launcher.js';
import { ClientTitle, ClientIcon, ToggleScratchpad } from '../Modules/Applications.js';
import { MicrophoneIcon, VolumeIcon } from '../Modules/Audio.js';
import { ActivityCenterButton } from './ActivityCenter.js';
import { ControlPanelToggleButton } from './ControlPanel.js';
import { SysTray } from '../Modules/Systray.js'


// layout of the bar
const Left = () => Widget.Box({
    spacing: 8,
    children: [
        LauncherButton(),
        ToggleScratchpad(),
        Workspaces(),
        ClientIcon(),
        ClientTitle(),
    ],
});

const Center = () => Widget.Box({
    spacing: 8,
    children: [
        ActivityCenterButton(),
    ],
});

const Right = (monitor) => Widget.Box({
    hpack: 'end',
    spacing: 24,
    children: [
        //BatteryBarButton(),
        SysTray(), 
        BatteryLabel(), 
        MicrophoneIcon(),
        NetworkIndicator(),
        BluetoothIcon(),
        VolumeIcon(),
        ControlPanelToggleButton(monitor),
    ],
});

export const Bar = (monitor = 0) => Widget.Window({
    name: `bar`,
    class_name: 'bar-window',
    monitor,
    anchor: ['top', 'left', 'right'],
    exclusivity: 'exclusive',
    child: Widget.CenterBox({
        start_widget: Left(),
        center_widget: Center(),
        end_widget: Right(monitor),
    }),
});



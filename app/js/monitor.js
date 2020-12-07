const path = require('path');
const osu = require('node-os-utils');
const notifier = require('node-notifier');
const { ipcRenderer } = require('electron');
const cpu = osu.cpu;
const mem = osu.mem;
const os = osu.os;

let cpuOverload;
let alertFrequency;

// Get settings & values
ipcRenderer.on('settings:get', (e, settings) => {
  cpuOverload = settings.cpuOverload;
  alertFrequency = settings.alertFrequency;
});

// Run evert 2 seconds
setInterval(() => {
  // CPU Usage
  cpu.usage().then((info) => {
    document.getElementById('cpu-usage').innerText = info + '%';

    document.getElementById('cpu-progress').style.width = info + '%';

    // Make progress bar red if overload
    document.getElementById('cpu-progress').style.background =
      info > cpuOverload ? 'red' : '#30c88b';

    if (info >= cpuOverload && runNotify(alertFrequency)) {
      notifyUser({
        title: 'CPU Overload',
        body: `CPU is over ${cpuOverload}%`,
        icon: path.join(__dirname, 'img', 'icon.png'),
        appID: 'Sys Top',
      });

      localStorage.setItem('lastNotify', +new Date());
    }
  });

  // CPU Free
  cpu.free().then((info) => {
    document.getElementById('cpu-free').innerText = info + '%';
  });

  // Uptime
  document.getElementById('sys-uptime').innerText = secondsTodhms(os.uptime());
}, 2000);

// Set model
document.getElementById('cpu-model').innerText = cpu.model();

// Computer Name
document.getElementById('comp-name').innerText = os.hostname();

// OS
document.getElementById('os').innerText = `${os.type()} ${os.arch()}`;

// Total Mem
mem.info().then((info) => {
  document.getElementById('mem-total').innerText = info.totalMemMb;
});

// Show days, hours, mins, sec
function secondsTodhms(seconds) {
  seconds = +seconds;
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 36000);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  return `${d}d, ${h}h, ${m}m, ${s}s`;
}

// Send notification
function notifyUser(options) {
  notifier.notify({
    title: options.title,
    message: options.body,
    icon: options.icon,
    appID: options.appID,
  });
}

// Check how much time has passed since notication
function runNotify(frequency) {
  if (localStorage.getItem('lastNotify') === null) {
    //Store timestamp
    localStorage.setItem('lastNotify', +new Date());
    return true;
  }

  const notifyTime = new Date(parseInt(localStorage.getItem('lastNotify')));
  const now = new Date();
  const diffTime = Math.abs(now - notifyTime);
  const minutesPassed = Math.ceil(diffTime / (1000 * 60));

  return minutesPassed > frequency ? true : false;
}

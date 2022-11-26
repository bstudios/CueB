
> Some notes here sourced from [Workshopshed](https://community.element14.com/members-area/personalblogs/b/andy-clark-s-blog/posts/vscode-and-micropython-for-the-pi-pico)

## Installing the firmware
Installing the firmware is covered on the the https://www.raspberrypi.org/documentation/rp2040/getting-started/ page.

Download the uf2 image from [Wiznet/RP2040-HAT-MicroPython/releases](https://github.com/Wiznet/RP2040-HAT-MicroPython/releases) then copy it to the Pi Pico as a file. Before you first plug in the Pi Pico, hold down the "BootSel" button then connect the USB. This makes the device appear as a hard disk on your computer and you can copy over the UF2 image. If you then un-plug and replug the Pico Pi it reverts to programming mode.

## Installing Thonny

You sadly have to install Thonny 